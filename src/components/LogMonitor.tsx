import React from 'react'

function LogMonitor() {
  return (
    <div className="bg-[#000] rounded-lg shadow-lg p-8 w-full">
            <ul className="text-sm space-y-2" style={{ color: "#ccc" }}>
            <li><span className="text-blue-400">INFO</span> System startup completed successfully</li>
            <li><span className="text-gray-400">DEBUG</span> WiFi connection established</li>
            <li><span className="text-blue-400">INFO</span> Connecting to WiFi network...</li>
            <li><span className="text-yellow-400">WARN</span> Temperature sensor reading high: 85°C</li>
            <li><span className="text-blue-400">INFO</span> Pin 2 state changed to HIGH</li>
            <li><span className="text-red-400">ERROR</span> Failed to read from sensor on pin 4</li>
            <li><span className="text-blue-400">INFO</span> JSON config file loaded successfully</li>
          </ul>
    </div>
  )
}

export default LogMonitor