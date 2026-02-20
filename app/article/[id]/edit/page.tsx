"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";

export default function EditArticlePage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [publishDate, setPublishDate] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notAuthor, setNotAuthor] = useState(false);

    useEffect(() => {
        if (!id || status === "loading") return;

        const load = async () => {
            const res = await fetch(`/api/article/${id}`);
            if (!res.ok) {
                setError("Článek nenalezen");
                setLoading(false);
                return;
            }
            const data = await res.json();

            if (!session?.user?.id || data.authorId !== session.user.id) {
                setNotAuthor(true);
                setLoading(false);
                return;
            }

            setTitle(data.title);
            setContent(data.content);
            setPublishDate(new Date(data.publishDate).toISOString().split("T")[0]);
            setLoading(false);
        };

        load();
    }, [id, session, status]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const res = await fetch(`/api/article/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content, publishDate }),
        });

        if (res.ok) {
            router.push(`/article/${id}`);
        } else {
            const data = await res.json();
            setError(data.error || "Úprava článku selhala");
        }
    };

    if (loading || status === "loading") return (
        <div className="page-wrapper">
            <Header />
            <div className="container" style={{ paddingTop: "48px" }}>
                <p style={{ color: "var(--color-text-muted)" }}>Načítání...</p>
            </div>
        </div>
    );

    if (notAuthor) return (
        <div className="page-wrapper">
            <Header />
            <div className="container" style={{ paddingTop: "48px" }}>
                <p style={{ color: "var(--color-error)", marginBottom: "16px" }}>Nemáte oprávnění upravovat tento článek.</p>
                <a href="/" className="btn btn-sm">← Zpět</a>
            </div>
        </div>
    );

    if (error && !title) return (
        <div className="page-wrapper">
            <Header />
            <div className="container" style={{ paddingTop: "48px" }}>
                <p style={{ color: "var(--color-error)", marginBottom: "16px" }}>{error}</p>
                <a href="/" className="btn btn-sm">← Zpět</a>
            </div>
        </div>
    );

    return (
        <div className="page-wrapper">
            <Header />
            <main className="container" style={{ paddingTop: "48px", paddingBottom: "80px", maxWidth: "680px" }}>
                <a href={`/article/${id}`} className="meta" style={{
                    display: "inline-block",
                    marginBottom: "32px",
                    color: "var(--color-text-muted)",
                }}>
                    ← Zpět na článek
                </a>

                <div className="card animate-in">
                    <h1 style={{ marginBottom: "8px" }}>Upravit článek</h1>
                    <span className="accent-line" style={{ marginBottom: "28px" }} />

                    {error && <p className="error-text" style={{ marginBottom: "20px" }}>{error}</p>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Název</label>
                            <input
                                className="input"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Obsah</label>
                            <textarea
                                className="textarea"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                                rows={10}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Datum publikace</label>
                            <input
                                className="input"
                                type="date"
                                value={publishDate}
                                onChange={(e) => setPublishDate(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-accent" style={{ marginTop: "24px" }}>
                            Uložit změny
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
