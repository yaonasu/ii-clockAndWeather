import {X} from 'lucide-react';
import {useEffect} from 'react';
import {EggplantClock} from './EggplantClock';

interface FullscreenClockModalProps {
  open: boolean;
  onClose: () => void;
}

export function FullscreenClockModal({open, onClose}: FullscreenClockModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0B0812] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="時計アプリ フルスクリーン表示"
    >
      <div className="flex items-center justify-between px-4 sm:px-6 h-14 shrink-0 border-b border-purple-300/10">
        <span className="text-base font-semibold text-slate-100">時計アプリ</span>
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] px-4 py-2 rounded-lg bg-[#1D1530] hover:bg-[#281E42] border border-purple-300/15 text-sm font-medium text-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
          閉じる
        </button>
      </div>
      <div className="flex-1 min-h-0 p-4 sm:p-8">
        <EggplantClock />
      </div>
    </div>
  );
}
