import { essays, users, ratings } from '../../database/schema'
import { eq, desc, avg, count, inArray } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core';

export default defineEventHandler(async (event) => {
  const db = useDB()
  try {
    // We need to calculate average rating and count for each essay.
    // Drizzle doesn't directly support LEFT JOIN with aggregation in a single fluent query for this specific scenario easily.
    // So, we'll fetch essays and then augment them with ratings and author details or do it in a more complex raw query if needed.
    // For simplicity here, we'll first fetch all completed essays with their authors.

    const essaysWithAuthors = await db.query.essays.findMany({
      where: eq(essays.status, 'completed'),
      with: {
        author: {
          columns: {
            githubHandle: true,
            githubId: true
          }
        }
      },
      // We will sort after combining with ratings
    });

    if (!essaysWithAuthors.length) {
      return [];
    }

    // Now, fetch rating stats for these essays
    const essayIds = essaysWithAuthors.map(e => e.id);
    
    const ratingStats = await db
      .select({
        essayId: ratings.essayId,
        averageRating: avg(ratings.rating).mapWith(Number), // Ensure it's a number
        totalRatings: count(ratings.id).mapWith(Number)    // Ensure it's a number
      })
      .from(ratings)
      .where(inArray(ratings.essayId, essayIds)) // Corrected to use inArray
      .groupBy(ratings.essayId)
      .execute(); // Use .execute() when not using db.query

    // Create a map for easy lookup
    const ratingsMap = new Map(ratingStats.map(r => [r.essayId, r]));

    // Combine essays with their ratings
    const combinedEssays = essaysWithAuthors.map(essay => ({
      ...essay,
      averageRating: ratingsMap.get(essay.id)?.averageRating ?? 0, // Default to 0 if no ratings
      totalRatings: ratingsMap.get(essay.id)?.totalRatings ?? 0,   // Default to 0 if no ratings
    }));

    // Sort by average rating (descending), then by total ratings (descending as tie-breaker), then by creation date (descending)
    combinedEssays.sort((a, b) => {
      if (b.averageRating !== a.averageRating) {
        return b.averageRating - a.averageRating;
      }
      if (b.totalRatings !== a.totalRatings) {
        return b.totalRatings - a.totalRatings;
      }
      // Dates need to be compared properly, assuming createdAt is a timestamp or Date object
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    return combinedEssays;

  } catch (error) {
    console.error('Error fetching completed essays with ratings and authors:', error)
    throw createError({ statusCode: 500, statusMessage: 'Could not fetch essays' })
  }
}) 