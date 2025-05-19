import { z } from 'h3-zod'
import { essays } from '../../../database/schema' // Adjusted path
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const essayId = getRouterParam(event, 'id')
  
  const bodyValidation = await readValidatedBody(event, z.object({
    success: z.boolean(),
    essayName: z.string(),
    essaySlug: z.string(),
    essayText: z.string(), // Changed from markdownContent
    modelUsed: z.string(),
    error: z.string().optional() // Worker sends empty string for success, or an error message
  }).safeParse)

  if (!bodyValidation.success) {
    console.error('Webhook received invalid body structure:', bodyValidation.error.issues)
    // It's important to return a 200 OK to the webhook provider if possible,
    // even if the payload is malformed, to prevent retries if the issue is with the payload itself.
    // However, the client that sent the webhook (your worker) might not retry on 400.
    // For now, let's indicate a bad request.
    throw createError({ statusCode: 400, statusMessage: 'Invalid webhook payload structure', data: bodyValidation.error.issues })
  }

  if (!essayId) {
    console.error('Webhook called without an essay ID in the path.')
    throw createError({ statusCode: 400, statusMessage: 'Essay ID missing in webhook path' })
  }

  const { essayText, modelUsed, success: workerSuccess, error: workerReportedError, essayName, essaySlug } = bodyValidation.data
  const db = useDB()

  try {
    const existingEssay = await db.query.essays.findFirst({
      where: eq(essays.id, essayId)
    })

    if (!existingEssay) {
      console.error(`Webhook received for non-existent essay ID: ${essayId}`)
      // Again, worker might not care about 404, but it's correct for our system.
      throw createError({ statusCode: 404, statusMessage: 'Essay not found for webhook update' })
    }

    if (!workerSuccess) {
      const message = workerReportedError || 'Worker reported failure without an error message.';
      console.warn(`Worker reported an error for essay ${essayId}: ${message}`);
      await db.update(essays).set({
        status: 'failed',
        errorMessage: message,
      }).where(eq(essays.id, essayId)).execute();
      return { received: true, processedSuccess: false, error: message }; // Acknowledge receipt, indicate failure
    }

    // At this point, workerSuccess is true. We expect essayText.
    if (typeof essayText !== 'string' || essayText.trim() === '') { // Check if essayText is valid content
        const message = 'Worker reported success, but essay content is missing or empty.';
        console.warn(`Issue with essay ${essayId}: ${message}`);
        await db.update(essays).set({
            status: 'failed',
            errorMessage: message,
        }).where(eq(essays.id, essayId)).execute();
        return { received: true, processedSuccess: false, error: message };
    }

    // If workerSuccess is true and essayText is present, update the essay.
    // Optionally, verify essayName and essaySlug if they are critical for integrity, though ID is primary.
    // console.log(`Webhook for essay ${essayId}: DB title: ${existingEssay.title}, Worker title: ${essayName}`);
    // console.log(`Webhook for essay ${essayId}: DB slug: ${existingEssay.slug}, Worker slug: ${essaySlug}`);

    await db.update(essays).set({
      content: essayText, // Use essayText
      modelUsed: modelUsed,
      status: 'completed',
      errorMessage: null // Clear any previous error message
    }).where(eq(essays.id, essayId)).execute()

    return { received: true, processedSuccess: true, message: 'Essay updated successfully from webhook.' }

  } catch (e: any) {
    console.error(`Error processing webhook for essay ${essayId}:`, e)
    // Attempt to mark the essay as failed if an unexpected error occurs during DB operations
    // This is a last resort if the above checks pass but DB fails.
    if (essayId) { // Only try to update if we have an essayId
        try {
            await db.update(essays).set({
                status: 'failed',
                errorMessage: e.message || 'Webhook processing failed unexpectedly during DB operation.'
            }).where(eq(essays.id, essayId)).execute()
        } catch (updateError) {
            console.error(`Failed to mark essay ${essayId} as failed after webhook processing error:`, updateError)
        }
    }
    // This error will be caught by Nuxt and returned as a 500 to the webhook sender.
    throw createError({ statusCode: 500, statusMessage: e.message || 'Failed to process webhook' })
  }
}) 