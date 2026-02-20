"use client";

import { useState } from "react";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const result = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, password }),
        });

        if (result.ok) {
            window.location.href = "/";
        } else {
            setError("Registrace selhala");
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="card auth-card animate-in">
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
                    >
                        Zaregistrovat se
                    </button>
                </form>
                <p className="auth-footer">
                    Máte účet? <a href="/login">Přihlaste se</a>
                </p>
            </div>
        </div>
    );
}