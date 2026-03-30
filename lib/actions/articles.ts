import { Prisma, type ArticleStatus } from "@prisma/client";
import prisma from "@/lib/prisma";

export const PUBLIC_ARTICLES_PER_PAGE = 5;
export const DASHBOARD_ARTICLES_PER_PAGE = 6;

const articleCardArgs = Prisma.validator<Prisma.ArticleDefaultArgs>()({
  include: {
    author: {
      select: {
        id: true,
        name: true,
      },
    },
    categories: {
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    },
    _count: {
      select: {
        reviews: true,
      },
    },
  },
});

const articleDetailArgs = Prisma.validator<Prisma.ArticleDefaultArgs>()({
  include: {
    author: {
      select: {
        id: true,
        name: true,
      },
    },
    categories: {
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    },
    reviews: {
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    },
  },
});

export type ArticleCard = Prisma.ArticleGetPayload<typeof articleCardArgs>;
export type ArticleDetail = Prisma.ArticleGetPayload<typeof articleDetailArgs>;
export type CategoryOption = {
  id: string;
  name: string;
};

type ArticlePageResult<TArticle> = {
  articles: TArticle[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
};

type ArticleListFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  authorId?: string;
  publishedOnly?: boolean;
  status?: ArticleStatus;
};

function normalizePage(page?: number) {
  if (!page || !Number.isFinite(page) || page < 1) {
    return 1;
  }

  return Math.floor(page);
}

function buildArticleWhere({
  search,
  category,
  authorId,
  publishedOnly,
  status,
}: ArticleListFilters): Prisma.ArticleWhereInput {
  const and: Prisma.ArticleWhereInput[] = [];
  const normalizedSearch = search?.trim();

  if (publishedOnly) {
    and.push({
      status: "PUBLISHED",
      publishDate: {
        lte: new Date(),
      },
    });
  }

  if (authorId) {
    and.push({ authorId });
  }

  if (status) {
    and.push({ status });
  }

  if (category) {
    and.push({
      categories: {
        some: {
          name: category,
        },
      },
    });
  }

  if (normalizedSearch) {
    and.push({
      OR: [
        {
          title: {
            contains: normalizedSearch,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: normalizedSearch,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (and.length === 0) {
    return {};
  }

  return { AND: and };
}

async function getPagedArticles(
  filters: ArticleListFilters,
): Promise<ArticlePageResult<ArticleCard>> {
  const requestedPage = normalizePage(filters.page);
  const pageSize = filters.pageSize ?? PUBLIC_ARTICLES_PER_PAGE;
  const where = buildArticleWhere(filters);

  try {
    const totalCount = await prisma.article.count({ where });
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const currentPage = totalCount === 0 ? 1 : Math.min(requestedPage, totalPages);

    const articles = await prisma.article.findMany({
      ...articleCardArgs,
      where,
      orderBy: [{ publishDate: "desc" }, { createdAt: "desc" }],
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    });

    return {
      articles,
      currentPage,
      totalPages,
      totalCount,
      pageSize,
    };
  } catch {
    return {
      articles: [],
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      pageSize,
    };
  }
}

function slugifyTitle(title: string) {
  const slug = title
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "clanek";
}

async function buildUniqueSlug(title: string, articleId?: string) {
  const baseSlug = slugifyTitle(title);
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const existing = await prisma.article.findFirst({
      where: {
        slug,
        ...(articleId
          ? {
              NOT: {
                id: articleId,
              },
            }
          : {}),
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

export async function getPublicArticlesPage(filters: ArticleListFilters) {
  return getPagedArticles({
    ...filters,
    publishedOnly: true,
  });
}

export async function getDashboardArticlesPage(authorId: string, page?: number) {
  return getPagedArticles({
    authorId,
    page,
    pageSize: DASHBOARD_ARTICLES_PER_PAGE,
  });
}

export async function getCategories(): Promise<CategoryOption[]> {
  try {
    return await prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  } catch {
    return [];
  }
}

export async function getArticle(id: string) {
  return prisma.article.findUnique({
    where: { id },
    ...articleDetailArgs,
  });
}

export async function getArticleBySlug(slug: string) {
  return prisma.article.findUnique({
    where: { slug },
    ...articleDetailArgs,
  });
}

export async function getOwnedArticleBySlug(slug: string, authorId: string) {
  return prisma.article.findFirst({
    where: {
      slug,
      authorId,
    },
    ...articleDetailArgs,
  });
}

export async function getPublicArticle(slug: string) {
  return prisma.article.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
      publishDate: {
        lte: new Date(),
      },
    },
    ...articleDetailArgs,
  });
}

export async function getPublishedArticlePaths() {
  try {
    return await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        publishDate: {
          lte: new Date(),
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  } catch {
    return [];
  }
}

export async function createArticle(
  title: string,
  content: string,
  publishDate: Date,
  authorId: string,
  categoryIds: string[] = [],
  status: ArticleStatus = "DRAFT",
) {
  const slug = await buildUniqueSlug(title);

  return prisma.article.create({
    data: {
      title,
      slug,
      content,
      publishDate,
      status,
      authorId,
      ...(categoryIds.length > 0
        ? {
            categories: {
              connect: categoryIds.map((id) => ({ id })),
            },
          }
        : {}),
    },
  });
}

export async function updateArticle(
  slug: string,
  title: string,
  content: string,
  publishDate: Date,
  status: ArticleStatus,
  categoryIds?: string[],
) {
  const existing = await prisma.article.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!existing) {
    throw new Error("ARTICLE_NOT_FOUND");
  }

  const uniqueSlug = await buildUniqueSlug(title, existing.id);

  return prisma.article.update({
    where: { slug },
    data: {
      title,
      slug: uniqueSlug,
      content,
      publishDate,
      status,
      ...(categoryIds
        ? {
            categories: {
              set: categoryIds.map((categoryId) => ({ id: categoryId })),
            },
          }
        : {}),
    },
  });
}

export async function deleteArticle(slug: string) {
  return prisma.article.delete({
    where: { slug },
  });
}
