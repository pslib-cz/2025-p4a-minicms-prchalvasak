"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Star, ThumbsDown } from "lucide-react";
import type { ArticleDetail } from "@/lib/actions/articles";

function ratingLabel(rating: number): string {
  if (rating === 0) return "odpad!";
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

function StarRating({ rating }: { rating: number }) {
  if (rating === 0) {
    return (
      <span
        className="star-row"
        style={{
          color: "var(--color-error)",
          fontWeight: 600,
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span>{ratingLabel(rating)}</span>
        <ThumbsDown size={18} strokeWidth={2.5} />
      </span>
    );
  }

  return (
    <span className="star-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= rating ? "filled" : ""}`}
          style={{ display: "inline-flex" }}
        >
          <Star size={18} fill={star <= rating ? "currentColor" : "none"} strokeWidth={2.5} />
        </span>
      ))}
    </span>
  );
}

function InteractiveStarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const activeValue = hover ?? value;

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
                display: "inline-flex",
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
            <Star
              size={22}
              fill={star <= activeValue && activeValue !== 0 ? "currentColor" : "none"}
              strokeWidth={2.5}
            />
          </span>
        );
      })}
    </span>
  );
}

type ArticlePageClientProps = {
  initialArticle: ArticleDetail;
};

export default function ArticlePageClient({
  initialArticle,
}: ArticlePageClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [article, setArticle] = useState(initialArticle);
  const [error, setError] = useState("");

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");

  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/article/${article.id}`);

      if (!response.ok) {
        setError("Aktualizace článku se nepodařila načíst.");
        return;
      }

      const data = (await response.json()) as ArticleDetail;
      setArticle(data);
    } catch {
      setError("Aktualizace článku se nepodařila načíst.");
    }
  };

  const handleDeleteArticle = async () => {
    if (!window.confirm("Opravdu chcete smazat tento článek?")) return;

    const response = await fetch(`/api/article/${article.id}`, { method: "DELETE" });

    if (response.ok) {
      router.push("/");
      router.refresh();
      return;
    }

    const data = await response.json();
    window.alert(data.error || "Smazání selhalo");
  };

  const handleSubmitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    setReviewError("");

    const response = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        articleId: article.id,
        rating: reviewRating,
        comment: reviewComment,
      }),
    });

    if (response.ok) {
      setReviewComment("");
      setReviewRating(5);
      await fetchArticle();
      return;
    }

    const data = await response.json();
    setReviewError(data.error || "Vytvoření recenze selhalo");
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Opravdu chcete smazat tuto recenzi?")) return;

    const response = await fetch("/api/review", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: reviewId }),
    });

    if (response.ok) {
      await fetchArticle();
      return;
    }

    const data = await response.json();
    window.alert(data.error || "Smazání recenze selhalo");
  };

  const handleEditReview = async (event: React.FormEvent) => {
    event.preventDefault();

    const response = await fetch("/api/review", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingReviewId,
        rating: editRating,
        comment: editComment,
      }),
    });

    if (response.ok) {
      setEditingReviewId(null);
      await fetchArticle();
      return;
    }

    const data = await response.json();
    window.alert(data.error || "Úprava recenze selhala");
  };

  const isAuthor = session?.user?.id === article.authorId;
  const avgRating =
    article.reviews.length > 0
      ? (
          article.reviews.reduce((sum, review) => sum + review.rating, 0) /
          article.reviews.length
        ).toFixed(1)
      : null;

  return (
    <main className="container" style={{ paddingTop: "40px", paddingBottom: "72px" }}>
      <Link
        href="/"
        className="back-link"
      >
        ← Zpět na články
      </Link>

      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ marginBottom: "16px", fontSize: "2.6rem", lineHeight: "1.2" }}>
          {article.title}
        </h1>
        <div
          className="meta"
          style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}
        >
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

        {article.categories.length > 0 && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "16px" }}>
            {article.categories.map((category) => (
              <span key={category.id} className="tag">
                {category.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="error-text" style={{ marginBottom: "20px" }}>
          {error}
        </p>
      )}

      {isAuthor && (
        <div style={{ display: "flex", gap: "10px", marginBottom: "28px", flexWrap: "wrap" }}>
          <Link href={`/article/${article.id}/edit`} className="btn btn-sm">
            Upravit článek
          </Link>
          <button onClick={handleDeleteArticle} className="btn btn-sm btn-danger">
            Smazat článek
          </button>
        </div>
      )}

      <div
        className="card"
        style={{
          whiteSpace: "pre-wrap",
          fontSize: "1.08rem",
          lineHeight: "1.85",
          color: "var(--color-text)",
        }}
      >
        {article.content}
      </div>

      <hr className="divider" />

      <div>
        <h2 style={{ marginBottom: "6px" }}>
          Recenze
          {avgRating && (
            <span
              style={{
                fontSize: "1rem",
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                color: "var(--color-text-muted)",
                marginLeft: "12px",
              }}
            >
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
        {article.reviews.map((review) => {
          const isReviewAuthor = session?.user?.id === review.authorId;

          if (editingReviewId === review.id) {
            return (
              <div
                key={review.id}
                className="card"
                style={{ borderColor: "var(--color-accent)", borderWidth: "1px" }}
              >
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
                      onChange={(event) => setEditComment(event.target.value)}
                      rows={3}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                    <button type="submit" className="btn btn-accent btn-sm">
                      Uložit
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => setEditingReviewId(null)}
                    >
                      Zrušit
                    </button>
                  </div>
                </form>
              </div>
            );
          }

          return (
            <div key={review.id} className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "10px",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
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
                <div style={{ display: "flex", gap: "8px", marginTop: "14px", flexWrap: "wrap" }}>
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
                  <button className="btn btn-sm btn-danger" onClick={() => handleDeleteReview(review.id)}>
                    Smazat
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {session?.user && (
        <div className="card" style={{ marginTop: "32px" }}>
          <h3 style={{ marginBottom: "20px" }}>Napsat recenzi</h3>
          {reviewError && (
            <p className="error-text" style={{ marginBottom: "16px" }}>
              {reviewError}
            </p>
          )}
          <form onSubmit={handleSubmitReview}>
            <div className="form-group">
              <label className="form-label">Hodnocení</label>
              <InteractiveStarRating value={reviewRating} onChange={setReviewRating} />
            </div>
            <div className="form-group">
              <label className="form-label">Váš komentář</label>
              <textarea
                className="textarea"
                placeholder="Napište svůj názor na článek..."
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
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
            <Link href="/login">Přihlaste se</Link> pro přidání recenze.
          </p>
        </div>
      )}
    </main>
  );
}
