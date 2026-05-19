import { createContext, useContext } from 'react';

export type ConfirmVariant = 'primary' | 'danger';

export type ConfirmActionOrder = 'cancel-first' | 'confirm-first';

export type ConfirmOptions = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  actionOrder?: ConfirmActionOrder;
};

export type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

export const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);

  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }

  return context;
};
