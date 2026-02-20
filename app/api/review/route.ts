import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createReview, getReviews, getReview, updateReview, deleteReview } from "@/lib/actions/reviews";

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Musíte být přihlášeni" },
                { status: 401 }
            );
        }

        const { articleId, rating, comment } = await request.json();

        if (!articleId || rating === undefined || rating === null || !comment) {
            return NextResponse.json(
                { error: "Všechna pole jsou povinná" },
                { status: 400 }
            );
        }

        if (rating < 0 || rating > 5) {
            return NextResponse.json(
                { error: "Hodnocení musí být 0-5" },
                { status: 400 }
            );
        }

        const review = await createReview(articleId, rating, comment, session.user.id);

        return NextResponse.json(review, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: "Vytvoření recenze selhalo" },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const articleId = searchParams.get("articleId");

        if (!articleId) {
            return NextResponse.json(
                { error: "articleId je povinný" },
                { status: 400 }
            );
        }

        const reviews = await getReviews(articleId);

        return NextResponse.json(reviews, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Získání recenzí selhalo" },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Musíte být přihlášeni" },
                { status: 401 }
            );
        }

        const { id, rating, comment } = await request.json();

        if (!id || rating === undefined || rating === null || !comment) {
            return NextResponse.json(
                { error: "Všechna pole jsou povinná" },
                { status: 400 }
            );
        }

        if (rating < 0 || rating > 5) {
            return NextResponse.json(
                { error: "Hodnocení musí být 0-5" },
                { status: 400 }
            );
        }

        const existing = await getReview(id);
        if (!existing) {
            return NextResponse.json(
                { error: "Recenze nenalezena" },
                { status: 404 }
            );
        }

        if (existing.authorId !== session.user.id) {
            return NextResponse.json(
                { error: "Nemáte oprávnění upravovat tuto recenzi" },
                { status: 403 }
            );
        }

        const review = await updateReview(id, rating, comment);

        return NextResponse.json(review, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Aktualizace recenze selhala" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Musíte být přihlášeni" },
                { status: 401 }
            );
        }

        const { id } = await request.json();

        if (!id) {
            return NextResponse.json(
                { error: "ID je povinné" },
                { status: 400 }
            );
        }

        const existing = await getReview(id);
        if (!existing) {
            return NextResponse.json(
                { error: "Recenze nenalezena" },
                { status: 404 }
            );
        }

        if (existing.authorId !== session.user.id) {
            return NextResponse.json(
                { error: "Nemáte oprávnění smazat tuto recenzi" },
                { status: 403 }
            );
        }

        const review = await deleteReview(id);

        return NextResponse.json({ id: review.id }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Smazání recenze selhalo" },
            { status: 500 }
        );
    }
}