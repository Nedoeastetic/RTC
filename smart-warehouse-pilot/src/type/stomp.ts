// Объявляем StompJs для избежания ошибок TypeScript
declare module StompJs {
  export class Versions {
    static 'v1.2': any;
    static 'v1.1': any;
    static 'v1.0': any;
  }
}

export interface StompConfig {
  brokerURL?: string;
  webSocketFactory?: () => any;
  reconnectDelay?: number;
  heartbeatIncoming?: number;
  heartbeatOutgoing?: number;
  connectionTimeout?: number;
  stompVersions?: any;
  debug?: (str: string) => void;
  onConnect?: (frame: any) => void;
  onStompError?: (frame: any) => void;
  onWebSocketError?: (event: any) => void;
  onDisconnect?: () => void;
}