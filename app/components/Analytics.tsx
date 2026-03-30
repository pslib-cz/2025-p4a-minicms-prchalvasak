"use client";

import { useEffect, useMemo, useState } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";

const TRACKING_CONSENT_KEY = "tracking-consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function readConsent() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TRACKING_CONSENT_KEY);
}

export default function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [consent, setConsent] = useState<string | null>(null);
  const [scriptsReady, setScriptsReady] = useState(false);

  const pagePath = useMemo(() => {
    const queryString = searchParams.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!gaId) {
      return;
    }

    const updateConsent = () => {
      setConsent(readConsent());
    };

    updateConsent();
    window.addEventListener("tracking-consent-changed", updateConsent);

    return () => {
      window.removeEventListener("tracking-consent-changed", updateConsent);
    };
  }, [gaId]);

  useEffect(() => {
    if (!gaId || consent !== "accepted") {
      return;
    }

    let timer: number | undefined;
    if (typeof window.gtag === "function") {
      timer = window.setTimeout(() => {
        setScriptsReady(true);
      }, 0);
    }

    const handleReady = () => {
      setScriptsReady(true);
    };

    window.addEventListener("ga-ready", handleReady);

    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
      window.removeEventListener("ga-ready", handleReady);
    };
  }, [consent, gaId]);

  useEffect(() => {
    if (
      !gaId ||
      consent !== "accepted" ||
      !scriptsReady ||
      typeof window.gtag !== "function"
    ) {
      return;
    }

    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_location: window.location.href,
      send_to: gaId,
    });
  }, [consent, gaId, pagePath, scriptsReady]);

  if (!gaId || consent !== "accepted") {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            anonymize_ip: true,
            send_page_view: false
          });
          window.dispatchEvent(new Event('ga-ready'));
        `}
      </Script>
    </>
  );
}
