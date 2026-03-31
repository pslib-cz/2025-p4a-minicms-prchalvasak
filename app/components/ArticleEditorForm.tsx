"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Editor from "react-simple-wysiwyg";
import {
  ARTICLE_STATUSES,
  stripHtmlTags,
  validateArticleInput,
} from "@/lib/validation";

type CategoryOption = {
  id: string;
  name: string;
};

export type ArticleFormPayload = {
  title: string;
  content: string;
  publishDate: string;
  categoryIds: string[];
  status: (typeof ARTICLE_STATUSES)[number];
};

type SubmitArticleResult = {
  article?: {
    slug: string;
  };
  error?: string;
};

type ArticleEditorFormProps = {
  backHref: string;
  backLabel: string;
  heading: string;
  helperText: string;
  initialValues: ArticleFormPayload;
  submitLabel: string;
  submitArticle: (payload: ArticleFormPayload) => Promise<SubmitArticleResult>;
};

export default function ArticleEditorForm({
  backHref,
  backLabel,
  heading,
  helperText,
  initialValues,
  submitLabel,
  submitArticle,
}: ArticleEditorFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialValues.title);
  const [content, setContent] = useState(initialValues.content);
  const [publishDate, setPublishDate] = useState(initialValues.publishDate);
  const [status, setStatus] = useState<(typeof ARTICLE_STATUSES)[number]>(
    initialValues.status,
  );
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    initialValues.categoryIds,
  );
  const [error, setError] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  useEffect(() => {
    setTitle(initialValues.title);
    setContent(initialValues.content);
    setPublishDate(initialValues.publishDate);
    setStatus(initialValues.status);
    setSelectedCategoryIds(initialValues.categoryIds);
  }, [initialValues]);

  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await fetch("/api/category");
        if (!response.ok) {
          setError("Načtení kategorií selhalo.");
          return;
        }

        const data = (await response.json()) as CategoryOption[];
        setCategories(data);
      } catch {
        setError("Načtení kategorií selhalo.");
      } finally {
        setLoadingCategories(false);
      }
    };

    void loadCategories();
  }, []);

  const plainTextLength = useMemo(() => stripHtmlTags(content).length, [content]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((item) => item !== categoryId)
        : [...current, categoryId],
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const validationError = validateArticleInput({
      title,
      content,
      publishDate,
      categoryIds: selectedCategoryIds,
      status,
    });

    if (validationError) {
      setError(validationError);
      setSubmitting(false);
      return;
    }

    const result = await submitArticle({
      title,
      content,
      publishDate,
      categoryIds: selectedCategoryIds,
      status,
    });

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    if (result.article?.slug) {
      router.push(`/article/${result.article.slug}`);
    }
  };

  const handleCreateCategory = async () => {
    setCategoryError("");
    setCreatingCategory(true);

    try {
      const response = await fetch("/api/category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newCategoryName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setCategoryError(data.error || "Vytvoření kategorie selhalo.");
        return;
      }

      const category = data as CategoryOption;
      setCategories((current) =>
        [...current, category].sort((left, right) =>
          left.name.localeCompare(right.name, "cs"),
        ),
      );
      setSelectedCategoryIds((current) => [...new Set([...current, category.id])]);
      setNewCategoryName("");
      setShowCategoryModal(false);
    } catch {
      setCategoryError("Vytvoření kategorie selhalo.");
    } finally {
      setCreatingCategory(false);
    }
  };

  return (
    <main className="container editor-page">
      <Link href={backHref} className="back-link">
        ← {backLabel}
      </Link>

      <div className="card">
        <div className="editor-heading">
          <div>
            <h1>{heading}</h1>
            <p style={{ marginBottom: 0 }}>{helperText}</p>
          </div>
          <span className={`badge ${status === "PUBLISHED" ? "badge-published" : "badge-draft"}`}>
            {status === "PUBLISHED" ? "Publikace zapnuta" : "Draft"}
          </span>
        </div>

        {error && <p className="error-text" style={{ marginBottom: "18px" }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="editor-fields-row">
            <div className="form-group editor-field-title">
              <label className="form-label" htmlFor="article-title">Název</label>
              <input
                id="article-title"
                className="input"
                type="text"
                value={title}
                placeholder="Zadejte titulek článku"
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            <div className="form-group editor-field-status">
              <label className="form-label" htmlFor="article-status">Stav</label>
              <select
                id="article-status"
                className="select-input"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as (typeof ARTICLE_STATUSES)[number])
                }
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
            <div className="form-group editor-field-date">
              <label className="form-label" htmlFor="article-date">Publikovat</label>
              <input
                id="article-date"
                className="input"
                type="date"
                value={publishDate}
                onChange={(event) => setPublishDate(event.target.value)}
              />
            </div>
          </div>

          <div className="editor-content-section">
            <div className="editor-content-label">Obsah článku</div>
            <div className="editor-shell">
              <Editor
                value={content}
                onChange={(event) =>
                  setContent((event.target as HTMLTextAreaElement).value)
                }
                containerProps={{
                  style: {
                    minHeight: "320px",
                  },
                }}
              />
            </div>
            <div className="editor-content-footer">
              <span>Použijte základní formátování, seznamy a odkazy.</span>
              <span>{plainTextLength} znaků čistého textu</span>
            </div>
          </div>
          <div className="editor-categories-header">
            <span className="form-label" style={{ margin: 0 }}>Kategorie</span>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setShowCategoryModal(true)}
            >
              + Přidat kategorii
            </button>
          </div>

          {loadingCategories ? (
            <div className="dashboard-loading">
              <span className="spinner" />
              <span>Načítání kategorií...</span>
            </div>
          ) : (
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
          )}

          <div className="editor-footer">
            <span className="editor-footer-hint">
              Published + budoucí datum = naplánovaný článek.
            </span>
            <button type="submit" className="btn btn-accent" disabled={submitting}>
              {submitting ? (
                <><span className="spinner" /> Ukládání...</>
              ) : (
                submitLabel
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Category creation modal */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Nova kategorie</h3>

            {categoryError && (
              <p className="error-text" style={{ marginBottom: "14px" }}>{categoryError}</p>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="new-category-name">Nazev</label>
              <input
                id="new-category-name"
                className="input"
                type="text"
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                placeholder="Napr. Rozhovory"
                autoFocus
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn"
                onClick={() => setShowCategoryModal(false)}
              >
                Zrusit
              </button>
              <button
                type="button"
                className="btn btn-accent"
                onClick={handleCreateCategory}
                disabled={creatingCategory}
              >
                {creatingCategory ? "Vytvareni..." : "Vytvorit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
