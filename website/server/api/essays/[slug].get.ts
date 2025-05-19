import { essays } from '../../database/schema' // Corrected path
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const db = useDB()

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Slug parameter is missing' })
  }

  try {
    const essay = await db.query.essays.findFirst({
      where: eq(essays.slug, slug),
      with: {
        author: {
          columns: {
            githubHandle: true,
            githubId: true // For avatar and profile link
          }
        }
      }
    })

    if (!essay) {
      throw createError({ statusCode: 404, statusMessage: 'Essay not found' })
    }
    return essay
  } catch (error: any) {
    // Catch specific Drizzle errors or if createError was thrown already
    if (error.statusCode === 404) throw error;
    console.error(`Error fetching essay with slug ${slug}:`, error)
    throw createError({ statusCode: 500, statusMessage: 'Could not fetch essay' })
  }
}) 