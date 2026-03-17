"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import type { CategoryOption } from "@/lib/actions/articles";
import { validateArticleInput } from "@/lib/validation";

export default function NewArticlePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [publishDate, setPublishDate] = useState(new Date().toISOString().split("T")[0]);
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await fetch("/api/category");
                if (!response.ok) {
                    setError("Načtení kategorií selhalo");
                    return;
                }

                const data = (await response.json()) as CategoryOption[];
                setCategories(data);
            } catch {
                setError("Načtení kategorií selhalo");
            }
        };

        loadCategories();
    }, []);

    const toggleCategory = (categoryId: string) => {
        setSelectedCategoryIds((current) =>
            current.includes(categoryId)
                ? current.filter((item) => item !== categoryId)
                : [...current, categoryId]
        );
    };

    if (status === "loading") return (
        <div className="page-wrapper">
            <Header />
            <div className="container" style={{ paddingTop: "40px" }}>
                <p style={{ color: "var(--color-text-muted)" }}>Načítání...</p>
            </div>
        </div>
    );

    if (!session?.user) {
        return (
            <div className="page-wrapper">
                <Header />
                <div className="container" style={{ paddingTop: "40px", textAlign: "center" }}>
                    <p style={{ color: "var(--color-text-secondary)", marginBottom: "20px" }}>
                        Musíte být přihlášeni pro vytvoření článku.
                    </p>
                    <Link href="/login" className="btn btn-accent">Přihlásit se</Link>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        const validationError = validateArticleInput({
            title,
            content,
            publishDate,
            categoryIds: selectedCategoryIds,
        });

        if (validationError) {
            setError(validationError);
            setSubmitting(false);
            return;
        }

        const res = await fetch("/api/article", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title,
                content,
                publishDate,
                categoryIds: selectedCategoryIds,
            }),
        });

        if (res.ok) {
            const article = await res.json();
            router.push(`/article/${article.id}`);
            router.refresh();
            return;
        }

        const data = await res.json();
        setError(data.error || "Vytvoření článku selhalo");
        setSubmitting(false);
    };

    return (
        <div className="page-wrapper">
            <Header />
            <main className="container" style={{ paddingTop: "40px", paddingBottom: "72px", maxWidth: "680px" }}>
                <Link href="/" className="back-link">
                    ← Zpět na články
                </Link>

                <div className="card">
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
                            <label className="form-label">Kategorie</label>
                            <div className="checkbox-grid">
                                {categories.map((category) => {
                                    const checked = selectedCategoryIds.includes(category.id);

                                    return (
                                        <label
                                            key={category.id}
                                            className={`choice-tile ${checked ? "choice-tile-active" : ""}`}
                                        >
                                            <input
                                                className="choice-checkbox"
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggleCategory(category.id)}
                                            />
                                            <span>{category.name}</span>
                                        </label>
                                    );
                                })}
                            </div>
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
                        <button
                            type="submit"
                            className="btn btn-accent"
                            style={{ marginTop: "24px" }}
                            disabled={submitting}
                        >
                            {submitting ? "Vytváření..." : "Vytvořit článek"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
