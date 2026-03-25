"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function NewArticlePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [publishDate, setPublishDate] = useState(new Date().toISOString().split("T")[0]);
    const [published, setPublished] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCats, setSelectedCats] = useState<string[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("/api/category").then(r => r.json()).then(setCategories).catch(() => { });
    }, []);

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
            body: JSON.stringify({ title, content, publishDate, published, categoryIds: selectedCats }),
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
                        <div className="form-group">
                            <label className="form-label">Kategorie</label>
                            <select className="select-input" multiple value={selectedCats} onChange={(e) => setSelectedCats(Array.from(e.target.selectedOptions, o => o.value))} style={{ minHeight: "80px" }}>
                                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: "10px" }}>
                            <input type="checkbox" id="published" checked={published} onChange={(e) => setPublished(e.target.checked)} />
                            <label htmlFor="published" style={{ fontSize: "0.95rem", cursor: "pointer" }}>Publikovat ihned</label>
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
