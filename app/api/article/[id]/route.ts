import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getArticle, updateArticle, deleteArticle } from "@/lib/actions/articles";

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

        const { title, content, publishDate, published, categoryIds } = await request.json();

        if (!title || !content || !publishDate) {
            return NextResponse.json(
                { error: "Všechna pole jsou povinná" },
                { status: 400 }
            );
        }

        const article = await updateArticle(id, title, content, new Date(publishDate), published, categoryIds);

        revalidatePath("/");
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

        return NextResponse.json({ id: article.id }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Smazání článku selhalo" },
            { status: 500 }
        );
    }
}
