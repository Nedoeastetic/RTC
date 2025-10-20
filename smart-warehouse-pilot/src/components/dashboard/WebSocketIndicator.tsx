import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";

type ConnectionStatus = "connected" | "disconnected" | "reconnecting";

const WebSocketIndicator = () => {
  const [status, setStatus] = useState<ConnectionStatus>("connected");

  useEffect(() => {
    // Симуляция WebSocket соединения
    const interval = setInterval(() => {
      const random = Math.random();
      if (random > 0.95) {
        setStatus("reconnecting");
        setTimeout(() => setStatus("connected"), 2000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case "connected":
        return "bg-success";
      case "disconnected":
        return "bg-destructive";
      case "reconnecting":
        return "bg-muted-foreground";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "connected":
        return "Соединение активно";
      case "disconnected":
        return "Соединение потеряно";
      case "reconnecting":
        return "Переподключение...";
    }
  };

  return (
    <div className="fixed bottom-6 right-6 flex items-center space-x-2 bg-card border border-border rounded-lg px-4 py-2 shadow-lg">
      <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}></div>
      {status === "connected" ? (
        <Wifi className="h-4 w-4 text-success" />
      ) : (
        <WifiOff className="h-4 w-4 text-destructive" />
      )}
      <span className="text-sm text-muted-foreground">{getStatusText()}</span>
    </div>
  );
};

export default WebSocketIndicator;
