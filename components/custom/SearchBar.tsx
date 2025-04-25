import React from "react";

export default function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="text"
      placeholder="Pretraži agente..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  );
}