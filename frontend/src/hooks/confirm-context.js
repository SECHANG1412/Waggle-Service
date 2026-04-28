import { createContext, useContext } from 'react';

export const ConfirmContext = createContext(null);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);

  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }

  return context;
};
