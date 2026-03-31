import type { Metadata } from "next";
import { Suspense } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import Providers from "./providers";
import Analytics from "./components/Analytics";
import CookieConsent from "./components/CookieConsent";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/brand";
import { getBaseUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    url: "/",
    siteName: APP_NAME,
    locale: "cs_CZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <Providers>
          {children}
          <CookieConsent />
          <Suspense fallback={null}>
            <Analytics />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
