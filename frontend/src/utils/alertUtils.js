import Swal from 'sweetalert2';
import { AUTH_MESSAGES, COMMON_MESSAGES } from '../constants/messages';

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
  Swal.fire({
    icon: 'error',
    title: COMMON_MESSAGES.defaultError,
    text: error?.response?.data?.error || error?.response?.data?.detail || defaultMessage,
    confirmButtonColor: '#EF4444',
  });
};

export const showWarningAlert = (title, text) => {
  Swal.fire({
    icon: 'warning',
    title,
    text,
    confirmButtonColor: '#EF4444',
  });
};

export const showSuccessAlert = (message) => {
  Swal.fire({
    icon: 'success',
    title: COMMON_MESSAGES.success,
    text: message,
    confirmButtonColor: '#34D399',
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
