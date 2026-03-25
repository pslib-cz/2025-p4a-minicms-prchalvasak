"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

export default function CookieConsent() {
    const [consent, setConsent] = useState<boolean | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("cookie-consent");
        if (stored === "true") {
            setConsent(true);
        } else if (stored === "false") {
            setConsent(false);
        } else {
            setVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookie-consent", "true");
        setConsent(true);
        setVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem("cookie-consent", "false");
        setConsent(false);
        setVisible(false);
    };

    return (
        <>
            {consent === true && process.env.NEXT_PUBLIC_CLARITY_ID && (
                <Script id="clarity" strategy="afterInteractive">
                    {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${process.env.NEXT_PUBLIC_CLARITY_ID}");`}
                </Script>
            )}
            {visible && (
                <div style={{
                    position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 10000,
                    background: "var(--color-bg-elevated)", borderTop: "1px solid var(--color-border)",
                    padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: "16px", flexWrap: "wrap",
                }}>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>
                        Tento web používá analytické cookies pro zlepšení uživatelského zážitku.
                    </p>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={handleDecline} className="btn btn-sm">Odmítnout</button>
                        <button onClick={handleAccept} className="btn btn-accent btn-sm">Přijmout</button>
                    </div>
                </div>
            )}
        </>
    );
}
