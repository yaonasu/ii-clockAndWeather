import {DEFAULT_SETTINGS, JAPAN_CITIES} from '../data/presets';
import type {AppSettings, LauncherItem, WeatherData} from '../types/app';
import {validateAndNormalizeWebUrl, validateAppTarget} from './url';

const SETTINGS_KEY = 'ii-clock-settings-v1';
const WEATHER_CACHE_KEY = 'ii-clock-weather-cache-v1';

function sanitizeLauncher(item: Partial<LauncherItem> | undefined, fallback: LauncherItem): LauncherItem {
  if (!item || typeof item !== 'object') return {...fallback};
  const label = typeof item.label === 'string' && item.label.trim().length > 0 ? item.label.trim() : fallback.label;
  const mode = item.mode === 'app' || item.mode === 'url' ? item.mode : fallback.mode;
  const rawTarget = typeof item.target === 'string' ? item.target.trim() : '';

  if (mode === 'url') {
    const validated = validateAndNormalizeWebUrl(rawTarget);
    if (validated.ok) {
      return {id: fallback.id, label, mode, target: validated.url};
    }
    return {...fallback};
  }

  const validatedApp = validateAppTarget(rawTarget);
  if (validatedApp.ok) {
    return {id: fallback.id, label, mode, target: validatedApp.target};
  }
  return {...fallback};
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return structuredClone(DEFAULT_SETTINGS);
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    const validCity = JAPAN_CITIES.some((c) => c.id === parsed.cityId)
      ? (parsed.cityId as string)
      : DEFAULT_SETTINGS.cityId;
    const rawLaunchers = Array.isArray(parsed.launchers) ? parsed.launchers : [];
    const launchers: [LauncherItem, LauncherItem, LauncherItem] = [
      sanitizeLauncher(rawLaunchers[0], DEFAULT_SETTINGS.launchers[0]),
      sanitizeLauncher(rawLaunchers[1], DEFAULT_SETTINGS.launchers[1]),
      sanitizeLauncher(rawLaunchers[2], DEFAULT_SETTINGS.launchers[2]),
    ];
    return {
      cityId: validCity,
      launchers,
    };
  } catch {
    return structuredClone(DEFAULT_SETTINGS);
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage quota or private browsing write errors
  }
}

export function loadCachedWeather(cityId: string): WeatherData | null {
  try {
    const raw = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, WeatherData>;
    const entry = parsed[cityId];
    if (!entry || !Array.isArray(entry.hourly) || entry.hourly.length === 0) return null;
    return entry;
  } catch {
    return null;
  }
}

export function saveCachedWeather(data: WeatherData): void {
  try {
    const raw = localStorage.getItem(WEATHER_CACHE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, WeatherData>) : {};
    parsed[data.cityId] = data;
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(parsed));
  } catch {
    // Ignore storage quota errors
  }
}
