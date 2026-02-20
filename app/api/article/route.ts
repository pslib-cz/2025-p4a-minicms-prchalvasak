import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createArticle } from "@/lib/actions/articles";

export async function POST(request: Request) {
    try {
        const { title, content, publishDate, authorId } = await request.json();

        if (!title || !content || !publishDate || !authorId) {
            return NextResponse.json(
                { error: "Všechna pole jsou povinná" },
                { status: 400 }
            );
        }

        const article = await createArticle(title, content, publishDate, authorId);

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
        const articles = await prisma.article.findMany();
        return NextResponse.json(articles, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Získání článků selhalo" },
            { status: 500 }
        );
    }
}
