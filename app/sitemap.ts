import { MetadataRoute } from "next";
import { getAllPublishedArticles } from "@/lib/actions/articles";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const articles = await getAllPublishedArticles();

    return [
        { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
        ...articles.map((a: { id: string; updatedAt: Date }) => ({
            url: `${baseUrl}/article/${a.id}`,
            lastModified: a.updatedAt,
            changeFrequency: "weekly" as const,
            priority: 0.8,
        })),
    ];
}
