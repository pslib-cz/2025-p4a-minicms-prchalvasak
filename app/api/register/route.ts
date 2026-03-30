import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { normalizeTextInput, validateRegisterInput } from "@/lib/validation";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const name = normalizeTextInput(body.name);
        const email = normalizeTextInput(body.email).toLowerCase();
        const password = typeof body.password === "string" ? body.password : "";

        const validationError = validateRegisterInput({ name, email, password });

        if (validationError) {
            return NextResponse.json(
                { error: validationError },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Uživatel s tímto emailem již existuje" },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                hashedPassword,
            },
        });

        return NextResponse.json(
            { id: user.id, name: user.name, email: user.email },
            { status: 201 }
        );
    } catch {
        return NextResponse.json(
            { error: "Registrace selhala" },
            { status: 500 }
        );
    }
}
