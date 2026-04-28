import React, { useEffect, useRef, useState } from 'react';
import { SUCCESS_TOAST_EVENT } from '../../utils/toastEvents';

const TOAST_DURATION = 2600;

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

    const handleSuccessToast = (event) => {
      const id = `${Date.now()}-${Math.random()}`;
      const { title, message } = event.detail || {};

      setToasts((prev) => [
        { id, title, message },
        ...prev.slice(0, 2),
      ]);

      const timer = setTimeout(() => removeToast(id), TOAST_DURATION);
      timers.set(id, timer);
    };

    window.addEventListener(SUCCESS_TOAST_EVENT, handleSuccessToast);

    return () => {
      window.removeEventListener(SUCCESS_TOAST_EVENT, handleSuccessToast);
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
            className="pointer-events-auto rounded-lg border border-emerald-200 bg-white px-4 py-3 shadow-lg"
          >
            <div className="flex gap-3">
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
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
