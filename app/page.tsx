import Link from "next/link";
import type { Metadata } from "next";
import Header from "./components/Header";
import {
  getCategories,
  getPublicArticlesPage,
  PUBLIC_ARTICLES_PER_PAGE,
} from "@/lib/actions/articles";
import { getArticleExcerpt, parsePageParam } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "MiniCMS",
  description: "Mini CMS pro publikaci článků, recenzí a jednoduchou správu obsahu.",
  alternates: {
    canonical: "/",
  },
};

type HomePageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    category?: string;
  }>;
};

function buildPageHref({
  page,
  query,
  category,
}: {
  page: number;
  query: string;
  category: string;
}) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (category) {
    params.set("category", category);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();
  return queryString ? `/?${queryString}` : "/";
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const selectedCategory = params.category?.trim() ?? "";
  const currentPage = parsePageParam(params.page);

  const [categories, articlePage] = await Promise.all([
    getCategories(),
    getPublicArticlesPage({
      page: currentPage,
      pageSize: PUBLIC_ARTICLES_PER_PAGE,
      search: query,
      category: selectedCategory,
    }),
  ]);

  const hasFilters = query.length > 0 || selectedCategory.length > 0;

  return (
    <div className="page-wrapper">
      <Header />
      <main
        className="container container-wide"
        style={{ paddingTop: "40px", paddingBottom: "72px" }}
      >
        <section
          className="card hero-grid"
          style={{
            gap: "28px",
            marginBottom: "28px",
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ marginBottom: "14px", maxWidth: "16ch" }}>
              Objevujte články a sdílejte názory.
            </h1>
            <p style={{ maxWidth: "58ch", marginBottom: "24px" }}>
              Procházejte publikované články, filtrujte podle kategorií
              a přidávejte vlastní recenze.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <a href="#article-filters" className="btn btn-accent">
                Procházet články
              </a>
              <Link href="/dashboard" className="btn">
                Můj dashboard
              </Link>
            </div>
          </div>

          <div
            style={{
              position: "relative",
              minHeight: "220px",
              borderRadius: "14px",
              overflow: "hidden",
              border: "1px solid var(--color-border-light)",
              background:
                "radial-gradient(circle at top, rgba(232, 168, 73, 0.26), transparent 45%), var(--color-bg-input)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "4rem", opacity: 0.25 }}>◆</span>
          </div>
        </section>

        <section id="article-filters" className="card" style={{ marginBottom: "28px" }}>
          <div style={{ marginBottom: "18px" }}>
            <h2 style={{ marginBottom: "8px" }}>Hledat články</h2>
          </div>

          <form method="get" className="filters-grid" style={{ gap: "14px", alignItems: "end" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="q">
                Vyhledat
              </label>
              <input
                id="q"
                name="q"
                className="input"
                placeholder="Hledat podle názvu nebo obsahu..."
                defaultValue={query}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="category">
                Kategorie
              </label>
              <select
                id="category"
                name="category"
                className="select-input"
                defaultValue={selectedCategory}
              >
                <option value="">Všechny kategorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button type="submit" className="btn btn-accent">
                Filtrovat
              </button>
              {hasFilters && (
                <Link href="/" className="btn">
                  Reset
                </Link>
              )}
            </div>
          </form>
        </section>

        <section style={{ marginBottom: "18px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={{ marginBottom: "8px" }}>Publikované články</h2>
              <span className="accent-line" />
            </div>
            <p className="meta">
              {articlePage.totalCount} výsledků, strana {articlePage.currentPage} z{" "}
              {articlePage.totalPages}
            </p>
          </div>
        </section>

        {articlePage.articles.length === 0 && (
          <div className="card">
            <h3 style={{ marginBottom: "10px" }}>Nic nenalezeno</h3>
            <p>
              Zkuste upravit hledaný výraz nebo vyčistit aktivní filtr
              kategorie.
            </p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {articlePage.articles.map((article) => (
            <Link
              key={article.id}
              href={`/article/${article.id}`}
              className="card card-interactive"
              style={{ textDecoration: "none", display: "block" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "16px",
                  alignItems: "flex-start",
                  marginBottom: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h3 style={{ marginBottom: "8px", fontSize: "1.35rem" }}>
                    {article.title}
                  </h3>
                  <div
                    className="meta"
                    style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}
                  >
                    <span className="meta-accent">{article.author.name}</span>
                    <span>{new Date(article.publishDate).toLocaleDateString("cs-CZ")}</span>
                    <span>{article._count.reviews} recenzí</span>
                  </div>
                </div>

                {article.categories.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                      justifyContent: "flex-end",
                    }}
                  >
                    {article.categories.map((category) => (
                      <span key={category.id} className="tag">
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <p
                style={{
                  fontSize: "0.97rem",
                  lineHeight: "1.75",
                  color: "var(--color-text-secondary)",
                }}
              >
                {getArticleExcerpt(article.content, 210)}
              </p>
            </Link>
          ))}
        </div>

        {articlePage.totalPages > 1 && (
          <nav
            aria-label="Stránkování článků"
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: "28px",
            }}
          >
            {articlePage.currentPage > 1 ? (
              <Link
                href={buildPageHref({
                  page: articlePage.currentPage - 1,
                  query,
                  category: selectedCategory,
                })}
                className="btn"
              >
                Předchozí
              </Link>
            ) : (
              <span className="btn btn-disabled">Předchozí</span>
            )}

            {Array.from({ length: articlePage.totalPages }, (_, index) => index + 1).map(
              (pageNumber) => (
                <Link
                  key={pageNumber}
                  href={buildPageHref({
                    page: pageNumber,
                    query,
                    category: selectedCategory,
                  })}
                  className={pageNumber === articlePage.currentPage ? "btn btn-accent" : "btn"}
                >
                  {pageNumber}
                </Link>
              ),
            )}

            {articlePage.currentPage < articlePage.totalPages ? (
              <Link
                href={buildPageHref({
                  page: articlePage.currentPage + 1,
                  query,
                  category: selectedCategory,
                })}
                className="btn"
              >
                Další
              </Link>
            ) : (
              <span className="btn btn-disabled">Další</span>
            )}
          </nav>
        )}
      </main>
    </div>
  );
}
