import { ratings, users } from '../../../database/schema' // Adjusted path
import { eq, sql, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const essayId = getRouterParam(event, 'essayId')

  if (!essayId) {
    throw createError({ statusCode: 400, statusMessage: 'Essay ID is required.' })
  }

  const db = useDB()
  let currentUserRating: number | null = null
  let internalUserId: string | null = null

  // Try to get session user - this is optional for fetching general rating stats
  const session = await getUserSession(event)
  if (session && session.user) {
    const internalUserRecord = await db.query.users.findFirst({
      where: eq(users.githubId, session.user.id.toString())
    })
    if (internalUserRecord) {
      internalUserId = internalUserRecord.id
    }
  }

  try {
    // Calculate average rating and count
    const aggregateResults = await db.select({
      averageRating: sql<number>`avg(${ratings.rating})`.mapWith(Number),
      totalRatings: sql<number>`count(${ratings.id})`.mapWith(Number)
    })
    .from(ratings)
    .where(eq(ratings.essayId, essayId))
    .get() // .get() for a single row of aggregates

    // Fetch the current user's rating if they are logged in and we found their internal ID
    if (internalUserId) {
      const userRatingRecord = await db.query.ratings.findFirst({
        where: and(
          eq(ratings.essayId, essayId),
          eq(ratings.userId, internalUserId)
        ),
        columns: { rating: true }
      })
      if (userRatingRecord) {
        currentUserRating = userRatingRecord.rating
      }
    }

    return {
      essayId: essayId,
      averageRating: aggregateResults?.averageRating ?? 0,
      totalRatings: aggregateResults?.totalRatings ?? 0,
      currentUserRating: currentUserRating // Will be null if not rated or not logged in
    }

  } catch (error) {
    console.error(`Error fetching ratings for essay ${essayId}:`, error)
    throw createError({ statusCode: 500, statusMessage: 'Could not fetch ratings.' })
  }
}) 