"use client";

import { useSession, signOut } from "next-auth/react";

export default function Header() {
    const { data: session, status } = useSession();

    return (
        <header style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 32px",
            height: "64px",
            background: "rgba(26, 26, 30, 0.82)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderBottom: "1px solid var(--color-border-light)",
        }}>
            <a href="/" style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.4rem",
                fontWeight: 700,
                color: "var(--color-text)",
                textDecoration: "none",
                letterSpacing: "-0.02em",
                display: "flex",
                alignItems: "center",
                gap: "8px",
            }}>
                <span style={{
                    color: "var(--color-accent)",
                    fontSize: "1.6rem",
                    lineHeight: 1,
                }}>◆</span>
                MiniCMS
            </a>

            <nav style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                fontSize: "0.9rem",
            }}>
                {status === "loading" && (
                    <span style={{ color: "var(--color-text-muted)" }}>Načítání...</span>
                )}
                {status === "authenticated" && session?.user && (
                    <>
                        <span style={{ color: "var(--color-text-secondary)" }}>
                            {session.user.name}
                        </span>
                        <a href="/dashboard" className="btn btn-sm" style={{ textDecoration: "none" }}>
                            Dashboard
                        </a>
                        <a href="/article/new" className="btn btn-accent btn-sm" style={{ textDecoration: "none" }}>
                            + Nový článek
                        </a>
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="btn btn-sm"
                        >
                            Odhlásit se
                        </button>
                    </>
                )}
                {status === "unauthenticated" && (
                    <>
                        <a href="/login" className="btn btn-sm">Přihlásit se</a>
                        <a href="/register" className="btn btn-accent btn-sm" style={{ textDecoration: "none" }}>
                            Registrace
                        </a>
                    </>
                )}
            </nav>
        </header>
    );
}
