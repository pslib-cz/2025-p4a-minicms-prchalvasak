"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";

export default function NewArticlePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [publishDate, setPublishDate] = useState(new Date().toISOString().split("T")[0]);
    const [error, setError] = useState("");

    if (status === "loading") return (
        <div className="page-wrapper">
            <Header />
            <div className="container" style={{ paddingTop: "48px" }}>
                <p style={{ color: "var(--color-text-muted)" }}>Načítání...</p>
            </div>
        </div>
    );

    if (!session?.user) {
        return (
            <div className="page-wrapper">
                <Header />
                <div className="container" style={{ paddingTop: "48px", textAlign: "center" }}>
                    <p style={{ color: "var(--color-text-secondary)", marginBottom: "20px" }}>
                        Musíte být přihlášeni pro vytvoření článku.
                    </p>
                    <a href="/login" className="btn btn-accent">Přihlásit se</a>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const res = await fetch("/api/article", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content, publishDate }),
        });

        if (res.ok) {
            const article = await res.json();
            router.push(`/article/${article.id}`);
        } else {
            const data = await res.json();
            setError(data.error || "Vytvoření článku selhalo");
        }
    };

    return (
        <div className="page-wrapper">
            <Header />
            <main className="container" style={{ paddingTop: "48px", paddingBottom: "80px", maxWidth: "680px" }}>
                <a href="/" className="meta" style={{
                    display: "inline-block",
                    marginBottom: "32px",
                    color: "var(--color-text-muted)",
                }}>
                    ← Zpět
                </a>

                <div className="card animate-in">
                    <h1 style={{ marginBottom: "8px" }}>Nový článek</h1>
                    <span className="accent-line" style={{ marginBottom: "28px" }} />

                    {error && <p className="error-text" style={{ marginBottom: "20px" }}>{error}</p>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Název</label>
                            <input
                                className="input"
                                type="text"
                                placeholder="Zadejte název článku…"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Obsah</label>
                            <textarea
                                className="textarea"
                                placeholder="Napište obsah článku…"
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
                            Vytvořit článek
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
