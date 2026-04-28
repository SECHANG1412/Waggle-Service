import React, { useEffect, useRef, useState } from 'react';
import { FEEDBACK_TOAST_EVENT } from '../../utils/toastEvents';

const TOAST_DURATION = 2600;

const TOAST_STYLES = {
  success: {
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  error: {
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
  warning: {
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
};

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  useEffect(() => {
    const timers = timersRef.current;

    const removeToast = (id) => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
      const timer = timers.get(id);
      if (timer) {
        clearTimeout(timer);
        timers.delete(id);
      }
    };

    const handleFeedbackToast = (event) => {
      const id = `${Date.now()}-${Math.random()}`;
      const { title, message, type = 'success' } = event.detail || {};

      setToasts((prev) => [
        { id, title, message, type },
        ...prev.slice(0, 2),
      ]);

      const timer = setTimeout(() => removeToast(id), TOAST_DURATION);
      timers.set(id, timer);
    };

    window.addEventListener(FEEDBACK_TOAST_EVENT, handleFeedbackToast);

    return () => {
      window.removeEventListener(FEEDBACK_TOAST_EVENT, handleFeedbackToast);
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return (
    <>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed right-4 top-4 z-[70] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-lg border bg-white px-4 py-3 shadow-lg ${
              TOAST_STYLES[toast.type]?.border || TOAST_STYLES.success.border
            }`}
          >
            <div className="flex gap-3">
              <span
                className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                  TOAST_STYLES[toast.type]?.dot || TOAST_STYLES.success.dot
                }`}
              />
              <div className="min-w-0">
                {toast.title && (
                  <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
                )}
                {toast.message && (
                  <p className="mt-0.5 text-sm leading-5 text-slate-600">{toast.message}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ToastProvider;
