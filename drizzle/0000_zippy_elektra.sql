CREATE TABLE "user" (
	"userId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firstName" varchar(25) NOT NULL,
	"lastName" varchar(25) NOT NULL,
	"email" varchar(50) NOT NULL,
	"password" varchar NOT NULL
);
