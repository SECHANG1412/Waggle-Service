import { useCallback, useEffect, useState } from 'react';
import type { NotificationRead, NotificationUnreadCount } from '../types';
import api from '../utils/api';

type UseNotificationOptions = {
  enabled: boolean;
};

export const useNotification = ({ enabled }: UseNotificationOptions) => {
  const [notifications, setNotifications] = useState<NotificationRead[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!enabled) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await api.get<NotificationUnreadCount>('/notifications/unread-count', {
        suppressAuthAlert: true,
      });
      setUnreadCount(response.data.count);
    } catch {
      setUnreadCount(0);
    }
  }, [enabled]);

  const fetchNotifications = useCallback(async () => {
    if (!enabled) {
      setNotifications([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.get<NotificationRead[]>('/notifications', {
        params: { limit: 10 },
        suppressAuthAlert: true,
      });
      setNotifications(response.data);
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      const response = await api.patch<NotificationRead>(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((item) => (item.notification_id === notificationId ? response.data : item))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch {
      // The notification link should still work even if the read update fails.
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
    } catch {
      // Keep the existing state and let the next fetch resync it.
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchUnreadCount();
  }, [enabled, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
};
