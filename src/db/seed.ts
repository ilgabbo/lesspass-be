import db from './index'; // adatta al tuo file di connessione
import { folders, passwords, tags, tagsToPasswords } from './schema'; // adatta al tuo file schema
import { randomUUID } from 'crypto';

// ID utente esistente
const existingUserId = 'ea608887-df45-4869-a41c-143df4d4b030';

async function seed() {
  console.log('Start seeding...');

  // Create folders
  const rootFolderId = randomUUID();
  const childFolderId = randomUUID();

  await db.insert(folders).values([
    {
      folderId: rootFolderId,
      name: 'Root Folder',
      userId: existingUserId,
    },
    {
      folderId: childFolderId,
      name: 'Sub Folder',
      parentId: rootFolderId,
      userId: existingUserId,
    },
  ]);
  console.log('Inserted folders');

  // Create passwords
  const passwordId1 = randomUUID();
  const passwordId2 = randomUUID();

  await db.insert(passwords).values([
    {
      passwordId: passwordId1,
      title: 'Email Account',
      username: 'user@example.com',
      password: 'supersecurepassword123',
      description: 'Main email login',
      folderId: rootFolderId,
      userId: existingUserId,
    },
    {
      passwordId: passwordId2,
      title: 'Bank Account',
      username: 'user2@example.com',
      url: 'http://domain.local',
      password: 'evenmoresecure456!',
      folderId: childFolderId,
      userId: existingUserId,
    },
  ]);
  console.log('Inserted passwords');

  // Create tags
  const tagId1 = randomUUID();
  const tagId2 = randomUUID();

  await db.insert(tags).values([
    {
      tagId: tagId1,
      name: 'Work',
      color: '#FF5733',
      userId: existingUserId,
    },
    {
      tagId: tagId2,
      name: 'Personal',
      color: '#33FFCE',
      userId: existingUserId,
    },
  ]);
  console.log('Inserted tags');

  // Link tags to passwords
  await db.insert(tagsToPasswords).values([
    {
      passwordId: passwordId1,
      tagId: tagId1,
    },
    {
      passwordId: passwordId2,
      tagId: tagId2,
    },
  ]);
  console.log('Inserted tag-password relations');

  console.log('Seeding completed!');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
