import { essays, ratings, comments } from '../../database/schema'
import { eq, count, avg, inArray } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDB()
  
  try {
    // Get all completed essays
    const allEssays = await db.query.essays.findMany({
      where: eq(essays.status, 'completed'),
    });
    
    if (!allEssays.length) {
      return createError({ statusCode: 404, statusMessage: 'No essays found' })
    }
    
    const essayIds = allEssays.map(e => e.id);
    
    // Get average ratings and counts for essays
    const ratingStats = await db
      .select({
        essayId: ratings.essayId,
        averageRating: avg(ratings.rating).mapWith(Number),
        totalRatings: count(ratings.id).mapWith(Number)
      })
      .from(ratings)
      .where(inArray(ratings.essayId, essayIds))
      .groupBy(ratings.essayId)
      .execute();
    
    // Create a map for easy rating lookup
    const ratingsMap = new Map(ratingStats.map(r => [r.essayId, r]));
    
    // Get all comments for these essays
    const allComments = await db.query.comments.findMany({
      where: inArray(comments.essayId, essayIds),
      orderBy: [comments.essayId, comments.createdAt]
    });
    
    // Group comments by essay ID
    const commentsByEssay = allComments.reduce((acc, comment) => {
      acc[comment.essayId] = acc[comment.essayId] || [];
      acc[comment.essayId].push(comment.content);
      return acc;
    }, {} as Record<string, string[]>);
    
    // Prepare CSV headers
    const csvHeaders = [
      'title',
      'slug',
      'content',
      'model_used',
      'generated_at',
      'rating',
      'number_of_ratings',
      'comments'
    ].join(',');
    
    // Prepare CSV rows
    const csvRows = allEssays.map(essay => {
      const ratingData = ratingsMap.get(essay.id) || { averageRating: 0, totalRatings: 0 };
      const essayComments = commentsByEssay[essay.id] || [];
      
      // Process content and comments to escape commas and quotes
      const escapeCsvField = (field: any): string => {
        if (field === null || field === undefined) return '';
        const stringField = String(field);
        // If the field contains commas, quotes, or newlines, wrap it in quotes and escape any quotes
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
          return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      };
      
      return [
        escapeCsvField(essay.title),
        escapeCsvField(essay.slug),
        escapeCsvField(essay.content),
        escapeCsvField(essay.modelUsed),
        escapeCsvField(essay.createdAt),
        escapeCsvField(ratingData.averageRating),
        escapeCsvField(ratingData.totalRatings),
        escapeCsvField(essayComments.join(' || '))
      ].join(',');
    });
    
    // Combine headers and rows
    const csvContent = [csvHeaders, ...csvRows].join('\n');
    
    // Set response headers for file download
    setResponseHeaders(event, {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="wwpgw-essays-data.csv"'
    });
    
    return csvContent;
    
  } catch (error) {
    console.error('Error generating CSV data:', error);
    throw createError({ statusCode: 500, statusMessage: 'Could not generate CSV data' });
  }
}) 