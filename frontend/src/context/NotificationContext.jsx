import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { safeGetLocalStorage, safeSetLocalStorage } from '../utils/storage';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  // Cargar notificaciones del localStorage al inicializar
  const [notifications, setNotifications] = useState(() => {
    return safeGetLocalStorage('notifications', []);
  });

  // Guardar notificaciones en localStorage cuando cambien
  useEffect(() => {
    safeSetLocalStorage('notifications', notifications);
  }, [notifications]);

  // Limpiar notificaciones viejas (más de 7 días)
  useEffect(() => {
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    setNotifications(prev => 
      prev.filter(notif => {
        if (notif.timestamp && notif.timestamp < sevenDaysAgo) {
          return false; // Eliminar notificaciones viejas
        }
        return true;
      })
    );
  }, []);

  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      type: notification.type || 'info', // 'success', 'error', 'warning', 'info'
      message: notification.message,
      title: notification.title,
      timestamp: Date.now(),
      read: false,
      persistent: notification.persistent || false, // Si es true, no se elimina automáticamente
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev]);
    return newNotification.id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const clearRead = useCallback(() => {
    setNotifications(prev => prev.filter(notif => !notif.read));
  }, []);

  const getUnreadCount = useCallback(() => {
    return notifications.filter(notif => !notif.read).length;
  }, [notifications]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    clearRead,
    getUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider');
  }
  return context;
};
