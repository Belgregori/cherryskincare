import { useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import './NotificationToast.css';

function NotificationToast() {
  const { notifications, removeNotification, markAsRead } = useNotifications();

  // Auto-eliminar notificaciones después de 5 segundos (excepto las persistentes)
  useEffect(() => {
    notifications.forEach(notif => {
      if (!notif.persistent && !notif.read) {
        const timer = setTimeout(() => {
          markAsRead(notif.id);
          setTimeout(() => removeNotification(notif.id), 300); // Delay para animación
        }, 5000);
        return () => clearTimeout(timer);
      }
    });
  }, [notifications, removeNotification, markAsRead]);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container" aria-live="polite" aria-atomic="true">
      {notifications.slice(0, 5).map(notification => (
        <div
          key={notification.id}
          className={`notification-toast ${notification.type} ${notification.read ? 'read' : ''}`}
          role="alert"
          onClick={() => markAsRead(notification.id)}
        >
          {notification.title && (
            <div className="notification-title">{notification.title}</div>
          )}
          <div className="notification-message">{notification.message}</div>
          <button
            className="notification-close"
            onClick={(e) => {
              e.stopPropagation();
              removeNotification(notification.id);
            }}
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default NotificationToast;
