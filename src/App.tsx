import {Settings} from 'lucide-react';
import {useCallback, useEffect, useRef, useState} from 'react';
import {EggplantClock} from './components/EggplantClock';
import {FullscreenClockModal} from './components/FullscreenClockModal';
import {LauncherBar} from './components/LauncherBar';
import {OfflineIndicator} from './components/OfflineIndicator';
import {PWAInstallButton} from './components/PWAInstallButton';
import {SettingsModal} from './components/SettingsModal';
import {WeatherForecastPanel} from './components/WeatherForecastPanel';
import {getCityPreset} from './data/presets';
import {useOnlineStatus} from './hooks/useOnlineStatus';
import {useWakeLock} from './hooks/useWakeLock';
import {fetch24HourWeather} from './services/weatherService';
import type {AppSettings, WeatherData} from './types/app';
import {loadCachedWeather, loadSettings, saveCachedWeather, saveSettings} from './utils/storage';

const SWAP_INTERVAL_MS = 3 * 60 * 1000;

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [isSwapped, setIsSwapped] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fullscreenClockOpen, setFullscreenClockOpen] = useState(false);

  const [weather, setWeather] = useState<WeatherData | null>(() =>
    loadCachedWeather(loadSettings().cityId),
  );
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const lastFetchedRef = useRef<{cityId: string; hour: number} | null>(null);
  const weatherRequestSeqRef = useRef(0);
  const inFlightCityIdRef = useRef<string | null>(null);
  const activeCityIdRef = useRef(settings.cityId);
  activeCityIdRef.current = settings.cityId;

  const isOnline = useOnlineStatus();
  const wasOnlineRef = useRef(isOnline);
  const {releaseForExternalApp} = useWakeLock();
  const activeCity = getCityPreset(settings.cityId);

  const loadWeather = useCallback(async (cityId: string) => {
    if (inFlightCityIdRef.current === cityId) {
      return;
    }

    const requestSeq = ++weatherRequestSeqRef.current;
    inFlightCityIdRef.current = cityId;

    const city = getCityPreset(cityId);
    const cached = loadCachedWeather(city.id);
    setWeather((prev) => {
      if (cached) return cached;
      return prev?.cityId === city.id ? prev : null;
    });
    setWeatherLoading(true);
    setWeatherError(null);

    try {
      const fresh = await fetch24HourWeather(city);
      if (
        weatherRequestSeqRef.current !== requestSeq ||
        activeCityIdRef.current !== city.id
      ) {
        return;
      }
      setWeather(fresh);
      saveCachedWeather(fresh);
      lastFetchedRef.current = {
        cityId: city.id,
        hour: new Date().getHours(),
      };
    } catch (err) {
      if (
        weatherRequestSeqRef.current !== requestSeq ||
        activeCityIdRef.current !== city.id
      ) {
        return;
      }
      if (!cached) {
        setWeatherError(
          err instanceof Error ? err.message : '天気予報の取得に失敗しました',
        );
      }
    } finally {
      if (weatherRequestSeqRef.current === requestSeq) {
        inFlightCityIdRef.current = null;
        setWeatherLoading(false);
      }
    }
  }, []);

  // Fetch on mount/city change and schedule updates precisely at the top of each hour (:00)
  useEffect(() => {
    void loadWeather(settings.cityId);

    let timeoutId: number | undefined;
    const scheduleTopOfHour = () => {
      const now = new Date();
      const nextHour = new Date(now);
      nextHour.setHours(now.getHours() + 1, 0, 1, 0);
      const delay = Math.max(1000, nextHour.getTime() - now.getTime());
      timeoutId = window.setTimeout(() => {
        void loadWeather(settings.cityId);
        scheduleTopOfHour();
      }, delay);
    };

    scheduleTopOfHour();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const currentHour = new Date().getHours();
        const last = lastFetchedRef.current;
        if (!last || last.cityId !== settings.cityId || last.hour !== currentHour) {
          void loadWeather(settings.cityId);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [settings.cityId, loadWeather]);

  // Refresh weather only when connectivity transitions from offline to online
  useEffect(() => {
    const wasOnline = wasOnlineRef.current;
    wasOnlineRef.current = isOnline;
    if (!wasOnline && isOnline) {
      void loadWeather(settings.cityId);
    }
  }, [isOnline, settings.cityId, loadWeather]);

  // Swap Panel A and Panel B instantly every 3 minutes
  useEffect(() => {
    const timer = window.setInterval(() => {
      setIsSwapped((prev) => !prev);
    }, SWAP_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  const handleSaveSettings = (next: AppSettings) => {
    setSettings(next);
    saveSettings(next);
  };

  const panelA = (
    <section
      aria-label="A面 茄子アナログ時計"
      className="h-full min-h-0 overflow-hidden rounded-2xl bg-[#151021] border border-purple-300/12 p-3 sm:p-5 flex flex-col"
    >
      <EggplantClock compact />
    </section>
  );

  const panelB = (
    <section
      aria-label="B面 24時間天気予報とランチャー"
      className="h-full min-h-0 overflow-hidden rounded-2xl bg-[#151021] border border-purple-300/12 p-3 sm:p-5 flex flex-col gap-2"
    >
      <WeatherForecastPanel
        city={activeCity}
        weather={weather}
        loading={weatherLoading}
        error={weatherError}
        onRetry={() => void loadWeather(settings.cityId)}
      />
      <LauncherBar
        launchers={settings.launchers}
        onOpenClockApp={() => setFullscreenClockOpen(true)}
        onExternalLaunch={releaseForExternalApp}
      />
    </section>
  );

  return (
    <div className="h-dvh w-full bg-[#0B0812] text-[#F8FAFC] flex flex-col overflow-hidden">
      {/* Top Bar: App icon + Brand on left, Settings (and optional PWA install) on right */}
      <header className="h-14 shrink-0 px-4 sm:px-6 border-b border-purple-300/12 flex items-center justify-between gap-4 bg-[#0B0812]">
        <div className="flex items-center gap-2.5 shrink-0">
          <img
            src={`${import.meta.env.BASE_URL}assets/aistudio/___91ac5eb5.png`}
            alt="ii-clockAndWeather アイコン"
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0 drop-shadow-[0_0_3px_rgba(233,213,255,0.38)]"
          />
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-50 whitespace-nowrap shrink-0">
            ii-clockAndWeather
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <PWAInstallButton compact />
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label="設定を開く"
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#151021] hover:bg-[#221936] border border-purple-300/15 text-sm font-medium text-slate-100 flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Settings className="w-4 h-4 text-purple-300" aria-hidden="true" />
            <span>設定</span>
          </button>
        </div>
      </header>

      {/* 2-Split Main Canvas: Landscape=Left/Right, Portrait=Top/Bottom; instant swap every 3m */}
      <main className="flex-1 min-h-0 grid grid-cols-1 grid-rows-2 landscape:grid-cols-2 landscape:grid-rows-1 gap-3 p-3 sm:p-4">
        {isSwapped ? panelB : panelA}
        {isSwapped ? panelA : panelB}
      </main>

      <SettingsModal
        open={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveSettings}
      />

      <FullscreenClockModal
        open={fullscreenClockOpen}
        onClose={() => setFullscreenClockOpen(false)}
      />

      <OfflineIndicator />
    </div>
  );
}
