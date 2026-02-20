import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createArticle, updateArticle, deleteArticle } from "@/lib/actions/articles";

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

        return NextResponse.json(
            { id: article.id, title: article.title, content: article.content, publishDate: article.publishDate, authorId: article.authorId },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Vytvoření článku selhalo" },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const { id, title, content, publishDate } = await request.json();

        if (!id || !title || !content || !publishDate) {
            return NextResponse.json(
                { error: "Všechna pole jsou povinná" },
                { status: 400 }
            );
        }

        const article = await updateArticle(id, title, content, publishDate);

        return NextResponse.json(
            { id: article.id, title: article.title, content: article.content, publishDate: article.publishDate },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Aktualizace článku selhala" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json(
                { error: "ID je povinné" },
                { status: 400 }
            );
        }

        const article = await deleteArticle(id);

        return NextResponse.json(
            { id: article.id },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Smazání článku selhalo" },
            { status: 500 }
        );
    }
}