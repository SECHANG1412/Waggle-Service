import { useEffect, useMemo, useState } from 'react';
import { formatDateTime } from '../../../utils/date';
import { formatCountdown, getRemainingMs, SECOND_MS } from './expirationCountdownUtils';

type ExpirationCountdownProps = {
  expiresAt: string | null;
  isClosed: boolean;
  onExpire: () => void;
};

const ExpirationCountdown = ({ expiresAt, isClosed, onExpire }: ExpirationCountdownProps) => {
  const [now, setNow] = useState(() => Date.now());
  const remainingMs = getRemainingMs(expiresAt, now);
  const countdownText = formatCountdown(remainingMs);
  const formattedExpiresAt = useMemo(() => formatDateTime(expiresAt, 'ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }), [expiresAt]);

  useEffect(() => {
    setNow(Date.now());
  }, [expiresAt]);

  useEffect(() => {
    if (!expiresAt || isClosed) return;
    const timerId = window.setInterval(() => {
      setNow(Date.now());
    }, SECOND_MS);
    return () => window.clearInterval(timerId);
  }, [expiresAt, isClosed]);

  useEffect(() => {
    if (isClosed) return;
    if (remainingMs !== null && remainingMs <= 0) {
      onExpire();
    }
  }, [isClosed, onExpire, remainingMs]);

  return (
    <div
      className={`mb-4 rounded-2xl border px-4 py-3 text-center ${
        isClosed
          ? 'border-slate-200 bg-slate-100 text-slate-700'
          : 'border-blue-100 bg-blue-50 text-blue-800'
      }`}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {isClosed ? '마감 상태' : '마감까지'}
      </p>
      <p className="mt-1 text-2xl font-extrabold leading-tight tracking-normal sm:text-3xl">
        {isClosed ? '마감된 토픽입니다' : countdownText || '마감 시간 없음'}
      </p>
      {formattedExpiresAt && (
        <p className="mt-1 text-xs font-semibold text-slate-500 sm:text-sm">
          {formattedExpiresAt} 마감
        </p>
      )}
    </div>
  );
};

export default ExpirationCountdown;
