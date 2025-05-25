CREATE TYPE "public"."role" AS ENUM('ADMIN', 'USER');--> statement-breakpoint
CREATE TABLE "folders" (
	"folderId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"modifiedAt" timestamp,
	"name" varchar(15) NOT NULL,
	"parentId" uuid,
	"userId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passwords" (
	"passwordId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"modifiedAt" timestamp,
	"title" varchar(15) NOT NULL,
	"description" varchar(100),
	"username" varchar(50) NOT NULL,
	"url" varchar(2000),
	"password" varchar NOT NULL,
	"folderId" uuid,
	"userId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"tagId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"modifiedAt" timestamp,
	"name" varchar(15) NOT NULL,
	"color" varchar NOT NULL,
	"userId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tagsToPasswords" (
	"tagId" uuid NOT NULL,
	"passwordId" uuid NOT NULL,
	CONSTRAINT "tagsToPasswords_passwordId_tagId_pk" PRIMARY KEY("passwordId","tagId")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"userId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"modifiedAt" timestamp,
	"firstName" varchar(25) NOT NULL,
	"lastName" varchar(25) NOT NULL,
	"email" varchar(50) NOT NULL,
	"password" varchar NOT NULL,
	"role" "role" DEFAULT 'USER' NOT NULL,
	"passwordChanged" boolean DEFAULT false NOT NULL,
	"publicKey" varchar DEFAULT '' NOT NULL
);
--> statement-breakpoint
DROP TABLE "user" CASCADE;--> statement-breakpoint
ALTER TABLE "folders" ADD CONSTRAINT "folders_parentId_folders_folderId_fk" FOREIGN KEY ("parentId") REFERENCES "public"."folders"("folderId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folders" ADD CONSTRAINT "folders_userId_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passwords" ADD CONSTRAINT "passwords_folderId_folders_folderId_fk" FOREIGN KEY ("folderId") REFERENCES "public"."folders"("folderId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passwords" ADD CONSTRAINT "passwords_userId_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_userId_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tagsToPasswords" ADD CONSTRAINT "tagsToPasswords_tagId_tags_tagId_fk" FOREIGN KEY ("tagId") REFERENCES "public"."tags"("tagId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tagsToPasswords" ADD CONSTRAINT "tagsToPasswords_passwordId_passwords_passwordId_fk" FOREIGN KEY ("passwordId") REFERENCES "public"."passwords"("passwordId") ON DELETE cascade ON UPDATE no action;