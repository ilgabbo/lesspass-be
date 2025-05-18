/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { relations } from 'drizzle-orm';
import { boolean } from 'drizzle-orm/pg-core';
import { primaryKey } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';
import { pgEnum, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { FieldLength } from 'enums/fieldLength.enum';
import { UserRole } from 'enums/role.enum';

export const userRole = pgEnum('role', [UserRole.ADMIN, UserRole.USER]);

export const users = pgTable('users', {
  userId: uuid().primaryKey().defaultRandom().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  modifiedAt: timestamp()
    .$onUpdateFn(() => new Date())
    .notNull(),
  firstName: varchar({ length: FieldLength.FIRSTNAME_LENGTH }).notNull(),
  lastName: varchar({ length: FieldLength.LASTNAME_LENGTH }).notNull(),
  email: varchar({ length: FieldLength.EMAIL_LENGTH }).notNull(),
  password: varchar().notNull(),
  role: userRole('role').notNull().default(UserRole.USER),
  passwordChanged: boolean().notNull().default(false),
  publicKey: varchar().notNull().default(''),
});

export const passwords = pgTable('passwords', {
  passwordId: uuid().primaryKey().defaultRandom().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  modifiedAt: timestamp()
    .$onUpdateFn(() => new Date())
    .notNull(),
  title: varchar({ length: FieldLength.TITLE_LENGTH }).notNull(),
  description: varchar({ length: FieldLength.DESCRIPTION_LENGTH }),
  password: varchar().notNull(),
  folderId: uuid()
    .notNull()
    .references(() => folders.folderId),
  userId: uuid()
    .notNull()
    .references(() => users.userId),
});

export const folders = pgTable('folders', {
  folderId: uuid().primaryKey().defaultRandom().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  modifiedAt: timestamp()
    .$onUpdateFn(() => new Date())
    .notNull(),
  name: varchar({ length: FieldLength.TITLE_LENGTH }).notNull(),
  parentId: uuid()
    .notNull()
    .references(() => folders.folderId),
});

export const tags = pgTable('tags', {
  tagId: uuid().primaryKey().defaultRandom().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  modifiedAt: timestamp()
    .$onUpdateFn(() => new Date())
    .notNull(),
  name: varchar().notNull(),
  userId: uuid()
    .notNull()
    .references(() => users.userId),
});

export const usersRelations = relations(users, ({ many }) => ({
  tags: many(tags),
  passwords: many(passwords),
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
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(users, {
    fields: [tags.userId],
    references: [users.userId],
  }),
  passwords: many(tagsToPasswords),
}));

export const tagsToPasswords = pgTable(
  'tagsToPasswords',
  {
    tagId: uuid()
      .notNull()
      .references(() => tags.tagId),
    passwordId: uuid()
      .notNull()
      .references(() => passwords.passwordId),
  },
  (t) => [primaryKey({ columns: [t.passwordId, t.tagId] })],
);

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
