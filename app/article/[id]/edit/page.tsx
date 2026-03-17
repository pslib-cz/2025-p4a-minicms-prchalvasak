"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import type { CategoryOption } from "@/lib/actions/articles";
import { validateArticleInput } from "@/lib/validation";

type EditableArticleResponse = {
    authorId: string;
    title: string;
    content: string;
    publishDate: string;
    categories: CategoryOption[];
};

export default function EditArticlePage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [publishDate, setPublishDate] = useState("");
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [notAuthor, setNotAuthor] = useState(false);

    useEffect(() => {
        if (!id || status === "loading") return;

        const load = async () => {
            try {
                const [articleResponse, categoryResponse] = await Promise.all([
                    fetch(`/api/article/${id}`),
                    fetch("/api/category"),
                ]);

                if (!articleResponse.ok) {
                    setError("Článek nenalezen");
                    setLoading(false);
                    return;
                }

                if (categoryResponse.ok) {
                    const categoryData = (await categoryResponse.json()) as CategoryOption[];
                    setCategories(categoryData);
                }

                const data = (await articleResponse.json()) as EditableArticleResponse;

                if (!session?.user?.id || data.authorId !== session.user.id) {
                    setNotAuthor(true);
                    setLoading(false);
                    return;
                }

                setTitle(data.title);
                setContent(data.content);
                setPublishDate(new Date(data.publishDate).toISOString().split("T")[0]);
                setSelectedCategoryIds(data.categories.map((category) => category.id));
                setLoading(false);
            } catch {
                setError("Načtení článku selhalo");
                setLoading(false);
            }
        };

        load();
    }, [id, session, status]);

    const toggleCategory = (categoryId: string) => {
        setSelectedCategoryIds((current) =>
            current.includes(categoryId)
                ? current.filter((item) => item !== categoryId)
                : [...current, categoryId]
        );
    };

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

        const res = await fetch(`/api/article/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title,
                content,
                publishDate,
                categoryIds: selectedCategoryIds,
            }),
        });

        if (res.ok) {
            router.push(`/article/${id}`);
            router.refresh();
            return;
        }

        const data = await res.json();
        setError(data.error || "Úprava článku selhala");
        setSubmitting(false);
    };

    if (loading || status === "loading") return (
        <div className="page-wrapper">
            <Header />
            <div className="container" style={{ paddingTop: "40px" }}>
                <p style={{ color: "var(--color-text-muted)" }}>Načítání...</p>
            </div>
        </div>
    );

    if (notAuthor) return (
        <div className="page-wrapper">
            <Header />
            <div className="container" style={{ paddingTop: "40px" }}>
                <p style={{ color: "var(--color-error)", marginBottom: "16px" }}>Nemáte oprávnění upravovat tento článek.</p>
                <Link href="/" className="btn btn-sm">← Zpět</Link>
            </div>
        </div>
    );

    if (error && !title) return (
        <div className="page-wrapper">
            <Header />
            <div className="container" style={{ paddingTop: "40px" }}>
                <p style={{ color: "var(--color-error)", marginBottom: "16px" }}>{error}</p>
                <Link href="/" className="btn btn-sm">← Zpět</Link>
            </div>
        </div>
    );

    return (
        <div className="page-wrapper">
            <Header />
            <main className="container" style={{ paddingTop: "40px", paddingBottom: "72px", maxWidth: "680px" }}>
                <Link href={`/article/${id}`} className="back-link">
                    ← Zpět na článek
                </Link>

                <div className="card">
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
                            {submitting ? "Ukládání..." : "Uložit změny"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
