type DateInput = string | number | Date | null | undefined;

const hasExplicitTimezone = (value: string) => /[zZ]|[+-]\d{2}:\d{2}$/.test(value);

export const parseApiDate = (value: DateInput) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value !== "string") return new Date(value);

  const normalized = hasExplicitTimezone(value) ? value : `${value}Z`;
  return new Date(normalized);
};

export const formatDateTime = (
  value: DateInput,
  locale = "ko-KR",
  options: Intl.DateTimeFormatOptions = {}
) => {
  const date = parseApiDate(value);
  if (!date || Number.isNaN(date.getTime())) return "";

  return date.toLocaleString(locale, options);
};

export const formatDateOnly = (
  value: DateInput,
  locale = "ko-KR",
  options: Intl.DateTimeFormatOptions = {}
) => {
  const date = parseApiDate(value);
  if (!date || Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString(locale, options);
};
