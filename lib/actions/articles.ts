import prisma from "@/lib/prisma";

export async function getArticles() {
    return prisma.article.findMany();
}

export async function getArticle(id: string) {
    return prisma.article.findUnique({
        where: { id },
    });
}

export async function createArticle(title: string, content: string, publishDate: Date, authorId: string) {
    return prisma.article.create({
        data: {
            title,
            slug: title.toLowerCase().replace(/\s+/g, "-"),
            content,
            publishDate,
            authorId,
        },
    });
}

export async function updateArticle(id: string, title: string, content: string, publishDate: Date) {
    return prisma.article.update({
        where: { id },
        data: {
            title,
            slug: title.toLowerCase().replace(/\s+/g, "-"),
            content,
            publishDate,
        },
    });
}

export async function deleteArticle(id: string) {
    return prisma.article.delete({
        where: { id },
    });
}