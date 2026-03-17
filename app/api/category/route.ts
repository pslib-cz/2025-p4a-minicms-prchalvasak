import { NextResponse } from "next/server";
import { getCategories } from "@/lib/actions/articles";

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Získání kategorií selhalo" },
      { status: 500 },
    );
  }
}
