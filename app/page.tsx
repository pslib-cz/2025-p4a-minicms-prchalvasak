import Header from "./components/Header";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
    title: "MiniCMS – Publikační platforma",
    description: "Platforma pro publikování článků, recenzí a dalšího obsahu.",
};

export default async function Home({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; category?: string; page?: string }>;
}) {
    const params = await searchParams;
    const search = params.search || "";
    const categoryId = params.category || "";
    const page = parseInt(params.page || "1");
    const pageSize = 6;

    const where: any = { published: true };
    if (search) where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
    ];
    if (categoryId) where.categories = { some: { id: categoryId } };

    const [articles, total, categories] = await Promise.all([
        prisma.article.findMany({
            where, include: { author: true, categories: true },
            orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize,
        }),
        prisma.article.count({ where }),
        prisma.category.findMany({ orderBy: { name: "asc" } }),
    ]);

    const pages = Math.ceil(total / pageSize);
    const q = (p: number) => `/?page=${p}${search ? `&search=${encodeURIComponent(search)}` : ""}${categoryId ? `&category=${categoryId}` : ""}`;

    return (
        <div className="page-wrapper">
            <Header />
            <main className="container" style={{ paddingTop: "48px", paddingBottom: "64px" }}>
                <div className="animate-in" style={{ marginBottom: "40px" }}>
                    <h1>Nejčtenější články</h1>
                    <span className="accent-line" />
                </div>

                <form method="GET" action="/" className="search-form">
                    {categoryId && <input type="hidden" name="category" value={categoryId} />}
                    <input className="input" type="text" name="search" placeholder="Hledat články…" defaultValue={search} />
                    <button type="submit" className="btn btn-accent">Hledat</button>
                    {search && <Link href={categoryId ? `/?category=${categoryId}` : "/"} className="btn">Zrušit</Link>}
                </form>

                <div className="category-filter">
                    <Link href={search ? `/?search=${encodeURIComponent(search)}` : "/"} className={`btn btn-sm ${!categoryId ? "btn-accent" : ""}`}>Vše</Link>
                    {categories.map((cat: any) => (
                        <Link key={cat.id} href={`/?category=${cat.id}${search ? `&search=${encodeURIComponent(search)}` : ""}`} className={`btn btn-sm ${categoryId === cat.id ? "btn-accent" : ""}`}>
                            {cat.name}
                        </Link>
                    ))}
                </div>

                {articles.length === 0 && (
                    <p className="animate-in stagger-1" style={{ fontSize: "1.05rem" }}>
                        Zatím žádné články. Buďte první, kdo něco napíše!
                    </p>
                )}

                <div className="article-list">
                    {articles.map((article: any, i: number) => (
                        <a key={article.id} href={`/article/${article.id}`}
                            className={`card card-interactive animate-in stagger-${Math.min(i + 1, 8)}`}
                            style={{ textDecoration: "none", display: "block" }}>
                            <h3>{article.title}</h3>
                            <p className="article-excerpt">
                                {article.content.replace(/<[^>]*>/g, "").substring(0, 180)}...
                            </p>
                            <div className="meta article-meta">
                                <span className="meta-accent">{article.author.name}</span>
                                <span>·</span>
                                <span>{new Date(article.publishDate).toLocaleDateString("cs-CZ")}</span>
                                {article.categories?.map((cat: any) => (
                                    <span key={cat.id} className="category-badge">{cat.name}</span>
                                ))}
                            </div>
                        </a>
                    ))}
                </div>

                {pages > 1 && (
                    <div className="pagination">
                        {page > 1 && <Link href={q(page - 1)} className="btn btn-sm">← Předchozí</Link>}
                        {Array.from({ length: pages }, (_, i) => (
                            <Link key={i + 1} href={q(i + 1)} className={`btn btn-sm ${i + 1 === page ? "btn-accent" : ""}`}>{i + 1}</Link>
                        ))}
                        {page < pages && <Link href={q(page + 1)} className="btn btn-sm">Další →</Link>}
                    </div>
                )}
            </main>
        </div>
    );
}
