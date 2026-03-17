import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getArticle, updateArticle, deleteArticle } from "@/lib/actions/articles";
import {
    normalizeStringArray,
    normalizeTextInput,
    validateArticleInput,
} from "@/lib/validation";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
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
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Musíte být přihlášeni" },
                { status: 401 }
            );
        }

        const { id } = await params;

        const existing = await getArticle(id);
        if (!existing) {
            return NextResponse.json(
                { error: "Článek nenalezen" },
                { status: 404 }
            );
        }

        if (existing.authorId !== session.user.id) {
            return NextResponse.json(
                { error: "Nemáte oprávnění upravovat tento článek" },
                { status: 403 }
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

        const article = await updateArticle(
            id,
            title,
            content,
            new Date(publishDate),
            categoryIds,
        );

        revalidatePath("/");
        revalidatePath("/dashboard");
        revalidatePath(`/article/${id}`);

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
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Musíte být přihlášeni" },
                { status: 401 }
            );
        }

        const { id } = await params;

        const existing = await getArticle(id);
        if (!existing) {
            return NextResponse.json(
                { error: "Článek nenalezen" },
                { status: 404 }
            );
        }

        if (existing.authorId !== session.user.id) {
            return NextResponse.json(
                { error: "Nemáte oprávnění smazat tento článek" },
                { status: 403 }
            );
        }

        const article = await deleteArticle(id);

        revalidatePath("/");
        revalidatePath("/dashboard");

        return NextResponse.json({ id: article.id }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Smazání článku selhalo" },
            { status: 500 }
        );
    }
}
