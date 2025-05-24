import { users } from 'db/schema';
import { type InferSelectModel } from 'drizzle-orm';

export type UserFromTable = InferSelectModel<typeof users>;

export interface Password {
  passwordId: string;
  createdAt: Date;
  modifiedAt: Date;
  title: string;
  description: string;
  username: string;
  url?: string;
  password: string;
  folderId: string | null;
  tags: Array<{
    tagId: string;
    name: string;
  }>;
}

export interface Folder {
  folderId: string;
  createdAt: Date;
  modifiedAt: Date;
  name: string;
  parentId: string | null;
}

export interface Tag {
  tagId: string;
  createdAt: Date;
  modifiedAt: Date | null;
  name: string;
  color: string;
}
