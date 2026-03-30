import { NextResponse } from "next/server";
import { getPublicArticle } from "@/lib/actions/articles";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const article = await getPublicArticle(slug);

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
