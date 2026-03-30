-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "Article"
ADD COLUMN "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT';

-- Backfill article status based on publish date for existing rows
UPDATE "Article"
SET "status" = CASE
    WHEN "publishDate" <= CURRENT_TIMESTAMP THEN 'PUBLISHED'::"ArticleStatus"
    ELSE 'DRAFT'::"ArticleStatus"
END;

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
