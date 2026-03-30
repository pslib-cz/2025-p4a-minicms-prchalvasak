"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { APP_NAME } from "@/lib/brand";
import { validateLoginInput } from "@/lib/validation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const validationError = validateLoginInput({ email, password });
        if (validationError) {
            setError(validationError);
            setLoading(false);
            return;
        }

        const normalizedEmail = email.trim().toLowerCase();

        try {
            const result = await signIn("credentials", {
                email: normalizedEmail,
                password,
                callbackUrl: "/",
                redirect: false,
            });

            if (result?.error) {
                setError("Neplatny email nebo heslo");
                setLoading(false);
            } else {
                await getSession();
                router.replace("/");
                router.refresh();
            }
        } catch {
            setError("Přihlášení selhalo");
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="card auth-card">
                <h1>Přihlášení</h1>
                <p className="auth-subtitle">Vítejte zpět v {APP_NAME}</p>

                {error && <p className="error-text" style={{ marginBottom: "18px" }}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="login-email">Email</label>
                        <input
                            id="login-email"
                            className="input"
                            type="email"
                            placeholder="vas@email.cz"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="login-password">Heslo</label>
                        <input
                            id="login-password"
                            className="input"
                            type="password"
                            placeholder="········"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-accent"
                        style={{ width: "100%", marginTop: "22px" }}
                        disabled={loading}
                    >
                        {loading ? (
                            <><span className="spinner" /> Přihlašování...</>
                        ) : (
                            "Přihlásit se"
                        )}
                    </button>
                </form>
                <p className="auth-footer">
                    Nemáte účet? <Link href="/register">Zaregistrujte se</Link>
                </p>
            </div>
        </div>
    );
}
