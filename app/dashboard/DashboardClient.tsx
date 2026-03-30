"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Badge,
  Button,
  ButtonGroup,
  Card,
  Pagination,
  Spinner,
  Stack,
} from "react-bootstrap";

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
    return {
      label: "Draft",
      variant: "secondary" as const,
    };
  }

  if (new Date(article.publishDate) > new Date()) {
    return {
      label: "Naplánováno",
      variant: "warning" as const,
    };
  }

  return {
    label: "Publikováno",
    variant: "success" as const,
  };
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
          setError(data.error || "Načtení dashboardu selhalo.");
          return;
        }

        setPageData(data as DashboardArticlePage);
      } catch {
        setError("Načtení dashboardu selhalo.");
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
      throw new Error(data.error || "Načtení dashboardu selhalo.");
    }

    setPageData(data as DashboardArticlePage);
  };

  const handleDelete = async (slug: string) => {
    if (!window.confirm("Opravdu chcete tento článek smazat?")) {
      return;
    }

    setBusySlug(slug);
    try {
      const response = await fetch(`/api/article/${slug}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Smazání článku selhalo.");
        return;
      }

      await reloadCurrentPage();
      router.refresh();
    } catch {
      setError("Smazání článku selhalo.");
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
        setError(data.error || "Změna stavu článku selhala.");
        return;
      }

      await reloadCurrentPage();
      router.refresh();
    } catch {
      setError("Změna stavu článku selhala.");
    } finally {
      setBusySlug(null);
    }
  };

  return (
    <main className="container container-wide" style={{ paddingTop: "40px", paddingBottom: "72px" }}>
      <Card
        bg="dark"
        text="light"
        className="shadow-sm border-secondary mb-4"
        style={{ backgroundColor: "var(--color-bg-elevated)" }}
      >
        <Card.Body className="p-4 p-lg-5">
          <Stack direction="horizontal" className="justify-content-between flex-wrap gap-3">
            <div>
              <h1 style={{ marginBottom: "12px" }}>Můj dashboard</h1>
              <p className="mb-0">
                Spravujte vlastní obsah přes klientský dashboard napojený na Route Handlers.
              </p>
            </div>
            <Stack direction="horizontal" gap={2}>
              <Link href="/article/new" className="btn btn-accent">
                Nový článek
              </Link>
              <Link href="/" className="btn">
                Veřejný web
              </Link>
            </Stack>
          </Stack>
        </Card.Body>
      </Card>

      {error ? <Alert variant="danger">{error}</Alert> : null}

      {loading ? (
        <div className="d-flex align-items-center gap-2 text-secondary">
          <Spinner animation="border" size="sm" />
          <span>Načítání obsahu…</span>
        </div>
      ) : null}

      {!loading && pageData && (
        <>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
            <div>
              <h2 style={{ marginBottom: "8px" }}>Moje články</h2>
              <span className="accent-line" />
            </div>
            <p className="meta mb-0">
              {pageData.totalCount} článků, strana {pageData.currentPage} z {pageData.totalPages}
            </p>
          </div>

          {pageData.articles.length === 0 ? (
            <Card
              bg="dark"
              text="light"
              className="border-secondary"
              style={{ backgroundColor: "var(--color-bg-elevated)" }}
            >
              <Card.Body className="p-4">
                <h3 style={{ marginBottom: "10px" }}>Zatím nemáte žádné články</h3>
                <p className="mb-3">Začněte novým draftem a publikujte až ve chvíli, kdy budete hotovi.</p>
                <Link href="/article/new" className="btn btn-accent">
                  Vytvořit článek
                </Link>
              </Card.Body>
            </Card>
          ) : (
            <Stack gap={3}>
              {pageData.articles.map((article) => {
                const state = getArticleState(article);
                const isBusy = busySlug === article.slug;

                return (
                  <Card
                    key={article.id}
                    bg="dark"
                    text="light"
                    className="border-secondary"
                    style={{ backgroundColor: "var(--color-bg-elevated)" }}
                  >
                    <Card.Body className="p-4">
                      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                        <div style={{ flex: "1 1 520px" }}>
                          <Stack direction="horizontal" gap={2} className="flex-wrap mb-3">
                            <Badge bg={state.variant}>{state.label}</Badge>
                            <Badge bg="warning" text="dark">
                              {article._count.reviews} recenzí
                            </Badge>
                            {article.categories.map((category) => (
                              <Badge key={category.id} bg="secondary">
                                {category.name}
                              </Badge>
                            ))}
                          </Stack>

                          <h3 style={{ marginBottom: "10px" }}>{article.title}</h3>
                          <p className="meta mb-3">
                            URL: /article/{article.slug}
                            <br />
                            Publikace: {new Date(article.publishDate).toLocaleDateString("cs-CZ")}
                            {" · "}
                            Poslední úprava: {new Date(article.updatedAt).toLocaleDateString("cs-CZ")}
                          </p>
                          <p className="mb-0">
                            {article.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 220)}
                            ...
                          </p>
                        </div>

                        <div className="d-flex flex-column align-items-stretch gap-2">
                          <ButtonGroup vertical>
                            <Link href={`/article/${article.slug}`} className="btn btn-outline-light">
                              Detail
                            </Link>
                            <Link href={`/article/${article.slug}/edit`} className="btn btn-outline-light">
                              Upravit
                            </Link>
                            <Button
                              variant={article.status === "PUBLISHED" ? "outline-secondary" : "warning"}
                              onClick={() => void handleToggleStatus(article)}
                              disabled={isBusy}
                            >
                              {article.status === "PUBLISHED" ? "Přepnout na draft" : "Publikovat"}
                            </Button>
                            <Button
                              variant="outline-danger"
                              onClick={() => void handleDelete(article.slug)}
                              disabled={isBusy}
                            >
                              {isBusy ? "Probíhá…" : "Smazat"}
                            </Button>
                          </ButtonGroup>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                );
              })}
            </Stack>
          )}

          {pageData.totalPages > 1 ? (
            <Pagination className="mt-4 justify-content-center flex-wrap">
              <Pagination.Prev
                disabled={pageData.currentPage <= 1}
                onClick={() => replacePage(pageData.currentPage - 1)}
              />
              {Array.from({ length: pageData.totalPages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <Pagination.Item
                    active={pageNumber === pageData.currentPage}
                    key={pageNumber}
                    onClick={() => replacePage(pageNumber)}
                  >
                    {pageNumber}
                  </Pagination.Item>
                ),
              )}
              <Pagination.Next
                disabled={pageData.currentPage >= pageData.totalPages}
                onClick={() => replacePage(pageData.currentPage + 1)}
              />
            </Pagination>
          ) : null}
        </>
      )}
    </main>
  );
}
