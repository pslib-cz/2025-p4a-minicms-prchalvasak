import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { createArticle, getArticles } from "@/lib/actions/articles";


export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Musíte být přihlášeni" },
                { status: 401 }
            );
        }

        const { title, content, publishDate, published, categoryIds } = await request.json();

        if (!title || !content || !publishDate) {
            return NextResponse.json(
                { error: "Všechna pole jsou povinná" },
                { status: 400 }
            );
        }

        const article = await createArticle(title, content, new Date(publishDate), session.user.id, published ?? false, categoryIds ?? []);

        revalidatePath("/");

        return NextResponse.json(article, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: "Vytvoření článku selhalo" },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || undefined;
        const category = searchParams.get("category") || undefined;
        const page = parseInt(searchParams.get("page") || "1");
        const pageSize = parseInt(searchParams.get("pageSize") || "10");
        const mine = searchParams.get("mine") === "true";

        let authorId: string | undefined;
        if (mine) {
            const session = await auth();
            if (!session?.user?.id) {
                return NextResponse.json({ error: "Musíte být přihlášeni" }, { status: 401 });
            }
            authorId = session.user.id;
        }

        const result = await getArticles({
            search, category, page, pageSize, authorId,
            publishedOnly: mine ? false : true,
        });
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Získání článků selhalo" },
            { status: 500 }
        );
    }
}
