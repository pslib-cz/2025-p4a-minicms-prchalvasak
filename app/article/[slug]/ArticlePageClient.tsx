"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Star, ThumbsDown } from "lucide-react";
import type { ArticleDetail } from "@/lib/actions/articles";
import { useToast } from "@/app/components/Toast";
import { useConfirm } from "@/app/components/ConfirmDialog";
import { readingTime } from "@/lib/format";

function StarRating({ rating }: { rating: number }) {
  if (rating === 0) {
    return (
      <span className="star-row" style={{ color: "var(--color-error)", fontWeight: 600 }}>
        <ThumbsDown size={16} strokeWidth={2.5} />
      </span>
    );
  }

  return (
    <span className="star-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={`star ${star <= rating ? "filled" : ""}`}>
          <Star size={16} fill={star <= rating ? "currentColor" : "none"} strokeWidth={2.5} />
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
    <span className="star-row" style={{ cursor: "pointer", gap: "4px" }}>
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
                opacity: activeValue === 0 || hover === 0 ? 1 : 0.35,
                marginRight: "6px",
              }}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onChange(star)}
              title="odpad!"
            >
              <ThumbsDown size={20} strokeWidth={2.5} />
            </span>
          );
        }

        return (
          <span
            key={star}
            className={`star ${star <= activeValue && activeValue !== 0 ? "filled" : ""}`}
            style={{ cursor: "pointer", transition: "transform 0.12s ease" }}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onChange(star)}
            title={`${star}/5`}
          >
            <Star
              size={20}
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
  isOwnerPreview?: boolean;
};

export default function ArticlePageClient({
  initialArticle,
  isOwnerPreview = false,
}: ArticlePageClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [article, setArticle] = useState(initialArticle);
  const [error, setError] = useState("");
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");

  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/public/article/${article.slug}`);

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
    const confirmed = await confirm({
      title: "Smazat článek",
      message: `Opravdu chcete smazat „${article.title}"? Tuto akci nelze vrátit zpět.`,
      confirmLabel: "Smazat",
      variant: "danger",
    });
    if (!confirmed) return;

    setBusyAction("delete");
    const response = await fetch(`/api/article/${article.slug}`, { method: "DELETE" });

    if (response.ok) {
      toast("Článek byl smazán");
      router.push("/dashboard");
      return;
    }

    setBusyAction(null);
    const data = await response.json();
    toast(data.error || "Smazání selhalo", "error");
  };

  const handleToggleStatus = async () => {
    const nextStatus = article.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const label = nextStatus === "PUBLISHED" ? "publikovat" : "přepnout na draft";

    const confirmed = await confirm({
      title: nextStatus === "PUBLISHED" ? "Publikovat článek" : "Přepnout na draft",
      message: nextStatus === "PUBLISHED"
        ? `Článek „${article.title}" bude zveřejněn.`
        : `Článek „${article.title}" bude stažen z veřejného webu.`,
      confirmLabel: nextStatus === "PUBLISHED" ? "Publikovat" : "Přepnout",
    });
    if (!confirmed) return;

    setBusyAction("status");
    try {
      const response = await fetch(`/api/article/${article.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (response.ok) {
        toast(nextStatus === "PUBLISHED" ? "Článek byl publikován" : "Článek přepnut na draft");
        router.refresh();
        return;
      }

      const data = await response.json();
      toast(data.error || `Nepodařilo se ${label}`, "error");
    } catch {
      toast(`Nepodařilo se ${label}`, "error");
    } finally {
      setBusyAction(null);
    }
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
      toast("Recenze byla přidána");
      return;
    }

    const data = await response.json();
    setReviewError(data.error || "Vytvoření recenze selhalo");
  };

  const handleDeleteReview = async (reviewId: string) => {
    const confirmed = await confirm({
      title: "Smazat recenzi",
      message: "Opravdu chcete smazat tuto recenzi?",
      confirmLabel: "Smazat",
      variant: "danger",
    });
    if (!confirmed) return;

    const response = await fetch("/api/review", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: reviewId }),
    });

    if (response.ok) {
      await fetchArticle();
      toast("Recenze byla smazána");
      return;
    }

    const data = await response.json();
    toast(data.error || "Smazání recenze selhalo", "error");
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
      toast("Recenze byla upravena");
      return;
    }

    const data = await response.json();
    toast(data.error || "Úprava recenze selhala", "error");
  };

  const isAuthor = session?.user?.id === article.authorId;
  const currentUserReview = session?.user?.id
    ? article.reviews.find((review) => review.authorId === session.user.id) ?? null
    : null;
  const avgRating =
    article.reviews.length > 0
      ? (
          article.reviews.reduce((sum, review) => sum + review.rating, 0) /
          article.reviews.length
        ).toFixed(1)
      : null;

  return (
    <main className="container" style={{ paddingTop: "32px", paddingBottom: "64px" }}>
      <Link href="/" className="back-link">
        ← Zpět na články
      </Link>

      {isOwnerPreview && (
        <div className="preview-banner">
          <span className={`badge ${article.status === "DRAFT" ? "badge-draft" : "badge-scheduled"}`}>
            {article.status === "DRAFT" ? "Draft" : "Naplánováno"}
          </span>
          <span>
            Tento článek není veřejný.{" "}
            {article.status === "DRAFT"
              ? "Publikujte ho, aby byl viditelný pro ostatní."
              : "Bude zveřejněn " + new Date(article.publishDate).toLocaleDateString("cs-CZ") + "."}
          </span>
        </div>
      )}

      {/* Article header */}
      <div className="article-header">
        <h1 className="article-title">{article.title}</h1>
        <div className="article-meta meta">
          <span className="meta-accent">{article.author.name}</span>
          <span className="sep">·</span>
          <span>{new Date(article.publishDate).toLocaleDateString("cs-CZ")}</span>
          <span className="sep">·</span>
          <span className="reading-time">{readingTime(article.content)}</span>
          {avgRating && (
            <>
              <span className="sep">·</span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <StarRating rating={Math.round(Number(avgRating))} />
                <span style={{ color: "var(--color-text-secondary)" }}>{avgRating}</span>
              </span>
            </>
          )}
        </div>

        {article.categories.length > 0 && (
          <div className="article-categories">
            {article.categories.map((category) => (
              <span key={category.id} className="tag">
                {category.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {error && <p className="error-text" style={{ marginBottom: "18px" }}>{error}</p>}

      {isAuthor && (
        <div className="article-actions">
          <Link href={`/article/${article.slug}/edit`} className="btn btn-sm">
            Upravit článek
          </Link>
          <button
            onClick={handleToggleStatus}
            className="btn btn-sm btn-accent"
            disabled={busyAction !== null}
          >
            {article.status === "PUBLISHED" ? "Přepnout na draft" : "Publikovat"}
          </button>
          <button
            onClick={handleDeleteArticle}
            className="btn btn-sm btn-danger"
            disabled={busyAction !== null}
          >
            Smazat článek
          </button>
        </div>
      )}

      {/* Article body */}
      <div className="card">
        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>

      <hr className="divider" />

      {/* Reviews section */}
      <div className="reviews-section">
        <h2>
          Recenze
          {avgRating && <span className="reviews-avg">(průměr: {avgRating}/5)</span>}
        </h2>
        <span className="accent-line" />
      </div>

      {article.reviews.length === 0 && (
        <p style={{ color: "var(--color-text-muted)", marginTop: "18px", fontSize: "0.9rem" }}>
          Zatím žádné recenze.
        </p>
      )}

      <div className="reviews-list">
        {article.reviews.map((review) => {
          const isReviewAuthor = session?.user?.id === review.authorId;

          if (editingReviewId === review.id) {
            return (
              <div
                key={review.id}
                className="card review-card"
                style={{ borderColor: "var(--color-accent)" }}
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
                  <div className="review-actions" style={{ marginTop: "14px" }}>
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
            <div key={review.id} className="card review-card">
              <div className="review-header">
                <div className="review-rating-line">
                  <StarRating rating={review.rating} />
                  <span className="meta">({review.rating}/5)</span>
                </div>
                <div className="review-author-block meta">
                  <span className="meta-accent">{review.author.name}</span>
                  <br />
                  {new Date(review.createdAt).toLocaleDateString("cs-CZ")}
                </div>
              </div>
              <p className="review-comment">{review.comment}</p>
              {isReviewAuthor && (
                <div className="review-actions">
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

      {session?.user && !currentUserReview && (
        <div className="card review-form-card">
          <h3>Napsat recenzi</h3>
          {reviewError && (
            <p className="error-text" style={{ marginBottom: "14px" }}>{reviewError}</p>
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
            <button type="submit" className="btn btn-accent" style={{ marginTop: "18px" }}>
              Odeslat recenzi
            </button>
          </form>
        </div>
      )}

      {session?.user && currentUserReview && (
        <div className="card review-login-prompt">
          <p style={{ color: "var(--color-text-muted)", margin: 0 }}>
            Recenzi pro tento článek už máte. Můžete ji upravit nebo smazat v seznamu výše.
          </p>
        </div>
      )}

      {!session?.user && (
        <div className="card review-login-prompt">
          <p style={{ color: "var(--color-text-muted)", margin: 0 }}>
            <Link href="/login">Přihlaste se</Link> pro přidání recenze.
          </p>
        </div>
      )}
    </main>
  );
}
