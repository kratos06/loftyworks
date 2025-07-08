import React from "react";

interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Avatar({
  src,
  alt,
  initials,
  size = "md",
  className = "",
}: AvatarProps) {
  const sizes = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const baseStyles = `inline-flex items-center justify-center rounded-full flex-shrink-0 ${sizes[size]}`;

  if (src) {
    return (
      <img
        src={src}
        alt={alt || ""}
        className={`${baseStyles} object-cover ${className}`}
      />
    );
  }

  if (initials) {
    return (
      <div
        className={`${baseStyles} text-white font-bold ${className}`}
        style={{ backgroundColor: "var(--avatar-random-color-8470fd)" }}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className={`${baseStyles} bg-gray-200 ${className}`}>
      <svg
        className="w-1/2 h-1/2 text-gray-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}
