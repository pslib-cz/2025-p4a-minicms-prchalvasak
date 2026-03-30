"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import ArticleEditorForm, {
  type ArticleFormPayload,
} from "@/app/components/ArticleEditorForm";

type EditableArticleResponse = ArticleFormPayload & {
  slug: string;
};

export default function EditArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { status } = useSession();
  const [article, setArticle] = useState<EditableArticleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug || status !== "authenticated") {
      if (status === "unauthenticated") {
        setLoading(false);
      }
      return;
    }

    const loadArticle = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/article/${slug}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Nacteni clanku selhalo.");
          return;
        }

        setArticle({
          title: data.title,
          content: data.content,
          publishDate: new Date(data.publishDate).toISOString().split("T")[0],
          categoryIds: data.categories.map((category: { id: string }) => category.id),
          status: data.status,
          slug: data.slug,
        });
      } catch {
        setError("Nacteni clanku selhalo.");
      } finally {
        setLoading(false);
      }
    };

    void loadArticle();
  }, [slug, status]);

  const initialValues = useMemo<ArticleFormPayload>(
    () =>
      article ?? {
        title: "",
        content: "",
        publishDate: "",
        categoryIds: [],
        status: "DRAFT",
      },
    [article],
  );

  const submitArticle = async (payload: ArticleFormPayload) => {
    const response = await fetch(`/api/article/${slug}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      return { error: data.error || "Uprava clanku selhala." };
    }

    return { article: data as { slug: string } };
  };

  return (
    <div className="page-wrapper">
      <Header />

      {(loading || status === "loading") && (
        <div className="container" style={{ paddingTop: "32px" }}>
          <div className="dashboard-loading">
            <span className="spinner" />
            <span>Načítání článku...</span>
          </div>
        </div>
      )}

      {!loading && status === "authenticated" && article && (
        <ArticleEditorForm
          backHref="/dashboard"
          backLabel="Zpet do dashboardu"
          heading="Upravit clanek"
          helperText="Zmeny se ukladaji pres chranene API a znovu validuji na serveru."
          initialValues={initialValues}
          submitLabel="Ulozit zmeny"
          submitArticle={submitArticle}
        />
      )}

      {!loading && status === "unauthenticated" && (
        <div className="container" style={{ paddingTop: "32px", maxWidth: "760px" }}>
          <p className="error-text" style={{ marginBottom: "16px" }}>
            Pro úpravu článku se musíte přihlásit.
          </p>
          <Link href="/login" className="btn btn-accent">
            Přihlásit se
          </Link>
        </div>
      )}

      {!loading && error && (
        <div className="container" style={{ paddingTop: "32px", maxWidth: "760px" }}>
          <p className="error-text" style={{ marginBottom: "16px" }}>{error}</p>
          <Link href="/dashboard" className="btn">
            Zpět do dashboardu
          </Link>
        </div>
      )}
    </div>
  );
}
