import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { getBaseUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  applicationName: "MiniCMS",
  title: {
    default: "MiniCMS",
    template: "%s | MiniCMS",
  },
  description: "Mini CMS pro publikaci článků, recenzí a správu vlastního obsahu.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MiniCMS",
    description: "Mini CMS pro publikaci článků, recenzí a správu vlastního obsahu.",
    url: "/",
    siteName: "MiniCMS",
    locale: "cs_CZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MiniCMS",
    description: "Mini CMS pro publikaci článků, recenzí a správu vlastního obsahu.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
