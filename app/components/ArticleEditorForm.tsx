"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Editor from "react-simple-wysiwyg";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Spinner,
  Stack,
} from "react-bootstrap";
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
      router.refresh();
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
    <main
      className="container"
      style={{ paddingTop: "40px", paddingBottom: "72px", maxWidth: "920px" }}
    >
      <Link href={backHref} className="back-link">
        {backLabel}
      </Link>

      <Card
        bg="dark"
        text="light"
        className="shadow-sm border-secondary"
        style={{ backgroundColor: "var(--color-bg-elevated)" }}
      >
        <Card.Body className="p-4 p-lg-5">
          <Stack direction="horizontal" className="justify-content-between mb-4">
            <div>
              <h1 style={{ marginBottom: "8px" }}>{heading}</h1>
              <p className="mb-0">{helperText}</p>
            </div>
            <Badge
              bg={status === "PUBLISHED" ? "warning" : "secondary"}
              text={status === "PUBLISHED" ? "dark" : "light"}
            >
              {status === "PUBLISHED" ? "Publikace zapnuta" : "Uložit jako draft"}
            </Badge>
          </Stack>

          {error ? <Alert variant="danger">{error}</Alert> : null}

          <Form onSubmit={handleSubmit}>
            <Row className="g-4">
              <Col xs={12} lg={8}>
                <Form.Group controlId="article-title">
                  <Form.Label>Název</Form.Label>
                  <Form.Control
                    type="text"
                    value={title}
                    placeholder="Zadejte titulek článku"
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6} lg={2}>
                <Form.Group controlId="article-status">
                  <Form.Label>Stav</Form.Label>
                  <Form.Select
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as (typeof ARTICLE_STATUSES)[number])
                    }
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12} md={6} lg={2}>
                <Form.Group controlId="article-publish-date">
                  <Form.Label>Publikovat</Form.Label>
                  <Form.Control
                    type="date"
                    value={publishDate}
                    onChange={(event) => setPublishDate(event.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="mt-4">
              <Form.Label>Obsah článku</Form.Label>
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
              <div className="d-flex justify-content-between mt-2">
                <small className="text-secondary">
                  Použijte základní formátování, seznamy a odkazy.
                </small>
                <small className="text-secondary">
                  {plainTextLength} znaků čistého textu
                </small>
              </div>
            </div>

            <div className="mt-4">
              <Stack direction="horizontal" className="justify-content-between mb-3">
                <Form.Label className="mb-0">Kategorie</Form.Label>
                <Button
                  type="button"
                  variant="outline-warning"
                  size="sm"
                  onClick={() => setShowCategoryModal(true)}
                >
                  Přidat kategorii
                </Button>
              </Stack>

              {loadingCategories ? (
                <div className="d-flex align-items-center gap-2 text-secondary">
                  <Spinner animation="border" size="sm" />
                  <span>Načítání kategorií…</span>
                </div>
              ) : (
                <Row className="g-2">
                  {categories.map((category) => {
                    const checked = selectedCategoryIds.includes(category.id);

                    return (
                      <Col xs={12} md={6} xl={4} key={category.id}>
                        <label
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
                      </Col>
                    );
                  })}
                </Row>
              )}
            </div>

            <Stack
              direction="horizontal"
              className="justify-content-between mt-4 flex-wrap"
              gap={2}
            >
              <small className="text-secondary">
                Published + budoucí datum = naplánovaný článek.
              </small>
              <Button type="submit" variant="warning" disabled={submitting}>
                {submitting ? "Ukládání…" : submitLabel}
              </Button>
            </Stack>
          </Form>
        </Card.Body>
      </Card>

      <Modal
        show={showCategoryModal}
        onHide={() => setShowCategoryModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Nová kategorie</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {categoryError ? <Alert variant="danger">{categoryError}</Alert> : null}
          <Form.Group controlId="new-category-name">
            <Form.Label>Název</Form.Label>
            <Form.Control
              type="text"
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              placeholder="Např. Rozhovory"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowCategoryModal(false)}>
            Zrušit
          </Button>
          <Button variant="warning" onClick={handleCreateCategory} disabled={creatingCategory}>
            {creatingCategory ? "Vytváření…" : "Vytvořit"}
          </Button>
        </Modal.Footer>
      </Modal>
    </main>
  );
}
