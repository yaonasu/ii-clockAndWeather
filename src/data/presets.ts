import type {AppSettings, CityPreset} from '../types/app';

export const JAPAN_CITIES: CityPreset[] = [
  {id: 'sapporo', name: '札幌', region: '北海道', latitude: 43.0618, longitude: 141.3545},
  {id: 'sendai', name: '仙台', region: '宮城県', latitude: 38.2682, longitude: 140.8694},
  {id: 'tokyo', name: '東京', region: '東京都', latitude: 35.6762, longitude: 139.6503},
  {id: 'yokohama', name: '横浜', region: '神奈川県', latitude: 35.4437, longitude: 139.638},
  {id: 'kanazawa', name: '金沢', region: '石川県', latitude: 36.5613, longitude: 136.6562},
  {id: 'nagoya', name: '名古屋', region: '愛知県', latitude: 35.1815, longitude: 136.9066},
  {id: 'kyoto', name: '京都', region: '京都府', latitude: 35.0116, longitude: 135.7681},
  {id: 'osaka', name: '大阪', region: '大阪府', latitude: 34.6937, longitude: 135.5023},
  {id: 'kobe', name: '神戸', region: '兵庫県', latitude: 34.6901, longitude: 135.1955},
  {id: 'hiroshima', name: '広島', region: '広島県', latitude: 34.3853, longitude: 132.4553},
  {id: 'takamatsu', name: '高松', region: '香川県', latitude: 34.3428, longitude: 134.0466},
  {id: 'fukuoka', name: '福岡', region: '福岡県', latitude: 33.5902, longitude: 130.4017},
  {id: 'naha', name: '那覇', region: '沖縄県', latitude: 26.2124, longitude: 127.6809},
];

export const DEFAULT_SETTINGS: AppSettings = {
  cityId: 'tokyo',
  launchers: [
    {
      id: 'launcher-1',
      label: 'Gmail',
      target: 'https://mail.google.com/',
    },
    {
      id: 'launcher-2',
      label: '天気',
      target: 'https://open-meteo.com/',
    },
    {
      id: 'launcher-3',
      label: 'カレンダー',
      target: 'https://calendar.google.com/',
    },
  ],
};

export function getCityPreset(cityId: string): CityPreset {
  return JAPAN_CITIES.find((c) => c.id === cityId) ?? JAPAN_CITIES[2];
}
