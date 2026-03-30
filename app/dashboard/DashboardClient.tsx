"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type DashboardArticle = {
  id: string;
  title: string;
  slug: string;
  content: string;
  updatedAt: string;
  publishDate: string;
  status: "DRAFT" | "PUBLISHED";
  categories: Array<{
    id: string;
    name: string;
  }>;
  _count: {
    reviews: number;
  };
};

type DashboardArticlePage = {
  articles: DashboardArticle[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
};

function getArticleState(article: DashboardArticle) {
  if (article.status === "DRAFT") {
    return { label: "Draft", className: "badge-draft" };
  }
  if (new Date(article.publishDate) > new Date()) {
    return { label: "Naplanovano", className: "badge-scheduled" };
  }
  return { label: "Publikovano", className: "badge-published" };
}

type DashboardClientProps = {
  initialPage: number;
};

export default function DashboardClient({ initialPage }: DashboardClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pageData, setPageData] = useState<DashboardArticlePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busySlug, setBusySlug] = useState<string | null>(null);

  const currentPage = useMemo(() => {
    const page = Number.parseInt(searchParams.get("page") ?? `${initialPage}`, 10);
    return Number.isFinite(page) && page > 0 ? page : 1;
  }, [initialPage, searchParams]);

  useEffect(() => {
    const loadPage = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/article?page=${currentPage}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Nacteni dashboardu selhalo.");
          return;
        }

        setPageData(data as DashboardArticlePage);
      } catch {
        setError("Nacteni dashboardu selhalo.");
      } finally {
        setLoading(false);
      }
    };

    void loadPage();
  }, [currentPage]);

  const replacePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", `${page}`);
    }

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const reloadCurrentPage = async () => {
    const response = await fetch(`/api/article?page=${currentPage}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Nacteni dashboardu selhalo.");
    }

    setPageData(data as DashboardArticlePage);
  };

  const handleDelete = async (slug: string) => {
    if (!window.confirm("Opravdu chcete tento clanek smazat?")) {
      return;
    }

    setBusySlug(slug);
    try {
      const response = await fetch(`/api/article/${slug}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Smazani clanku selhalo.");
        return;
      }

      await reloadCurrentPage();
      router.refresh();
    } catch {
      setError("Smazani clanku selhalo.");
    } finally {
      setBusySlug(null);
    }
  };

  const handleToggleStatus = async (article: DashboardArticle) => {
    const nextStatus = article.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setBusySlug(article.slug);

    try {
      const response = await fetch(`/api/article/${article.slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Zmena stavu clanku selhala.");
        return;
      }

      await reloadCurrentPage();
      router.refresh();
    } catch {
      setError("Zmena stavu clanku selhala.");
    } finally {
      setBusySlug(null);
    }
  };

  return (
    <main className="container container-wide" style={{ paddingTop: "32px", paddingBottom: "64px" }}>
      <div className="card dashboard-hero">
        <div className="dashboard-hero-inner">
          <div>
            <h1>Můj dashboard</h1>
            <p style={{ marginBottom: 0 }}>
              Spravujte vlastní obsah, publikujte články a sledujte recenze.
            </p>
          </div>
          <div className="dashboard-hero-actions">
            <Link href="/article/new" className="btn btn-accent">
              Nový článek
            </Link>
            <Link href="/" className="btn">
              Veřejný web
            </Link>
          </div>
        </div>
      </div>

      {error && <p className="error-text" style={{ marginBottom: "16px" }}>{error}</p>}

      {loading && (
        <div className="dashboard-loading">
          <span className="spinner" />
          <span>Načítání obsahu...</span>
        </div>
      )}

      {!loading && pageData && (
        <>
          <div className="section-header">
            <div>
              <h2>Moje články</h2>
              <span className="accent-line" />
            </div>
            <p className="meta">
              {pageData.totalCount} článků, strana {pageData.currentPage} z {pageData.totalPages}
            </p>
          </div>

          {pageData.articles.length === 0 ? (
            <div className="card dashboard-empty">
              <h3>Zatím nemáte žádné články</h3>
              <p>Začněte novým draftem a publikujte až ve chvíli, kdy budete hotovi.</p>
              <Link href="/article/new" className="btn btn-accent">
                Vytvořit článek
              </Link>
            </div>
          ) : (
            <div className="articles-list">
              {pageData.articles.map((article) => {
                const state = getArticleState(article);
                const isBusy = busySlug === article.slug;

                return (
                  <div key={article.id} className="card">
                    <div className="dashboard-article-card">
                      <div className="dashboard-article-info">
                        <div className="dashboard-badges">
                          <span className={`badge ${state.className}`}>{state.label}</span>
                          <span className="badge badge-count">
                            {article._count.reviews} recenzi
                          </span>
                          {article.categories.map((category) => (
                            <span key={category.id} className="tag">
                              {category.name}
                            </span>
                          ))}
                        </div>

                        <h3 className="dashboard-article-title">{article.title}</h3>
                        <p className="meta dashboard-article-meta">
                          /article/{article.slug}
                          {" · "}
                          Publikace: {new Date(article.publishDate).toLocaleDateString("cs-CZ")}
                          {" · "}
                          Upraveno: {new Date(article.updatedAt).toLocaleDateString("cs-CZ")}
                        </p>
                        <p className="dashboard-article-excerpt">
                          {article.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200)}...
                        </p>
                      </div>

                      <div className="dashboard-article-actions">
                        <Link href={`/article/${article.slug}`} className="btn btn-sm">
                          Detail
                        </Link>
                        <Link href={`/article/${article.slug}/edit`} className="btn btn-sm">
                          Upravit
                        </Link>
                        <button
                          className="btn btn-sm btn-accent"
                          onClick={() => void handleToggleStatus(article)}
                          disabled={isBusy}
                        >
                          {article.status === "PUBLISHED" ? "Prepnout na draft" : "Publikovat"}
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => void handleDelete(article.slug)}
                          disabled={isBusy}
                        >
                          {isBusy ? "Probiha..." : "Smazat"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {pageData.totalPages > 1 && (
            <nav className="pagination-nav" aria-label="Strankovani">
              <button
                className="btn btn-sm"
                disabled={pageData.currentPage <= 1}
                onClick={() => replacePage(pageData.currentPage - 1)}
              >
                Predchozi
              </button>
              {Array.from({ length: pageData.totalPages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <button
                    key={pageNumber}
                    className={pageNumber === pageData.currentPage ? "btn btn-sm btn-accent" : "btn btn-sm"}
                    onClick={() => replacePage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ),
              )}
              <button
                className="btn btn-sm"
                disabled={pageData.currentPage >= pageData.totalPages}
                onClick={() => replacePage(pageData.currentPage + 1)}
              >
                Dalsi
              </button>
            </nav>
          )}
        </>
      )}
    </main>
  );
}
