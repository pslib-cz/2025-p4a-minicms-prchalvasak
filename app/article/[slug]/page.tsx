import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import { getPublicArticle, getOwnedArticleBySlug } from "@/lib/actions/articles";
import { auth } from "@/lib/auth";
import { APP_NAME } from "@/lib/brand";
import { getArticleExcerpt, getCanonicalUrl } from "@/lib/site";
import ArticlePageClient from "./ArticlePageClient";

export const dynamic = "force-dynamic";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function resolveArticle(slug: string) {
  const publicArticle = await getPublicArticle(slug);
  if (publicArticle) {
    return { article: publicArticle, isOwnerPreview: false };
  }

  const session = await auth();
  if (session?.user?.id) {
    const ownedArticle = await getOwnedArticleBySlug(slug, session.user.id);
    if (ownedArticle) {
      return { article: ownedArticle, isOwnerPreview: true };
    }
  }

  return { article: null, isOwnerPreview: false };
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const { article, isOwnerPreview } = await resolveArticle(slug);

  if (!article) {
    return {
      title: "Článek nenalezen",
    };
  }

  if (isOwnerPreview) {
    return {
      title: `${article.title} (náhled)`,
      robots: { index: false },
    };
  }

  const description = getArticleExcerpt(article.content, 155);
  const canonicalUrl = getCanonicalUrl(`/article/${article.slug}`);

  return {
    title: article.title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: article.title,
      description,
      url: canonicalUrl,
      type: "article",
      siteName: APP_NAME,
      locale: "cs_CZ",
      publishedTime: article.publishDate.toISOString(),
      authors: [article.author.name],
      tags: article.categories.map((category) => category.name),
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const { article, isOwnerPreview } = await resolveArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="page-wrapper">
      <Header />
      <ArticlePageClient initialArticle={article} isOwnerPreview={isOwnerPreview} />
    </div>
  );
}
