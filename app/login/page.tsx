"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            console.log("signIn result:", result);

            if (result?.error) {
                setError("Neplatný email nebo heslo");
                setLoading(false);
            } else {
                window.location.href = "/";
            }
        } catch (err) {
            console.error("signIn error:", err);
            setError("Přihlášení selhalo");
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="card auth-card animate-in">
                <h1>Přihlášení</h1>
                <p className="auth-subtitle">Vítejte zpět v MiniCMS</p>

                {error && <p className="error-text" style={{ marginBottom: "20px" }}>{error}</p>}

                <form onSubmit={handleSubmit}>
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
                        {loading ? "Přihlašování..." : "Přihlásit se"}
                    </button>
                </form>
                <p className="auth-footer">
                    Nemáte účet? <a href="/register">Zaregistrujte se</a>
                </p>
            </div>
        </div>
    );
}