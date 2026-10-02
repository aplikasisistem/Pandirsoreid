import React from 'react';

interface PandirStoreLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const PandirStoreEmblem: React.FC<{ className?: string }> = ({
  className = 'w-9 h-9',
}) => {
  return (
    <svg
      viewBox="0 0 500 500"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="psShieldGrad" x1="150" y1="80" x2="350" y2="340" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="60%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#030712" />
        </linearGradient>
        <linearGradient id="psShieldBorder" x1="150" y1="80" x2="350" y2="340" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="psOrangeArrow" x1="170" y1="270" x2="330" y2="130" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="60%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>
        <linearGradient id="psSwooshCyan" x1="120" y1="120" x2="380" y2="380" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="psSwooshOrange" x1="380" y1="180" x2="120" y2="320" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
      </defs>

      {/* Outer Orbit Swoosh - Cyan Top */}
      <path
        d="M 160 115 C 220 75 320 80 365 130 C 388 155 398 190 392 225"
        stroke="url(#psSwooshCyan)"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      <polygon points="392,215 397,240 372,230" fill="#38BDF8" />
      <polygon points="165,120 142,108 152,135" fill="#38BDF8" />

      {/* Outer Orbit Swoosh - Orange Bottom */}
      <path
        d="M 340 335 C 280 375 180 365 135 315 C 112 290 102 255 108 220"
        stroke="url(#psSwooshOrange)"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      <polygon points="108,230 103,205 128,215" fill="#F97316" />
      <polygon points="335,330 358,342 348,315" fill="#F97316" />

      {/* Metallic Shield Base */}
      <polygon
        points="250,85 355,140 335,275 250,345 165,275 145,140"
        fill="#090E17"
        stroke="url(#psShieldBorder)"
        strokeWidth="14"
        strokeLinejoin="round"
      />

      {/* Inner Beveled Shield */}
      <polygon
        points="250,112 332,154 316,260 250,320 184,260 168,154"
        fill="url(#psShieldGrad)"
        stroke="#38BDF8"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Cyber @ Symbol In Center */}
      <circle
        cx="250"
        cy="200"
        r="44"
        stroke="#38BDF8"
        strokeWidth="7"
        fill="none"
        opacity="0.9"
      />
      <path
        d="M 250 178 C 236 178 225 188 225 202 C 225 216 236 226 250 226 C 262 226 271 218 273 206 L 273 194"
        stroke="#38BDF8"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Bold Orange Ascending Arrow */}
      <path
        d="M 180 280 L 295 165"
        stroke="url(#psOrangeArrow)"
        strokeWidth="18"
        strokeLinecap="round"
      />
      <polygon points="278,145 335,135 325,192" fill="#FBBF24" />

      {/* Game Controller in Bottom of Shield */}
      <g transform="translate(205, 238)">
        <rect
          x="0"
          y="6"
          width="90"
          height="52"
          rx="22"
          fill="#F1F5F9"
          stroke="#0284C7"
          strokeWidth="4"
        />
        <ellipse cx="45" cy="50" rx="16" ry="9" fill="#090E17" />
        {/* D-Pad */}
        <path
          d="M 18 26 H 32 M 25 19 V 33"
          stroke="#0F172A"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Buttons */}
        <circle cx="63" cy="22" r="3" fill="#EF4444" />
        <circle cx="72" cy="26" r="3" fill="#3B82F6" />
        <circle cx="63" cy="30" r="3" fill="#10B981" />
        <circle cx="54" cy="26" r="3" fill="#F59E0B" />
      </g>
    </svg>
  );
};

export const PandirStoreLogo: React.FC<PandirStoreLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* High-Fidelity Uploaded Logo Emblem */}
      <div className="relative flex items-center justify-center p-0.5 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-orange-500 shadow-lg shadow-cyan-950/40">
        <div className="w-full h-full bg-slate-950 rounded-[10px] p-1 flex items-center justify-center">
          <PandirStoreEmblem className={iconSizes[size]} />
        </div>
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950 animate-ping"></span>
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950"></span>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-lg sm:text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-orange-400">
              PANDIRSTORE<span className="text-orange-500">.ID</span>
            </span>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase tracking-widest">
              OFFICIAL
            </span>
          </div>
          <span className="text-[10px] text-cyan-400 font-semibold tracking-wide -mt-0.5">
            Jual Beli Akun Aman &amp; Terpercaya
          </span>
        </div>
      )}
    </div>
  );
};
