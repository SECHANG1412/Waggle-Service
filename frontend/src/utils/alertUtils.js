import Swal from 'sweetalert2';
import { AUTH_MESSAGES, COMMON_MESSAGES } from '../constants/messages';
import { FEEDBACK_TOAST_EVENT } from './toastEvents';

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

export const handleAuthError = async (error) => {
  if (error?.response?.status === 401) {
    await Swal.fire({
      title: AUTH_MESSAGES.loginRequiredTitle,
      text: AUTH_MESSAGES.loginRequiredText,
      icon: 'warning',
      confirmButtonText: COMMON_MESSAGES.confirm,
      confirmButtonColor: '#34D399',
    });
    return true;
  }
  return false;
};

export const showLoginRequiredAlert = async (
  message = AUTH_MESSAGES.loginRequiredFeature
) => {
  await Swal.fire({
    title: AUTH_MESSAGES.loginRequiredTitle,
    text: message,
    icon: 'warning',
    confirmButtonText: COMMON_MESSAGES.confirm,
    confirmButtonColor: '#34D399',
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
