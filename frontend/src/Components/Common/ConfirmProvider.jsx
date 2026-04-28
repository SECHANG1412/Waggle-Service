import React, { useCallback, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ConfirmContext } from '../../hooks/confirm-context';

const defaultOptions = {
  title: '',
  description: '',
  confirmText: '확인',
  cancelText: '취소',
  variant: 'primary',
};

const variantClasses = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-300',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-300',
};

const ConfirmProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState(defaultOptions);
  const resolverRef = useRef(null);

  const resolve = useCallback((value) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setOpen(false);
  }, []);

  const confirm = useCallback((nextOptions) => {
    setOptions({ ...defaultOptions, ...nextOptions });
    setOpen(true);

    return new Promise((resolver) => {
      resolverRef.current = resolver;
    });
  }, []);

  const handleOpenChange = useCallback(
    (nextOpen) => {
      if (!nextOpen) {
        resolve(false);
      }
    },
    [resolve]
  );

  const confirmButtonClass = variantClasses[options.variant] || variantClasses.primary;

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[1px]" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-6 shadow-lg focus:outline-none">
            <Dialog.Title className="text-lg font-semibold text-slate-900">
              {options.title}
            </Dialog.Title>
            {options.description && (
              <Dialog.Description className="mt-2 text-sm leading-6 text-slate-600">
                {options.description}
              </Dialog.Description>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => resolve(false)}
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300"
              >
                {options.cancelText}
              </button>
              <button
                type="button"
                onClick={() => resolve(true)}
                className={`rounded-md px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${confirmButtonClass}`}
              >
                {options.confirmText}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </ConfirmContext.Provider>
  );
};

export default ConfirmProvider;
