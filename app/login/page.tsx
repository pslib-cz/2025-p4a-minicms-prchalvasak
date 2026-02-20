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
        <div style={{ padding: "16px" }}>
            <h1>Login</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "8px" }}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div style={{ marginBottom: "8px" }}>
                    <input
                        type="password"
                        placeholder="Heslo"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? "Přihlašování..." : "Přihlásit se"}
                </button>
                <br />
                <a href="/register">Nemáte účet? Zaregistrujte se</a>
            </form>
        </div>
    );
}