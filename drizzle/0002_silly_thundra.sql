ALTER TABLE "folders" DROP CONSTRAINT "folders_parentId_folders_folderId_fk";
--> statement-breakpoint
ALTER TABLE "folders" ADD CONSTRAINT "folders_parentId_folders_folderId_fk" FOREIGN KEY ("parentId") REFERENCES "public"."folders"("folderId") ON DELETE cascade ON UPDATE no action;