import { z } from 'h3-zod'
import { ratings, users, essays } from '../../../database/schema' // Adjusted path
import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export default defineEventHandler(async (event) => {
  const { user: sessionUser } = await requireUserSession(event)
  const essayId = getRouterParam(event, 'essayId')

  const bodyValidation = await readValidatedBody(event, z.object({
    rating: z.number().int().min(0).max(5, 'Rating must be between 0 and 5')
  }).safeParse)

  if (!bodyValidation.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid rating payload', data: bodyValidation.error.issues })
  }

  if (!essayId) {
    throw createError({ statusCode: 400, statusMessage: 'Essay ID is required.' })
  }

  const { rating } = bodyValidation.data
  const db = useDB()

  // 1. Find our internal user record using the GitHub ID from the session
  const internalUser = await db.query.users.findFirst({
    where: eq(users.githubId, sessionUser.id.toString()) 
  })

  if (!internalUser) {
    throw createError({ statusCode: 403, statusMessage: 'User not found. Please log in again.' })
  }

  // 2. Verify the essay exists
  const essayExists = await db.query.essays.findFirst({
    where: eq(essays.id, essayId)
  })

  if (!essayExists) {
    throw createError({ statusCode: 404, statusMessage: 'Essay not found.' })
  }

  // 3. Check if the user has already rated this essay
  const existingRating = await db.query.ratings.findFirst({
    where: and(
      eq(ratings.essayId, essayId),
      eq(ratings.userId, internalUser.id)
    )
  })

  let actualRatingRecord
  let wasUpdated = false
  const now = new Date()

  if (existingRating) {
    // Update existing rating
    actualRatingRecord = await db.update(ratings)
      .set({
        rating: rating,
        createdAt: now // Consider an 'updatedAt' field if you want to preserve original rating time
      })
      .where(eq(ratings.id, existingRating.id))
      .returning().get()
    wasUpdated = true
  } else {
    // Create new rating
    const ratingId = nanoid()
    actualRatingRecord = await db.insert(ratings).values({
      id: ratingId,
      essayId: essayId,
      userId: internalUser.id,
      rating: rating,
      createdAt: now
    }).returning().get()
    wasUpdated = false
  }

  if (!actualRatingRecord) {
    throw createError({ statusCode: 500, statusMessage: 'Could not save or update rating.' })
  }

  return {
    rating: actualRatingRecord,
    isUpdate: wasUpdated
  }
}) 