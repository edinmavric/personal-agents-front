import React from "react";

export default function CategoryFilter({
  categories,
  selected,
  onSelect,
}: {
  categories: string[];
  selected: string | null;
  onSelect: (cat: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        className={`px-3 py-1 rounded-full border ${
          !selected
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white text-gray-700 border-gray-300"
        }`}
        onClick={() => onSelect(null)}
      >
        Sve
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          className={`px-3 py-1 rounded-full border ${
            selected === cat
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300"
          }`}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}