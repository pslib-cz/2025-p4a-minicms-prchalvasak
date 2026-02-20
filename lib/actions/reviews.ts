import prisma from "@/lib/prisma";

export async function createReview(articleId: string, rating: number, comment: string, authorId: string) {
    return prisma.review.create({
        data: {
            articleId,
            rating,
            comment,
            authorId,
        },
    });
}

export async function getReviews(articleId: string) {
    return prisma.review.findMany({
        where: { articleId },
        include: { author: true },
        orderBy: { createdAt: "desc" },
    });
}

export async function getReview(id: string) {
    return prisma.review.findUnique({
        where: { id },
    });
}

export async function updateReview(id: string, rating: number, comment: string) {
    return prisma.review.update({
        where: { id },
        data: {
            rating,
            comment,
        },
    });
}

export async function deleteReview(id: string) {
    return prisma.review.delete({
        where: { id },
    });
}
