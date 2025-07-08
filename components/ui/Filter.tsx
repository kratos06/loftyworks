import React from "react";

interface FilterProps {
  label: string;
  value: string;
  options?: string[];
  onChange?: (value: string) => void;
  className?: string;
}

export default function Filter({
  label,
  value,
  options = [],
  onChange,
  className = "",
}: FilterProps) {
  return (
    <div
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-md cursor-pointer hover:bg-gray-50 ${className}`}
    >
      <span className="text-sm" style={{ color: "var(--solid-black-515666)" }}>
        {label}:
      </span>
      <span
        className="text-sm font-medium"
        style={{ color: "var(--solid-black-515666)" }}
      >
        {value}
      </span>
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        className="ml-1"
      >
        <path
          d="M6.0003 9.25492L0.859047 4.14367C0.789203 4.07341 0.75 3.97836 0.75 3.87929C0.75 3.78022 0.789203 3.68518 0.859047 3.61492C0.893908 3.57977 0.935384 3.55187 0.981081 3.53283C1.02678 3.5138 1.07579 3.50399 1.1253 3.50399C1.1748 3.50399 1.22382 3.5138 1.26951 3.53283C1.31521 3.55187 1.35669 3.57977 1.39155 3.61492L6.0003 8.19742L10.609 3.61117C10.6439 3.57602 10.6854 3.54812 10.7311 3.52908C10.7768 3.51005 10.8258 3.50024 10.8753 3.50024C10.9248 3.50024 10.9738 3.51005 11.0195 3.52908C11.0652 3.54812 11.1067 3.57602 11.1415 3.61117C11.2114 3.68143 11.2506 3.77647 11.2506 3.87554C11.2506 3.97461 11.2114 4.06966 11.1415 4.13992L6.0003 9.25492Z"
          fill="var(--solid-black-a0a3af)"
        />
      </svg>
    </div>
  );
}
