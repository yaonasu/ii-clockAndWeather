import {Download, X} from 'lucide-react';
import {useState} from 'react';
import {usePWAInstall} from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export function PWAInstallButton({compact = false}: PWAInstallButtonProps) {
  const {isInstallable, isInstalled, isIOS, install} = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        className={
          compact
            ? 'min-h-[40px] px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-xs font-medium text-white flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer'
            : 'min-h-[44px] w-full px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-sm font-medium text-white flex items-center justify-center gap-2 transition-colors whitespace-nowrap cursor-pointer'
        }
      >
        <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>アプリをインストール</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={
            compact
              ? 'min-h-[40px] px-3 py-1.5 rounded-lg border border-purple-300/20 bg-[#1D1530] hover:bg-[#281E42] text-xs font-medium text-purple-100 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer'
              : 'min-h-[44px] w-full px-4 py-2 rounded-xl border border-purple-300/20 bg-[#1D1530] hover:bg-[#281E42] text-sm font-medium text-purple-100 flex items-center justify-center gap-2 transition-colors whitespace-nowrap cursor-pointer'
          }
        >
          <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>ホーム画面に追加</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="iOSホーム画面への追加手順"
          >
            <div className="w-full max-w-sm rounded-2xl bg-[#151021] border border-purple-300/20 p-5 shadow-2xl">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-slate-50">ホーム画面に追加（iOS）</h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="閉じる"
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-purple-500/15 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ol className="mt-3 space-y-2 text-sm text-slate-300 list-decimal list-inside">
                <li>Safari 下部または上部の「共有」アイコンをタップします。</li>
                <li>メニューをスクロールし「ホーム画面に追加」を選択します。</li>
                <li>右上の「追加」をタップすると置時計アプリとして起動できます。</li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 min-h-[44px] w-full rounded-xl bg-purple-700 hover:bg-purple-600 text-sm font-medium text-white transition-colors cursor-pointer"
              >
                閉じる
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}
