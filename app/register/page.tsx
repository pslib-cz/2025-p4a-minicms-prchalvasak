"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
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

        const result = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, password }),
        });

        if (result.ok) {
            const loginResult = await signIn("credentials", {
                email,
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
                <p className="auth-subtitle">Vytvořte si účet v MiniCMS</p>

                {error && <p className="error-text" style={{ marginBottom: "20px" }}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Jméno</label>
                        <input
                            className="input"
                            type="text"
                            placeholder="Jan Novák"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            className="input"
                            type="email"
                            placeholder="vas@email.cz"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Heslo</label>
                        <input
                            className="input"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-accent"
                        style={{ width: "100%", marginTop: "24px" }}
                        disabled={loading}
                    >
                        {loading ? "Zakládání účtu..." : "Zaregistrovat se"}
                    </button>
                </form>
                <p className="auth-footer">
                    Máte účet? <Link href="/login">Přihlaste se</Link>
                </p>
            </div>
        </div>
    );
}
