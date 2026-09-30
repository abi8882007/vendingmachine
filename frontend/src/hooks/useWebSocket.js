import { useEffect, useRef, useState, useCallback } from 'react';

export function useWebSocket(url = `ws://${window.location.hostname}:5000`) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [hardwareStatus, setHardwareStatus] = useState({ connected: false, isMock: true });
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log('[Kiosk WS] Connected to backend event stream');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);

          if (data.type === 'CONNECTED' && data.hardware) {
            setHardwareStatus(data.hardware);
          } else if (data.type === 'HARDWARE_STATUS' && data.payload) {
            setHardwareStatus(data.payload);
          }
        } catch {
          // ignore parsing error
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Auto-reconnect every 3 seconds for continuous kiosk reliability
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    }
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  const sendMessage = useCallback((msg) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  }, []);

  return { isConnected, lastMessage, hardwareStatus, sendMessage };
}
