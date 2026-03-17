const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeTextInput(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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

export function validateArticleInput({
  title,
  content,
  publishDate,
  categoryIds,
}: {
  title: string;
  content: string;
  publishDate: string;
  categoryIds: string[];
}) {
  const normalizedTitle = normalizeTextInput(title);
  const normalizedContent = normalizeTextInput(content);

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

  const parsedPublishDate = new Date(publishDate);
  if (Number.isNaN(parsedPublishDate.getTime())) {
    return "Zadejte platné datum publikace.";
  }

  return null;
}
