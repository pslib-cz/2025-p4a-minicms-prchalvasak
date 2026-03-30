"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { APP_NAME } from "@/lib/brand";

export default function Header() {
    const { data: session, status } = useSession();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navContent = (
        <>
            {status === "loading" && (
                <span className="site-nav-user">Načítání...</span>
            )}
            {status === "authenticated" && session?.user && (
                <>
                    <span className="site-nav-user">{session.user.name}</span>
                    <Link href="/dashboard" className="btn btn-sm btn-ghost" onClick={() => setMobileOpen(false)}>
                        Dashboard
                    </Link>
                    <Link href="/article/new" className="btn btn-accent btn-sm" onClick={() => setMobileOpen(false)}>
                        + Nový článek
                    </Link>
                    <button
                        onClick={() => { signOut({ callbackUrl: "/" }); setMobileOpen(false); }}
                        className="btn btn-sm btn-ghost"
                    >
                        Odhlásit se
                    </button>
                </>
            )}
            {status === "unauthenticated" && (
                <>
                    <Link href="/login" className="btn btn-sm btn-ghost" onClick={() => setMobileOpen(false)}>
                        Přihlásit se
                    </Link>
                    <Link href="/register" className="btn btn-accent btn-sm" onClick={() => setMobileOpen(false)}>
                        Registrace
                    </Link>
                </>
            )}
        </>
    );

    return (
        <>
            <header className="site-header">
                <Link href="/" className="site-logo">
                    <span className="site-logo-icon">&#9670;</span>
                    {APP_NAME}
                </Link>

                <nav className="site-nav">
                    {navContent}
                </nav>

                <button
                    className="mobile-toggle"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label={mobileOpen ? "Zavrit menu" : "Otevrit menu"}
                >
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </header>

            <div className={`mobile-menu ${mobileOpen ? "open" : ""}`}>
                {navContent}
            </div>
        </>
    );
}
