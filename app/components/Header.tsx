"use client";

import { useSession, signOut } from "next-auth/react";

export default function Header() {
    const { data: session, status } = useSession();

    return (
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", borderBottom: "1px solid #ccc" }}>
            <a href="/"><h1>MiniCMS</h1></a>
            <nav>
                {status === "loading" && <span>Načítání...</span>}
                {status === "authenticated" && session?.user && (
                    <>
                        <span>Přihlášen jako {session.user.name}</span>
                        {" | "}
                        <a href="/article/new"><button>+ Nový článek</button></a>
                        {" | "}
                        <button onClick={() => signOut({ callbackUrl: "/" })}>Odhlásit se</button>
                    </>
                )}
                {status === "unauthenticated" && (
                    <>
                        <a href="/login">Přihlásit se</a>
                        {" | "}
                        <a href="/register">Registrace</a>
                    </>
                )}
            </nav>
        </header>
    );
}
