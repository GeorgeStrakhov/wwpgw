import { comments } from '../../../database/schema'
import { eq, desc, asc } from 'drizzle-orm' // Added asc for ordering replies
import type { CommentWithUser, UserProfile } from '../../../../types' // Adjusted path for deeper nesting

// Define a type for the hierarchical comment structure
interface HierarchicalComment extends CommentWithUser {
  replies: HierarchicalComment[];
}

export default defineEventHandler(async (event) => {
  const essayId = getRouterParam(event, 'essayId')

  if (!essayId) {
    throw createError({ statusCode: 400, statusMessage: 'Essay ID is required.' })
  }

  const db = useDB()

  try {
    const allCommentsForEssay = await db.query.comments.findMany({
      where: eq(comments.essayId, essayId),
      orderBy: [asc(comments.createdAt)], // Fetch all, order by oldest first to build tree easily
      with: {
        commenter: { 
          columns: {
            githubHandle: true,
          }
        }
      }
    })

    // Helper to transform raw comment to CommentWithUser structure
    const transformComment = (rawComment: typeof allCommentsForEssay[0]): CommentWithUser => {
      const commenter = rawComment.commenter;
      return {
        id: rawComment.id,
        essayId: rawComment.essayId,
        userId: rawComment.userId,
        content: rawComment.content,
        createdAt: rawComment.createdAt,
        parentId: rawComment.parentId || null, // Ensure parentId is explicitly null if undefined/empty
        user: commenter ? {
          githubHandle: commenter.githubHandle,
          avatarUrl: commenter.githubHandle ? `https://github.com/${commenter.githubHandle}.png` : null
        } : null
      };
    };

    // Build the tree structure
    const commentsById: { [key: string]: HierarchicalComment } = {};
    const topLevelComments: HierarchicalComment[] = [];

    allCommentsForEssay.forEach(rawComment => {
      const comment = transformComment(rawComment);
      commentsById[comment.id] = { ...comment, replies: [] };
    });

    Object.values(commentsById).forEach(commentNode => {
      if (commentNode.parentId && commentsById[commentNode.parentId]) {
        commentsById[commentNode.parentId].replies.push(commentNode);
      } else {
        topLevelComments.push(commentNode);
      }
    });
    
    // The topLevelComments are already sorted by createdAt because the initial query was sorted.
    // If replies within each level need specific sorting, you'd sort them here.
    // For example, to sort replies by createdAt ascending:
    // function sortRepliesRecursive(nodes: HierarchicalComment[]) {
    //   nodes.forEach(node => {
    //     node.replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    //     sortRepliesRecursive(node.replies);
    //   });
    // }
    // sortRepliesRecursive(topLevelComments);

    return topLevelComments;

  } catch (error) {
    console.error(`Error fetching comments for essay ${essayId}:`, error)
    throw createError({ statusCode: 500, statusMessage: 'Could not fetch comments.' })
  }
}) 