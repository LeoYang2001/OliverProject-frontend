import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashCard from "../components/DashCard";
import LogMonitor from "../components/LogMonitor";
import WebSocketControls from "../components/WebSocketControls";
import JsonEditor from "../components/JsonEditor";
import HeaderWebSocketControls from "../components/HeaderWebSocketControls";

export default function MainPage() {
  const navigate = useNavigate();
  const [selectedEsp, setSelectedEsp] = useState("ESP32-A");
  const esps = ["ESP32-A"];
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [connectionState, setConnectionState] = useState<string>('disconnected');

  const handleWebSocketChange = (ws: WebSocket | null, state: string) => {
    setWebsocket(ws);
    setConnectionState(state);
  };

  const baseTextColor = '#ccc'
  return (
    <div className="bg-[#111] min-h-screen w-full text-white px-16  h-[100vh] overflow-hidden flex-col flex">
        {/* Header with ESP selection, WebSocket controls, and Sign Out */}
        <div className="flex items-center justify-between py-8 ">
          <div className="flex items-center gap-6">
            <div className="flex items-center">
              <label htmlFor="esp-select" style={{ color: baseTextColor }} className="text-lg font-semibold mr-2">Monitor all applications</label>
              <select
                id="esp-select"
                className="bg-[#181818] text-white rounded px-3 py-2 border border-[#333] focus:outline-none"
                value={selectedEsp}
                onChange={e => setSelectedEsp(e.target.value)}
              >
                {esps.map(esp => (
                  <option key={esp} value={esp}>{esp}</option>
                ))}
              </select>
            </div>
            
            <HeaderWebSocketControls 
              baseTextColor={baseTextColor} 
              onWebSocketChange={handleWebSocketChange}
            />
          </div>
          
          <button 
            className="bg-[#222] text-white px-4 py-2 rounded hover:bg-[#333] transition" 
            onClick={() => navigate('/signin')}
          >
            Sign Out
          </button>
        </div>
        
        {/* Main Content Grid */}
        <div className="  flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 ">
          {/* Left Column - WebSocket Controls */}
          <div className="lg:col-span-2  flex flex-col gap-6">
             {/* Middle Column - Activity Logs */}
          <div className=" h-[50%] overflow-hidden" >
            <DashCard title="Activity Logs">
              <LogMonitor 
                websocket={websocket}
                connectionState={connectionState}
              />
            </DashCard>
          </div>
            <div >
            <DashCard title="WebSocket Controls">
              <WebSocketControls 
                baseTextColor={baseTextColor} 
                onWebSocketChange={handleWebSocketChange}
                websocket={websocket}
                connectionState={connectionState}
              />
            </DashCard>
          </div>

         
          </div>

          {/* Right Column - JSON Editor */}
          <div className="lg:col-span-1">
            <JsonEditor 
              baseTextColor={baseTextColor}
              websocket={websocket}
              connectionState={connectionState}
            />
          </div>
        </div>
    </div>
  );
}
