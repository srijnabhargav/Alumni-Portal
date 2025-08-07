-- AlterTable
ALTER TABLE "public"."alumni" ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "graduationYear" DROP NOT NULL,
ALTER COLUMN "degree" DROP NOT NULL,
ALTER COLUMN "department" DROP NOT NULL;
