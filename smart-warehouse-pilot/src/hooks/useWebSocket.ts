import { useEffect, useRef, useCallback, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { toast } from 'sonner';

interface WebSocketMessage {
  type: string;
  data: any;
  warehouse_code?: string;
  criticality?: string;
  timestamp?: number;
  status?: string;
}

interface UseWebSocketProps {
  warehouseCode: string;
  onRobotUpdate?: (data: any) => void;
  onLocationUpdate?: (data: any) => void;
  onStatsUpdate?: (data: any) => void;
  onWarehouseRobotsUpdate?: (data: any) => void;
  onWarehouseLocationUpdate?: (data: any) => void;
  onPredictionsUpdate?: (data: any) => void;
  onCriticalityUpdate?: (data: any) => void;
}

export const useWebSocket = ({
  warehouseCode,
  onRobotUpdate,
  onLocationUpdate,
  onStatsUpdate,
  onWarehouseRobotsUpdate,
  onWarehouseLocationUpdate,
  onPredictionsUpdate,
  onCriticalityUpdate
}: UseWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const clientRef = useRef<Client | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication token not found');
      setConnectionStatus('error');
      return () => {};
    }

    const createSockJS = () => {
      return new SockJS('http://localhost:8080/ws');
    };

    const client = new Client({
      webSocketFactory: createSockJS,
      
      connectHeaders: {
        'Authorization': `Bearer ${token}`,
        'X-Warehouse-Code': warehouseCode,
      },
      
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.log('STOMP:', str);
        }
      },
      
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame) => {
      console.log('SockJS connected successfully', frame);
      setIsConnected(true);
      setConnectionStatus('connected');
      reconnectAttemptsRef.current = 0;
      
      if (reconnectAttemptsRef.current > 0) {
        toast.success('Real-time connection restored');
      } else {
        toast.success('Real-time updates connected');
      }

      const subscribeWithAuth = (destination: string, callback: (data: WebSocketMessage) => void) => {
        client.subscribe(destination, (message) => {
          try {
            const data: WebSocketMessage = JSON.parse(message.body);
            callback(data);
          } catch (error) {
            console.error(`Error parsing message from ${destination}:`, error);
          }
        });
      };

      // Global dashboard updates
      subscribeWithAuth('/topic/dashboard', (data) => {
        if (data.type === 'robot_update' && onRobotUpdate) {
          onRobotUpdate(data.data);
        } else if (data.type === 'location_update' && onLocationUpdate) {
          onLocationUpdate(data.data);
        } else if (data.type === 'robot_status' && onRobotUpdate) {
          onRobotUpdate(data.data);
        }
      });

      // Warehouse-specific updates
      subscribeWithAuth(`/topic/dashboard/warehouse/${warehouseCode}`, (data) => {
        if (data.type === 'warehouse_robots_update' && onWarehouseRobotsUpdate) {
          onWarehouseRobotsUpdate(data.data);
        }
      });

      subscribeWithAuth(`/topic/dashboard/warehouse/${warehouseCode}/locations`, (data) => {
        if (data.type === 'warehouse_location_update' && onWarehouseLocationUpdate) {
          onWarehouseLocationUpdate(data.data);
        }
      });

      subscribeWithAuth(`/topic/dashboard/warehouse/${warehouseCode}/stats`, (data) => {
        if (data.type === 'warehouse_stats' && onStatsUpdate) {
          onStatsUpdate(data.data);
        }
      });

      // Robot-specific updates
      subscribeWithAuth(`/topic/dashboard/robot/+`, (data) => {
        if (data.type === 'robot_update' && onRobotUpdate) {
          onRobotUpdate(data.data);
        }
      });

      // Prediction updates
      subscribeWithAuth(`/topic/dashboard/predictions`, (data) => {
        if ((data.type === 'prediction_update' || data.type === 'prediction_data') && onPredictionsUpdate) {
          onPredictionsUpdate(data);
        }
      });

      subscribeWithAuth(`/topic/dashboard/predictions/${warehouseCode}`, (data) => {
        if ((data.type === 'prediction_update' || data.type === 'prediction_data' || data.type === 'prediction_refresh') && onPredictionsUpdate) {
          onPredictionsUpdate(data);
        }
      });

      // Criticality updates
      subscribeWithAuth(`/topic/dashboard/predictions/criticality`, (data) => {
        if ((data.type === 'criticality_update' || data.type === 'criticality_data') && onCriticalityUpdate) {
          onCriticalityUpdate(data);
        }
      });

      subscribeWithAuth(`/topic/dashboard/predictions/criticality/${warehouseCode}`, (data) => {
        if ((data.type === 'criticality_update' || data.type === 'all_criticality_data') && onCriticalityUpdate) {
          onCriticalityUpdate(data);
        }
      });

      subscribeWithAuth(`/topic/dashboard/predictions/criticality/${warehouseCode}/critical`, (data) => {
        if ((data.type === 'criticality_level_update' || data.type === 'criticality_data') && onCriticalityUpdate) {
          onCriticalityUpdate(data);
        }
      });

      subscribeWithAuth(`/topic/dashboard/predictions/criticality/${warehouseCode}/medium`, (data) => {
        if ((data.type === 'criticality_level_update' || data.type === 'criticality_data') && onCriticalityUpdate) {
          onCriticalityUpdate(data);
        }
      });

      subscribeWithAuth(`/topic/dashboard/predictions/criticality/${warehouseCode}/ok`, (data) => {
        if ((data.type === 'criticality_level_update' || data.type === 'criticality_data') && onCriticalityUpdate) {
          onCriticalityUpdate(data);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('STOMP protocol error:', frame);
      setConnectionStatus('error');
      
      const errorMessage = frame.headers?.message || '';
      if (errorMessage.includes('403') || errorMessage.includes('401') || errorMessage.includes('auth')) {
        toast.error('Authentication failed. Please login again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        toast.error(`WebSocket error: ${errorMessage}`);
      }
    };

    client.onWebSocketError = (event) => {
      console.error('SockJS connection error:', event);
      setConnectionStatus('error');
      reconnectAttemptsRef.current++;
      
      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        toast.error('Failed to connect after multiple attempts. Please check your connection and login.');
      } else {
        toast.warning(`Connection failed. Retrying... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
      }
    };

    client.onDisconnect = () => {
      console.log('SockJS disconnected');
      setIsConnected(false);
      setConnectionStatus('disconnected');
    };

    try {
      client.activate();
      clientRef.current = client;
    } catch (error) {
      console.error('Failed to activate SockJS connection:', error);
      setConnectionStatus('error');
      toast.error('Failed to establish SockJS connection');
    }

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [
    warehouseCode, 
    onRobotUpdate, 
    onLocationUpdate, 
    onStatsUpdate, 
    onWarehouseRobotsUpdate, 
    onWarehouseLocationUpdate,
    onPredictionsUpdate,
    onCriticalityUpdate
  ]);

  useEffect(() => {
    if (!warehouseCode) return;

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to establish real-time connection');
      setConnectionStatus('error');
      return;
    }

    const disconnect = connect();
    
    return () => {
      disconnect();
    };
  }, [connect, warehouseCode]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
      setIsConnected(false);
      setConnectionStatus('disconnected');
      toast.info('SockJS connection closed');
    }
  }, []);

  const reconnect = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to establish real-time connection');
      return;
    }

    reconnectAttemptsRef.current = 0;
    setConnectionStatus('connecting');
    disconnect();
    setTimeout(connect, 1000);
  }, [connect, disconnect]);

  const sendMessage = useCallback((destination: string, body: any) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication required to send messages');
      return false;
    }

    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination,
        body: JSON.stringify(body)
      });
      return true;
    }
    
    toast.error('SockJS not connected');
    return false;
  }, []);

  return { 
    isConnected, 
    connectionStatus, 
    disconnect, 
    reconnect,
    sendMessage
  };
};

export default useWebSocket;