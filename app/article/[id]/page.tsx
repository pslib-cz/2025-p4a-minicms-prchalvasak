import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import { getPublicArticle, getPublishedArticlePaths } from "@/lib/actions/articles";
import { getArticleExcerpt, getCanonicalUrl } from "@/lib/site";
import ArticlePageClient from "./ArticlePageClient";

export const revalidate = 60;

type ArticlePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { id } = await params;
  const article = await getPublicArticle(id);

  if (!article) {
    return {
      title: "Článek nenalezen",
    };
  }

  const description = getArticleExcerpt(article.content, 155);
  const canonicalUrl = getCanonicalUrl(`/article/${article.id}`);

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
      siteName: "MiniCMS",
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

export async function generateStaticParams() {
  const articles = await getPublishedArticlePaths();

  return articles.map((article) => ({
    id: article.id,
  }));
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params;
  const article = await getPublicArticle(id);

  if (!article) {
    notFound();
  }

  return (
    <div className="page-wrapper">
      <Header />
      <ArticlePageClient initialArticle={article} />
    </div>
  );
}
