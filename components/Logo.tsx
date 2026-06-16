export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="logo-g1" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#E84A6F" />
          <stop offset="0.5" stopColor="#FF6B8E" />
          <stop offset="1" stopColor="#FF9EB8" />
        </linearGradient>
      </defs>
      <g transform="scale(5.688889) translate(-250 -40)">
        <rect
          x="250"
          y="40"
          width="180"
          height="180"
          rx="44"
          fill="url(#logo-g1)"
        />
        <path
          d="M340 182 C300 152, 272 134, 272 108 C272 92, 286 82, 300 82 C313 82, 332 92, 340 110 C348 92, 367 82, 380 82 C394 82, 408 92, 408 108 C408 134, 380 152, 340 182 Z"
          fill="#FFFFFF"
        />
        <path
          d="M312 102 C312 95, 318 90, 325 91"
          fill="none"
          stroke="#FF8FAB"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.7"
        />
      </g>
    </svg>
  );
}
