import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCategories } from "@/lib/actions/articles";
import prisma from "@/lib/prisma";
import { normalizeTextInput, validateCategoryName } from "@/lib/validation";

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
    const name = normalizeTextInput(body.name);
    const validationError = validateCategoryName(name);

    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 },
      );
    }

    const existing = await prisma.category.findUnique({
      where: { name },
      select: { id: true, name: true },
    });

    if (existing) {
      return NextResponse.json(existing, { status: 200 });
    }

    const category = await prisma.category.create({
      data: { name },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Vytvoření kategorie selhalo" },
      { status: 500 },
    );
  }
}
