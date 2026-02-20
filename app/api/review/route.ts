import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createReview, getReviews, updateReview, deleteReview } from "@/lib/actions/reviews";

export async function POST(request: Request) {
    try {
        const { articleId, rating, comment } = await request.json();

        if (!articleId || !rating || !comment) {
            return NextResponse.json(
                { error: "Všechna pole jsou povinná" },
                { status: 400 }
            );
        }

        const review = await createReview(articleId, rating, comment);

        return NextResponse.json(
            { id: review.id, articleId: review.articleId, rating: review.rating, comment: review.comment },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Vytvoření recenze selhalo" },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { articleId } = await request.json();

        if (!articleId) {
            return NextResponse.json(
                { error: "Článek je povinný" },
                { status: 400 }
            );
        }

        const reviews = await getReviews(articleId);

        return NextResponse.json(
            { reviews },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Získání recenzí selhalo" },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const { id, rating, comment } = await request.json();

        if (!id || !rating || !comment) {
            return NextResponse.json(
                { error: "Všechna pole jsou povinná" },
                { status: 400 }
            );
        }

        const review = await updateReview(id, rating, comment);

        return NextResponse.json(
            { id: review.id, articleId: review.articleId, rating: review.rating, comment: review.comment },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Aktualizace recenze selhala" },
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

        const review = await deleteReview(id);

        return NextResponse.json(
            { id: review.id },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Smazání recenze selhalo" },
            { status: 500 }
        );
    }
}