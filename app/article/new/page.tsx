"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Alert, Spinner } from "react-bootstrap";
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
      return { error: data.error || "Vytvoření článku selhalo." };
    }

    return { article: data as { slug: string } };
  };

  return (
    <div className="page-wrapper">
      <Header />

      {status === "loading" ? (
        <div className="container" style={{ paddingTop: "40px" }}>
          <div className="d-flex align-items-center gap-2 text-secondary">
            <Spinner animation="border" size="sm" />
            <span>Načítání…</span>
          </div>
        </div>
      ) : null}

      {status === "authenticated" && session?.user ? (
        <ArticleEditorForm
          backHref="/dashboard"
          backLabel="← Zpět do dashboardu"
          heading="Nový článek"
          helperText="Vytvořte draft nebo připravte článek k naplánované publikaci."
          initialValues={initialValues}
          submitLabel="Uložit článek"
          submitArticle={submitArticle}
        />
      ) : null}

      {status === "unauthenticated" ? (
        <div className="container" style={{ paddingTop: "40px", maxWidth: "760px" }}>
          <Alert variant="warning">
            Musíte být přihlášeni, abyste mohli vytvořit nový článek.
          </Alert>
          <Link href="/login" className="btn btn-accent">
            Přihlásit se
          </Link>
        </div>
      ) : null}
    </div>
  );
}
