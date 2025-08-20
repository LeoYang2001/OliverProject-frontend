import React from "react";
import { useNavigate } from "react-router-dom";

const cardBg = "bg-[#181818] rounded-lg shadow-lg p-8 mb-20";
const btn = "bg-[#222] text-white px-4 py-2 rounded hover:bg-[#333] transition";

export default function SignUp() {
  const navigate = useNavigate();
  return (
    <div className="  w-full h-[100vh]  flex  justify-center items-center  bg-[#111]  text-white">
      <div className={cardBg}>
        <h2 className="text-2xl font-bold mb-6 ">Sign Up</h2>
        <input className="w-full mb-4 p-2 rounded bg-[#222] text-white border-none" placeholder="Email" />
        <input className="w-full mb-6 p-2 rounded bg-[#222] text-white border-none" placeholder="Password" type="password" />
        <input className="w-full mb-6 p-2 rounded bg-[#222] text-white border-none" placeholder="Confirm Password" type="password" />
        <button className={btn} onClick={() => navigate('/main')}>Create Account</button>
        <div className="mt-4 text-sm text-gray-400">
          Don't have an account? <button className="underline" onClick={() => navigate('/signin')}>Sign In</button>
        </div>
      </div>
    </div>
  );
}
