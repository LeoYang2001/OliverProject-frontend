import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashCard from "../components/DashCard";
import LogMonitor from "../components/LogMonitor";

export default function MainPage() {
  const navigate = useNavigate();
  const [selectedEsp, setSelectedEsp] = useState("ESP32-A");
  const esps = ["ESP32-A", "ESP32-B", "ESP32-C"];

  const baseTextColor = '#ccc'
  return (
    <div className="bg-[#111] min-h-screen w-full  text-white px-16">
      <div className=" py-10">
        <div className="flex items-center mb-8">
          <div className="mr-4">
            <label htmlFor="esp-select" style={{ color: baseTextColor }} className="text-lg font-semibold mr-2 ">Monitor all applications</label>
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
        </div>
    <div className="grid grid-cols-2 grid-rows-2 gap-6 mb-8 w-full">
          <DashCard title="API requests">
            <div className="text-2xl text-green-400 font-bold">7.1m</div>
            <div className="text-xs text-green-500" style={{ color: baseTextColor }}>+8% vs last week</div>
          </DashCard>
          <DashCard title="Uptime (7 days)">
            <div className="text-2xl font-bold">94.999%</div>
          </DashCard>
          <DashCard title="API response times">
            <div className="text-2xl text-red-400 font-bold">92ms</div>
            <div className="text-xs text-red-500" style={{ color: baseTextColor }}>-2% vs last week</div>
          </DashCard>
          <DashCard title="Events">
            <div className="text-2xl text-red-400 font-bold">48k</div>
            <div className="text-xs text-red-500" style={{ color: baseTextColor }}>-3% vs last week</div>
          </DashCard>
        </div>
      <DashCard title="Activity Logs">
          <LogMonitor />
       </DashCard>
        <button className="bg-[#222] text-white px-4 py-2 rounded hover:bg-[#333] transition mt-8" onClick={() => navigate('/signin')}>Sign Out</button>
      </div>
    </div>
  );
}
