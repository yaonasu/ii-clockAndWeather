import {WifiOff} from 'lucide-react';
import {useOnlineStatus} from '../hooks/useOnlineStatus';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-lg bg-[#241A3B] border border-amber-400/35 px-3 py-2 text-xs font-medium text-amber-200 shadow-lg">
      <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
      <span>オフライン表示中（キャッシュ済みの天気データを利用しています）</span>
    </div>
  );
}
