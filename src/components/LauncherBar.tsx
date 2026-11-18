import {AppWindow, Calendar, Clock, CloudSun, ExternalLink} from 'lucide-react';
import {BUILTIN_CLOCK_TARGET} from '../data/presets';
import type {LauncherItem} from '../types/app';
import {validateAndNormalizeWebUrl, validateAppTarget} from '../utils/url';

interface LauncherBarProps {
  launchers: [LauncherItem, LauncherItem, LauncherItem];
  onOpenClockApp: () => void;
  onExternalLaunch: () => void;
}

function getLauncherIcon(item: LauncherItem) {
  const lowerLabel = item.label.toLowerCase();
  const lowerTarget = item.target.toLowerCase();
  if (item.mode === 'app' && (item.target === BUILTIN_CLOCK_TARGET || lowerTarget === 'clock-app')) {
    return <Clock className="w-5 h-5 text-purple-300 shrink-0" aria-hidden="true" />;
  }
  if (lowerLabel.includes('天気') || lowerTarget.includes('weather') || lowerTarget.includes('open-meteo')) {
    return <CloudSun className="w-5 h-5 text-amber-300 shrink-0" aria-hidden="true" />;
  }
  if (lowerLabel.includes('カレンダー') || lowerTarget.includes('calendar')) {
    return <Calendar className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />;
  }
  if (item.mode === 'app') {
    return <AppWindow className="w-5 h-5 text-purple-300 shrink-0" aria-hidden="true" />;
  }
  return <ExternalLink className="w-5 h-5 text-sky-300 shrink-0" aria-hidden="true" />;
}

export function LauncherBar({
  launchers,
  onOpenClockApp,
  onExternalLaunch,
}: LauncherBarProps) {
  return (
    <div className="shrink-0 pt-2.5 border-t border-purple-300/10">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {launchers.map((item) => {
          const commonClass =
            'min-h-[48px] sm:min-h-[54px] px-2.5 sm:px-3 py-2 rounded-xl bg-[#1D1530] hover:bg-[#281E42] active:scale-[0.98] border border-purple-300/15 flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400';

          const disabledClass =
            'min-h-[48px] sm:min-h-[54px] px-2.5 sm:px-3 py-2 rounded-xl bg-[#171126] border border-rose-400/20 opacity-60 flex items-center justify-center gap-2 cursor-not-allowed';

          if (item.mode === 'app') {
            const validatedApp = validateAppTarget(item.target);
            if (!validatedApp.ok) {
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled
                  aria-disabled="true"
                  title={validatedApp.error}
                  className={disabledClass}
                >
                  {getLauncherIcon(item)}
                  <span className="text-xs sm:text-sm font-medium text-slate-300 truncate">
                    {item.label}
                  </span>
                </button>
              );
            }

            if (validatedApp.isBuiltinClock) {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={onOpenClockApp}
                  className={`${commonClass} cursor-pointer`}
                >
                  {getLauncherIcon(item)}
                  <span className="text-xs sm:text-sm font-medium text-slate-100 truncate">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <a
                key={item.id}
                href={validatedApp.target}
                onClick={onExternalLaunch}
                className={commonClass}
              >
                {getLauncherIcon(item)}
                <span className="text-xs sm:text-sm font-medium text-slate-100 truncate">
                  {item.label}
                </span>
              </a>
            );
          }

          const validatedUrl = validateAndNormalizeWebUrl(item.target);
          if (!validatedUrl.ok) {
            return (
              <button
                key={item.id}
                type="button"
                disabled
                aria-disabled="true"
                title={validatedUrl.error}
                className={disabledClass}
              >
                {getLauncherIcon(item)}
                <span className="text-xs sm:text-sm font-medium text-slate-300 truncate">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <a
              key={item.id}
              href={validatedUrl.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onExternalLaunch}
              className={commonClass}
            >
              {getLauncherIcon(item)}
              <span className="text-xs sm:text-sm font-medium text-slate-100 truncate">
                {item.label}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
