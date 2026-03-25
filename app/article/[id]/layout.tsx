import { Metadata } from "next";
import { getArticle } from "@/lib/actions/articles";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const article = await getArticle(id);
    if (!article) return { title: "Článek nenalezen – MiniCMS" };
    const desc = article.content.replace(/<[^>]*>/g, "").substring(0, 160);
    const url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/article/${id}`;
    return {
        title: `${article.title} – MiniCMS`,
        description: desc,
        alternates: { canonical: url },
        openGraph: {
            title: article.title, description: desc, type: "article", url,
            publishedTime: article.publishDate.toISOString(),
            authors: [article.author.name],
        },
    };
}

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
