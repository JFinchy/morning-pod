import React from "react";

export function BrokenRecordIllustration({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl"
      >
        {/* Record Base */}
        <circle
          cx="200"
          cy="200"
          r="160"
          className="fill-base-300 stroke-base-content/20"
          strokeWidth="8"
        />

        {/* Grooves */}
        <circle
          cx="200"
          cy="200"
          r="140"
          stroke="currentColor"
          className="stroke-base-content/10"
          strokeWidth="2"
          fill="none"
        />
        <circle
          cx="200"
          cy="200"
          r="120"
          stroke="currentColor"
          className="stroke-base-content/10"
          strokeWidth="2"
          fill="none"
        />
        <circle
          cx="200"
          cy="200"
          r="100"
          stroke="currentColor"
          className="stroke-base-content/10"
          strokeWidth="2"
          fill="none"
        />
        <circle
          cx="200"
          cy="200"
          r="80"
          stroke="currentColor"
          className="stroke-base-content/10"
          strokeWidth="2"
          fill="none"
        />

        {/* Center Label */}
        <circle cx="200" cy="200" r="50" className="fill-primary" />
        <circle cx="200" cy="200" r="10" className="fill-base-100" />

        {/* Crack / Break entirely obscuring logic */}
        <path
          d="M 200 40 L 210 100 L 190 150 L 220 180 L 180 200 L 210 220 M 200 40 V 200"
          stroke="currentColor"
          className="stroke-base-100"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M 170 340 L 190 280 L 170 240 L 190 220"
          stroke="currentColor"
          className="stroke-base-100"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Disconnected Cable */}
        <path
          d="M 40 360 Q 100 380 150 300 Q 180 250 250 280"
          stroke="currentColor"
          className="stroke-accent"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        {/* Aux Plug */}
        <rect
          x="250"
          y="275"
          width="40"
          height="10"
          rx="3"
          className="fill-accent focus:fill-accent-focus"
          transform="rotate(20 250 275)"
        />
        <rect
          x="290"
          y="277"
          width="15"
          height="6"
          rx="2"
          className="fill-base-content/40"
          transform="rotate(20 290 277)"
        />
      </svg>
    </div>
  );
}

export function ServerErrorIllustration({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {/* Glow */}
      <div className="absolute inset-0 bg-error/20 blur-2xl rounded-full animate-pulse" />
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-lg"
      >
        {/* Server Rack Body */}
        <rect
          x="120"
          y="80"
          width="160"
          height="240"
          rx="16"
          className="fill-base-300 stroke-base-content/20"
          strokeWidth="6"
        />

        {/* Server Slots */}
        <rect
          x="140"
          y="110"
          width="120"
          height="20"
          rx="4"
          className="fill-base-100"
        />
        <rect
          x="140"
          y="150"
          width="120"
          height="20"
          rx="4"
          className="fill-base-100"
        />

        {/* The Error Slot! */}
        <rect
          x="140"
          y="190"
          width="120"
          height="20"
          rx="4"
          className="fill-error/20 stroke-error"
          strokeWidth="2"
        />
        {/* Error Sparks */}
        <path
          d="M 120 180 L 100 160 M 110 200 L 90 210 M 130 220 L 110 240"
          stroke="currentColor"
          className="stroke-error"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M 280 180 L 300 160 M 290 200 L 310 210 M 270 220 L 290 240"
          stroke="currentColor"
          className="stroke-error"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <rect
          x="140"
          y="230"
          width="120"
          height="20"
          rx="4"
          className="fill-base-100"
        />
        <rect
          x="140"
          y="270"
          width="120"
          height="20"
          rx="4"
          className="fill-base-100"
        />

        {/* Blinking Lights */}
        <circle cx="150" cy="120" r="4" className="fill-success" />
        <circle cx="150" cy="160" r="4" className="fill-success" />
        <circle cx="150" cy="200" r="4" className="fill-error animate-ping" />
        <circle cx="150" cy="240" r="4" className="fill-success" />
        <circle cx="150" cy="280" r="4" className="fill-success" />

        {/* Warning Triangle */}
        <path
          d="M 200 160 L 240 220 L 160 220 Z"
          className="fill-error/30 stroke-error"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M 200 180 V 200 M 200 210 V 212"
          stroke="currentColor"
          className="stroke-error"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
