"use client";

import { useEffect, useState } from "react";

const TRACKING_CONSENT_KEY = "tracking-consent";
const CONSENT_MAX_AGE = 60 * 60 * 24 * 180;

function persistConsent(value: "accepted" | "declined") {
  window.localStorage.setItem(TRACKING_CONSENT_KEY, value);
  document.cookie = `${TRACKING_CONSENT_KEY}=${value}; path=/; max-age=${CONSENT_MAX_AGE}; SameSite=Lax`;
  window.dispatchEvent(new Event("tracking-consent-changed"));
}

export default function CookieConsent() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!gaId) {
      return;
    }

    const storedValue = window.localStorage.getItem(TRACKING_CONSENT_KEY);
    const timer = window.setTimeout(() => {
      setVisible(!storedValue);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [gaId]);

  if (!gaId || !visible) {
    return null;
  }

  return (
    <div className="cookie-banner">
      <div className="cookie-banner-inner">
        <div>
          <div className="cookie-banner-title">Souhlas se statistikami</div>
          <div className="cookie-banner-desc">
            Pouzivame Google Analytics pouze pro pageview statistiky. Kdyz tracking odmitnete,
            aplikace zustane plne funkcni.
          </div>
        </div>
        <div className="cookie-banner-actions">
          <button
            className="btn btn-sm"
            onClick={() => {
              persistConsent("declined");
              setVisible(false);
            }}
          >
            Nepovolit
          </button>
          <button
            className="btn btn-accent btn-sm"
            onClick={() => {
              persistConsent("accepted");
              setVisible(false);
            }}
          >
            Povolit analytiku
          </button>
        </div>
      </div>
    </div>
  );
}
