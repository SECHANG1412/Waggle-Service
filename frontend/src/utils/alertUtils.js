import Swal from 'sweetalert2';
import { AUTH_MESSAGES, COMMON_MESSAGES } from '../constants/messages';
import { AUTH_FEEDBACK_EVENT, FEEDBACK_TOAST_EVENT } from './toastEvents';

const showFeedbackToast = ({ type = 'success', title, message }) => {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent(FEEDBACK_TOAST_EVENT, {
      detail: {
        type,
        title,
        message,
      },
    })
  );
};

const showAuthFeedback = ({ title, message }) => {
  if (typeof window === 'undefined') return Promise.resolve();

  return new Promise((resolve) => {
    window.dispatchEvent(
      new CustomEvent(AUTH_FEEDBACK_EVENT, {
        detail: {
          title,
          message,
          confirmText: COMMON_MESSAGES.confirm,
          resolve,
        },
      })
    );
  });
};

export const handleAuthError = async (error) => {
  if (error?.response?.status === 401) {
    await showAuthFeedback({
      title: AUTH_MESSAGES.loginRequiredTitle,
      message: AUTH_MESSAGES.loginRequiredText,
    });
    return true;
  }
  return false;
};

export const showLoginRequiredAlert = async (
  message = AUTH_MESSAGES.loginRequiredFeature
) => {
  await showAuthFeedback({
    title: AUTH_MESSAGES.loginRequiredTitle,
    message,
  });
};

export const showErrorAlert = (
  error,
  defaultMessage = COMMON_MESSAGES.defaultError
) => {
  showFeedbackToast({
    type: 'error',
    title: COMMON_MESSAGES.defaultError,
    message:
      error?.response?.data?.error ||
      error?.response?.data?.detail ||
      defaultMessage,
  });
};

export const showWarningAlert = (title, text) => {
  showFeedbackToast({
    type: 'warning',
    title,
    message: text,
  });
};

export const showSuccessAlert = (message) => {
  showFeedbackToast({
    type: 'success',
    title: COMMON_MESSAGES.success,
    message,
  });
};

export const showConfirmDialog = async (
  title,
  text,
  confirmButtonText = COMMON_MESSAGES.confirm,
  cancelButtonText = COMMON_MESSAGES.cancel,
  confirmButtonColor = '#d33',
  cancelButtonColor = '#3085d6'
) => {
  return await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor,
    cancelButtonColor,
    confirmButtonText,
    cancelButtonText,
  });
};
