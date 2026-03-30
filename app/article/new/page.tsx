"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Header from "@/app/components/Header";
import ArticleEditorForm, {
  type ArticleFormPayload,
} from "@/app/components/ArticleEditorForm";

export default function NewArticlePage() {
  const { data: session, status } = useSession();

  const initialValues = useMemo<ArticleFormPayload>(
    () => ({
      title: "",
      content: "",
      publishDate: new Date().toISOString().split("T")[0],
      categoryIds: [],
      status: "DRAFT",
    }),
    [],
  );

  const submitArticle = async (payload: ArticleFormPayload) => {
    const response = await fetch("/api/article", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      return { error: data.error || "Vytvoreni clanku selhalo." };
    }

    return { article: data as { slug: string } };
  };

  return (
    <div className="page-wrapper">
      <Header />

      {status === "loading" && (
        <div className="container" style={{ paddingTop: "32px" }}>
          <div className="dashboard-loading">
            <span className="spinner" />
            <span>Nacitani...</span>
          </div>
        </div>
      )}

      {status === "authenticated" && session?.user && (
        <ArticleEditorForm
          backHref="/dashboard"
          backLabel="Zpet do dashboardu"
          heading="Nový článek"
          helperText="Vytvorte draft nebo pripravte clanek k naplanovane publikaci."
          initialValues={initialValues}
          submitLabel="Uložit článek"
          submitArticle={submitArticle}
        />
      )}

      {status === "unauthenticated" && (
        <div className="container" style={{ paddingTop: "32px", maxWidth: "760px" }}>
          <p className="error-text" style={{ marginBottom: "16px" }}>
            Musíte být přihlášeni abyste mohli vytvořit nový článek.
          </p>
          <Link href="/login" className="btn btn-accent">
            Přihlásit se
          </Link>
        </div>
      )}
    </div>
  );
}
