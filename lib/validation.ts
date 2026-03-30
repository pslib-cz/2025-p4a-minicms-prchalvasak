const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const ARTICLE_STATUSES = ["DRAFT", "PUBLISHED"] as const;
export type ArticleStatusInput = (typeof ARTICLE_STATUSES)[number];

export function normalizeTextInput(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function stripHtmlTags(value: string) {
  return value
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [
    ...new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

export function validateLoginInput({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const normalizedEmail = normalizeTextInput(email);

  if (!emailPattern.test(normalizedEmail)) {
    return "Zadejte platný email.";
  }

  if (password.length < 8) {
    return "Heslo musí mít alespoň 8 znaků.";
  }

  return null;
}

export function validateRegisterInput({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  const normalizedName = normalizeTextInput(name);
  const loginError = validateLoginInput({ email, password });

  if (normalizedName.length < 2) {
    return "Jméno musí mít alespoň 2 znaky.";
  }

  if (normalizedName.length > 80) {
    return "Jméno je příliš dlouhé.";
  }

  return loginError;
}

export function validateCategoryName(name: string) {
  const normalizedName = normalizeTextInput(name);

  if (normalizedName.length < 2) {
    return "Název kategorie musí mít alespoň 2 znaky.";
  }

  if (normalizedName.length > 40) {
    return "Název kategorie je příliš dlouhý.";
  }

  return null;
}

export function validateArticleInput({
  title,
  content,
  publishDate,
  categoryIds,
  status,
}: {
  title: string;
  content: string;
  publishDate: string;
  categoryIds: string[];
  status: string;
}) {
  const normalizedTitle = normalizeTextInput(title);
  const normalizedContent = stripHtmlTags(content);

  if (normalizedTitle.length < 5) {
    return "Název musí mít alespoň 5 znaků.";
  }

  if (normalizedTitle.length > 160) {
    return "Název je příliš dlouhý.";
  }

  if (normalizedContent.length < 50) {
    return "Obsah musí mít alespoň 50 znaků.";
  }

  if (categoryIds.length === 0) {
    return "Vyberte alespoň jednu kategorii.";
  }

  if (!ARTICLE_STATUSES.includes(status as ArticleStatusInput)) {
    return "Zvolte platný stav článku.";
  }

  const parsedPublishDate = new Date(publishDate);
  if (Number.isNaN(parsedPublishDate.getTime())) {
    return "Zadejte platné datum publikace.";
  }

  return null;
}
