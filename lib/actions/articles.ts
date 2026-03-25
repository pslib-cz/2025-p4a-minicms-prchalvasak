import prisma from "@/lib/prisma";

export async function getArticles(opts?: {
    search?: string; category?: string; page?: number; pageSize?: number;
    authorId?: string; publishedOnly?: boolean;
}) {
    const { search, category, page = 1, pageSize = 10, authorId, publishedOnly = false } = opts || {};
    const where: any = {};
    if (publishedOnly) where.published = true;
    if (authorId) where.authorId = authorId;
    if (search) where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
    ];
    if (category) where.categories = { some: { id: category } };

    const [articles, total] = await Promise.all([
        prisma.article.findMany({
            where, include: { author: true, categories: true },
            orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize,
        }),
        prisma.article.count({ where }),
    ]);
    return { articles, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getArticle(id: string) {
    return prisma.article.findUnique({
        where: { id },
        include: {
            author: true,
            categories: true,
            reviews: {
                include: { author: true },
                orderBy: { createdAt: "desc" },
            },
        },
    });
}

export async function createArticle(title: string, content: string, publishDate: Date, authorId: string, published = false, categoryIds: string[] = []) {
    return prisma.article.create({
        data: {
            title, slug: title.toLowerCase().replace(/\s+/g, "-"),
            content, publishDate, published, authorId,
            categories: categoryIds.length > 0 ? { connect: categoryIds.map(id => ({ id })) } : undefined,
        },
    });
}

export async function updateArticle(id: string, title: string, content: string, publishDate: Date, published?: boolean, categoryIds?: string[]) {
    return prisma.article.update({
        where: { id },
        data: {
            title, slug: title.toLowerCase().replace(/\s+/g, "-"),
            content, publishDate, published,
            categories: categoryIds ? { set: categoryIds.map(id => ({ id })) } : undefined,
        },
    });
}

export async function deleteArticle(id: string) {
    return prisma.article.delete({ where: { id } });
}

export async function getAllPublishedArticles() {
    return prisma.article.findMany({
        where: { published: true },
        select: { id: true, updatedAt: true },
    });
}