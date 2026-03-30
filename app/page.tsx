import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Header from "./components/Header";
import {
  getCategories,
  getPublicArticlesPage,
  PUBLIC_ARTICLES_PER_PAGE,
} from "@/lib/actions/articles";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/lib/brand";
import { getArticleExcerpt, parsePageParam } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
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
      <main className="container container-wide home-content">
        {/* Hero */}
        <section className="card hero-section">
          <div>
            <h1 className="hero-title">
              {APP_NAME} pro autorské texty a redakční výběr.
            </h1>
            <p className="hero-desc">
              {APP_TAGLINE} Procházejte vydané články, filtrujte témata
              a sledujte reakce čtenářů pod každým textem.
            </p>
            <div className="hero-actions">
              <a href="#article-filters" className="btn btn-accent">
                Procházet články
              </a>
              <Link href="/dashboard" className="btn">
                Můj dashboard
              </Link>
            </div>
          </div>

          <div className="hero-visual">
            <Image
              src="/editorial-hero.svg"
              alt="Ilustrace redakcniho dashboardu"
              fill
              sizes="(max-width: 1100px) 100vw, 420px"
              style={{ objectFit: "cover", opacity: 0.8 }}
              priority
            />
          </div>
        </section>

        {/* Filters */}
        <section id="article-filters" className="card filters-section">
          <h2 style={{ marginBottom: '14px' }}>Hledat články</h2>

          <form method="get" className="filters-grid">
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

            <div className="filters-actions">
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

        {/* Section header */}
        <div className="section-header">
          <div>
            <h2>Publikované články</h2>
            <span className="accent-line" />
          </div>
          <p className="meta">
            {articlePage.totalCount} výsledků, strana {articlePage.currentPage} z{" "}
            {articlePage.totalPages}
          </p>
        </div>

        {/* Empty state */}
        {articlePage.articles.length === 0 && (
          <div className="card">
            <h3 style={{ marginBottom: "8px" }}>Nic nenalezeno</h3>
            <p>
              Zkuste upravit hledaný výraz nebo vyčistit aktivní filtr
              kategorie.
            </p>
          </div>
        )}

        {/* Article list */}
        <div className="articles-list">
          {articlePage.articles.map((article) => (
            <Link
              key={article.id}
              href={`/article/${article.slug}`}
              className="card card-interactive"
              style={{ textDecoration: "none", display: "block" }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}>
                <div>
                  <h3 style={{ marginBottom: "8px", fontSize: "1.2rem" }}>
                    {article.title}
                  </h3>
                  <div className="article-card-meta meta">
                    <span className="meta-accent">{article.author.name}</span>
                    <span className="sep">·</span>
                    <span>{new Date(article.publishDate).toLocaleDateString("cs-CZ")}</span>
                    <span className="sep">·</span>
                    <span>{article._count.reviews} recenzi</span>
                  </div>
                </div>

                {article.categories.length > 0 && (
                  <div className="article-card-tags">
                    {article.categories.map((category) => (
                      <span key={category.id} className="tag">
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <p className="article-card-excerpt">
                {getArticleExcerpt(article.content, 210)}
              </p>
            </Link>
          ))}
        </div>

        {articlePage.totalPages > 1 && (
          <nav aria-label="Strankovani clanku" className="pagination-nav">
            {articlePage.currentPage > 1 ? (
              <Link
                href={buildPageHref({
                  page: articlePage.currentPage - 1,
                  query,
                  category: selectedCategory,
                })}
                className="btn btn-sm"
              >
                Předchozí
              </Link>
            ) : (
              <span className="btn btn-sm btn-disabled">Předchozí</span>
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
                  className={pageNumber === articlePage.currentPage ? "btn btn-sm btn-accent" : "btn btn-sm"}
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
                className="btn btn-sm"
              >
                Další
              </Link>
            ) : (
              <span className="btn btn-sm btn-disabled">Další</span>
            )}
          </nav>
        )}
      </main>
    </div>
  );
}
