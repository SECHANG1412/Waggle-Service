import { useEffect, useRef, useState } from 'react';
import { FiBell } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../hooks/useNotification';
import type { NotificationRead } from '../../../types';
import { formatKoreanDateTime } from '../../../utils/date';

type NotificationBellProps = {
  enabled: boolean;
  className?: string;
};

const getBadgeLabel = (count: number) => {
  if (count > 9) return '9+';
  return String(count);
};

const NotificationItem = ({
  notification,
  onClick,
}: {
  notification: NotificationRead;
  onClick: (notification: NotificationRead) => void;
}) => (
  <button
    type="button"
    onClick={() => onClick(notification)}
    className={`flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
      notification.is_read ? 'bg-white' : 'bg-blue-50/70'
    }`}
  >
    <span
      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
        notification.is_read ? 'bg-slate-200' : 'bg-blue-600'
      }`}
      aria-hidden="true"
    />
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-medium leading-5 text-slate-900">
        {notification.message}
      </span>
      <span className="mt-1 block text-xs text-slate-500">
        {formatKoreanDateTime(notification.created_at)}
      </span>
    </span>
  </button>
);

const NotificationBell = ({ enabled, className = '' }: NotificationBellProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotification({ enabled });

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node | null)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!enabled) return null;

  const onToggle = async () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen) {
      await fetchNotifications();
    }
  };

  const onNotificationClick = async (notification: NotificationRead) => {
    if (!notification.is_read) {
      await markAsRead(notification.notification_id);
    }
    setIsOpen(false);
    navigate(notification.link);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={onToggle}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-200"
        aria-label="알림"
        aria-expanded={isOpen}
      >
        <FiBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
            {getBadgeLabel(unreadCount)}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-30 mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-slate-900">알림</p>
              <p className="text-xs text-slate-500">최근 알림 10개</p>
            </div>
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="rounded-md px-2 py-1 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              모두 읽음
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-2 px-4 py-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                아직 받은 알림이 없습니다.
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.notification_id}
                  notification={notification}
                  onClick={onNotificationClick}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
