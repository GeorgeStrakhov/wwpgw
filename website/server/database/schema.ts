import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // UUID
  githubId: text('github_id').notNull().unique(),
  githubHandle: text('github_handle').notNull(),
  email: text('email'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

export const essays = sqliteTable('essays', {
  id: text('id').primaryKey(), // UUID
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content'), // Markdown content - nullable since it won't exist during generation
  modelUsed: text('model_used'), // Which LLM was used - nullable during generation
  generatedBy: text('generated_by').notNull().references(() => users.id),
  status: text('status', { enum: ['pending', 'generating', 'completed', 'failed'] }).notNull().default('pending'),
  errorMessage: text('error_message'), // Store error details if generation fails
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
}, (table) => {
  return {
    slugIdx: index('slug_idx').on(table.slug), // Explicitly defining an index
  };
})

export const ratings = sqliteTable('ratings', {
  id: text('id').primaryKey(),
  essayId: text('essay_id').notNull().references(() => essays.id),
  userId: text('user_id').notNull().references(() => users.id),
  rating: integer('rating').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

// This is the standard way to define the table. 
// The linter warning on `comments` here due to self-reference is often a benign TypeScript issue for Drizzle.
export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  essayId: text('essay_id').notNull().references(() => essays.id),
  userId: text('user_id').notNull().references(() => users.id),
  parentId: text('parent_id').references(() => comments.id), // Self-referential FK for replies
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  essays: many(essays),
  ratings: many(ratings),
  comments: many(comments) 
}));

export const essaysRelations = relations(essays, ({ one, many }) => ({
  author: one(users, {
    fields: [essays.generatedBy],
    references: [users.id],
    relationName: 'essayAuthor'
  }),
  ratings: many(ratings),
  comments: many(comments)
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  essay: one(essays, {
    fields: [ratings.essayId],
    references: [essays.id]
  }),
  user: one(users, {
    fields: [ratings.userId],
    references: [users.id]
  })
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  essay: one(essays, {
    fields: [comments.essayId],
    references: [essays.id],
    relationName: 'commentEssayRelation'
  }),
  commenter: one(users, {
    fields: [comments.userId],
    references: [users.id],
    relationName: 'commentAuthorRelation'
  }),
  // A comment can reply to one parent comment
  parent: one(comments, {
    fields: [comments.parentId], 
    references: [comments.id],
    relationName: 'replyToParentRelation'
  })
  // Temporarily remove the 'replies' relation to isolate the issue
  // We can add it back or construct it differently after confirming the parentId column and 'parent' relation migrate correctly.
  // replies: many(comments, {
  //   relationName: 'directRepliesRelation' 
  // })
}));
