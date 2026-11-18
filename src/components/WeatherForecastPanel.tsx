import {RefreshCw} from 'lucide-react';
import {useMemo} from 'react';
import type {CityPreset, WeatherData} from '../types/app';
import {WeatherIcon} from './WeatherIcon';

interface WeatherForecastPanelProps {
  city: CityPreset;
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function WeatherForecastPanel({
  city,
  weather,
  loading,
  error,
  onRetry,
}: WeatherForecastPanelProps) {
  const chartGeometry = useMemo(() => {
    if (!weather || weather.hourly.length === 0) return null;
    const points = weather.hourly;
    const temps = points.map((p) => p.temperatureC);
    const rawMin = Math.min(...temps);
    const rawMax = Math.max(...temps);
    const minTemp = Math.floor(rawMin - 1.5);
    const maxTemp = Math.ceil(rawMax + 1.5);
    const tempSpan = Math.max(4, maxTemp - minTemp);

    const width = 640;
    const height = 252;
    const padLeft = 38;
    const padRight = 40;
    const padTop = 44;
    const padBottom = 28;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    const getX = (idx: number) =>
      points.length === 1 ? padLeft + plotW / 2 : padLeft + (idx / (points.length - 1)) * plotW;

    const getTempY = (t: number) => padTop + (1 - (t - minTemp) / tempSpan) * plotH;
    const getPopY = (pop: number) => padTop + (1 - pop / 100) * plotH;

    const tempPath = points
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx).toFixed(1)} ${getTempY(p.temperatureC).toFixed(1)}`)
      .join(' ');

    const popPath = points
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx).toFixed(1)} ${getPopY(p.precipitationProb).toFixed(1)}`)
      .join(' ');

    const popAreaPath = `${popPath} L ${getX(points.length - 1).toFixed(1)} ${(padTop + plotH).toFixed(1)} L ${getX(0).toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`;

    const midTemp = Math.round((minTemp + tempSpan / 2) * 10) / 10;

    return {
      width,
      height,
      padLeft,
      padRight,
      padTop,
      padBottom,
      plotW,
      plotH,
      minTemp,
      maxTemp,
      midTemp,
      tempPath,
      popPath,
      popAreaPath,
      getX,
      getTempY,
      getPopY,
    };
  }, [weather]);

  const updatedLabel = weather
    ? new Date(weather.fetchedAt).toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header row with unboxed metadata */}
      <div className="flex items-center justify-between gap-3 shrink-0 pb-2 border-b border-purple-300/10">
        <div className="flex items-center gap-2.5 min-w-0">
          {weather ? (
            <WeatherIcon kind={weather.currentIconKind} className="w-6 h-6 shrink-0" />
          ) : null}
          <div className="min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-semibold text-slate-50 whitespace-nowrap">
                {city.name}
              </h2>
              {weather ? (
                <span className="text-sm text-purple-200/80 tabular-nums whitespace-nowrap">
                  {weather.currentConditionLabel} · {weather.currentTempC.toFixed(1)}℃
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {updatedLabel ? (
            <span className="hidden sm:inline text-xs text-slate-400 tabular-nums whitespace-nowrap">
              {updatedLabel} 更新
            </span>
          ) : null}
          <button
            type="button"
            onClick={onRetry}
            aria-label="天気予報を再読み込み"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-purple-500/15 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-300' : ''}`} />
          </button>
        </div>
      </div>

      {/* Subheader: label + legend */}
      <div className="flex items-center justify-between gap-2 pt-2 pb-1 text-xs shrink-0 flex-wrap">
        <span className="text-slate-400">現在から24時間予報</span>
        <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-300">
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-3 h-0.5 bg-amber-400 inline-block" />
            気温(℃)
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-3 h-0.5 bg-sky-400 inline-block" />
            降水確率(%)
          </span>
        </div>
      </div>

      {/* Main chart body */}
      <div className="flex-1 min-h-0 flex flex-col justify-center">
        {loading && !weather ? (
          <div className="flex-1 flex flex-col justify-center gap-3 py-4">
            <div className="h-32 w-full rounded-xl bg-purple-950/40 animate-pulse" />
            <div className="h-6 w-2/3 mx-auto rounded bg-purple-950/30 animate-pulse" />
          </div>
        ) : error && !weather ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-4 gap-3">
            <p className="text-sm text-rose-300">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="min-h-[44px] px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 text-sm font-medium text-white transition-colors cursor-pointer"
            >
              再試行する
            </button>
          </div>
        ) : weather && chartGeometry ? (
          <div className="flex-1 min-h-0 w-full flex items-center">
            <svg
              viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`}
              className="w-full h-full max-h-full overflow-visible"
              role="img"
              aria-label="現在から24時間の気温・降水確率・天気アイコングラフ"
            >
              <defs>
                <linearGradient id="popFill" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* 3-hour primary icons (24px) + intermediate 1-hour secondary icons (14px) */}
              {weather.hourly.map((pt, idx) => {
                const isMajor = idx % 3 === 0;
                const iconSize = isMajor ? 24 : 14;
                const yPos = isMajor ? 6 : 11;
                return (
                  <svg
                    key={`icon-${pt.timeIso}`}
                    x={chartGeometry.getX(idx) - iconSize / 2}
                    y={yPos}
                    width={iconSize}
                    height={iconSize}
                  >
                    <WeatherIcon kind={pt.iconKind} className="w-full h-full" />
                  </svg>
                );
              })}

              {/* Subtle 3-hour vertical guide lines */}
              {weather.hourly.map((pt, idx) => {
                if (idx % 3 !== 0) return null;
                const x = chartGeometry.getX(idx);
                return (
                  <line
                    key={`vline-${pt.timeIso}`}
                    x1={x}
                    y1={chartGeometry.padTop}
                    x2={x}
                    y2={chartGeometry.padTop + chartGeometry.plotH}
                    stroke="#E2E8F0"
                    strokeOpacity="0.06"
                  />
                );
              })}

              {/* Horizontal gridlines (0%, 50%, 100% PoP) */}
              {[0, 50, 100].map((pct) => {
                const y = chartGeometry.getPopY(pct);
                return (
                  <g key={pct}>
                    <line
                      x1={chartGeometry.padLeft}
                      y1={y}
                      x2={chartGeometry.width - chartGeometry.padRight}
                      y2={y}
                      stroke="#E2E8F0"
                      strokeOpacity="0.09"
                      strokeDasharray="3 4"
                    />
                    <text
                      x={chartGeometry.width - chartGeometry.padRight + 6}
                      y={y + 4}
                      fill="#38BDF8"
                      fillOpacity="0.85"
                      fontSize="11"
                      fontFamily="var(--font-mono)"
                    >
                      {pct}%
                    </text>
                  </g>
                );
              })}

              {/* Left Y-axis temperature ticks */}
              {[chartGeometry.minTemp, chartGeometry.midTemp, chartGeometry.maxTemp].map(
                (tempVal, idx) => {
                  const y = chartGeometry.getTempY(tempVal);
                  return (
                    <text
                      key={idx}
                      x={chartGeometry.padLeft - 6}
                      y={y + 4}
                      textAnchor="end"
                      fill="#FBBF24"
                      fillOpacity="0.9"
                      fontSize="11"
                      fontFamily="var(--font-mono)"
                    >
                      {Math.round(tempVal)}°
                    </text>
                  );
                },
              )}

              {/* Precipitation probability area + line */}
              <path d={chartGeometry.popAreaPath} fill="url(#popFill)" />
              <path
                d={chartGeometry.popPath}
                fill="none"
                stroke="#38BDF8"
                strokeWidth="2.2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {/* Temperature line */}
              <path
                d={chartGeometry.tempPath}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2.6"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {/* X-axis 3-hour labels */}
              {weather.hourly.map((pt, idx) => {
                if (idx % 3 !== 0) return null;
                return (
                  <text
                    key={pt.timeIso}
                    x={chartGeometry.getX(idx)}
                    y={chartGeometry.height - 6}
                    textAnchor="middle"
                    fill="#94A3B8"
                    fontSize="11"
                    fontFamily="var(--font-mono)"
                  >
                    {pt.hourLabel}
                  </text>
                );
              })}
            </svg>
          </div>
        ) : null}
      </div>

      <div className="shrink-0 pt-1 text-[10px] sm:text-[11px] text-slate-400/90 flex items-center justify-end gap-1.5 flex-wrap">
        <a
          href="https://open-meteo.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-purple-200 underline decoration-slate-600 underline-offset-2 transition-colors"
        >
          Weather data by Open-Meteo.com
        </a>
        <span aria-hidden="true">·</span>
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-purple-200 underline decoration-slate-600 underline-offset-2 transition-colors"
        >
          CC BY 4.0
        </a>
      </div>
    </div>
  );
}
