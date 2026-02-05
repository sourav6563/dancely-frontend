import React from 'react';

export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333EA" /> {/* purple-600 */}
          <stop offset="100%" stopColor="#2563EB" /> {/* blue-600 */}
        </linearGradient>
      </defs>
      <path
        d="M30 25C30 15 45 10 55 10C75 10 90 25 90 50C90 75 75 90 50 90C35 90 20 80 20 65C20 50 40 45 40 45C40 45 60 50 60 65C60 75 50 80 45 80"
        stroke="url(#logo-gradient)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-sm"
      />
      <path
        d="M40 45C30 40 25 30 45 25"
        stroke="url(#logo-gradient)"
        strokeWidth="12"
        strokeLinecap="round"
      />
    </svg>
  );
}
