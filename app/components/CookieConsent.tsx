"use client";

import { useEffect, useState } from "react";
import { Alert, Button, Stack } from "react-bootstrap";

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
      <Alert variant="dark" className="mb-0 cookie-banner-alert">
        <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 align-items-lg-center">
          <div>
            <strong>Souhlas se statistikami</strong>
            <div className="text-secondary small mt-1">
              Používáme Google Analytics pouze pro pageview statistiky. Když tracking odmítnete,
              aplikace zůstane plně funkční.
            </div>
          </div>
          <Stack direction="horizontal" gap={2}>
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => {
                persistConsent("declined");
                setVisible(false);
              }}
            >
              Nepovolit
            </Button>
            <Button
              variant="warning"
              size="sm"
              onClick={() => {
                persistConsent("accepted");
                setVisible(false);
              }}
            >
              Povolit analytiku
            </Button>
          </Stack>
        </div>
      </Alert>
    </div>
  );
}
