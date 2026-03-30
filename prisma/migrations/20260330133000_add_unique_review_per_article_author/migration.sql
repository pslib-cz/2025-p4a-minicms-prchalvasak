WITH ranked_reviews AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY "articleId", "authorId"
            ORDER BY "updatedAt" DESC, "createdAt" DESC, id DESC
        ) AS duplicate_rank
    FROM "Review"
)
DELETE FROM "Review"
WHERE id IN (
    SELECT id
    FROM ranked_reviews
    WHERE duplicate_rank > 1
);

CREATE UNIQUE INDEX "Review_articleId_authorId_key" ON "Review"("articleId", "authorId");
