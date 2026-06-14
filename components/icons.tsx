import * as React from "react";

// Set de iconos SVG en línea (sin dependencias). Estilo trazo, 24x24.
// Se referencian por nombre desde lib/attributes.ts y la UI.
const PATHS: Record<string, React.ReactNode> = {
  // Categorías ("qué buscas")
  heart: (
    <path d="M12 20.5C7 17 3.5 13.8 3.5 9.8 3.5 7 5.6 5 8.2 5c1.7 0 3 .9 3.8 2.2C12.8 5.9 14.1 5 15.8 5c2.6 0 4.7 2 4.7 4.8 0 4-3.5 7.2-8.5 10.7z" />
  ),
  spark: <path d="M13 3 4 14h7l-1 7 9-11h-7z" />,
  friends: (
    <>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M16 6.2a3 3 0 0 1 0 5.6" />
      <path d="M18.5 19a5.5 5.5 0 0 0-3-4.9" />
    </>
  ),
  chat: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z" />,

  // Intereses
  plane: (
    <>
      <path d="M21 3 3 10.5l7 2.5 2.5 7z" />
      <path d="M10 13l4.5-4.5" />
    </>
  ),
  dumbbell: <path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12" />,
  music: (
    <>
      <path d="M9 18V6l11-2v12" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </>
  ),
  film: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4" />
    </>
  ),
  food: (
    <>
      <path d="M7 3v7a2 2 0 0 0 4 0V3M9 12v9" />
      <path d="M16 3c-1.5 0-2.5 2-2.5 5S15 13 16 13v8" />
    </>
  ),
  book: (
    <>
      <path d="M5 4a2 2 0 0 1 2-2h11v16H7a2 2 0 0 0-2 2z" />
      <path d="M5 20a2 2 0 0 1 2-2h11" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19c0-8 6-13 14-13 0 8-5 13-13 13z" />
      <path d="M5.5 18.5c2-4 5-6.5 9-7.5" />
    </>
  ),
  camera: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <circle cx="12" cy="13.5" r="3.5" />
      <path d="M8 7l1.5-3h5L16 7" />
    </>
  ),
  gamepad: (
    <>
      <rect x="2.5" y="7.5" width="19" height="9" rx="4.5" />
      <path d="M7 11v3M5.5 12.5h3" />
      <circle cx="16" cy="11.5" r="1" />
      <circle cx="18" cy="13.5" r="1" />
    </>
  ),
  star: (
    <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" />
  ),
  palette: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-1 2-2 0-1.4 1-2 2.4-2H18a3 3 0 0 0 3-3c0-5-4-9-9-9z" />
      <circle cx="7.5" cy="11.5" r="1" />
      <circle cx="10" cy="8" r="1" />
      <circle cx="14" cy="8" r="1" />
      <circle cx="16.5" cy="11.5" r="1" />
    </>
  ),
  paw: (
    <>
      <circle cx="6.5" cy="11" r="1.6" />
      <circle cx="10" cy="7.8" r="1.6" />
      <circle cx="14" cy="7.8" r="1.6" />
      <circle cx="17.5" cy="11" r="1.6" />
      <path d="M12 13c-2.2 0-4 1.6-4 3.6 0 1.6 1.3 2.4 4 2.4s4-.8 4-2.4c0-2-1.8-3.6-4-3.6z" />
    </>
  ),

  // Complexión — siluetas minimalistas (formas abstractas, sin figuras)
  buildSlim: <rect x="9.5" y="3.5" width="5" height="17" rx="2.5" />,
  buildAverage: <rect x="7.5" y="3.5" width="9" height="17" rx="4" />,
  buildAthletic: (
    <path d="M7.5 6c0-1.4 1.1-2.5 2.5-2.5h4c1.4 0 2.5 1.1 2.5 2.5l-1 12c0 1.4-1.1 2.5-2.5 2.5h0c-1.4 0-2.5-1.1-2.5-2.5z" />
  ),
  buildCurvy: (
    <path d="M8.5 4h7c-1.6 3-1.6 5 0 8-1.6 3-1.6 5 0 8h-7c1.6-3 1.6-5 0-8 1.6-3 1.6-5 0-8z" />
  ),

  // Género
  venus: (
    <>
      <circle cx="12" cy="8" r="5" />
      <path d="M12 13v8M9 18h6" />
    </>
  ),
  mars: (
    <>
      <circle cx="10" cy="14" r="5" />
      <path d="M14 10l6-6M15 4h5v5" />
    </>
  ),
  nonbinary: (
    <>
      <circle cx="12" cy="14" r="5" />
      <path d="M12 9V3M9.5 5.5 12 3l2.5 2.5" />
    </>
  ),

  // UI
  "shield-check": (
    <>
      <path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  mapPin: (
    <>
      <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M3.5 9h17M8 3v4M16 3v4" />
    </>
  ),
  ruler: (
    <>
      <rect x="2.5" y="9" width="19" height="6" rx="1" />
      <path d="M7 9v2.5M11 9v3M15 9v2.5M19 9v3" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  chevronRight: <path d="M9 6l6 6-6 6" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  scanFace: (
    <>
      <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
      <path d="M9 10h.01M15 10h.01M9.5 14a3 3 0 0 0 5 0" />
    </>
  ),
  check: <path d="M5 12l4.5 4.5L19 7" />,
  sparkles: (
    <>
      <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9z" />
      <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17z" />
    </>
  ),
  bell: (
    <>
      <path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5 1.5 5h-15S6 13 6 9z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
  expand: (
    <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3" />
  ),
};

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  className = "h-5 w-5",
  strokeWidth = 1.7,
  filled = false,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
  filled?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name] ?? PATHS.spark}
    </svg>
  );
}
