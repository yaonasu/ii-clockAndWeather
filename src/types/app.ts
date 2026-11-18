export interface LauncherItem {
  id: string;
  label: string;
  target: string;
}

export interface CityPreset {
  id: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
}

export interface AppSettings {
  cityId: string;
  launchers: [LauncherItem, LauncherItem, LauncherItem];
}

export type WeatherIconKind =
  | 'sun'
  | 'partly-cloudy'
  | 'cloud'
  | 'rain'
  | 'snow';

export interface HourlyWeatherPoint {
  timeIso: string;
  hourLabel: string;
  fullTimeLabel: string;
  temperatureC: number;
  precipitationProb: number;
  weatherCode: number;
  conditionLabel: string;
  iconKind: WeatherIconKind;
}

export interface WeatherData {
  cityId: string;
  fetchedAt: number;
  currentTempC: number;
  currentWeatherCode: number;
  currentConditionLabel: string;
  currentIconKind: WeatherIconKind;
  hourly: HourlyWeatherPoint[];
}
