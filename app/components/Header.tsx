"use client";

import Link from "next/link";
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
            <Link href="/" style={{
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
            </Link>

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
                        <Link href="/dashboard" className="btn btn-sm">
                            Můj dashboard
                        </Link>
                        <Link href="/article/new" className="btn btn-accent btn-sm">
                            + Nový článek
                        </Link>
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
                        <Link href="/login" className="btn btn-sm">Přihlásit se</Link>
                        <Link href="/register" className="btn btn-accent btn-sm">
                            Registrace
                        </Link>
                    </>
                )}
            </nav>
        </header>
    );
}
