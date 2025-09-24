import { useState, useEffect, useRef } from 'react';

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR';
  message: string;
}

interface LogMonitorProps {
  websocket?: WebSocket | null;
  connectionState?: string;
}

function LogMonitor({ websocket, connectionState }: LogMonitorProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [containerHeight, setContainerHeight] = useState<string>('100%');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  // Set static height after component mounts to prevent expansion
  useEffect(() => {
    if (scrollContainerRef.current) {
      const height = scrollContainerRef.current.offsetHeight;
      if (height > 0) {
        setContainerHeight(`${height}px`);
      }
    }
  }, []);

  const addLog = (level: LogEntry['level'], message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog: LogEntry = { timestamp, level, message };
    
    setLogs(prev => {
      const updatedLogs = [newLog, ...prev];
      // Keep only the latest 30 entries
      return updatedLogs.slice(0, 30);
    });
  };

  // Auto-scroll to bottom when logs change
  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  // Handle WebSocket status polling
  useEffect(() => {
    let interval: number;
    
    if (websocket && connectionState === 'connected') {
      // Add connection log
      addLog('INFO', 'WebSocket connected successfully');
      
      const getStatus = () => {
        if (websocket && websocket.readyState === WebSocket.OPEN) {
          const command = { action: "status" };
          websocket.send(JSON.stringify(command));
        }
      };

      // Set up interval for every 1 seconds
      interval = setInterval(getStatus, 1000);
      
      // Handle incoming messages
      const handleMessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle status response
          if (data.type === 'status' && data.success) {
            try {
              const statusData = JSON.parse(data.data);
              const statusMessage = `Status: WiFi ${statusData.wifi_connected ? 'Connected' : 'Disconnected'}, WebSocket ${statusData.websocket_connected ? 'Connected' : 'Disconnected'}, Active Connections: ${statusData.active_connections}`;
              addLog('INFO', statusMessage);
            } catch (error) {
              addLog('ERROR', 'Failed to parse status data');
            }
          } else if (data.type === 'gpio_response') {
            addLog('INFO', `GPIO Pin ${data.pin} set to ${data.state ? 'HIGH' : 'LOW'}`);
          } else if (data.type === 'json_response') {
            addLog('INFO', 'JSON file operation completed');
          } else {
            addLog('DEBUG', `Received: ${JSON.stringify(data)}`);
          }
        } catch (error) {
          addLog('ERROR', 'Failed to parse WebSocket message');
        }
      };

      websocket.addEventListener('message', handleMessage);
      
      return () => {
        if (interval) clearInterval(interval);
        websocket.removeEventListener('message', handleMessage);
      };
    } else if (connectionState === 'disconnected') {
      addLog('WARN', 'WebSocket disconnected');
    } else if (connectionState === 'error') {
      addLog('ERROR', 'WebSocket connection failed');
    }
  }, [websocket, connectionState]);

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'INFO': return 'text-blue-400';
      case 'DEBUG': return 'text-gray-400';
      case 'WARN': return 'text-yellow-400';
      case 'ERROR': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-[#000] h-full rounded-lg shadow-lg p-6 w-full">
      <div 
        ref={scrollContainerRef}
        className="flex flex-col  overflow-y-auto rounded-lg p-2 log-container"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#444 #1a1a1a',
          height: containerHeight,
        }}
      >
        <ul className="text-sm space-y-2 flex-grow" style={{ color: "#ccc" }}>
          {logs.length === 0 ? (
            <li className="text-gray-500 italic">
              {connectionState === 'connected' 
                ? 'Waiting for status updates...' 
                : 'Connect to WebSocket to view activity logs'
              }
            </li>
          ) : (
            logs.slice().reverse().map((log, index) => (
              <li key={logs.length - index}>
                <span className="text-gray-500 mr-2">{log.timestamp}</span>
                <span className={getLevelColor(log.level)}>{log.level}</span>
                <span className="ml-2">{log.message}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default LogMonitor