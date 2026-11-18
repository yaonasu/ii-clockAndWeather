import {BUILTIN_CLOCK_TARGET} from '../data/presets';

const CONTROL_OR_SPACE_REGEX = /[\u0000-\u001F\u007F\s]/;
const SCHEME_PREFIX_REGEX = /^([a-zA-Z][a-zA-Z\d+\-.]*):/;
const BLOCKED_APP_SCHEMES = new Set([
  'javascript',
  'data',
  'vbscript',
  'file',
  'blob',
  'about',
  'filesystem',
]);

export type WebUrlValidationResult =
  | {ok: true; url: string}
  | {ok: false; error: string};

export type AppTargetValidationResult =
  | {ok: true; target: string; isBuiltinClock: boolean}
  | {ok: false; error: string};

export function validateAndNormalizeWebUrl(raw: string): WebUrlValidationResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {ok: false, error: 'URLを入力してください'};
  }

  if (CONTROL_OR_SPACE_REGEX.test(trimmed)) {
    return {ok: false, error: 'URLに空白や制御文字は使用できません'};
  }

  if (trimmed.startsWith('//')) {
    return {ok: false, error: 'http:// または https:// から始まるURLを入力してください'};
  }

  const schemeMatch = SCHEME_PREFIX_REGEX.exec(trimmed);
  let candidate = trimmed;

  if (schemeMatch) {
    const scheme = schemeMatch[1].toLowerCase();
    if (scheme !== 'http' && scheme !== 'https') {
      return {ok: false, error: 'http: または https: のURLのみ許可されています'};
    }
  } else {
    candidate = `https://${trimmed}`;
  }

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {ok: false, error: 'http: または https: のURLのみ許可されています'};
    }
    if (!parsed.hostname) {
      return {ok: false, error: '有効なホスト名を含むURLを入力してください'};
    }
    return {ok: true, url: parsed.toString()};
  } catch {
    return {ok: false, error: '有効なURL形式で入力してください'};
  }
}

export function validateAppTarget(raw: string): AppTargetValidationResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {ok: false, error: 'アプリ指定を入力してください'};
  }

  if (trimmed === BUILTIN_CLOCK_TARGET || trimmed.toLowerCase() === 'clock-app') {
    return {ok: true, target: BUILTIN_CLOCK_TARGET, isBuiltinClock: true};
  }

  if (CONTROL_OR_SPACE_REGEX.test(trimmed)) {
    return {ok: false, error: '空白や制御文字は使用できません'};
  }

  const schemeMatch = SCHEME_PREFIX_REGEX.exec(trimmed);
  if (!schemeMatch) {
    return {
      ok: false,
      error: '「時計アプリ」または有効なアプリスキーム（例: clock://）を指定してください',
    };
  }

  const scheme = schemeMatch[1].toLowerCase();
  if (BLOCKED_APP_SCHEMES.has(scheme)) {
    return {ok: false, error: 'このスキームは安全上の理由により使用できません'};
  }

  return {ok: true, target: trimmed, isBuiltinClock: false};
}
