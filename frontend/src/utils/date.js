const hasExplicitTimezone = (value) => /[zZ]|[+-]\d{2}:\d{2}$/.test(value);

export const parseApiDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value !== "string") return new Date(value);

  const normalized = hasExplicitTimezone(value) ? value : `${value}Z`;
  return new Date(normalized);
};

export const formatDateTime = (value, locale = "ko-KR", options = {}) => {
  const date = parseApiDate(value);
  if (!date || Number.isNaN(date.getTime())) return "";

  return date.toLocaleString(locale, options);
};

export const formatDateOnly = (value, locale = "ko-KR", options = {}) => {
  const date = parseApiDate(value);
  if (!date || Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString(locale, options);
};
