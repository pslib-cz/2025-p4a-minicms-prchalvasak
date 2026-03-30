import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  deleteArticle,
  getOwnedArticleBySlug,
  updateArticle,
} from "@/lib/actions/articles";
import {
  normalizeStringArray,
  normalizeTextInput,
  ARTICLE_STATUSES,
  validateArticleInput,
} from "@/lib/validation";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Musíte být přihlášeni" },
        { status: 401 },
      );
    }

    const { slug } = await params;
    const article = await getOwnedArticleBySlug(slug, session.user.id);

    if (!article) {
      return NextResponse.json(
        { error: "Článek nenalezen" },
        { status: 404 },
      );
    }

    return NextResponse.json(article, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Získání článku selhalo" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Musíte být přihlášeni" },
        { status: 401 },
      );
    }

    const { slug } = await params;
    const existing = await getOwnedArticleBySlug(slug, session.user.id);
    if (!existing) {
      return NextResponse.json(
        { error: "Článek nenalezen" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const title = normalizeTextInput(body.title);
    const content = typeof body.content === "string" ? body.content : "";
    const publishDate = normalizeTextInput(body.publishDate);
    const categoryIds = normalizeStringArray(body.categoryIds);
    const status = normalizeTextInput(body.status).toUpperCase();

    const validationError = validateArticleInput({
      title,
      content,
      publishDate,
      categoryIds,
      status,
    });

    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 },
      );
    }

    const article = await updateArticle(
      slug,
      title,
      content,
      new Date(publishDate),
      status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
      categoryIds,
    );

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath(`/article/${slug}`);
    revalidatePath(`/article/${article.slug}`);

    return NextResponse.json(article, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Aktualizace článku selhala" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Musíte být přihlášeni" },
        { status: 401 },
      );
    }

    const { slug } = await params;
    const existing = await getOwnedArticleBySlug(slug, session.user.id);
    if (!existing) {
      return NextResponse.json(
        { error: "Článek nenalezen" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const status = normalizeTextInput(body.status).toUpperCase();

    if (!ARTICLE_STATUSES.includes(status as (typeof ARTICLE_STATUSES)[number])) {
      return NextResponse.json(
        { error: "Zvolte platný stav článku." },
        { status: 400 },
      );
    }

    const article = await updateArticle(
      slug,
      existing.title,
      existing.content,
      existing.publishDate,
      status as "DRAFT" | "PUBLISHED",
      existing.categories.map((category) => category.id),
    );

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath(`/article/${slug}`);
    revalidatePath(`/article/${article.slug}`);

    return NextResponse.json(article, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Změna stavu článku selhala" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Musíte být přihlášeni" },
        { status: 401 },
      );
    }

    const { slug } = await params;

    const existing = await getOwnedArticleBySlug(slug, session.user.id);
    if (!existing) {
      return NextResponse.json(
        { error: "Článek nenalezen" },
        { status: 404 },
      );
    }

    const article = await deleteArticle(slug);

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath(`/article/${slug}`);

    return NextResponse.json({ id: article.id }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Smazání článku selhalo" },
      { status: 500 },
    );
  }
}
