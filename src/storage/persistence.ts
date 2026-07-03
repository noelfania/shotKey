import {
  characterStatsStorageKey,
  modeOptions,
  recentHistoryLimit,
  themeStorageKey,
  trainingModeStorageKey,
  typingFontPresets,
  typingFontStorageKey,
} from "../game/constants";
import type {
  AppTheme,
  CharacterStat,
  CharacterStats,
  RecentOutcome,
  TrainingMode,
  TypingFontPresetId,
} from "../game/types";

export function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

/**
 * 저장값이 유효한 훈련 모드인지 판별한다.
 * @param value localStorage 등 외부에서 읽어온 문자열 값
 * @returns 지원하는 훈련 모드면 true
 */
function isTrainingMode(value: string): value is TrainingMode {
  return modeOptions.some((option) => option.value === value);
}

/**
 * 저장값이 유효한 폰트 프리셋인지 판별한다.
 * @param value localStorage 등 외부에서 읽어온 문자열 값
 * @returns 지원하는 폰트 프리셋이면 true
 */
function isTypingFontPresetId(value: string): value is TypingFontPresetId {
  return typingFontPresets.some((preset) => preset.id === value);
}

/**
 * 마지막에 선택한 훈련 모드를 읽어온다.
 * @returns 저장값이 없거나 잘못되면 기본 모드인 all
 */
export function readStoredTrainingMode() {
  if (!canUseStorage()) {
    return "all" as TrainingMode;
  }

  const storedValue = window.localStorage.getItem(trainingModeStorageKey);

  if (storedValue !== null && isTrainingMode(storedValue)) {
    return storedValue;
  }

  return "all" as TrainingMode;
}

/**
 * boolean 설정값을 문자열로 저장된 localStorage에서 복원한다.
 * @param key 읽어올 localStorage 키
 * @param fallbackValue 저장값이 없거나 잘못된 경우 사용할 기본값
 * @returns 복원된 boolean 값
 */
export function readStoredBoolean(key: string, fallbackValue: boolean) {
  if (!canUseStorage()) {
    return fallbackValue;
  }

  const storedValue = window.localStorage.getItem(key);

  if (storedValue === "true") {
    return true;
  }

  if (storedValue === "false") {
    return false;
  }

  return fallbackValue;
}

/**
 * 숫자 설정값을 문자열로 저장된 localStorage에서 복원한다.
 * @param key 읽어올 localStorage 키
 * @param fallbackValue 저장값이 없거나 잘못된 경우 사용할 기본값
 * @returns 0 이상의 복원된 숫자 값
 */
export function readStoredNumber(key: string, fallbackValue: number) {
  if (!canUseStorage()) {
    return fallbackValue;
  }

  const storedValue = window.localStorage.getItem(key);

  if (storedValue === null) {
    return fallbackValue;
  }

  const parsedValue = Number(storedValue);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return fallbackValue;
  }

  return parsedValue;
}

/**
 * 문자별 누적 학습 데이터를 localStorage에서 복원한다.
 * @returns 파싱 실패나 형식 불일치가 있으면 빈 객체
 */
export function readStoredCharacterStats(): CharacterStats {
  if (!canUseStorage()) {
    return {};
  }

  const storedValue = window.localStorage.getItem(characterStatsStorageKey);

  if (storedValue === null) {
    return {};
  }

  try {
    const parsedValue = JSON.parse(storedValue) as Record<
      string,
      CharacterStat
    >;

    if (
      parsedValue === null ||
      typeof parsedValue !== "object" ||
      Array.isArray(parsedValue)
    ) {
      return {};
    }

    const nextStats: CharacterStats = {};

    Object.entries(parsedValue).forEach(([character, stat]) => {
      if (stat === null || typeof stat !== "object" || Array.isArray(stat)) {
        return;
      }

      // 과거 저장 포맷이 섞여 있어도 현재 구조로 안전하게 보정한다.
      nextStats[character] = {
        attempts: typeof stat.attempts === "number" ? stat.attempts : 0,
        seen: typeof stat.seen === "number" ? stat.seen : 0,
        miss: typeof stat.miss === "number" ? stat.miss : 0,
        solvedCount:
          typeof stat.solvedCount === "number" ? stat.solvedCount : 0,
        totalResponseMs:
          typeof stat.totalResponseMs === "number" ? stat.totalResponseMs : 0,
        slowCount: typeof stat.slowCount === "number" ? stat.slowCount : 0,
        lastSeenAt: typeof stat.lastSeenAt === "number" ? stat.lastSeenAt : 0,
        recentOutcomes: Array.isArray(stat.recentOutcomes)
          ? stat.recentOutcomes
              .filter(
                (outcome): outcome is RecentOutcome =>
                  outcome === "hit" || outcome === "slow" || outcome === "miss",
              )
              .slice(-recentHistoryLimit)
          : [],
      };
    });

    return nextStats;
  } catch {
    return {};
  }
}

/**
 * 마지막에 선택한 타이핑 표시용 폰트 프리셋을 읽어온다.
 * @returns 저장값이 없거나 유효하지 않으면 기본 프리셋
 */
export function readStoredTypingFontPreset() {
  if (!canUseStorage()) {
    return typingFontPresets[0].id;
  }

  const storedValue = window.localStorage.getItem(typingFontStorageKey);

  if (storedValue !== null && isTypingFontPresetId(storedValue)) {
    return storedValue;
  }

  return typingFontPresets[0].id;
}

/**
 * 저장값이 유효한 테마인지 판별한다.
 * @param value localStorage 등 외부에서 읽어온 문자열 값
 * @returns light 또는 dark이면 true
 */
function isAppTheme(value: string): value is AppTheme {
  return value === "light" || value === "dark";
}

/**
 * 시스템 색상 선호를 기반으로 초기 테마를 추정한다.
 * @returns prefers-color-scheme이 light면 light, 아니면 dark
 */
function getSystemTheme(): AppTheme {
  if (typeof window === "undefined") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

/**
 * 마지막에 선택한 UI 테마를 읽어온다.
 * @returns 저장값이 없으면 시스템 선호, 잘못된 값이면 dark
 */
export function readStoredTheme(): AppTheme {
  if (!canUseStorage()) {
    return getSystemTheme();
  }

  const storedValue = window.localStorage.getItem(themeStorageKey);

  if (storedValue !== null && isAppTheme(storedValue)) {
    return storedValue;
  }

  return getSystemTheme();
}

/**
 * document 루트에 테마 data 속성을 적용한다.
 * @param theme 적용할 light/dark 테마
 */
export function applyTheme(theme: AppTheme) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = theme;
}

/**
 * 브라우저 저장소에 문자열 값을 기록한다.
 * @param key 저장할 localStorage 키
 * @param value 직렬화된 설정값
 */
export function writeStoredValue(key: string, value: string) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, value);
}
