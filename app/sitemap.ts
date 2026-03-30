import type { MetadataRoute } from "next";
import { getPublishedArticlePaths } from "@/lib/actions/articles";
import { getCanonicalUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getPublishedArticlePaths();

  return [
    {
      url: getCanonicalUrl("/"),
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    ...articles.map((article) => ({
      url: getCanonicalUrl(`/article/${article.slug}`),
      lastModified: article.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
