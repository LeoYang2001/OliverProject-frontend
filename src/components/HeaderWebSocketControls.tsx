import { useState, useEffect } from "react";

interface HeaderWebSocketControlsProps {
  baseTextColor: string;
  onWebSocketChange?: (ws: WebSocket | null, state: string) => void;
}

export default function HeaderWebSocketControls({ baseTextColor, onWebSocketChange }: HeaderWebSocketControlsProps) {
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [systemStatus, setSystemStatus] = useState<{
    wifi_connected: boolean;
    websocket_connected: boolean;
    active_connections: number;
  } | null>(null);
  const [wsEndpoint, setWsEndpoint] = useState<string>('ws://192.168.4.193:8080/ws');

  // Auto-refresh system status every 5 seconds when connected
  useEffect(() => {
    let interval: number;
    
    if (websocket && connectionState === 'connected') {
      const getStatus = () => {
        const command = { action: "status" };
        websocket.send(JSON.stringify(command));
      };
      
      // Get initial status
      getStatus();
      
      // Set up interval for every 5 seconds
      interval = setInterval(getStatus, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [websocket, connectionState]);

  const connectWebSocket = () => {
    setConnectionState('connecting');
    const ws = new WebSocket(wsEndpoint);
    ws.onopen = () => {
      setConnectionState('connected');
      setWebsocket(ws);
      onWebSocketChange?.(ws, 'connected');
    };
    ws.onclose = () => {
      setConnectionState('disconnected');
      setWebsocket(null);
      onWebSocketChange?.(null, 'disconnected');
    };
    ws.onerror = () => {
      setConnectionState('error');
      setWebsocket(null);
      onWebSocketChange?.(null, 'error');
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message:', data);
        // Handle status response
        if (data.type === 'status' && data.success) {
          try {
            const statusData = JSON.parse(data.data);
            setSystemStatus({
              wifi_connected: statusData.wifi_connected,
              websocket_connected: statusData.websocket_connected,
              active_connections: statusData.active_connections
            });
          } catch (error) {
            console.error('Failed to parse status data:', error);
          }
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
  };

  const disconnectWebSocket = () => {
    if (websocket) {
      websocket.close();
      setWebsocket(null);
      setConnectionState('disconnected');
      setSystemStatus(null); // Clear status when disconnected
      onWebSocketChange?.(null, 'disconnected');
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionState) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionState) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Connection Error';
      default: return 'Disconnected';
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3">
        <span className={`font-semibold text-sm ${getConnectionStatusColor()}`}>
          {getConnectionStatusText()}
        </span>
        {connectionState === 'connecting' && (
          <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
        )}
        {(connectionState === 'disconnected' || connectionState === 'error' || connectionState === 'connecting') && (
          <>
            <input
              type="text"
              value={wsEndpoint}
              onChange={e => setWsEndpoint(e.target.value)}
              className="bg-[#181818] border border-[#333] text-xs px-2 py-1 rounded text-white mr-2 w-64 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="ws://192.168.4.193:8080/ws"
              disabled={connectionState === 'connecting'}
            />
            <button
              onClick={connectWebSocket}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition"
              disabled={connectionState === 'connecting'}
            >
              Connect
            </button>
          </>
        )}
        {connectionState === 'connected' && (
          <button
            onClick={disconnectWebSocket}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition"
          >
            Disconnect
          </button>
        )}
      </div>

      {/* System Status Display in Header */}
      {connectionState === 'connected' && systemStatus && (
        <div className="flex items-center gap-3 text-xs bg-[#181818] px-3 py-1 rounded border border-[#333]">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${systemStatus.wifi_connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span style={{ color: baseTextColor }}>WiFi</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${systemStatus.websocket_connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span style={{ color: baseTextColor }}>WS</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <span style={{ color: baseTextColor }}>Clients: {systemStatus.active_connections}</span>
          </div>
        </div>
      )}
    </div>
  );
}
