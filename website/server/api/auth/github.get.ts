import { users } from '../../database/schema'
import { eq } from 'drizzle-orm'

export default defineOAuthGitHubEventHandler({
  async onSuccess(event, { user: githubUser }) {
    const db = useDB()

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.githubId, githubUser.id.toString())
    })

    if (!existingUser) {
      // Create new user
      await db.insert(users).values({
        id: crypto.randomUUID(),
        githubId: githubUser.id.toString(),
        githubHandle: githubUser.login,
        email: githubUser.email || null,
        createdAt: new Date()
      }).execute()
    }

    // Set session
    await setUserSession(event, { user: githubUser })
    
    // Redirect to home page
    return sendRedirect(event, '/')
  }
})
