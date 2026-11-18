import type {CityPreset, HourlyWeatherPoint, WeatherData, WeatherIconKind} from '../types/app';

interface OpenMeteoResponse {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: (number | null)[];
    weather_code: number[];
  };
}

export function mapWmoWeatherCode(code: number): {label: string; iconKind: WeatherIconKind} {
  if (code === 0) return {label: '快晴', iconKind: 'sun'};
  if (code === 1) return {label: '晴れ', iconKind: 'sun'};
  if (code === 2) return {label: '薄曇り', iconKind: 'partly-cloudy'};
  if (code === 3) return {label: '曇り', iconKind: 'cloud'};
  if (code === 45 || code === 48) return {label: '霧', iconKind: 'cloud'};
  if (code >= 51 && code <= 57) return {label: '霧雨', iconKind: 'rain'};
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return {label: '雨', iconKind: 'rain'};
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return {label: '雪', iconKind: 'snow'};
  if (code >= 95) return {label: '雷雨', iconKind: 'rain'};
  return {label: '曇り', iconKind: 'cloud'};
}

function getCurrentJstHourKey(): string {
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const year = jst.getUTCFullYear();
  const month = String(jst.getUTCMonth() + 1).padStart(2, '0');
  const day = String(jst.getUTCDate()).padStart(2, '0');
  const hour = String(jst.getUTCHours()).padStart(2, '0');
  return `${year}-${month}-${day}T${hour}:00`;
}

export async function fetch24HourWeather(city: CityPreset): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    hourly: 'temperature_2m,precipitation_probability,weather_code',
    current: 'temperature_2m,weather_code',
    timezone: 'Asia/Tokyo',
    forecast_days: '2',
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`天気データの取得に失敗しました (${response.status})`);
  }

  const json = (await response.json()) as OpenMeteoResponse;
  if (!json.hourly || !Array.isArray(json.hourly.time) || json.hourly.time.length === 0) {
    throw new Error('天気データの形式が不正です');
  }

  const currentHourKey = getCurrentJstHourKey();
  let startIdx = json.hourly.time.findIndex((t) => t >= currentHourKey);
  if (startIdx < 0) {
    startIdx = Math.max(0, json.hourly.time.length - 24);
  }
  if (startIdx + 24 > json.hourly.time.length) {
    startIdx = Math.max(0, json.hourly.time.length - 24);
  }

  const sliceEnd = Math.min(json.hourly.time.length, startIdx + 24);
  const hourly: HourlyWeatherPoint[] = [];

  for (let i = startIdx; i < sliceEnd; i++) {
    const timeIso = json.hourly.time[i];
    const hourPart = timeIso.slice(11, 13);
    const hourNum = Number.parseInt(hourPart, 10);
    const datePart = timeIso.slice(5, 10).replace('-', '/');
    const code = json.hourly.weather_code[i] ?? 3;
    const mapped = mapWmoWeatherCode(code);
    const temp = json.hourly.temperature_2m[i] ?? 0;
    const pop = json.hourly.precipitation_probability[i] ?? 0;

    hourly.push({
      timeIso,
      hourLabel: `${hourNum}時`,
      fullTimeLabel: `${datePart} ${String(hourNum).padStart(2, '0')}:00`,
      temperatureC: Math.round(temp * 10) / 10,
      precipitationProb: Math.max(0, Math.min(100, Math.round(pop))),
      weatherCode: code,
      conditionLabel: mapped.label,
      iconKind: mapped.iconKind,
    });
  }

  const currentCode = json.current?.weather_code ?? hourly[0]?.weatherCode ?? 3;
  const currentMapped = mapWmoWeatherCode(currentCode);
  const currentTemp = json.current?.temperature_2m ?? hourly[0]?.temperatureC ?? 0;

  return {
    cityId: city.id,
    fetchedAt: Date.now(),
    currentTempC: Math.round(currentTemp * 10) / 10,
    currentWeatherCode: currentCode,
    currentConditionLabel: currentMapped.label,
    currentIconKind: currentMapped.iconKind,
    hourly,
  };
}
