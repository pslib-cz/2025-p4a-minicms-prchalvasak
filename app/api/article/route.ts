import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createArticle } from "@/lib/actions/articles";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Musíte být přihlášeni" },
                { status: 401 }
            );
        }

        const { title, content, publishDate } = await request.json();

        if (!title || !content || !publishDate) {
            return NextResponse.json(
                { error: "Všechna pole jsou povinná" },
                { status: 400 }
            );
        }

        const article = await createArticle(title, content, new Date(publishDate), session.user.id);

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
            include: { author: true },
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
