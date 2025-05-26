/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { relations } from 'drizzle-orm';
import {
  pgEnum,
  pgTable,
  uuid,
  varchar,
  boolean,
  primaryKey,
  timestamp,
} from 'drizzle-orm/pg-core';
import { FieldLength } from 'shared/enums/fieldLength.enum';
import { UserRole } from 'shared/enums/role.enum';

export const userRole = pgEnum('role', [UserRole.ADMIN, UserRole.USER]);

export const users = pgTable('users', {
  userId: uuid().primaryKey().defaultRandom().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  modifiedAt: timestamp().$onUpdateFn(() => new Date()),
  firstName: varchar({ length: FieldLength.FIRSTNAME_LENGTH }).notNull(),
  lastName: varchar({ length: FieldLength.LASTNAME_LENGTH }).notNull(),
  email: varchar({ length: FieldLength.EMAIL_LENGTH }).notNull(),
  password: varchar().notNull(),
  role: userRole('role').notNull().default(UserRole.USER),
  passwordChanged: boolean().notNull().default(false),
  publicKey: varchar().notNull().default(''),
  tokenVersion: uuid(),
});

export const passwords = pgTable('passwords', {
  passwordId: uuid().primaryKey().defaultRandom().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  modifiedAt: timestamp().$onUpdateFn(() => new Date()),
  title: varchar({ length: FieldLength.TITLE_LENGTH }).notNull(),
  description: varchar({ length: FieldLength.DESCRIPTION_LENGTH }),
  username: varchar({ length: FieldLength.EMAIL_LENGTH }).notNull(),
  url: varchar({ length: FieldLength.URL_LENGTH }),
  password: varchar().notNull(),
  folderId: uuid().references(() => folders.folderId, { onDelete: 'cascade' }),
  userId: uuid()
    .notNull()
    .references(() => users.userId, { onDelete: 'cascade' }),
});

export const folders = pgTable('folders', {
  folderId: uuid().primaryKey().defaultRandom().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  modifiedAt: timestamp().$onUpdateFn(() => new Date()),
  name: varchar({ length: FieldLength.TITLE_LENGTH }).notNull(),
  parentId: uuid().references(() => folders.folderId, { onDelete: 'cascade' }),
  userId: uuid()
    .notNull()
    .references(() => users.userId, { onDelete: 'cascade' }),
});

export const tags = pgTable('tags', {
  tagId: uuid().primaryKey().defaultRandom().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  modifiedAt: timestamp().$onUpdateFn(() => new Date()),
  name: varchar({ length: FieldLength.TITLE_LENGTH }).notNull(),
  color: varchar().notNull(),
  userId: uuid()
    .notNull()
    .references(() => users.userId, { onDelete: 'cascade' }),
});

export const tagsToPasswords = pgTable(
  'tagsToPasswords',
  {
    tagId: uuid()
      .notNull()
      .references(() => tags.tagId, { onDelete: 'cascade' }),
    passwordId: uuid()
      .notNull()
      .references(() => passwords.passwordId, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.passwordId, t.tagId] })],
);

export const usersRelations = relations(users, ({ many }) => ({
  tags: many(tags),
  passwords: many(passwords),
  folders: many(folders),
}));

export const passwordsRelations = relations(passwords, ({ one, many }) => ({
  folder: one(folders, {
    fields: [passwords.folderId],
    references: [folders.folderId],
    relationName: 'folder',
  }),
  user: one(users, {
    fields: [passwords.userId],
    references: [users.userId],
    relationName: 'user',
  }),
  tags: many(tagsToPasswords),
}));

export const foldersRelations = relations(folders, ({ one, many }) => ({
  passwords: many(passwords),
  parent: one(folders, {
    fields: [folders.parentId],
    references: [folders.folderId],
    relationName: 'parent',
  }),
  children: many(folders, {
    relationName: 'parent',
  }),
  user: one(users, {
    fields: [folders.userId],
    references: [users.userId],
  }),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(users, {
    fields: [tags.userId],
    references: [users.userId],
  }),
  passwords: many(tagsToPasswords),
}));

export const tagsToPasswordsRelations = relations(
  tagsToPasswords,
  ({ one }) => ({
    tag: one(tags, {
      fields: [tagsToPasswords.tagId],
      references: [tags.tagId],
    }),
    password: one(passwords, {
      fields: [tagsToPasswords.passwordId],
      references: [passwords.passwordId],
    }),
  }),
);
