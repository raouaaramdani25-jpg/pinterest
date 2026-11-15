import { jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import type { Article } from '@/types';

export const articles = pgTable('articles', {
  id: text('id').primaryKey(),
  data: jsonb('data').$type<Article>().notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
});
