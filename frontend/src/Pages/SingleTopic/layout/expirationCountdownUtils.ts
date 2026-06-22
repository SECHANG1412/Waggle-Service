import { parseApiDate } from '../../../utils/date';

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export const getRemainingMs = (expiresAt: string | null, now: number) => {
  const expiresAtDate = parseApiDate(expiresAt);
  if (!expiresAtDate || Number.isNaN(expiresAtDate.getTime())) return null;
  return expiresAtDate.getTime() - now;
};

export const formatCountdown = (remainingMs: number | null) => {
  if (remainingMs === null) return '';
  const safeMs = Math.max(0, remainingMs);
  const days = Math.floor(safeMs / DAY_MS);
  const hours = Math.floor((safeMs % DAY_MS) / HOUR_MS);
  const minutes = Math.floor((safeMs % HOUR_MS) / MINUTE_MS);
  const seconds = Math.floor((safeMs % MINUTE_MS) / SECOND_MS);

  if (days >= 1) return `${days}일 ${hours}시간`;
  if (hours >= 1) return `${hours}시간 ${minutes}분 ${seconds}초`;
  if (minutes >= 1) return `${minutes}분 ${seconds}초`;
  return `${seconds}초`;
};

export { SECOND_MS };
