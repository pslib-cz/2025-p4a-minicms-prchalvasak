import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { createArticle } from "@/lib/actions/articles";
import prisma from "@/lib/prisma";
import {
    normalizeStringArray,
    normalizeTextInput,
    validateArticleInput,
} from "@/lib/validation";

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Musíte být přihlášeni" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const title = normalizeTextInput(body.title);
        const content = normalizeTextInput(body.content);
        const publishDate = normalizeTextInput(body.publishDate);
        const categoryIds = normalizeStringArray(body.categoryIds);

        const validationError = validateArticleInput({
            title,
            content,
            publishDate,
            categoryIds,
        });

        if (validationError) {
            return NextResponse.json(
                { error: validationError },
                { status: 400 }
            );
        }

        const article = await createArticle(
            title,
            content,
            new Date(publishDate),
            session.user.id,
            categoryIds,
        );

        revalidatePath("/");
        revalidatePath("/dashboard");

        return NextResponse.json(article, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: "Vytvoření článku selhalo" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const articles = await prisma.article.findMany({
            include: {
                author: true,
                categories: true,
            },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(articles, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Získání článků selhalo" },
            { status: 500 }
        );
    }
}
