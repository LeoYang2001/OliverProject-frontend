import { useState } from "react";

interface WebSocketControlsProps {
  baseTextColor: string;
  onWebSocketChange?: (ws: WebSocket | null, state: string) => void;
  websocket?: WebSocket | null;
  connectionState?: string;
}

interface GpioPin {
  pin: number;
  name: string;
  state: boolean;
}

const gpioComponents: GpioPin[] = [
  { pin: 7, name: "Retractor", state: false },
  { pin: 8, name: "Detergent Valve", state: false },
  { pin: 5, name: "Cold Valve", state: false },
  { pin: 19, name: "Drain Pump", state: false },
  { pin: 9, name: "Hot Valve", state: false },
  { pin: 18, name: "Softener Valve", state: false },
  { pin: 4, name: "Motor ON", state: false },
  { pin: 10, name: "Motor Direction", state: false },
];

export default function WebSocketControls({ baseTextColor, websocket, connectionState }: WebSocketControlsProps) {
  const [gpioStates, setGpioStates] = useState<GpioPin[]>(gpioComponents);

  const toggleGpio = (pin: number) => {
    if (!websocket || connectionState !== 'connected') return;
    
    const currentState = gpioStates.find(gpio => gpio.pin === pin)?.state || false;
    const newState = !currentState;
    
    const command = {
      action: "gpio_control",
      pin: pin,
      state: newState
    };
    
    websocket.send(JSON.stringify(command));
    
    setGpioStates(prev => 
      prev.map(gpio => 
        gpio.pin === pin ? { ...gpio, state: newState } : gpio
      )
    );
  };

  const readJsonFile = () => {
    if (!websocket || connectionState !== 'connected') return;
    
    const command = {
      action: "read_json"
    };
    
    websocket.send(JSON.stringify(command));
  };

  return (
    <div className=" space-y-6">
      {/* GPIO Controls */}
      <div className="bg-[#181818] rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4" style={{ color: baseTextColor }}>GPIO Pin Controls</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {gpioStates.map((gpio) => (
            <button
              key={gpio.pin}
              onClick={() => toggleGpio(gpio.pin)}
              disabled={connectionState !== 'connected'}
              className={`p-3 rounded text-sm font-medium transition ${
                gpio.state
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-600 hover:bg-gray-700'
              } ${connectionState !== 'connected' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div>{gpio.name}</div>
              <div className="text-xs">Pin {gpio.pin}</div>
              <div className="text-xs">{gpio.state ? 'ON' : 'OFF'}</div>
            </button>
          ))}
        </div>
      </div>

     
    </div>
  );
}
