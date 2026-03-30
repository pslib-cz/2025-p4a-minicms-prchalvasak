"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { APP_NAME } from "@/lib/brand";
import { validateRegisterInput } from "@/lib/validation";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const validationError = validateRegisterInput({ name, email, password });
        if (validationError) {
            setError(validationError);
            setLoading(false);
            return;
        }

        const normalizedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();

        const result = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: normalizedName, email: normalizedEmail, password }),
        });

        if (result.ok) {
            const loginResult = await signIn("credentials", {
                email: normalizedEmail,
                password,
                callbackUrl: "/",
                redirect: false,
            });

            if (loginResult?.error) {
                setError("Účet vznikl, ale přihlášení selhalo. Zkuste se přihlásit ručně.");
                setLoading(false);
                return;
            }

            await getSession();
            router.replace("/");
            router.refresh();
        } else {
            const data = await result.json();
            setError(data.error || "Registrace selhala");
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="card auth-card">
                <h1>Registrace</h1>
                <p className="auth-subtitle">Vytvořte si účet v {APP_NAME}</p>

                {error && <p className="error-text" style={{ marginBottom: "18px" }}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-name">Jméno</label>
                        <input
                            id="reg-name"
                            className="input"
                            type="text"
                            placeholder="Jan Novak"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoComplete="name"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-email">Email</label>
                        <input
                            id="reg-email"
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
                        <label className="form-label" htmlFor="reg-password">Heslo</label>
                        <input
                            id="reg-password"
                            className="input"
                            type="password"
                            placeholder="········"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
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
                            <><span className="spinner" /> Zakládání účtu...</>
                        ) : (
                            "Zaregistrovat se"
                        )}
                    </button>
                </form>
                <p className="auth-footer">
                    Máte účet? <Link href="/login">Přihlásit se</Link>
                </p>
            </div>
        </div>
    );
}
