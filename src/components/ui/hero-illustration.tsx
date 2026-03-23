import React from "react";

export function HeroIllustration({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Background Glow */}
      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse-slow object-center" />

      {/* Abstract Pensive Monkey SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 500 500"
        class="w-full h-full max-w-2xl mx-auto"
      >
        <g class="text-secondary fill-current" opacity="0.4">
          <path d="M 50 100 Q 80 80 100 120 T 70 150 Z" />
          <circle cx="80" cy="380" r="25" />
          <circle cx="140" cy="120" r="5" />
          <circle cx="360" cy="140" r="4" />
          <circle cx="440" cy="200" r="6" />
          <circle cx="180" cy="450" r="3" />
        </g>
        <g class="text-primary fill-current" opacity="0.5">
          <path d="M 400 350 Q 450 330 460 380 T 410 420 Z" />
          <circle cx="120" cy="90" r="4" />
          <circle cx="340" cy="80" r="5" />
          <circle cx="420" cy="280" r="3" />
          <circle cx="160" cy="400" r="6" />
        </g>
        <g class="text-accent fill-current" opacity="0.5">
          <circle cx="430" cy="100" r="18" />
          <circle cx="90" cy="200" r="5" />
          <circle cx="380" cy="90" r="6" />
          <circle cx="400" cy="400" r="4" />
          <circle cx="220" cy="460" r="5" />
        </g>

        <path
          d="M 150 200 C 130 150, 180 100, 250 100 C 320 100, 370 150, 350 200 C 370 250, 380 320, 350 380 C 330 450, 280 480, 250 480 C 220 480, 170 450, 150 380 C 120 320, 130 250, 150 200 Z"
          class="text-base-content fill-current"
        />

        <path
          d="M 170 210 C 170 170, 330 170, 330 210 C 340 240, 330 270, 310 290 C 340 330, 330 410, 250 410 C 170 410, 160 330, 190 290 C 170 270, 160 240, 170 210 Z"
          class="text-base-300 fill-current"
        />

        <path
          d="M 200 280 C 200 260, 300 260, 300 280 C 320 340, 300 380, 250 380 C 200 380, 180 340, 200 280 Z"
          class="text-base-200 fill-current"
        />

        <path
          d="M 220 200 L 280 200 L 270 280 L 230 280 Z"
          class="text-base-200 fill-current"
        />

        <path
          d="M 190 200 C 200 190, 240 190, 240 210 C 240 230, 190 230, 190 200 Z"
          class="text-base-content fill-current"
        />
        <path
          d="M 310 200 C 300 190, 260 190, 260 210 C 260 230, 310 230, 310 200 Z"
          class="text-base-content fill-current"
        />

        <ellipse
          cx="215"
          cy="210"
          rx="6"
          ry="3"
          class="text-accent fill-current"
        />
        <ellipse
          cx="285"
          cy="210"
          rx="6"
          ry="3"
          class="text-accent fill-current"
        />

        <path
          d="M 210 170 Q 250 180 290 170"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          class="text-base-content"
          opacity="0.6"
        />
        <path
          d="M 220 185 Q 250 195 280 185"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          class="text-base-content"
          opacity="0.6"
        />

        <path
          d="M 170 230 Q 190 270 170 300"
          fill="none"
          stroke="currentColor"
          stroke-width="4"
          class="text-base-content"
          opacity="0.5"
        />
        <path
          d="M 330 230 Q 310 270 330 300"
          fill="none"
          stroke="currentColor"
          stroke-width="4"
          class="text-base-content"
          opacity="0.5"
        />

        <path
          d="M 225 300 C 235 295, 245 305, 235 315 C 220 315, 220 305, 225 300 Z"
          class="text-base-content fill-current"
        />
        <path
          d="M 275 300 C 265 295, 255 305, 265 315 C 280 315, 280 305, 275 300 Z"
          class="text-base-content fill-current"
        />

        <path
          d="M 190 350 Q 250 365 310 350"
          fill="none"
          stroke="currentColor"
          stroke-width="5"
          class="text-base-content"
        />
        <path
          d="M 210 365 Q 250 380 290 365"
          fill="none"
          stroke="currentColor"
          stroke-width="8"
          stroke-linecap="round"
          class="text-base-100"
        />

        <path
          d="M 210 390 L 220 430 M 250 400 L 250 440 M 290 390 L 280 430"
          fill="none"
          stroke="currentColor"
          stroke-width="5"
          class="text-base-content"
          stroke-linecap="round"
        />

        <path
          d="M 90 240 C 90 40, 410 40, 410 240"
          fill="none"
          stroke="currentColor"
          stroke-width="50"
          stroke-linecap="round"
          class="text-base-content"
        />

        <path
          d="M 90 240 C 90 40, 410 40, 410 240"
          fill="none"
          stroke="currentColor"
          stroke-width="20"
          stroke-linecap="round"
          class="text-primary"
        />

        <rect
          x="40"
          y="150"
          width="80"
          height="180"
          rx="40"
          class="text-base-content fill-current"
        />
        <rect
          x="50"
          y="160"
          width="60"
          height="160"
          rx="30"
          class="text-secondary fill-current"
        />
        <rect
          x="80"
          y="170"
          width="40"
          height="140"
          rx="20"
          class="text-base-300 fill-current"
        />
        <line
          x1="100"
          y1="190"
          x2="100"
          y2="290"
          stroke="currentColor"
          stroke-width="4"
          class="text-accent"
          stroke-linecap="round"
        />
        <circle cx="80" cy="240" r="12" class="text-primary fill-current" />

        <rect
          x="380"
          y="150"
          width="80"
          height="180"
          rx="40"
          class="text-base-content fill-current"
        />
        <rect
          x="390"
          y="160"
          width="60"
          height="160"
          rx="30"
          class="text-secondary fill-current"
        />
        <rect
          x="380"
          y="170"
          width="40"
          height="140"
          rx="20"
          class="text-base-300 fill-current"
        />
        <line
          x1="400"
          y1="190"
          x2="400"
          y2="290"
          stroke="currentColor"
          stroke-width="4"
          class="text-accent"
          stroke-linecap="round"
        />
        <circle cx="420" cy="240" r="12" class="text-primary fill-current" />

        <path
          d="M 90 320 C 90 380, 120 450, 50 500"
          fill="none"
          stroke="currentColor"
          stroke-width="6"
          class="text-base-content"
        />

        <path
          d="M 200 110 C 220 100, 230 120, 210 130 Z M 205 135 L 202 155 A 2 2 0 1 0 208 155 Z"
          class="text-error fill-current"
        />
        <circle
          cx="330"
          cy="270"
          r="12"
          class="text-error fill-current"
          opacity="0.8"
        />

        <path
          d="M 300 370 C 310 360, 320 380, 305 390 Z M 307 395 L 315 420 A 2 2 0 1 1 310 422 Z"
          class="text-info fill-current"
        />
        <circle
          cx="240"
          cy="380"
          r="14"
          class="text-info fill-current"
          opacity="0.7"
        />

        <circle cx="250" cy="120" r="8" class="text-warning fill-current" />
        <path
          d="M 120 120 L 140 120 M 130 110 L 130 130"
          stroke="currentColor"
          stroke-width="4"
          class="text-warning"
          stroke-linecap="round"
        />

        <path
          d="M 170 240 Q 150 250, 160 270 T 180 290 T 200 270 Z"
          class="text-primary fill-current"
          opacity="0.9"
        />
        <path
          d="M 150 380 L 170 360 M 170 380 L 150 360"
          stroke="currentColor"
          stroke-width="4"
          class="text-primary"
          stroke-linecap="round"
        />

        <path
          d="M 280 160 Q 300 140, 320 150 T 330 180 T 290 190 Z"
          class="text-secondary fill-current"
          opacity="0.9"
        />
        <path
          d="M 370 110 L 390 110 M 380 100 L 380 120"
          stroke="currentColor"
          stroke-width="4"
          class="text-accent"
          stroke-linecap="round"
        />

        <path
          d="M 230 380 L 235 430 Q 240 440, 245 420 L 240 380 Z"
          class="text-accent fill-current"
        />
        <path
          d="M 150 280 Q 180 300, 160 320 Q 130 300, 150 280 Z"
          class="text-accent fill-current"
        />
      </svg>
    </div>
  );
}
