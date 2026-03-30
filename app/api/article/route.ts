import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  createArticle,
  getDashboardArticlesPage,
} from "@/lib/actions/articles";
import {
  normalizeStringArray,
  normalizeTextInput,
  validateArticleInput,
} from "@/lib/validation";
import { parsePageParam } from "@/lib/site";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Musíte být přihlášeni" },
        { status: 401 },
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

    const article = await createArticle(
      title,
      content,
      new Date(publishDate),
      session.user.id,
      categoryIds,
      status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
    );

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath(`/article/${article.slug}`);

    return NextResponse.json(article, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Vytvoření článku selhalo" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Musíte být přihlášeni" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const currentPage = parsePageParam(searchParams.get("page"));
    const page = await getDashboardArticlesPage(session.user.id, currentPage);

    return NextResponse.json(page, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Získání článků selhalo" },
      { status: 500 },
    );
  }
}
