import React from "react";

export const Bow = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        {/* Left Loop */}
        <path d="M12 11c0-3.5-2.5-5-5-5s-5 1.5-5 4.5 2.5 4.5 5 4.5c2.5 0 5-1.5 5-4.5Z" />
        {/* Right Loop */}
        <path d="M12 11c0-3.5 2.5-5 5-5s5 1.5 5 4.5-2.5 4.5-5 4.5c-2.5 0-5-1.5-5-4.5Z" />
        {/* Tails */}
        <path d="M10 14.5 8 20" />
        <path d="M14 14.5 16 20" />
        {/* Center Knot */}
        <rect x="10.5" y="9.5" width="3" height="3" rx="1" fill="currentColor" />
    </svg>
);
