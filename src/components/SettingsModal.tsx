import {RotateCcw, X} from 'lucide-react';
import {useEffect, useState} from 'react';
import {DEFAULT_SETTINGS, JAPAN_CITIES} from '../data/presets';
import {usePWAInstall} from '../hooks/usePWAInstall';
import type {AppSettings, LauncherItem} from '../types/app';
import {validateAndNormalizeWebUrl} from '../utils/url';
import {PWAInstallButton} from './PWAInstallButton';

interface SettingsModalProps {
  open: boolean;
  settings: AppSettings;
  onClose: () => void;
  onSave: (next: AppSettings) => void;
}

export function SettingsModal({open, settings, onClose, onSave}: SettingsModalProps) {
  const [draft, setDraft] = useState<AppSettings>(() => structuredClone(settings));
  const [targetErrors, setTargetErrors] = useState<[string | null, string | null, string | null]>([
    null,
    null,
    null,
  ]);
  const {isInstalled, isInstallable, isIOS} = usePWAInstall();

  useEffect(() => {
    if (open) {
      setDraft(structuredClone(settings));
      setTargetErrors([null, null, null]);
    }
  }, [open, settings]);

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

  const clearErrorAt = (index: 0 | 1 | 2) => {
    setTargetErrors((prev) => {
      if (!prev[index]) return prev;
      const next: [string | null, string | null, string | null] = [...prev];
      next[index] = null;
      return next;
    });
  };

  const updateLauncher = (index: 0 | 1 | 2, patch: Partial<LauncherItem>) => {
    clearErrorAt(index);
    setDraft((prev) => {
      const nextLaunchers: [LauncherItem, LauncherItem, LauncherItem] = [
        {...prev.launchers[0]},
        {...prev.launchers[1]},
        {...prev.launchers[2]},
      ];
      nextLaunchers[index] = {...nextLaunchers[index], ...patch};
      return {...prev, launchers: nextLaunchers};
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: [string | null, string | null, string | null] = [null, null, null];
    const validatedTargets: [string, string, string] = ['', '', ''];
    let hasError = false;

    for (const idx of [0, 1, 2] as const) {
      const item = draft.launchers[idx];
      const res = validateAndNormalizeWebUrl(item.target);
      if (!res.ok) {
        nextErrors[idx] = res.error;
        hasError = true;
      } else {
        validatedTargets[idx] = res.url;
      }
    }

    if (hasError) {
      setTargetErrors(nextErrors);
      return;
    }

    const cleanedLaunchers: [LauncherItem, LauncherItem, LauncherItem] = [
      {
        id: draft.launchers[0].id,
        label: draft.launchers[0].label.trim() || DEFAULT_SETTINGS.launchers[0].label,
        target: validatedTargets[0],
      },
      {
        id: draft.launchers[1].id,
        label: draft.launchers[1].label.trim() || DEFAULT_SETTINGS.launchers[1].label,
        target: validatedTargets[1],
      },
      {
        id: draft.launchers[2].id,
        label: draft.launchers[2].label.trim() || DEFAULT_SETTINGS.launchers[2].label,
        target: validatedTargets[2],
      },
    ];
    onSave({
      cityId: draft.cityId,
      launchers: cleanedLaunchers,
    });
    onClose();
  };

  const handleReset = () => {
    setDraft(structuredClone(DEFAULT_SETTINGS));
    setTargetErrors([null, null, null]);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="設定"
    >
      <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl bg-[#151021] border border-purple-300/20 shadow-2xl overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-purple-300/12 shrink-0">
          <h2 className="text-base sm:text-lg font-semibold text-slate-50">設定</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="設定を閉じる"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-purple-500/15 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal form body */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
            {/* Weather city preset */}
            <section className="space-y-2">
              <label
                htmlFor="weather-city-select"
                className="block text-sm font-medium text-purple-100"
              >
                天気予報の地域（主要都市プリセット）
              </label>
              <select
                id="weather-city-select"
                value={draft.cityId}
                onChange={(e) => setDraft((prev) => ({...prev, cityId: e.target.value}))}
                className="w-full min-h-[44px] rounded-xl bg-[#0E0A18] border border-purple-300/20 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {JAPAN_CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}（{c.region}）
                  </option>
                ))}
              </select>
            </section>

            {/* 3 Launcher items (Web URL only) */}
            <section className="space-y-3">
              <h3 className="text-sm font-medium text-purple-100">
                ランチャーボタン設定（3つ・Web URL専用）
              </h3>

              <div className="space-y-3">
                {([0, 1, 2] as const).map((idx) => {
                  const item = draft.launchers[idx];
                  const targetError = targetErrors[idx];
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl bg-[#0E0A18] border border-purple-300/15 p-3.5 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-purple-300">
                          ボタン {idx + 1}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label
                            htmlFor={`launcher-label-${idx}`}
                            className="block text-xs text-slate-400 mb-1"
                          >
                            表示名
                          </label>
                          <input
                            id={`launcher-label-${idx}`}
                            type="text"
                            value={item.label}
                            maxLength={20}
                            onChange={(e) => updateLauncher(idx, {label: e.target.value})}
                            placeholder="例: Gmail"
                            className="w-full min-h-[44px] rounded-lg bg-[#151021] border border-purple-300/15 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label
                            htmlFor={`launcher-target-${idx}`}
                            className="block text-xs text-slate-400 mb-1"
                          >
                            Web URL（http / https）
                          </label>
                          <input
                            id={`launcher-target-${idx}`}
                            type="url"
                            inputMode="url"
                            value={item.target}
                            onChange={(e) => updateLauncher(idx, {target: e.target.value})}
                            placeholder="https://example.com/"
                            aria-invalid={!!targetError}
                            className={`w-full min-h-[44px] rounded-lg bg-[#151021] border px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:ring-2 ${
                              targetError
                                ? 'border-rose-400/70 focus:ring-rose-500'
                                : 'border-purple-300/15 focus:ring-purple-500'
                            }`}
                          />
                          {targetError ? (
                            <p className="mt-1 text-xs text-rose-300" role="alert">
                              {targetError}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* PWA Install state */}
            {(isInstallable || isIOS) && !isInstalled ? (
              <section className="pt-2 border-t border-purple-300/10 space-y-2">
                <p className="text-xs text-slate-400">
                  PWAとして端末のホーム画面やデスクトップに追加できます。
                </p>
                <PWAInstallButton />
              </section>
            ) : isInstalled ? (
              <section className="pt-2 border-t border-purple-300/10">
                <p className="text-xs text-emerald-400">
                  スタンドアロンPWAモードで起動しています
                </p>
              </section>
            ) : null}
          </div>

          {/* Modal footer */}
          <div className="flex items-center justify-between gap-2 px-5 py-3.5 border-t border-purple-300/12 bg-[#110C1B] shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-purple-500/10 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>初期値に戻す</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-purple-300/20 text-sm font-medium text-slate-200 hover:bg-purple-500/10 transition-colors cursor-pointer"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-sm font-semibold text-white transition-colors cursor-pointer"
              >
                保存
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
