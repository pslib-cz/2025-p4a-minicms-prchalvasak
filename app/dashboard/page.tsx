import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Header from "@/app/components/Header";
import {
  deleteArticle,
  getArticle,
  getDashboardArticlesPage,
} from "@/lib/actions/articles";
import { auth } from "@/lib/auth";
import { parsePageParam } from "@/lib/site";

type DashboardPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

async function deleteArticleAction(formData: FormData) {
  "use server";

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const articleId = formData.get("articleId");

  if (typeof articleId !== "string" || articleId.length === 0) {
    return;
  }

  const article = await getArticle(articleId);

  if (!article || article.authorId !== session.user.id) {
    return;
  }

  await deleteArticle(articleId);
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath(`/article/${articleId}`);
}

function buildDashboardHref(page: number) {
  if (page <= 1) {
    return "/dashboard";
  }

  return `/dashboard?page=${page}`;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const currentPage = parsePageParam(params.page);
  const articlePage = await getDashboardArticlesPage(session.user.id, currentPage);

  return (
    <div className="page-wrapper">
      <Header />
      <main className="container container-wide" style={{ paddingTop: "40px", paddingBottom: "72px" }}>
        <section className="card" style={{ marginBottom: "28px" }}>
          <h1 style={{ marginBottom: "12px" }}>Můj dashboard</h1>
          <p style={{ maxWidth: "64ch", marginBottom: "22px" }}>
            Přehled vašich článků, stav publikace a rychlé akce.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/article/new" className="btn btn-accent">
              Nový článek
            </Link>
            <Link href="/" className="btn">
              Zpět na články
            </Link>
          </div>
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
              <h2 style={{ marginBottom: "8px" }}>Moje články</h2>
              <span className="accent-line" />
            </div>
            <p className="meta">
              {articlePage.totalCount} článků, strana {articlePage.currentPage} z {articlePage.totalPages}
            </p>
          </div>
        </section>

        {articlePage.articles.length === 0 ? (
          <div className="card">
            <h3 style={{ marginBottom: "10px" }}>Zatím nemáte žádné články</h3>
            <p style={{ marginBottom: "18px" }}>
              Vytvořte svůj první článek a uvidíte ho zde.
            </p>
            <Link href="/article/new" className="btn btn-accent">
              Vytvořit článek
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {articlePage.articles.map((article) => {
              const isPublished = new Date(article.publishDate) <= new Date();

              return (
                <article key={article.id} className="card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ flex: "1 1 440px" }}>
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "10px" }}>
                        <span className="tag">{isPublished ? "Publikováno" : "Naplánováno"}</span>
                        <span className="tag">{article._count.reviews} recenzí</span>
                        {article.categories.map((category) => (
                          <span key={category.id} className="tag">
                            {category.name}
                          </span>
                        ))}
                      </div>

                      <h3 style={{ marginBottom: "10px" }}>{article.title}</h3>
                      <p className="meta" style={{ marginBottom: "14px" }}>
                        Datum publikace: {new Date(article.publishDate).toLocaleDateString("cs-CZ")} ·
                        Poslední úprava: {new Date(article.updatedAt).toLocaleDateString("cs-CZ")}
                      </p>
                      <p>{article.content.slice(0, 180).trimEnd()}...</p>
                    </div>

                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <Link href={`/article/${article.id}`} className="btn btn-sm">
                        Detail
                      </Link>
                      <Link href={`/article/${article.id}/edit`} className="btn btn-sm">
                        Upravit
                      </Link>
                      <form action={deleteArticleAction}>
                        <input type="hidden" name="articleId" value={article.id} />
                        <button type="submit" className="btn btn-sm btn-danger">
                          Smazat
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {articlePage.totalPages > 1 && (
          <nav
            aria-label="Stránkování dashboardu"
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: "28px",
            }}
          >
            {articlePage.currentPage > 1 ? (
              <Link href={buildDashboardHref(articlePage.currentPage - 1)} className="btn">
                Předchozí
              </Link>
            ) : (
              <span className="btn btn-disabled">Předchozí</span>
            )}

            {Array.from({ length: articlePage.totalPages }, (_, index) => index + 1).map(
              (pageNumber) => (
                <Link
                  key={pageNumber}
                  href={buildDashboardHref(pageNumber)}
                  className={pageNumber === articlePage.currentPage ? "btn btn-accent" : "btn"}
                >
                  {pageNumber}
                </Link>
              ),
            )}

            {articlePage.currentPage < articlePage.totalPages ? (
              <Link href={buildDashboardHref(articlePage.currentPage + 1)} className="btn">
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
