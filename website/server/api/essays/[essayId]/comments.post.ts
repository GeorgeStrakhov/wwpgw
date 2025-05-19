import { z } from 'h3-zod'
import { comments, users, essays } from '../../../database/schema' // Adjusted path
import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export default defineEventHandler(async (event) => {
  const { user: sessionUser } = await requireUserSession(event)
  const essayId = getRouterParam(event, 'essayId')

  const bodyValidation = await readValidatedBody(event, z.object({
    content: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment too long'),
    parentId: z.string().min(1).optional() // Changed from .uuid() to .min(1) to accept any non-empty string (like nanoid)
  }).safeParse)

  if (!bodyValidation.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid comment payload', data: bodyValidation.error.issues })
  }

  if (!essayId) {
    throw createError({ statusCode: 400, statusMessage: 'Essay ID is required.' })
  }

  const { content, parentId } = bodyValidation.data
  const db = useDB()

  // 1. Find our internal user record using the GitHub ID from the session
  const internalUser = await db.query.users.findFirst({
    where: eq(users.githubId, sessionUser.id.toString())
  })

  if (!internalUser) {
    throw createError({ statusCode: 403, statusMessage: 'User not found. Please log in again.' })
  }

  // 2. Verify the essay exists and is completed (or allow comments on failed/pending? For now, only completed)
  const essayRecord = await db.query.essays.findFirst({
    where: eq(essays.id, essayId)
  })

  if (!essayRecord) {
    throw createError({ statusCode: 404, statusMessage: 'Essay not found.' })
  }
  // Optional: Restrict comments to only completed essays
  // if (essayRecord.status !== 'completed') {
  //   throw createError({ statusCode: 400, statusMessage: 'Comments can only be added to completed essays.' })
  // }

  // If parentId is provided, validate it
  if (parentId) {
    const parentComment = await db.query.comments.findFirst({
      where: and(eq(comments.id, parentId), eq(comments.essayId, essayId))
    })
    if (!parentComment) {
      throw createError({ statusCode: 400, statusMessage: 'Parent comment not found or does not belong to this essay.' })
    }
    // Optional: Check depth of nesting if you want to limit it.
  }

  // 3. Create new comment
  const commentId = nanoid()
  const now = new Date()
  
  const newCommentValues: typeof comments.$inferInsert = {
    id: commentId,
    essayId: essayId,
    userId: internalUser.id,
    content: content,
    createdAt: now
  }
  if (parentId) {
    newCommentValues.parentId = parentId
  }

  const newComment = await db.insert(comments).values(newCommentValues).returning().get()

  if (!newComment) {
    throw createError({ statusCode: 500, statusMessage: 'Could not save new comment.' })
  }
  
  // For consistency or if frontend needs immediate user details for the new comment:
  const newCommentWithUser = {
      ...newComment,
      user: {
          githubHandle: internalUser.githubHandle,
          avatarUrl: `https://github.com/${internalUser.githubHandle}.png`
      }
  };

  return newCommentWithUser;
}) 