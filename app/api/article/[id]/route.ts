import { NextResponse } from "next/server";
import { getArticle, updateArticle, deleteArticle } from "@/lib/actions/articles";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const article = await getArticle(id);

        if (!article) {
            return NextResponse.json(
                { error: "Článek nenalezen" },
                { status: 404 }
            );
        }

        return NextResponse.json(article, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Získání článku selhalo" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const { title, content, publishDate } = await request.json();

        if (!title || !content || !publishDate) {
            return NextResponse.json(
                { error: "Všechna pole jsou povinná" },
                { status: 400 }
            );
        }

        const article = await updateArticle(id, title, content, publishDate);

        return NextResponse.json(article, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Aktualizace článku selhala" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const article = await deleteArticle(id);

        return NextResponse.json({ id: article.id }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Smazání článku selhalo" },
            { status: 500 }
        );
    }
}
