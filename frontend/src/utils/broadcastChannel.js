import React from 'react';

/**
 * Utilidades para sincronización entre pestañas usando BroadcastChannel API
 */

/**
 * Crea un canal de broadcast para sincronizar estado entre pestañas
 * @param {string} channelName - Nombre del canal
 * @returns {BroadcastChannel|null} Canal de broadcast o null si no está disponible
 */
export const createBroadcastChannel = (channelName) => {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return null;
  }

  try {
    return new BroadcastChannel(channelName);
  } catch (error) {
    console.error(`Error creating broadcast channel ${channelName}:`, error);
    return null;
  }
};

/**
 * Hook para sincronizar estado entre pestañas
 * @param {string} channelName - Nombre del canal
 * @param {Function} onMessage - Callback cuando se recibe un mensaje
 * @returns {Object} Objeto con sendMessage, close y channel
 */
export const useBroadcastSync = (channelName, onMessage) => {
  const channelRef = React.useRef(null);
  const onMessageRef = React.useRef(onMessage);

  // Actualizar referencia del callback
  React.useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  // Crear canal al montar
  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const channel = createBroadcastChannel(channelName);
    if (!channel) {
      return;
    }

    channelRef.current = channel;

    // Configurar listener
    const handleMessage = (event) => {
      if (onMessageRef.current) {
        onMessageRef.current(event.data);
      }
    };

    channel.addEventListener('message', handleMessage);

    // Limpiar al desmontar
    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
      channelRef.current = null;
    };
  }, [channelName]);

  const sendMessage = React.useCallback((data) => {
    if (channelRef.current) {
      try {
        channelRef.current.postMessage(data);
      } catch (error) {
        console.error(`Error sending message to ${channelName}:`, error);
      }
    }
  }, [channelName]);

  const close = React.useCallback(() => {
    if (channelRef.current) {
      channelRef.current.close();
      channelRef.current = null;
    }
  }, []);

  return { 
    sendMessage, 
    close, 
    channel: channelRef.current 
  };
};
