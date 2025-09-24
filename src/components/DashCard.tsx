import React from "react";

interface DashCardProps {
  title: string;
  children: React.ReactNode;
}

export default function DashCard({ title, children }: DashCardProps) {
  return (
    <div className="bg-[#111] border-[#2e2e2e] h-full flex flex-col overflow-hidden border-2 w-full rounded-lg shadow-lg p-4 px-8 justify-start ">
      <div className="text-lg mb-10  font-semibold" style={{ color: '#ccc' }}>{title}</div>
      <div className="flex-1 ">
        {children}
      </div>
    </div>
  );
}
