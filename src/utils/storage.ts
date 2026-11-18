import {DEFAULT_SETTINGS, JAPAN_CITIES} from '../data/presets';
import type {AppSettings, LauncherItem, WeatherData} from '../types/app';
import {validateAndNormalizeWebUrl} from './url';

const SETTINGS_KEY = 'ii-clock-settings-v1';
const WEATHER_CACHE_KEY = 'ii-clock-weather-cache-v1';

const GMAIL_MIGRATION_TARGET: Pick<LauncherItem, 'label' | 'target'> = {
  label: 'Gmail',
  target: 'https://mail.google.com/',
};

interface LegacyLauncherInput {
  id?: unknown;
  label?: unknown;
  mode?: unknown;
  target?: unknown;
}

function isLegacyClockTarget(rawTarget: string): boolean {
  return rawTarget === '時計アプリ' || rawTarget.toLowerCase() === 'clock-app';
}

function sanitizeLauncher(
  item: LegacyLauncherInput | undefined,
  fallback: LauncherItem,
): {item: LauncherItem; migrated: boolean} {
  if (!item || typeof item !== 'object') {
    return {item: {...fallback}, migrated: true};
  }

  const rawLabel = typeof item.label === 'string' ? item.label.trim() : '';
  const label = rawLabel.length > 0 ? rawLabel : fallback.label;
  const rawMode = typeof item.mode === 'string' ? item.mode : undefined;
  const hasLegacyMode = 'mode' in item;
  const rawTarget = typeof item.target === 'string' ? item.target.trim() : '';

  if (isLegacyClockTarget(rawTarget)) {
    return {
      item: {
        id: fallback.id,
        label: GMAIL_MIGRATION_TARGET.label,
        target: GMAIL_MIGRATION_TARGET.target,
      },
      migrated: true,
    };
  }

  if (rawMode === 'app') {
    return {item: {...fallback}, migrated: true};
  }

  const validated = validateAndNormalizeWebUrl(rawTarget);
  if (validated.ok) {
    return {
      item: {id: fallback.id, label, target: validated.url},
      migrated: hasLegacyMode || validated.url !== item.target || label !== item.label,
    };
  }

  return {item: {...fallback}, migrated: true};
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return structuredClone(DEFAULT_SETTINGS);
    const parsed = JSON.parse(raw) as {cityId?: unknown; launchers?: unknown};
    const validCity =
      typeof parsed.cityId === 'string' && JAPAN_CITIES.some((c) => c.id === parsed.cityId)
        ? parsed.cityId
        : DEFAULT_SETTINGS.cityId;
    const rawLaunchers = Array.isArray(parsed.launchers)
      ? (parsed.launchers as LegacyLauncherInput[])
      : [];

    const m0 = sanitizeLauncher(rawLaunchers[0], DEFAULT_SETTINGS.launchers[0]);
    const m1 = sanitizeLauncher(rawLaunchers[1], DEFAULT_SETTINGS.launchers[1]);
    const m2 = sanitizeLauncher(rawLaunchers[2], DEFAULT_SETTINGS.launchers[2]);

    const result: AppSettings = {
      cityId: validCity,
      launchers: [m0.item, m1.item, m2.item],
    };

    if (
      m0.migrated ||
      m1.migrated ||
      m2.migrated ||
      rawLaunchers.length !== 3 ||
      validCity !== parsed.cityId
    ) {
      saveSettings(result);
    }

    return result;
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
