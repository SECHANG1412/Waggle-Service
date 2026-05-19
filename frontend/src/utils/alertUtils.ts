import { isAxiosError } from 'axios';
import { AUTH_MESSAGES, COMMON_MESSAGES } from '../constants/messages';
import { AUTH_FEEDBACK_EVENT, FEEDBACK_TOAST_EVENT } from './toastEvents';

type FeedbackToastType = 'success' | 'error' | 'warning';

type FeedbackToastOptions = {
  type?: FeedbackToastType;
  title: string;
  message: string;
};

type AuthFeedbackOptions = {
  title: string;
  message: string;
};

type ApiErrorResponse = {
  error?: string;
  detail?: string;
};

const getApiErrorMessage = (error: unknown, defaultMessage: string) => {
  if (!isAxiosError<ApiErrorResponse>(error)) {
    return defaultMessage;
  }

  return error.response?.data?.error || error.response?.data?.detail || defaultMessage;
};

const showFeedbackToast = ({ type = 'success', title, message }: FeedbackToastOptions) => {
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

const showAuthFeedback = ({ title, message }: AuthFeedbackOptions) => {
  if (typeof window === 'undefined') return Promise.resolve();

  return new Promise<void>((resolve) => {
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

export const handleAuthError = async (error: unknown) => {
  if (isAxiosError(error) && error.response?.status === 401) {
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
  error: unknown,
  defaultMessage = COMMON_MESSAGES.defaultError
) => {
  showFeedbackToast({
    type: 'error',
    title: COMMON_MESSAGES.defaultError,
    message: getApiErrorMessage(error, defaultMessage),
  });
};

export const showWarningAlert = (title: string, text: string) => {
  showFeedbackToast({
    type: 'warning',
    title,
    message: text,
  });
};

export const showSuccessAlert = (message: string) => {
  showFeedbackToast({
    type: 'success',
    title: COMMON_MESSAGES.success,
    message,
  });
};
