import type { MetadataRoute } from "next";
import { getCanonicalUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/login", "/register", "/article/new", "/article/*/edit", "/api/"],
      },
    ],
    sitemap: getCanonicalUrl("/sitemap.xml"),
  };
}
