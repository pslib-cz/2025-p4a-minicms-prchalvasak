"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Table from "react-bootstrap/Table";
import Badge from "react-bootstrap/Badge";
import Pagination from "react-bootstrap/Pagination";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [articles, setArticles] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const fetchArticles = async (p: number) => {
        setLoading(true);
        const res = await fetch(`/api/article?mine=true&page=${p}&pageSize=10`);
        if (res.ok) {
            const data = await res.json();
            setArticles(data.articles);
            setTotalPages(data.totalPages);
            setPage(data.page);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (status === "authenticated") fetchArticles(1);
    }, [status]);

    const handleDelete = async (id: string) => {
        if (!confirm("Opravdu chcete smazat tento článek?")) return;
        const res = await fetch(`/api/article/${id}`, { method: "DELETE" });
        if (res.ok) fetchArticles(page);
        else alert("Smazání selhalo");
    };

    const handleTogglePublished = async (article: any) => {
        await fetch(`/api/article/${article.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: article.title,
                content: article.content,
                publishDate: article.publishDate,
                published: !article.published,
            }),
        });
        fetchArticles(page);
    };

    if (status === "loading" || loading) return (
        <div className="page-wrapper">
            <Header />
            <div className="container" style={{ paddingTop: "48px" }}>
                <p style={{ color: "var(--color-text-muted)" }}>Načítání...</p>
            </div>
        </div>
    );

    if (status === "unauthenticated") {
        return (
            <div className="page-wrapper">
                <Header />
                <div className="container" style={{ paddingTop: "48px", textAlign: "center" }}>
                    <p style={{ marginBottom: "20px" }}>Pro přístup do dashboardu se musíte přihlásit.</p>
                    <a href="/login" className="btn btn-accent">Přihlásit se</a>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <Header />
            <main className="container container-wide" style={{ paddingTop: "48px", paddingBottom: "64px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                    <div>
                        <h1>Dashboard</h1>
                        <span className="accent-line" />
                    </div>
                    <a href="/article/new" className="btn btn-accent">+ Nový článek</a>
                </div>

                {articles.length === 0 ? (
                    <p style={{ color: "var(--color-text-muted)" }}>Zatím nemáte žádné články.</p>
                ) : (
                    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                        <Table hover responsive style={{ margin: 0, color: "var(--color-text)" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                                    <th style={{ padding: "14px 20px", color: "var(--color-text-secondary)", fontWeight: 500 }}>Název</th>
                                    <th style={{ padding: "14px 20px", color: "var(--color-text-secondary)", fontWeight: 500 }}>Stav</th>
                                    <th style={{ padding: "14px 20px", color: "var(--color-text-secondary)", fontWeight: 500 }}>Datum</th>
                                    <th style={{ padding: "14px 20px", color: "var(--color-text-secondary)", fontWeight: 500 }}>Akce</th>
                                </tr>
                            </thead>
                            <tbody>
                                {articles.map((article: any) => (
                                    <tr key={article.id} style={{ borderBottom: "1px solid var(--color-border-light)" }}>
                                        <td style={{ padding: "14px 20px" }}>
                                            <a href={`/article/${article.id}`}>{article.title}</a>
                                        </td>
                                        <td style={{ padding: "14px 20px" }}>
                                            <Badge
                                                bg={article.published ? "success" : "secondary"}
                                                style={{ cursor: "pointer" }}
                                                onClick={() => handleTogglePublished(article)}
                                            >
                                                {article.published ? "Publikováno" : "Koncept"}
                                            </Badge>
                                        </td>
                                        <td style={{ padding: "14px 20px", color: "var(--color-text-muted)" }}>
                                            {new Date(article.publishDate).toLocaleDateString("cs-CZ")}
                                        </td>
                                        <td style={{ padding: "14px 20px" }}>
                                            <div style={{ display: "flex", gap: "8px" }}>
                                                <a href={`/article/${article.id}/edit`} className="btn btn-sm">Upravit</a>
                                                <button onClick={() => handleDelete(article.id)} className="btn btn-sm btn-danger">Smazat</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}

                {totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", marginTop: "24px" }}>
                        <Pagination>
                            <Pagination.Prev disabled={page <= 1} onClick={() => fetchArticles(page - 1)} />
                            {Array.from({ length: totalPages }, (_, i) => (
                                <Pagination.Item key={i + 1} active={i + 1 === page} onClick={() => fetchArticles(i + 1)}>
                                    {i + 1}
                                </Pagination.Item>
                            ))}
                            <Pagination.Next disabled={page >= totalPages} onClick={() => fetchArticles(page + 1)} />
                        </Pagination>
                    </div>
                )}
            </main>
        </div>
    );
}
