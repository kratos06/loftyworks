import React from "react";

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export default function SearchInput({
  placeholder = "Search...",
  value,
  onChange,
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div className="absolute left-3 pointer-events-none">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13.8685 13.2476L10.0029 9.38194C10.9587 8.26559 11.4451 6.82244 11.3599 5.35527C11.2747 3.8881 10.6246 2.51092 9.54607 1.51267C8.46749 0.514412 7.04422 -0.0273414 5.57485 0.00106307C4.10548 0.0294676 2.70421 0.625823 1.66502 1.66502C0.625823 2.70421 0.0294676 4.10548 0.00106307 5.57485C-0.0273414 7.04422 0.514412 8.46749 1.51267 9.54607C2.51092 10.6246 3.8881 11.2747 5.35527 11.3599C6.82244 11.4451 8.26559 10.9587 9.38194 10.0029L13.2476 13.8685C13.2882 13.9095 13.3366 13.942 13.3899 13.9642C13.4431 13.9864 13.5003 13.9978 13.558 13.9978C13.6157 13.9978 13.6729 13.9864 13.7262 13.9642C13.7795 13.942 13.8278 13.9095 13.8685 13.8685C13.9095 13.8278 13.942 13.7795 13.9642 13.7262C13.9864 13.6729 13.9978 13.6157 13.9978 13.558C13.9978 13.5003 13.9864 13.4431 13.9642 13.3899C13.942 13.3366 13.9095 13.2882 13.8685 13.2476ZM5.68687 10.497C4.73552 10.497 3.80552 10.2149 3.0145 9.68637C2.22348 9.15782 1.60695 8.40658 1.24288 7.52764C0.87881 6.6487 0.783553 5.68154 0.969154 4.74846C1.15475 3.81538 1.61288 2.9583 2.28559 2.28559C2.9583 1.61288 3.81538 1.15475 4.74846 0.969154C5.68154 0.783553 6.6487 0.87881 7.52764 1.24288C8.40658 1.60695 9.15782 2.22348 9.68637 3.0145C10.2149 3.80552 10.497 4.73552 10.497 5.68687C10.497 6.9626 9.99024 8.18608 9.08816 9.08816C8.18608 9.99024 6.9626 10.497 5.68687 10.497Z"
            fill="var(--solid-black-c6c8d1)"
          />
        </svg>
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full pl-10 pr-4 py-2 text-sm border border-[var(--solid-black-c6c8d1)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--solid-sales-theme-5d51e2)] focus:border-transparent placeholder-[var(--solid-black-c6c8d1)]"
        style={{ backgroundColor: "var(--solid-black-ffffff)" }}
      />
    </div>
  );
}
