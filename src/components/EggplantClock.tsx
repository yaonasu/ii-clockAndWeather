import {useEffect, useState} from 'react';

interface EggplantClockProps {
  compact?: boolean;
}

const WEEKDAYS_JA = ['日', '月', '火', '水', '木', '金', '土'];

export function EggplantClock({compact = false}: EggplantClockProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 200);
    return () => window.clearInterval(timer);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const secondAngle = seconds * 6;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const hourAngle = (hours % 12) * 30 + minutes * 0.5;

  const digitalTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const dateLabel = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 (${WEEKDAYS_JA[now.getDay()]})`;

  const cx = 150;
  const cy = 206;
  const dialR = 124;

  const ticks = Array.from({length: 60}, (_, i) => {
    const isHour = i % 5 === 0;
    const angle = (i * 6 * Math.PI) / 180;
    const rOuter = dialR - 7;
    const rInner = isHour ? dialR - 19 : dialR - 12;
    const x1 = cx + Math.sin(angle) * rInner;
    const y1 = cy - Math.cos(angle) * rInner;
    const x2 = cx + Math.sin(angle) * rOuter;
    const y2 = cy - Math.cos(angle) * rOuter;
    return {i, isHour, x1, y1, x2, y2};
  });

  return (
    <div className="h-full w-full flex flex-col items-center justify-center min-h-0 px-2 py-1 select-none">
      <div className="flex-1 min-h-0 w-full flex items-center justify-center">
        <svg
          viewBox="0 0 336 346"
          className={compact ? 'h-full max-h-full w-auto max-w-full' : 'h-full max-h-[82vh] w-auto max-w-full'}
          role="img"
          aria-label={`茄子アナログ時計 ${digitalTime}`}
        >
          <defs>
            <radialGradient id="eggplantAmbient" cx="52%" cy="58%" r="54%">
              <stop offset="0%" stopColor="#6B21A8" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#0B0812" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="eggplantSkin" cx="38%" cy="36%" r="74%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.95" />
              <stop offset="32%" stopColor="#6D28D9" />
              <stop offset="70%" stopColor="#4C1D95" />
              <stop offset="100%" stopColor="#240B4C" />
            </radialGradient>
            <linearGradient id="eggplantHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5F3FF" stopOpacity="0.42" />
              <stop offset="100%" stopColor="#C084FC" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="calyxBack" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ADE80" />
              <stop offset="100%" stopColor="#15803D" />
            </linearGradient>
            <linearGradient id="calyxFront" x1="15%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%" stopColor="#BEF264" />
              <stop offset="48%" stopColor="#65A30D" />
              <stop offset="100%" stopColor="#16A34A" />
            </linearGradient>
            <radialGradient id="dialFace" cx="50%" cy="44%" r="56%">
              <stop offset="0%" stopColor="#1A102E" />
              <stop offset="100%" stopColor="#0B0714" />
            </radialGradient>
          </defs>

          {/* Subtle ambient glow */}
          <ellipse cx="168" cy="206" rx="164" ry="142" fill="url(#eggplantAmbient)" />

          {/* Eggplant silhouette matching sketch: top-left neck, snug left wall, wide plump right belly */}
          <path
            d="M46 56
               C76 52 108 52 132 54
               C138 68 168 72 224 88
               C282 104 318 144 322 198
               C328 258 312 308 266 326
               C216 344 110 344 68 331
               C28 314 12 268 14 210
               C16 156 32 106 46 56 Z"
            fill="url(#eggplantSkin)"
            stroke="#C084FC"
            strokeOpacity="0.42"
            strokeWidth="2.4"
          />

          {/* Glossy highlight on the plump upper-right / right belly */}
          <path
            d="M276 132 C296 152 308 180 310 208 C311 216 301 217 299 210 C295 184 285 159 267 141 C261 135 269 125 276 132 Z"
            fill="url(#eggplantHighlight)"
          />
          <ellipse cx="304" cy="242" rx="4.5" ry="7.5" transform="rotate(6 304 242)" fill="#F3E8FF" fillOpacity="0.28" />

          {/* Soft calyx shadow onto top-left neck */}
          <path
            d="M38 66 C66 60 102 60 140 70 C128 78 114 78 100 72 C84 82 64 82 48 74 Z"
            fill="#120529"
            fillOpacity="0.48"
          />

          {/* Back flicked calyx tips (top-left, curling outward) */}
          <path
            d="M66 44 C48 44 34 40 22 36 C32 48 44 54 60 56 Z"
            fill="url(#calyxBack)"
            stroke="#052E16"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M114 44 C132 46 146 46 160 40 C150 54 136 60 118 62 Z"
            fill="url(#calyxBack)"
            stroke="#052E16"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Main top-left calyx with right-curled stem tip matching sketch */}
          <path
            d="M90 22
               C98 14 110 8 122 10
               C126 11 128 16 123 20
               C116 24 110 26 108 32
               C116 40 130 48 148 52
               C155 54 160 58 158 63
               C155 68 143 69 130 64
               C137 71 140 76 134 79
               C127 81 116 74 106 66
               C102 74 96 78 90 77
               C85 76 82 71 80 65
               C73 74 63 80 54 78
               C48 76 47 70 50 64
               C36 68 22 66 18 60
               C15 55 21 50 32 49
               C48 47 64 38 74 26
               C80 19 85 18 90 22 Z"
            fill="url(#calyxFront)"
            stroke="#052E16"
            strokeWidth="2.1"
            strokeLinejoin="round"
          />

          {/* Stem cut-top detail & calyx specular highlights */}
          <ellipse
            cx="116"
            cy="15"
            rx="6.5"
            ry="3.2"
            transform="rotate(-14 116 15)"
            fill="#D9F99D"
            stroke="#166534"
            strokeWidth="1.4"
          />
          <path
            d="M72 37 C79 31 86 30 90 34 C86 39 78 41 72 39 Z"
            fill="#ECFCCB"
            fillOpacity="0.88"
          />
          <circle cx="96" cy="40" r="2.1" fill="#ECFCCB" fillOpacity="0.82" />

          {/* Extra-large high-contrast analog clock dial */}
          <circle
            cx={cx}
            cy={cy}
            r={dialR}
            fill="url(#dialFace)"
            stroke="#E9D5FF"
            strokeOpacity="0.55"
            strokeWidth="2.5"
          />
          <circle
            cx={cx}
            cy={cy}
            r={dialR - 4}
            fill="none"
            stroke="#F59E0B"
            strokeOpacity="0.22"
            strokeWidth="1"
          />

          {/* Tick marks */}
          {ticks.map((t) => (
            <line
              key={t.i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.isHour ? '#FDE68A' : '#94A3B8'}
              strokeOpacity={t.isHour ? 0.92 : 0.4}
              strokeWidth={t.isHour ? 2.8 : 1.2}
              strokeLinecap="round"
            />
          ))}

          {/* Bold cardinal numbers */}
          <text
            x={cx}
            y={cy - dialR + 40}
            textAnchor="middle"
            fill="#F8FAFC"
            fontSize="24"
            fontWeight="700"
            fontFamily="var(--font-mono)"
          >
            12
          </text>
          <text
            x={cx + dialR - 32}
            y={cy + 8}
            textAnchor="middle"
            fill="#F8FAFC"
            fontSize="24"
            fontWeight="700"
            fontFamily="var(--font-mono)"
          >
            3
          </text>
          <text
            x={cx}
            y={cy + dialR - 23}
            textAnchor="middle"
            fill="#F8FAFC"
            fontSize="24"
            fontWeight="700"
            fontFamily="var(--font-mono)"
          >
            6
          </text>
          <text
            x={cx - dialR + 32}
            y={cy + 8}
            textAnchor="middle"
            fill="#F8FAFC"
            fontSize="24"
            fontWeight="700"
            fontFamily="var(--font-mono)"
          >
            9
          </text>

          {/* Hour hand */}
          <g transform={`rotate(${hourAngle} ${cx} ${cy})`}>
            <line
              x1={cx}
              y1={cy + 14}
              x2={cx}
              y2={cy - 65}
              stroke="#F8FAFC"
              strokeWidth="7"
              strokeLinecap="round"
            />
          </g>

          {/* Minute hand */}
          <g transform={`rotate(${minuteAngle} ${cx} ${cy})`}>
            <line
              x1={cx}
              y1={cy + 18}
              x2={cx}
              y2={cy - 96}
              stroke="#E2E8F0"
              strokeWidth="4.6"
              strokeLinecap="round"
            />
          </g>

          {/* Second hand */}
          <g transform={`rotate(${secondAngle} ${cx} ${cy})`}>
            <line
              x1={cx}
              y1={cy + 24}
              x2={cx}
              y2={cy - 106}
              stroke="#4ADE80"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <circle cx={cx} cy={cy + 22} r="3.2" fill="#4ADE80" />
          </g>

          {/* Center pin */}
          <circle cx={cx} cy={cy} r="6.5" fill="#F59E0B" />
          <circle cx={cx} cy={cy} r="2.6" fill="#0B0812" />
        </svg>
      </div>

      {/* Digital time and date below the analog dial */}
      <div className="shrink-0 mt-1 text-center">
        <div
          className={
            compact
              ? 'font-mono tabular-nums text-2xl sm:text-3xl font-semibold tracking-wider text-slate-50 leading-tight'
              : 'font-mono tabular-nums text-3xl sm:text-4xl font-semibold tracking-wider text-slate-50 leading-tight'
          }
        >
          {digitalTime}
        </div>
        <div className="mt-0.5 text-xs sm:text-sm text-purple-200/75 tabular-nums">
          {dateLabel}
        </div>
      </div>
    </div>
  );
}
