import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FEEDBACK_TOAST_EVENT } from '../../utils/toastEvents';

const TOAST_DURATION = {
  success: 2600,
  error: 4200,
  warning: 4200,
};

const TOAST_STYLES = {
  success: {
    border: 'border-emerald-200',
    background: 'bg-emerald-50',
    icon: 'bg-emerald-600 text-white',
    title: 'text-emerald-950',
    message: 'text-emerald-800',
    symbol: '✓',
  },
  error: {
    border: 'border-red-200',
    background: 'bg-red-50',
    icon: 'bg-red-600 text-white',
    title: 'text-red-950',
    message: 'text-red-800',
    symbol: '×',
  },
  warning: {
    border: 'border-amber-200',
    background: 'bg-amber-50',
    icon: 'bg-amber-500 text-white',
    title: 'text-amber-950',
    message: 'text-amber-800',
    symbol: '!',
  },
};

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    const timers = timersRef.current;
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timer = timers.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.delete(id);
    }
  }, []);

  useEffect(() => {
    const timers = timersRef.current;

    const handleFeedbackToast = (event) => {
      const id = `${Date.now()}-${Math.random()}`;
      const { title, message, type = 'success' } = event.detail || {};
      const toastType = TOAST_STYLES[type] ? type : 'success';

      setToasts((prev) => [
        { id, title, message, type: toastType },
        ...prev.slice(0, 2),
      ]);

      const timer = setTimeout(
        () => removeToast(id),
        TOAST_DURATION[toastType] || TOAST_DURATION.success
      );
      timers.set(id, timer);
    };

    window.addEventListener(FEEDBACK_TOAST_EVENT, handleFeedbackToast);

    return () => {
      window.removeEventListener(FEEDBACK_TOAST_EVENT, handleFeedbackToast);
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, [removeToast]);

  return (
    <>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed right-4 top-4 z-[70] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6"
      >
        {toasts.map((toast) => {
          const style = TOAST_STYLES[toast.type] || TOAST_STYLES.success;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-lg border px-4 py-3 shadow-lg ${style.border} ${style.background}`}
            >
              <div className="flex gap-3">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${style.icon}`}
                >
                  {style.symbol}
                </span>
                <div className="min-w-0 flex-1">
                  {toast.title && (
                    <p className={`break-words text-sm font-semibold ${style.title}`}>
                      {toast.title}
                    </p>
                  )}
                  {toast.message && (
                    <p className={`mt-1 break-words text-sm leading-5 ${style.message}`}>
                      {toast.message}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  aria-label="알림 닫기"
                  onClick={() => removeToast(toast.id)}
                  className="ml-1 h-6 w-6 shrink-0 rounded-md text-slate-500 transition hover:bg-white/70 hover:text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300"
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ToastProvider;
