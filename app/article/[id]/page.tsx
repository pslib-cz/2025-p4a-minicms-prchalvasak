"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import { Star, ThumbsDown } from "lucide-react";

function ratingLabel(rating: number): string {
    if (rating === 0) return "odpad!";
    return "★".repeat(rating) + "☆".repeat(5 - rating);
}

function StarRating({ rating }: { rating: number }) {
    if (rating === 0) {
        return (
            <span className="star-row" style={{ color: "var(--color-error)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <span>odpad!</span> <ThumbsDown size={18} strokeWidth={2.5} />
            </span>
        );
    }
    return (
        <span className="star-row">
            {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={`star ${star <= rating ? "filled" : ""}`} style={{ display: "inline-flex" }}>
                    <Star size={18} fill={star <= rating ? "currentColor" : "none"} strokeWidth={2.5} />
                </span>
            ))}
        </span>
    );
}

function InteractiveStarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const [hover, setHover] = useState<number | null>(null);
    const activeValue = hover !== null ? hover : value;

    return (
        <span className="star-row" style={{ cursor: "pointer", alignItems: "center" }}>
            {[0, 1, 2, 3, 4, 5].map((star) => {
                if (star === 0) {
                    return (
                        <span
                            key={star}
                            className="star"
                            style={{
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                color: activeValue === 0 ? "var(--color-error)" : "var(--color-text-muted)",
                                opacity: activeValue === 0 || hover === 0 ? 1 : 0.4,
                                marginRight: "8px",
                                filter: activeValue === 0 ? "none" : "grayscale(100%)",
                                display: "inline-flex"
                            }}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(null)}
                            onClick={() => onChange(star)}
                            title="odpad!"
                        >
                            <ThumbsDown size={22} strokeWidth={2.5} />
                        </span>
                    );
                }
                return (
                    <span
                        key={star}
                        className={`star ${star <= activeValue && activeValue !== 0 ? "filled" : ""}`}
                        style={{ cursor: "pointer", transition: "transform 0.15s ease", display: "inline-flex" }}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(null)}
                        onClick={() => onChange(star)}
                        title={`${star}/5`}
                    >
                        <Star size={22} fill={star <= activeValue && activeValue !== 0 ? "currentColor" : "none"} strokeWidth={2.5} />
                    </span>
                );
            })}
        </span>
    );
}

export default function ArticlePage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { data: session } = useSession();
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // review form
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewError, setReviewError] = useState("");

    // edit review
    const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
    const [editRating, setEditRating] = useState(5);
    const [editComment, setEditComment] = useState("");

    const fetchArticle = async () => {
        try {
            const res = await fetch(`/api/article/${id}`);
            if (!res.ok) {
                setError("Článek nenalezen");
                return;
            }
            const data = await res.json();
            setArticle(data);
        } catch {
            setError("Chyba při načítání článku");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchArticle();
    }, [id]);

    const handleDeleteArticle = async () => {
        if (!confirm("Opravdu chcete smazat tento článek?")) return;
        const res = await fetch(`/api/article/${id}`, { method: "DELETE" });
        if (res.ok) {
            router.push("/");
        } else {
            const data = await res.json();
            alert(data.error || "Smazání selhalo");
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setReviewError("");

        const res = await fetch("/api/review", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                articleId: id,
                rating: reviewRating,
                comment: reviewComment,
            }),
        });

        if (res.ok) {
            setReviewComment("");
            setReviewRating(5);
            fetchArticle();
        } else {
            const data = await res.json();
            setReviewError(data.error || "Vytvoření recenze selhalo");
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!confirm("Opravdu chcete smazat tuto recenzi?")) return;
        const res = await fetch("/api/review", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: reviewId }),
        });
        if (res.ok) {
            fetchArticle();
        } else {
            const data = await res.json();
            alert(data.error || "Smazání recenze selhalo");
        }
    };

    const handleEditReview = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch("/api/review", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: editingReviewId,
                rating: editRating,
                comment: editComment,
            }),
        });
        if (res.ok) {
            setEditingReviewId(null);
            fetchArticle();
        } else {
            const data = await res.json();
            alert(data.error || "Úprava recenze selhala");
        }
    };

    if (loading) return (
        <div className="page-wrapper">
            <Header />
            <div className="container" style={{ paddingTop: "48px" }}>
                <p style={{ color: "var(--color-text-muted)" }}>Načítání...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="page-wrapper">
            <Header />
            <div className="container" style={{ paddingTop: "48px" }}>
                <p style={{ color: "var(--color-error)", marginBottom: "16px" }}>{error}</p>
                <a href="/" className="btn btn-sm">← Zpět</a>
            </div>
        </div>
    );

    if (!article) return null;

    const isAuthor = session?.user?.id === article.authorId;
    const avgRating = article.reviews.length > 0
        ? (article.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / article.reviews.length).toFixed(1)
        : null;

    return (
        <div className="page-wrapper">
            <Header />
            <main className="container" style={{ paddingTop: "48px", paddingBottom: "80px" }}>
                {/* Back link */}
                <a href="/" className="meta" style={{
                    display: "inline-block",
                    marginBottom: "32px",
                    color: "var(--color-text-muted)",
                    transition: "color var(--transition-fast)",
                }}>
                    ← Zpět na články
                </a>

                {/* Article header */}
                <div className="animate-in" style={{ marginBottom: "32px" }}>
                    <h1 style={{ marginBottom: "16px", fontSize: "2.6rem", lineHeight: "1.2" }}>
                        {article.title}
                    </h1>
                    <div className="meta" style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                        <span className="meta-accent">{article.author.name}</span>
                        <span style={{ color: "var(--color-border)" }}>·</span>
                        <span>{new Date(article.publishDate).toLocaleDateString("cs-CZ")}</span>
                        {avgRating && (
                            <>
                                <span style={{ color: "var(--color-border)" }}>·</span>
                                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <StarRating rating={Math.round(Number(avgRating))} />
                                    <span style={{ color: "var(--color-text-secondary)" }}>{avgRating}</span>
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Author actions */}
                {isAuthor && (
                    <div className="animate-in stagger-1" style={{ display: "flex", gap: "10px", marginBottom: "28px" }}>
                        <a href={`/article/${id}/edit`} className="btn btn-sm">Upravit článek</a>
                        <button onClick={handleDeleteArticle} className="btn btn-sm btn-danger">
                            Smazat článek
                        </button>
                    </div>
                )}

                {/* Article content */}
                <hr className="divider" />
                <div className="animate-in stagger-2" style={{
                    whiteSpace: "pre-wrap",
                    fontSize: "1.08rem",
                    lineHeight: "1.85",
                    color: "var(--color-text)",
                    maxWidth: "680px",
                }}>
                    {article.content}
                </div>

                {/* Reviews section */}
                <hr className="divider" />
                <div className="animate-in stagger-3">
                    <h2 style={{ marginBottom: "6px" }}>
                        Recenze
                        {avgRating && (
                            <span style={{
                                fontSize: "1rem",
                                fontFamily: "var(--font-body)",
                                fontWeight: 400,
                                color: "var(--color-text-muted)",
                                marginLeft: "12px",
                            }}>
                                (průměr: {avgRating}/5)
                            </span>
                        )}
                    </h2>
                    <span className="accent-line" style={{ marginBottom: "28px" }} />
                </div>

                {article.reviews.length === 0 && (
                    <p style={{ color: "var(--color-text-muted)", marginTop: "20px" }}>
                        Zatím žádné recenze.
                    </p>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "20px" }}>
                    {article.reviews.map((review: any, i: number) => {
                        const isReviewAuthor = session?.user?.id === review.authorId;

                        if (editingReviewId === review.id) {
                            return (
                                <div key={review.id} className="card" style={{ borderColor: "var(--color-accent)", borderWidth: "1px" }}>
                                    <form onSubmit={handleEditReview}>
                                        <div className="form-group">
                                            <label className="form-label">Hodnocení</label>
                                            <InteractiveStarRating value={editRating} onChange={setEditRating} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Komentář</label>
                                            <textarea
                                                className="textarea"
                                                value={editComment}
                                                onChange={(e) => setEditComment(e.target.value)}
                                                rows={3}
                                            />
                                        </div>
                                        <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                                            <button type="submit" className="btn btn-accent btn-sm">Uložit</button>
                                            <button type="button" className="btn btn-sm" onClick={() => setEditingReviewId(null)}>
                                                Zrušit
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            );
                        }

                        return (
                            <div key={review.id} className={`card animate-in stagger-${Math.min(i + 4, 8)}`}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                                            <StarRating rating={review.rating} />
                                            <span className="meta">({review.rating}/5)</span>
                                        </div>
                                    </div>
                                    <div className="meta" style={{ textAlign: "right" }}>
                                        <span className="meta-accent">{review.author.name}</span>
                                        <br />
                                        {new Date(review.createdAt).toLocaleDateString("cs-CZ")}
                                    </div>
                                </div>
                                <p style={{ color: "var(--color-text-secondary)", lineHeight: "1.6" }}>
                                    {review.comment}
                                </p>
                                {isReviewAuthor && (
                                    <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                                        <button
                                            className="btn btn-sm"
                                            onClick={() => {
                                                setEditingReviewId(review.id);
                                                setEditRating(review.rating);
                                                setEditComment(review.comment);
                                            }}
                                        >
                                            Upravit
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDeleteReview(review.id)}
                                        >
                                            Smazat
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Write review form */}
                {session?.user && (
                    <div className="card animate-in stagger-6" style={{ marginTop: "32px" }}>
                        <h3 style={{ marginBottom: "20px" }}>Napsat recenzi</h3>
                        {reviewError && <p className="error-text" style={{ marginBottom: "16px" }}>{reviewError}</p>}
                        <form onSubmit={handleSubmitReview}>
                            <div className="form-group">
                                <label className="form-label">Hodnocení</label>
                                <InteractiveStarRating value={reviewRating} onChange={setReviewRating} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Váš komentář</label>
                                <textarea
                                    className="textarea"
                                    placeholder="Napište svůj názor na článek…"
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    rows={3}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-accent" style={{ marginTop: "20px" }}>
                                Odeslat recenzi
                            </button>
                        </form>
                    </div>
                )}

                {!session?.user && (
                    <div className="card" style={{ marginTop: "32px", textAlign: "center" }}>
                        <p style={{ color: "var(--color-text-muted)" }}>
                            <a href="/login">Přihlaste se</a> pro přidání recenze.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}