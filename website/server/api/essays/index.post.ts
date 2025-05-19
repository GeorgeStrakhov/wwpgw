import { z } from 'h3-zod'
import { essays, users } from '../../database/schema'
import { nanoid } from 'nanoid' // For generating unique IDs
import { eq, count } from 'drizzle-orm' // Added import for eq and count
import slugify from 'slugify'

const MAX_TOTAL_ESSAYS = 1000

// Helper function to generate a slug
const generateSlug = (title: string): string => {
  return slugify(title, {
    lower: true,        // Convert to lower case
    strict: true,       // Strip special characters except replacement
    trim: true,         // Trim leading and trailing replacement chars
    locale: 'en'        // Use English locale for transliteration
  })
}

export default defineEventHandler(async (event) => {
  const { user: sessionUser } = await requireUserSession(event)
  const bodyValidation = await readValidatedBody(event, z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(150, 'Title must be 150 characters or less')
  }).safeParse)

  if (!bodyValidation.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid request body', data: bodyValidation.error.issues })
  }

  const { title } = bodyValidation.data
  const slug = generateSlug(title)
  const db = useDB()
  const config = useRuntimeConfig(event)

  // Find our internal user record using the GitHub ID from the session
  const internalUser = await db.query.users.findFirst({
    where: eq(users.githubId, sessionUser.id.toString()) // sessionUser.id is the GitHub numeric ID
  })

  if (!internalUser) {
    // This should ideally not happen if the user is logged in and their record was created on auth
    console.error('Could not find internal user for session GitHub ID:', sessionUser.id)
    throw createError({ statusCode: 403, statusMessage: 'User not found in our system. Please try logging out and back in.' })
  }

  // Check if we've reached the maximum allowed essays
  const totalEssayCount = await db.select({ count: count() }).from(essays).get()
  if (totalEssayCount && totalEssayCount.count >= MAX_TOTAL_ESSAYS) {
    throw createError({ 
      statusCode: 429, 
      statusMessage: 'Maximum number of essays reached. Looks like the community is going crazy and have already generated all the essays the project owner can afford. Sorry about this!'
    })
  }

  // Check if an essay with this slug already exists
  const existingEssayBySlug = await db.query.essays.findFirst({
    where: eq(essays.slug, slug)
  })

  // If an essay with this slug exists and is NOT failed, return it.
  // If it's failed, we allow a new attempt (it will create a new row with a new ID but same slug if user confirms,
  // or we could offer to retry the failed one - for now, new attempt is simpler by letting it proceed).
  if (existingEssayBySlug && existingEssayBySlug.status !== 'failed') {
    return {
      ...existingEssayBySlug,
      isExisting: true
    }
  }
  // If existingEssayBySlug is 'failed', we allow user to try generating again. It will create a new record if they proceed.
  // This means a slug could have multiple failed attempts before a success.
  // If strict single-use-of-slug-even-for-fails is needed, this logic would need adjustment.

  const essayId = nanoid() // Generate a unique ID for the essay
  let initialEssayRecord;
  try {
    initialEssayRecord = await db.insert(essays).values({
      id: essayId,
      title,
      slug,
      generatedBy: internalUser.id, // Use the UUID from our users table
      status: 'pending',
      createdAt: new Date()
    }).returning().get()
  } catch (dbError) {
    console.error('Error creating initial essay entry:', dbError)
    // Log the actual dbError to see more details in D1 logs if it's not the FK constraint
    throw createError({ statusCode: 500, statusMessage: 'Could not create essay entry' })
  }

  if (!initialEssayRecord) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to create essay entry and get a return value.' })
  }

  // 2. Construct webhook URL
  const appBaseUrl = process.env.NUXT_PUBLIC_APP_BASE_URL || `http://localhost:3000` 
  const webhookUrl = `${appBaseUrl}/api/essays/webhook/${essayId}`

  // DEBUG: Log the API key (ensure it's removed in production or made more secure)
  // console.log('[DEBUG] Attempting to use API Key:', config.generateEssayApiKey ? `***${config.generateEssayApiKey.slice(-5)}` : 'API Key is undefined or empty');

  // 3. Call the external worker
  try {
    const workerResponse = await $fetch(config.generateEssayEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.generateEssayApiKey}`
      },
      body: {
        essayName: title,
        essaySlug: slug,
        webhookUrl: webhookUrl
      }
    })

    // Assuming any 2xx response or a truthy response means the worker accepted the job.
    // You might need to be more specific based on your worker's actual success responses.
    if (workerResponse) { 
      await db.update(essays)
        .set({ status: 'generating' })
        .where(eq(essays.id, essayId))
        .execute()
      initialEssayRecord.status = 'generating'
      return { ...initialEssayRecord, isExisting: false }
    } else {
      // Worker call was made, but worker indicated it didn't accept the job (e.g., returned falsy but not an error status code)
      console.warn('Worker API call succeeded but indicated job not accepted (falsy response):', workerResponse)
      // Delete the pending essay as the worker did not definitively accept the task
      await db.delete(essays).where(eq(essays.id, essayId)).execute()
      throw createError({ statusCode: 502, statusMessage: 'Essay generation worker did not accept the task.' })
    }
  } catch (workerError: any) {
    console.error('Error calling generation worker (e.g., network error, 4xx/5xx from worker):', workerError)
    // Worker call itself failed. Delete the pending essay.
    await db.delete(essays).where(eq(essays.id, essayId)).execute()
    // Re-throw or create a new error to inform the client
    throw createError({ statusCode: 502, statusMessage: `Failed to communicate with essay generation worker: ${workerError.message || 'Unknown error'}` })
  }
}) 