const FALLBACK_APP_URL = "http://localhost:3000";

export function getBaseUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_APP_URL || FALLBACK_APP_URL;
  return rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;
}

export function getCanonicalUrl(path: string) {
  return new URL(path, `${getBaseUrl()}/`).toString();
}

export function getArticleExcerpt(content: string, maxLength = 160) {
  const normalized = content.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

export function parsePageParam(value?: string | string[] | null, fallback = 1) {
  const firstValue = Array.isArray(value) ? value[0] : value;
  const parsedValue = Number.parseInt(firstValue ?? "", 10);

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
}
