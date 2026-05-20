import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  firebaseUid: text('firebase_uid').unique().notNull(),
  email: text('email').unique().notNull(),
  nome: text('nome'),
  isAdmin: integer('is_admin').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const esbocos = sqliteTable('esbocos', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  livro: text('livro').notNull(),
  capitulo: integer('capitulo').notNull(),
  versiculo: integer('versiculo').notNull(),
  tipo: text('tipo', {
    enum: ['narrativa', 'expositiva', 'tematica', 'textual', 'devocional', 'biblico'],
  }).notNull(),
  titulo: text('titulo').notNull(),
  publicoAlvo: text('publico_alvo'),
  conteudoJson: text('conteudo_json'),
  status: text('status', {
    enum: ['pending', 'completed', 'failed'],
  }).default('pending'),
  erro: text('erro'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const apiConfigs = sqliteTable('api_configs', {
  id: text('id').primaryKey(),
  provider: text('provider', { enum: ['anthropic', 'openai'] }).notNull(),
  model: text('model').notNull(),
  apiKey: text('api_key').notNull(),
  isActive: integer('is_active').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const appSettings = sqliteTable('app_settings', {
  id: text('id').primaryKey(),
  key: text('key').unique().notNull(),
  value: text('value').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Esboço = typeof esbocos.$inferSelect;
export type InsertEsboço = typeof esbocos.$inferInsert;
export type ApiConfig = typeof apiConfigs.$inferSelect;
export type InsertApiConfig = typeof apiConfigs.$inferInsert;
export type AppSetting = typeof appSettings.$inferSelect;
export type InsertAppSetting = typeof appSettings.$inferInsert;
