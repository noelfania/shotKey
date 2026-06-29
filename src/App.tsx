import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import "./App.css";

const gaugeMax = 100;
const startingGauge = 100;
const decayMinPerTick = 0.08;
const decayMaxPerTick = 0.68;
const decayIntervalMs = 120;
const missPenalty = 15;
const missLockMs = 1000;
const previewCount = 3;
const slowResponseThresholdMs = 900;
const recentHistoryLimit = 10;
const retryDelayMs = 5000;
const retryMinGap = 3;
const retryMaxGap = 8;
const visualMissPriorRate = 0.12;
const visualSlowPriorRate = 0.18;
const visualTotalPriorSamples = 6;
const visualRecentPriorSamples = 4;
const trainingModeStorageKey = "gmtl-hit-key:training-mode";
const endlessModeStorageKey = "gmtl-hit-key:endless-mode";
const characterStatsStorageKey = "gmtl-hit-key:character-stats";
const soundEnabledStorageKey = "gmtl-hit-key:sound-enabled";
const visualEffectsStorageKey = "gmtl-hit-key:visual-effects-enabled";
const keyboardPanelVisibleStorageKey = "gmtl-hit-key:keyboard-panel-visible";
const keyboardHintsVisibleStorageKey = "gmtl-hit-key:keyboard-hints-visible";
const typedKeyFlashEnabledStorageKey = "gmtl-hit-key:typed-key-flash-enabled";
const typingFontStorageKey = "gmtl-hit-key:typing-font";
const bestScoreStorageKey = "gmtl-hit-key:best-score";
const bestStreakStorageKey = "gmtl-hit-key:best-streak";
const bestSurvivalStorageKey = "gmtl-hit-key:best-survival-ms";
const keycapFlashDurationMs = 180;

type BaseHand = "left" | "right";
type HandGroup = BaseHand;
type TrainingMode = "all" | BaseHand;
type ShiftKeyId = "shift-left" | "shift-right";
type FeedbackTone =
  | "ready"
  | "perfect"
  | "good"
  | "ok"
  | "miss"
  | "timeout"
  | "gameover";
type TypingFontPresetId = "balanced" | "cascadia" | "consolas" | "classic";

type FeedbackState = {
  label: string;
  tone: FeedbackTone;
  detail: string;
};

type HandRecord = {
  hit: number;
  miss: number;
};

type HandStats = Record<HandGroup, HandRecord>;

type RecentOutcome = "hit" | "slow" | "miss";

type CharacterStat = {
  attempts: number;
  seen: number;
  miss: number;
  solvedCount: number;
  totalResponseMs: number;
  slowCount: number;
  lastSeenAt: number;
  recentOutcomes: RecentOutcome[];
};

type CharacterStats = Record<string, CharacterStat>;

type ChallengeEntry = {
  character: string;
  group: HandGroup;
  keyId: string;
  requiresShift: boolean;
};

type ModeOption = {
  value: TrainingMode;
  label: string;
  shortLabel: string;
  description: string;
};

type KeyboardKey = {
  id: string;
  kind: "char" | "action";
  base?: string;
  shifted?: string;
  helperShiftKeyId?: ShiftKeyId;
  actionLabel?: string;
  hand?: BaseHand;
  widthUnits?: number;
};

type ChallengeQueue = {
  current: ChallengeEntry;
  upcoming: ChallengeEntry[];
};

type PendingRetry = {
  id: number;
  entry: ChallengeEntry;
  dueAt: number;
  remainingSteps: number;
};

type TypingFontPreset = {
  id: TypingFontPresetId;
  label: string;
  fontFamily: string;
};

const typingFontPresets: TypingFontPreset[] = [
  {
    id: "consolas",
    label: "Consolas",
    fontFamily: "'Consolas', 'Cascadia Mono', 'Lucida Console', monospace",
  },
  {
    id: "cascadia",
    label: "Cascadia Mono",
    fontFamily:
      "'Cascadia Mono', 'Consolas', 'JetBrains Mono', 'SFMono-Regular', monospace",
  },
];

const modeOptions: ModeOption[] = [
  {
    value: "all",
    label: "전체",
    shortLabel: "ALL",
    description: "영문 키보드 전체를 고르게 훈련합니다.",
  },
  {
    value: "left",
    label: "왼손",
    shortLabel: "L",
    description: "왼손으로 입력하는 기본/Shift 문자를 함께 훈련합니다.",
  },
  {
    value: "right",
    label: "오른손",
    shortLabel: "R",
    description: "오른손으로 입력하는 기본/Shift 문자를 함께 훈련합니다.",
  },
];

const keyboardRows: KeyboardKey[][] = [
  [
    {
      id: "backquote",
      kind: "char",
      base: "`",
      shifted: "~",
      hand: "left",
      helperShiftKeyId: "shift-right",
    },
    {
      id: "digit-1",
      kind: "char",
      base: "1",
      shifted: "!",
      hand: "left",
      helperShiftKeyId: "shift-right",
    },
    {
      id: "digit-2",
      kind: "char",
      base: "2",
      shifted: "@",
      hand: "left",
      helperShiftKeyId: "shift-right",
    },
    {
      id: "digit-3",
      kind: "char",
      base: "3",
      shifted: "#",
      hand: "left",
      helperShiftKeyId: "shift-right",
    },
    {
      id: "digit-4",
      kind: "char",
      base: "4",
      shifted: "$",
      hand: "left",
      helperShiftKeyId: "shift-right",
    },
    {
      id: "digit-5",
      kind: "char",
      base: "5",
      shifted: "%",
      hand: "left",
      helperShiftKeyId: "shift-right",
    },
    {
      id: "digit-6",
      kind: "char",
      base: "6",
      shifted: "^",
      hand: "left",
      helperShiftKeyId: "shift-right",
    },
    {
      id: "digit-7",
      kind: "char",
      base: "7",
      shifted: "&",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "digit-8",
      kind: "char",
      base: "8",
      shifted: "*",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "digit-9",
      kind: "char",
      base: "9",
      shifted: "(",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "digit-0",
      kind: "char",
      base: "0",
      shifted: ")",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "minus",
      kind: "char",
      base: "-",
      shifted: "_",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "equal",
      kind: "char",
      base: "=",
      shifted: "+",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "backspace",
      kind: "action",
      actionLabel: "Backspace",
      widthUnits: 1.75,
    },
  ],
  [
    { id: "tab", kind: "action", actionLabel: "Tab", widthUnits: 1.4 },
    {
      id: "key-q",
      kind: "char",
      base: "q",
      shifted: "Q",
      hand: "left",
      helperShiftKeyId: "shift-right",
    },
    {
      id: "key-w",
      kind: "char",
      base: "w",
      shifted: "W",
      hand: "left",
      helperShiftKeyId: "shift-right",
    },
    {
      id: "key-e",
      kind: "char",
      base: "e",
      shifted: "E",
      hand: "left",
      helperShiftKeyId: "shift-right",
    },
    {
      id: "key-r",
      kind: "char",
      base: "r",
      shifted: "R",
      hand: "left",
      helperShiftKeyId: "shift-right",
    },
    {
      id: "key-t",
      kind: "char",
      base: "t",
      shifted: "T",
      hand: "left",
      helperShiftKeyId: "shift-right",
    },
    {
      id: "key-y",
      kind: "char",
      base: "y",
      shifted: "Y",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "key-u",
      kind: "char",
      base: "u",
      shifted: "U",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "key-i",
      kind: "char",
      base: "i",
      shifted: "I",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "key-o",
      kind: "char",
      base: "o",
      shifted: "O",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "key-p",
      kind: "char",
      base: "p",
      shifted: "P",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "bracket-left",
      kind: "char",
      base: "[",
      shifted: "{",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "bracket-right",
      kind: "char",
      base: "]",
      shifted: "}",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "backslash",
      kind: "char",
      base: "\\",
      shifted: "|",
      hand: "right",
      helperShiftKeyId: "shift-left",
      widthUnits: 1.35,
    },
  ],
  [
    { id: "caps-lock", kind: "action", actionLabel: "Caps", widthUnits: 1.75 },
    {
      id: "key-a",
      kind: "char",
      base: "a",
      shifted: "A",
      hand: "left",
      helperShiftKeyId: "shift-right",
    },
    {
      id: "key-s",
      kind: "char",
      base: "s",
      shifted: "S",
      hand: "left",
      helperShiftKeyId: "shift-right",
    },
    {
      id: "key-d",
      kind: "char",
      base: "d",
      shifted: "D",
      hand: "left",
      helperShiftKeyId: "shift-right",
    },
    {
      id: "key-f",
      kind: "char",
      base: "f",
      shifted: "F",
      hand: "left",
      helperShiftKeyId: "shift-right",
    },
    {
      id: "key-g",
      kind: "char",
      base: "g",
      shifted: "G",
      hand: "left",
      helperShiftKeyId: "shift-right",
    },
    {
      id: "key-h",
      kind: "char",
      base: "h",
      shifted: "H",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "key-j",
      kind: "char",
      base: "j",
      shifted: "J",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "key-k",
      kind: "char",
      base: "k",
      shifted: "K",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "key-l",
      kind: "char",
      base: "l",
      shifted: "L",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "semicolon",
      kind: "char",
      base: ";",
      shifted: ":",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "quote",
      kind: "char",
      base: "'",
      shifted: '"',
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    { id: "enter", kind: "action", actionLabel: "Enter", widthUnits: 2.1 },
  ],
  [
    {
      id: "shift-left",
      kind: "action",
      actionLabel: "Shift",
      widthUnits: 2.25,
    },
    {
      id: "key-z",
      kind: "char",
      base: "z",
      shifted: "Z",
      hand: "left",
      helperShiftKeyId: "shift-right",
    },
    {
      id: "key-x",
      kind: "char",
      base: "x",
      shifted: "X",
      hand: "left",
      helperShiftKeyId: "shift-right",
    },
    {
      id: "key-c",
      kind: "char",
      base: "c",
      shifted: "C",
      hand: "left",
      helperShiftKeyId: "shift-right",
    },
    {
      id: "key-v",
      kind: "char",
      base: "v",
      shifted: "V",
      hand: "left",
      helperShiftKeyId: "shift-right",
    },
    {
      id: "key-b",
      kind: "char",
      base: "b",
      shifted: "B",
      hand: "left",
      helperShiftKeyId: "shift-right",
    },
    {
      id: "key-n",
      kind: "char",
      base: "n",
      shifted: "N",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "key-m",
      kind: "char",
      base: "m",
      shifted: "M",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "comma",
      kind: "char",
      base: ",",
      shifted: "<",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "period",
      kind: "char",
      base: ".",
      shifted: ">",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "slash",
      kind: "char",
      base: "/",
      shifted: "?",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "shift-right",
      kind: "action",
      actionLabel: "Shift",
      widthUnits: 2.55,
    },
  ],
];

const keyboardKeys = keyboardRows.flat();
const keyboardKeyMap = Object.fromEntries(
  keyboardKeys.map((key) => [key.id, key] as const),
);

/**
 * 브라우저 KeyboardEvent.code 값을 키보드 패널에서 쓰는 key id로 변환한다.
 * @param code 브라우저가 제공하는 물리 키 코드
 * @returns 매핑 가능한 키면 key id, 아니면 null
 */
function getKeyboardEventKeyId(code: string): string | null {
  if (code.startsWith("Digit")) {
    return `digit-${code.slice(5)}`;
  }

  if (code.startsWith("Key")) {
    return `key-${code.slice(3).toLowerCase()}`;
  }

  const keyboardEventCodeMap: Record<string, string> = {
    Backquote: "backquote",
    Minus: "minus",
    Equal: "equal",
    Backspace: "backspace",
    Tab: "tab",
    BracketLeft: "bracket-left",
    BracketRight: "bracket-right",
    Backslash: "backslash",
    CapsLock: "caps-lock",
    Semicolon: "semicolon",
    Quote: "quote",
    Enter: "enter",
    ShiftLeft: "shift-left",
    ShiftRight: "shift-right",
    Comma: "comma",
    Period: "period",
    Slash: "slash",
  };

  return keyboardEventCodeMap[code] ?? null;
}

const challengePool = keyboardKeys.flatMap((key) => {
  if (key.kind !== "char" || !key.base || !key.hand) {
    return [];
  }

  const entries: ChallengeEntry[] = [
    {
      character: key.base,
      group: key.hand,
      keyId: key.id,
      requiresShift: false,
    },
  ];

  if (key.shifted) {
    entries.push({
      character: key.shifted,
      group: key.hand,
      keyId: key.id,
      requiresShift: true,
    });
  }

  return entries;
});

const challengePoolsByGroup: Record<HandGroup, ChallengeEntry[]> = {
  left: challengePool.filter((entry) => entry.group === "left"),
  right: challengePool.filter((entry) => entry.group === "right"),
};

/**
 * 현재 실행 환경에서 localStorage를 안전하게 사용할 수 있는지 확인한다.
 * @returns 브라우저 환경이고 localStorage가 존재하면 true
 */
function canUseStorage() {
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
function readStoredTrainingMode() {
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
function readStoredBoolean(key: string, fallbackValue: boolean) {
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
function readStoredNumber(key: string, fallbackValue: number) {
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
function readStoredCharacterStats(): CharacterStats {
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
function readStoredTypingFontPreset() {
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
 * 브라우저 저장소에 문자열 값을 기록한다.
 * @param key 저장할 localStorage 키
 * @param value 직렬화된 설정값
 */
function writeStoredValue(key: string, value: string) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, value);
}

/**
 * 손 영역별 통계의 초기값을 생성한다.
 * @returns 왼손/오른손의 hit, miss가 0인 객체
 */
function createEmptyHandStats(): HandStats {
  return {
    left: { hit: 0, miss: 0 },
    right: { hit: 0, miss: 0 },
  };
}

/**
 * 문자별 누적 학습 데이터의 초기값을 생성한다.
 * @returns 출제 가중치 계산과 시각화에 필요한 기본 통계
 */
function createEmptyCharacterStat(): CharacterStat {
  return {
    attempts: 0,
    seen: 0,
    miss: 0,
    solvedCount: 0,
    totalResponseMs: 0,
    slowCount: 0,
    lastSeenAt: 0,
    recentOutcomes: [],
  };
}

/**
 * 현재 훈련 모드에 대응하는 표시용 메타 정보를 찾는다.
 * @param mode 전체/왼손/오른손 중 현재 모드
 * @returns 대응 항목이 없으면 첫 번째 모드 정보
 */
function getModeOption(mode: TrainingMode) {
  return modeOptions.find((option) => option.value === mode) ?? modeOptions[0];
}

/**
 * 손 영역 값을 화면용 한글 라벨로 변환한다.
 * @param group left 또는 right
 * @returns 화면에 표시할 한글 라벨
 */
function getGroupLabel(group: HandGroup) {
  return group === "left" ? "왼손" : "오른손";
}

/**
 * 특정 손 영역의 정확도를 계산한다.
 * @param record 손 영역별 hit, miss 기록
 * @returns 아직 시도가 없으면 null
 */
function getGroupAccuracy(record: HandRecord) {
  const total = record.hit + record.miss;

  if (total === 0) {
    return null;
  }

  return record.hit / total;
}

/**
 * 손 영역 정확도를 화면 표시용 문자열로 변환한다.
 * @param record 손 영역별 hit, miss 기록
 * @returns 시도 전이면 --, 아니면 백분율 문자열
 */
function formatAccuracy(record: HandRecord) {
  const accuracy = getGroupAccuracy(record);

  if (accuracy === null) {
    return "--";
  }

  return `${Math.round(accuracy * 100)}%`;
}

/**
 * 특정 문자의 평균 반응 시간을 계산한다.
 * @param stat 문자별 누적 학습 데이터
 * @returns 해결 기록이 없으면 null
 */
function getAverageResponseMs(stat?: CharacterStat) {
  if (!stat || stat.solvedCount === 0) {
    return null;
  }

  return stat.totalResponseMs / stat.solvedCount;
}

/**
 * 현재 게이지 값에 따라 틱당 감소량을 계산한다.
 * @param currentGauge 현재 집중 게이지 값
 * @returns 게이지가 낮을수록 완만해지는 비선형 감소량
 */
function getGaugeDecayPerTick(currentGauge: number) {
  const gaugeRatio = Math.max(0, Math.min(1, currentGauge / gaugeMax));

  return (
    decayMinPerTick +
    Math.pow(gaugeRatio, 1.35) * (decayMaxPerTick - decayMinPerTick)
  );
}

/**
 * 경과 시간을 mm:ss.000 형식의 문자열로 변환한다.
 * @param elapsedMs 밀리초 단위 경과 시간
 * @returns 화면 표시용 시간 문자열
 */
function formatElapsedDisplay(elapsedMs: number) {
  const safeElapsedMs = Math.max(0, elapsedMs);
  const minutes = Math.floor(safeElapsedMs / 60000);
  const seconds = Math.floor((safeElapsedMs % 60000) / 1000);
  const milliseconds = safeElapsedMs % 1000;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
}

/**
 * 오답 재출제를 몇 문제 뒤에 다시 보여줄지 무작위 간격을 만든다.
 * @returns retryMinGap ~ retryMaxGap 범위의 정수
 */
function getRandomRetryGap() {
  return (
    retryMinGap + Math.floor(Math.random() * (retryMaxGap - retryMinGap + 1))
  );
}

/**
 * 최근 성과 이력을 최신 상태로 유지한다.
 * @param recentOutcomes 기존 최근 성과 배열
 * @param nextOutcome 이번 입력 결과
 * @returns 최대 recentHistoryLimit 길이로 잘린 최신 배열
 */
function appendRecentOutcome(
  recentOutcomes: RecentOutcome[],
  nextOutcome: RecentOutcome,
) {
  return [...recentOutcomes, nextOutcome].slice(-recentHistoryLimit);
}

/**
 * 최근 성과 이력 기준의 miss/slow 비율을 계산한다.
 * @param stat 문자별 누적 학습 데이터
 * @returns 최근 miss 비율과 slow 비율
 */
function getRecentRates(stat?: CharacterStat) {
  if (!stat || stat.recentOutcomes.length === 0) {
    return {
      recentMissRate: 0,
      recentSlowRate: 0,
    };
  }

  const recentAttempts = stat.recentOutcomes.length;
  const recentMissCount = stat.recentOutcomes.filter(
    (outcome) => outcome === "miss",
  ).length;
  const recentSlowCount = stat.recentOutcomes.filter(
    (outcome) => outcome === "slow",
  ).length;

  return {
    recentMissRate: recentMissCount / recentAttempts,
    recentSlowRate: recentSlowCount / recentAttempts,
  };
}

/**
 * 적은 표본에서도 비율이 과하게 튀지 않도록 베이지안 스무딩 비율을 계산한다.
 * @param hitCount 특정 결과가 발생한 횟수
 * @param totalCount 전체 시도 수
 * @param priorRate 사전 기대 비율
 * @param priorSamples 사전 표본 수
 * @returns 스무딩된 비율
 */
function getSmoothedRate(
  hitCount: number,
  totalCount: number,
  priorRate: number,
  priorSamples: number,
) {
  if (totalCount <= 0) {
    return 0;
  }

  return (hitCount + priorRate * priorSamples) / (totalCount + priorSamples);
}

/**
 * 문자 통계에서 시각화와 메타 랭킹에 공통으로 쓸 스무딩 오답률을 계산한다.
 * @param stat 특정 문자에 대한 누적 학습 데이터
 * @returns 베이지안 스무딩이 적용된 오답률
 */
function getSmoothedMissRate(stat?: CharacterStat) {
  if (!stat || stat.attempts === 0) {
    return 0;
  }

  return getSmoothedRate(
    stat.miss,
    stat.attempts,
    visualMissPriorRate,
    visualTotalPriorSamples,
  );
}

/**
 * 문자 통계에서 시각화에 쓸 스무딩 느림 비율을 계산한다.
 * @param stat 특정 문자에 대한 누적 학습 데이터
 * @returns 베이지안 스무딩이 적용된 느림 비율
 */
function getSmoothedSlowRate(stat?: CharacterStat) {
  if (!stat || stat.solvedCount === 0) {
    return 0;
  }

  return getSmoothedRate(
    stat.slowCount,
    stat.solvedCount,
    visualSlowPriorRate,
    visualTotalPriorSamples,
  );
}

/**
 * 최근 이력 구간에 베이지안 스무딩을 적용한 비율과 신뢰도를 계산한다.
 * @param stat 특정 문자에 대한 누적 학습 데이터
 * @returns 최근 miss/slow 비율과 최근 표본 신뢰도
 */
function getSmoothedRecentRates(stat?: CharacterStat) {
  if (!stat || stat.recentOutcomes.length === 0) {
    return {
      recentMissRate: 0,
      recentSlowRate: 0,
      recentWeight: 0,
    };
  }

  const recentAttempts = stat.recentOutcomes.length;
  const recentMissCount = stat.recentOutcomes.filter(
    (outcome) => outcome === "miss",
  ).length;
  const recentSlowCount = stat.recentOutcomes.filter(
    (outcome) => outcome === "slow",
  ).length;

  return {
    recentMissRate: getSmoothedRate(
      recentMissCount,
      recentAttempts,
      visualMissPriorRate,
      visualRecentPriorSamples,
    ),
    recentSlowRate: getSmoothedRate(
      recentSlowCount,
      recentAttempts,
      visualSlowPriorRate,
      visualRecentPriorSamples,
    ),
    recentWeight: Math.min(1, recentAttempts / (recentAttempts + 3)),
  };
}

/**
 * 문자별 누적 성과를 바탕으로 출제 가중치에 사용할 리스크 점수를 계산한다.
 * @param stat 특정 문자에 대한 누적 학습 데이터
 * @returns 0 이상 출제 우선도 계산에 사용할 점수
 */
function getCharacterRiskScore(stat?: CharacterStat) {
  if (!stat || stat.attempts === 0) {
    return 0;
  }

  // 전체 성과와 최근 성과를 함께 반영해 최근에 흔들린 문자도 다시 자주 나오게 한다.
  const totalMissRate = stat.miss / stat.attempts;
  const totalSlowRate =
    stat.solvedCount > 0 ? stat.slowCount / stat.solvedCount : 0;
  const { recentMissRate, recentSlowRate } = getRecentRates(stat);
  const averageResponseMs = getAverageResponseMs(stat) ?? 0;
  const responsePenalty =
    stat.solvedCount > 0 ? Math.max(0, (averageResponseMs - 700) / 500) : 0;
  const sampleWeight = Math.min(1, stat.attempts / 8);

  return (
    (totalMissRate * 2.4 +
      totalSlowRate * 1 +
      recentMissRate * 2.8 +
      recentSlowRate * 1.2 +
      responsePenalty * 0.6) *
    sampleWeight
  );
}

/**
 * 문자별 약점 정도를 키보드 하이라이트 강도로 변환한다.
 * @param stat 특정 문자에 대한 누적 학습 데이터
 * @returns 0~0.72 범위의 시각화 알파값
 */
function getVisualRiskAlpha(stat?: CharacterStat) {
  if (!stat || stat.attempts === 0) {
    return 0;
  }

  const totalMissRate = getSmoothedMissRate(stat);
  const totalSlowRate = getSmoothedSlowRate(stat);
  const { recentMissRate, recentSlowRate, recentWeight } =
    getSmoothedRecentRates(stat);
  const averageResponseMs = getAverageResponseMs(stat) ?? 0;
  const responsePenalty =
    stat.solvedCount > 0 ? Math.max(0, (averageResponseMs - 900) / 700) : 0;
  const sampleWeight = Math.min(1, stat.attempts / (stat.attempts + 2));
  const rawAlpha =
    (totalMissRate * 0.34 +
      totalSlowRate * 0.12 +
      recentMissRate * 0.24 * recentWeight +
      recentSlowRate * 0.1 * recentWeight +
      responsePenalty * 0.07) *
    sampleWeight;
  const earlyAlphaCap = stat.attempts < 5 ? 0.16 + stat.attempts * 0.03 : 0.72;

  return Math.min(rawAlpha, earlyAlphaCap);
}

/**
 * 정답 입력 시 문자별 누적 학습 데이터를 갱신한다.
 * @param characterStats 전체 문자 통계 맵
 * @param character 이번에 맞힌 문자
 * @param elapsedMs 이번 입력 반응 시간
 * @returns 정답 반영 후의 문자 통계 맵
 */
function updateCharacterStatsOnHit(
  characterStats: CharacterStats,
  character: string,
  elapsedMs: number,
) {
  const currentStat = characterStats[character] ?? createEmptyCharacterStat();
  const nextOutcome: RecentOutcome =
    elapsedMs > slowResponseThresholdMs ? "slow" : "hit";

  return {
    ...characterStats,
    [character]: {
      ...currentStat,
      attempts: currentStat.attempts + 1,
      seen: currentStat.seen + 1,
      solvedCount: currentStat.solvedCount + 1,
      totalResponseMs: currentStat.totalResponseMs + elapsedMs,
      slowCount:
        currentStat.slowCount + (elapsedMs > slowResponseThresholdMs ? 1 : 0),
      lastSeenAt: Date.now(),
      recentOutcomes: appendRecentOutcome(
        currentStat.recentOutcomes,
        nextOutcome,
      ),
    },
  };
}

/**
 * 오답 입력 시 문자별 누적 학습 데이터를 갱신한다.
 * @param characterStats 전체 문자 통계 맵
 * @param character 이번에 틀린 문제 문자
 * @returns 오답 반영 후의 문자 통계 맵
 */
function updateCharacterStatsOnMiss(
  characterStats: CharacterStats,
  character: string,
) {
  const currentStat = characterStats[character] ?? createEmptyCharacterStat();

  return {
    ...characterStats,
    [character]: {
      ...currentStat,
      attempts: currentStat.attempts + 1,
      seen: currentStat.seen + 1,
      miss: currentStat.miss + 1,
      lastSeenAt: Date.now(),
      recentOutcomes: appendRecentOutcome(currentStat.recentOutcomes, "miss"),
    },
  };
}

/**
 * 현재 훈련 모드에 맞는 출제 후보 풀을 반환한다.
 * @param mode 전체/왼손/오른손 중 현재 모드
 * @returns 현재 모드에서 사용할 출제 후보 배열
 */
function getChallengeCandidates(mode: TrainingMode) {
  if (mode === "all") {
    return challengePool;
  }

  return challengePoolsByGroup[mode];
}

/**
 * 문자별 리스크를 반영해 다음 문제를 가중 랜덤으로 뽑는다.
 * @param mode 현재 훈련 모드
 * @param characterStats 문자별 누적 학습 데이터
 * @param previousChallenge 직전 문자 중복을 줄이기 위한 이전 문자
 * @returns 다음에 출제할 문제 정보
 */
function getRandomChallenge(
  mode: TrainingMode,
  characterStats: CharacterStats,
  previousChallenge?: string,
) {
  // 직전 문자와 같은 문자는 우선 제외해 즉시 반복 출제를 줄인다.
  const pool = getChallengeCandidates(mode);
  const filteredPool = pool.filter(
    ({ character }) => character !== previousChallenge,
  );
  const candidates = filteredPool.length > 0 ? filteredPool : pool;
  // 리스크가 높은 문자는 기본 가중치 1 위에 추가 가중치를 더한다.
  const weightedCandidates = candidates.map((entry) => ({
    entry,
    weight:
      1 + Math.min(getCharacterRiskScore(characterStats[entry.character]), 4.2),
  }));
  const totalWeight = weightedCandidates.reduce(
    (sum, candidate) => sum + candidate.weight,
    0,
  );
  let cursor = Math.random() * totalWeight;

  for (const candidate of weightedCandidates) {
    cursor -= candidate.weight;

    if (cursor <= 0) {
      return candidate.entry;
    }
  }

  return weightedCandidates[weightedCandidates.length - 1].entry;
}

/**
 * 손 영역별 적중/실패 통계를 누적한다.
 * @param handStats 현재 손 영역 통계
 * @param group 이번 입력에 대응하는 손 영역
 * @param result hit 또는 miss
 * @returns 갱신된 손 영역 통계
 */
function updateHandStats(
  handStats: HandStats,
  group: HandGroup,
  result: "hit" | "miss",
) {
  return {
    ...handStats,
    [group]: {
      ...handStats[group],
      [result]: handStats[group][result] + 1,
    },
  };
}

/**
 * 현재 문제 뒤에 붙일 미리보기 큐를 채운다.
 * @param mode 현재 훈련 모드
 * @param characterStats 문자별 누적 학습 데이터
 * @param recentCharacter 직전에 배치된 문자
 * @param count 채울 미리보기 개수
 * @returns 현재 문제 뒤에 이어질 미리보기 큐
 */
function fillUpcomingQueue(
  mode: TrainingMode,
  characterStats: CharacterStats,
  recentCharacter: string,
  count = previewCount,
) {
  const upcomingChallenges: ChallengeEntry[] = [];
  let previousChallenge = recentCharacter;

  for (let index = 0; index < count; index += 1) {
    const nextChallenge = getRandomChallenge(
      mode,
      characterStats,
      previousChallenge,
    );
    upcomingChallenges.push(nextChallenge);
    previousChallenge = nextChallenge.character;
  }

  return upcomingChallenges;
}

/**
 * 현재 문제와 미리보기 큐를 포함한 출제 큐를 생성한다.
 * @param mode 현재 훈련 모드
 * @param characterStats 문자별 누적 학습 데이터
 * @returns 현재 문제와 미리보기 큐를 포함한 새 출제 큐
 */
function createChallengeQueue(
  mode: TrainingMode,
  characterStats: CharacterStats,
): ChallengeQueue {
  const current = getRandomChallenge(mode, characterStats);

  return {
    current,
    upcoming: fillUpcomingQueue(mode, characterStats, current.character),
  };
}

/**
 * 정답 입력 후 출제 큐를 한 칸 전진시킨다.
 * @param queue 현재 문제와 미리보기 큐
 * @param mode 현재 훈련 모드
 * @param characterStats 문자별 누적 학습 데이터
 * @returns 한 칸 전진한 출제 큐
 */
function advanceChallengeQueue(
  queue: ChallengeQueue,
  mode: TrainingMode,
  characterStats: CharacterStats,
): ChallengeQueue {
  const [nextCurrent, ...rest] = queue.upcoming;

  if (!nextCurrent) {
    return createChallengeQueue(mode, characterStats);
  }

  const lastCharacter =
    rest.length > 0 ? rest[rest.length - 1].character : nextCurrent.character;
  const nextTail = getRandomChallenge(mode, characterStats, lastCharacter);

  return {
    current: nextCurrent,
    upcoming: [...rest, nextTail],
  };
}

/**
 * 오답 재출제 문제를 미리보기 큐 안의 목표 위치에 삽입한다.
 * @param queue 현재 출제 큐
 * @param entry 다시 출제할 문제
 * @param targetStep 현재 문제 기준 몇 문제 뒤에 넣을지
 * @returns 재출제 문제가 반영된 출제 큐
 */
function insertRetryIntoQueue(
  queue: ChallengeQueue,
  entry: ChallengeEntry,
  targetStep: number,
) {
  if (queue.upcoming.length === 0) {
    return queue;
  }

  const nextUpcoming = [...queue.upcoming];
  let targetIndex = Math.max(
    0,
    Math.min(nextUpcoming.length - 1, targetStep - 1),
  );

  // 같은 문자가 바로 이어지지 않도록 목표 위치를 뒤로 밀어낸다.
  while (
    targetIndex < nextUpcoming.length - 1 &&
    (targetIndex === 0
      ? queue.current.character === entry.character
      : nextUpcoming[targetIndex - 1].character === entry.character)
  ) {
    targetIndex += 1;
  }

  nextUpcoming[targetIndex] = entry;

  return {
    ...queue,
    upcoming: nextUpcoming,
  };
}

/**
 * 기본 큐 전진 후 조건이 맞는 오답 재출제를 미리보기 큐에 반영한다.
 * @param queue 현재 출제 큐
 * @param mode 현재 훈련 모드
 * @param characterStats 문자별 누적 학습 데이터
 * @param pendingRetries 아직 대기 중인 재출제 목록
 * @param now 현재 시각
 * @returns 큐 전진 결과와 남은 재출제 목록
 */
function advanceChallengeQueueWithRetries(
  queue: ChallengeQueue,
  mode: TrainingMode,
  characterStats: CharacterStats,
  pendingRetries: PendingRetry[],
  now: number,
) {
  const nextQueue = advanceChallengeQueue(queue, mode, characterStats);
  const nextPendingRetries = pendingRetries.map((retry) => ({
    ...retry,
    remainingSteps: retry.remainingSteps - 1,
  }));
  const sortedRetries = [...nextPendingRetries].sort(
    (left, right) => left.dueAt - right.dueAt,
  );
  let queueWithRetries = nextQueue;
  const remainingRetries: PendingRetry[] = [];

  // 재출제는 남은 거리와 지연 시간이 모두 충족된 경우에만 큐에 삽입한다.
  sortedRetries.forEach((retry) => {
    if (retry.dueAt > now || retry.remainingSteps > previewCount) {
      remainingRetries.push(retry);
      return;
    }

    queueWithRetries = insertRetryIntoQueue(
      queueWithRetries,
      retry.entry,
      Math.max(1, retry.remainingSteps),
    );
  });

  return {
    queue: queueWithRetries,
    pendingRetries: remainingRetries,
  };
}

/**
 * 반응 시간에 따라 점수, 게이지 보상, 판정 메시지를 계산한다.
 * @param elapsedMs 현재 문제를 맞히기까지 걸린 시간
 * @returns 점수, 게이지, 판정 정보를 묶은 보상 객체
 */
function getRewardBySpeed(elapsedMs: number) {
  if (elapsedMs <= 450) {
    return {
      gaugeGain: 15,
      scoreGain: 180,
      feedback: {
        label: "PERFECT",
        tone: "perfect" as const,
        detail: `${elapsedMs}ms 반응`,
      },
    };
  }

  if (elapsedMs <= 900) {
    return {
      gaugeGain: 6,
      scoreGain: 120,
      feedback: {
        label: "GOOD",
        tone: "good" as const,
        detail: `${elapsedMs}ms 반응`,
      },
    };
  }

  return {
    gaugeGain: 4,
    scoreGain: 80,
    feedback: {
      label: "OK",
      tone: "ok" as const,
      detail: `${elapsedMs}ms 반응`,
    },
  };
}

/**
 * 타이핑 훈련 화면 전체를 구성하는 메인 컴포넌트다.
 * 상태, 입력 처리, 시각/오디오 피드백, 출제 큐 갱신을 함께 관리한다.
 * @returns 타이핑 훈련 화면 JSX
 */
function App() {
  const [trainingMode, setTrainingMode] = useState<TrainingMode>(() =>
    readStoredTrainingMode(),
  );
  const [handStats, setHandStats] = useState<HandStats>(() =>
    createEmptyHandStats(),
  );
  const [characterStats, setCharacterStats] = useState<CharacterStats>(() =>
    readStoredCharacterStats(),
  );
  const [challengeQueue, setChallengeQueue] = useState<ChallengeQueue>(() =>
    createChallengeQueue(readStoredTrainingMode(), readStoredCharacterStats()),
  );
  const [pendingRetries, setPendingRetries] = useState<PendingRetry[]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() =>
    readStoredNumber(bestScoreStorageKey, 0),
  );
  const [bestStreak, setBestStreak] = useState(() =>
    readStoredNumber(bestStreakStorageKey, 0),
  );
  const [streak, setStreak] = useState(0);
  const [gauge, setGauge] = useState(startingGauge);
  const [endlessModeEnabled, setEndlessModeEnabled] = useState(() =>
    readStoredBoolean(endlessModeStorageKey, false),
  );
  const [soundEnabled, setSoundEnabled] = useState(() =>
    readStoredBoolean(soundEnabledStorageKey, true),
  );
  const [visualEffectsEnabled, setVisualEffectsEnabled] = useState(() =>
    readStoredBoolean(visualEffectsStorageKey, true),
  );
  const [keyboardPanelVisible, setKeyboardPanelVisible] = useState(() =>
    readStoredBoolean(keyboardPanelVisibleStorageKey, true),
  );
  const [keyboardHintsVisible, setKeyboardHintsVisible] = useState(() =>
    readStoredBoolean(keyboardHintsVisibleStorageKey, true),
  );
  const [typedKeyFlashEnabled, setTypedKeyFlashEnabled] = useState(() =>
    readStoredBoolean(typedKeyFlashEnabledStorageKey, true),
  );
  const [flashedKeyId, setFlashedKeyId] = useState<string | null>(null);
  const [selectedFontPresetId, setSelectedFontPresetId] =
    useState<TypingFontPresetId>(() => readStoredTypingFontPreset());
  const [hasStarted, setHasStarted] = useState(false);
  const [isInputLocked, setIsInputLocked] = useState(false);
  const [lockRemainingMs, setLockRemainingMs] = useState(0);
  const [timeoutElapsedMs, setTimeoutElapsedMs] = useState<number | null>(null);
  const [bestSurvivalMs, setBestSurvivalMs] = useState(() =>
    readStoredNumber(bestSurvivalStorageKey, 0),
  );
  const [feedback, setFeedback] = useState<FeedbackState>({
    label: "READY",
    tone: "ready",
    detail: "보이는 문자를 그대로 입력하세요",
  });
  const challengeStartedAtRef = useRef(0);
  const sessionStartedAtRef = useRef(0);
  const missLockTimerRef = useRef<number | null>(null);
  const missLockEndsAtRef = useRef(0);
  const retryIdRef = useRef(0);
  const keycapFlashTimerRef = useRef<number | null>(null);
  const keycapFlashFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const challengeCardRef = useRef<HTMLDivElement | null>(null);
  const canAcceptInput = endlessModeEnabled || gauge > 0;
  const isRunning = hasStarted && canAcceptInput;
  const selectedFontPreset = useMemo(
    () =>
      typingFontPresets.find((preset) => preset.id === selectedFontPresetId) ??
      typingFontPresets[0],
    [selectedFontPresetId],
  );
  const challenge = challengeQueue.current;
  const upcomingChallenges = challengeQueue.upcoming;
  const previewOpacities = useMemo(() => {
    const maxOpacity = 0.3;
    const minOpacity = 0.1;

    if (previewCount <= 1) {
      return [maxOpacity];
    }

    return Array.from({ length: previewCount }, (_, index) => {
      const ratio = index / (previewCount - 1);

      return maxOpacity - (maxOpacity - minOpacity) * ratio;
    });
  }, []);
  const activeKeyboardKey = keyboardKeyMap[challenge.keyId];
  const keyboardShiftKeyId =
    challenge.requiresShift &&
    activeKeyboardKey?.kind === "char" &&
    activeKeyboardKey.helperShiftKeyId
      ? activeKeyboardKey.helperShiftKeyId
      : null;
  const keyRiskMap = useMemo(() => {
    const nextRiskMap: Record<string, number> = {};

    keyboardKeys.forEach((key) => {
      if (key.kind !== "char") {
        return;
      }

      const characters = [key.base, key.shifted].filter(
        (value): value is string => typeof value === "string",
      );
      const riskAlpha = characters.reduce((maxRisk, character) => {
        return Math.max(maxRisk, getVisualRiskAlpha(characterStats[character]));
      }, 0);

      nextRiskMap[key.id] = riskAlpha;
    });

    return nextRiskMap;
  }, [characterStats]);
  const highlightedWeakKeys = useMemo(() => {
    return Object.values(keyRiskMap).filter((risk) => risk >= 0.45).length;
  }, [keyRiskMap]);
  const mostMissedCharacters = useMemo(() => {
    return Object.entries(characterStats)
      .filter(([, stat]) => stat.attempts >= 5 && stat.miss > 0)
      .sort(([, leftStat], [, rightStat]) => {
        const leftMissRate = getSmoothedMissRate(leftStat);
        const rightMissRate = getSmoothedMissRate(rightStat);

        if (rightMissRate !== leftMissRate) {
          return rightMissRate - leftMissRate;
        }

        if (rightStat.attempts !== leftStat.attempts) {
          return rightStat.attempts - leftStat.attempts;
        }

        return rightStat.miss - leftStat.miss;
      })
      .slice(0, 5)
      .map(([character, stat]) => ({
        character,
        missRateLabel: `${Math.round(getSmoothedMissRate(stat) * 100)}%`,
        sampleLabel: `(${stat.miss}/${stat.attempts})`,
      }));
  }, [characterStats]);
  const gaugeFillStyle = useMemo(() => {
    const clampedGauge = Math.max(0, Math.min(gauge, gaugeMax));
    const gaugeRatio = clampedGauge / gaugeMax;
    const glowAlpha = 0.18 + gaugeRatio * 0.2;
    const gaugeLowStart = [255, 95, 95] as const;
    const gaugeLowEnd = [255, 150, 102] as const;
    const gaugeHigh = [109, 247, 193] as const;
    const blendChannel = (low: number, high: number) => {
      return Math.round(low + (high - low) * gaugeRatio);
    };
    const startColor = gaugeLowStart.map((channel, index) =>
      blendChannel(channel, gaugeHigh[index]),
    );
    const endColor = gaugeLowEnd.map((channel, index) =>
      blendChannel(channel, gaugeHigh[index]),
    );

    return {
      width: `${clampedGauge}%`,
      "--gauge-fill-start": `rgb(${startColor.join(", ")})`,
      "--gauge-fill-end": `rgb(${endColor.join(", ")})`,
      "--gauge-fill-shadow": `rgba(${endColor.join(", ")}, ${glowAlpha})`,
    } as CSSProperties;
  }, [gauge]);
  const appStyle = useMemo(() => {
    return {
      "--typing-display-font": selectedFontPreset.fontFamily,
    } as CSSProperties;
  }, [selectedFontPreset.fontFamily]);
  const feedbackDetailAccent =
    feedback.tone === "miss" && isInputLocked
      ? `${Math.max(0, Math.ceil(lockRemainingMs))}ms`
      : !endlessModeEnabled &&
          feedback.label === "TIME OUT" &&
          timeoutElapsedMs !== null
        ? formatElapsedDisplay(timeoutElapsedMs)
        : null;

  /**
   * 남아 있는 키캡 반짝 타이머를 정리하고 현재 반짝 상태를 비운다.
   */
  const clearTypedKeyFlash = useCallback(() => {
    if (keycapFlashTimerRef.current !== null) {
      window.clearTimeout(keycapFlashTimerRef.current);
      keycapFlashTimerRef.current = null;
    }

    if (keycapFlashFrameRef.current !== null) {
      window.cancelAnimationFrame(keycapFlashFrameRef.current);
      keycapFlashFrameRef.current = null;
    }

    setFlashedKeyId(null);
  }, []);

  /**
   * 실제 입력한 키캡에 짧은 흰색 반짝 효과를 재생한다.
   * @param keyId 반짝 효과를 줄 키보드 패널 key id
   */
  const triggerTypedKeyFlash = useCallback(
    (keyId: string | null) => {
      if (!typedKeyFlashEnabled || keyId === null) {
        return;
      }

      // 같은 키를 연속 입력해도 애니메이션이 다시 시작되도록 먼저 비운다.
      clearTypedKeyFlash();
      keycapFlashFrameRef.current = window.requestAnimationFrame(() => {
        setFlashedKeyId(keyId);
        keycapFlashFrameRef.current = null;
        keycapFlashTimerRef.current = window.setTimeout(() => {
          setFlashedKeyId(null);
          keycapFlashTimerRef.current = null;
        }, keycapFlashDurationMs);
      });
    },
    [clearTypedKeyFlash, typedKeyFlashEnabled],
  );

  /**
   * 효과음 재생에 사용할 AudioContext를 준비한다.
   * @returns 사용할 수 없는 환경이면 null
   */
  const ensureAudioContext = useCallback(() => {
    if (typeof window === "undefined") {
      return null;
    }

    if (audioContextRef.current === null) {
      const AudioContextConstructor =
        window.AudioContext ||
        (
          window as Window &
            typeof globalThis & { webkitAudioContext?: typeof AudioContext }
        ).webkitAudioContext;

      if (!AudioContextConstructor) {
        return null;
      }

      audioContextRef.current = new AudioContextConstructor();
    }

    if (audioContextRef.current.state === "suspended") {
      void audioContextRef.current.resume();
    }

    return audioContextRef.current;
  }, []);

  /**
   * 짧은 효과음을 오실레이터 기반으로 재생한다.
   * @param context 재생에 사용할 AudioContext
   * @param frequency 재생할 주파수
   * @param startAt 재생 시작 시각
   * @param duration 재생 길이
   * @param volume 최대 볼륨
   * @param type 오실레이터 파형 종류
   */
  const playTone = useCallback(
    (
      context: AudioContext,
      frequency: number,
      startAt: number,
      duration: number,
      volume: number,
      type: OscillatorType,
    ) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, startAt);
      gainNode.gain.setValueAtTime(0.0001, startAt);
      gainNode.gain.exponentialRampToValueAtTime(volume, startAt + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      oscillator.start(startAt);
      oscillator.stop(startAt + duration + 0.02);
    },
    [],
  );

  /**
   * 판정 종류에 맞는 효과음 패턴을 재생한다.
   * @param tone ok, good, perfect, miss 중 하나
   */
  const triggerAudioFeedback = useCallback(
    (tone: "ok" | "good" | "perfect" | "miss") => {
      if (!soundEnabled) {
        return;
      }

      const context = ensureAudioContext();

      if (context === null) {
        return;
      }

      const startAt = context.currentTime + 0.005;

      if (tone === "perfect") {
        playTone(context, 1244, startAt, 0.08, 0.05, "sine");
        playTone(context, 1568, startAt + 0.05, 0.12, 0.035, "triangle");
        return;
      }

      if (tone === "miss") {
        playTone(context, 165, startAt, 0.11, 0.055, "triangle");
        return;
      }

      playTone(
        context,
        tone === "good" ? 988 : 880,
        startAt,
        tone === "good" ? 0.07 : 0.06,
        tone === "good" ? 0.038 : 0.03,
        "square",
      );
    },
    [ensureAudioContext, playTone, soundEnabled],
  );

  /**
   * 동일한 애니메이션 클래스도 다시 재생되도록 강제로 재적용한다.
   * @param element 애니메이션을 적용할 대상 요소
   * @param className 다시 붙일 애니메이션 클래스
   */
  const retriggerAnimationClass = useCallback(
    (element: HTMLElement | null, className: string) => {
      if (element === null) {
        return;
      }

      element.classList.remove(
        "is-hit-flash",
        "is-perfect-pop",
        "is-miss-shake",
        className,
      );
      // 강제 리플로우로 이전 프레임을 끊어 같은 클래스도 다시 재생되게 한다.
      void element.offsetWidth;
      element.classList.add(className);
    },
    [],
  );

  /**
   * 판정 종류에 맞는 카드 애니메이션을 재생한다.
   * @param kind hit, perfect, miss 중 하나
   */
  const triggerVisualFeedback = useCallback(
    (kind: "hit" | "perfect" | "miss") => {
      if (!visualEffectsEnabled) {
        return;
      }

      if (kind === "miss") {
        retriggerAnimationClass(challengeCardRef.current, "is-miss-shake");
        return;
      }

      retriggerAnimationClass(
        challengeCardRef.current,
        kind === "perfect" ? "is-perfect-pop" : "", // is-hit-flash 임시로 일단 끄자. 너무 자주 나오고 눈아프다.
      );
    },
    [retriggerAnimationClass, visualEffectsEnabled],
  );

  /**
   * 현재 세션 상태를 초기화하고 새 모드 기준으로 게임을 다시 시작한다.
   * @param nextMode 재시작 시 적용할 훈련 모드, 생략 시 현재 모드 유지
   */
  const resetGame = useCallback(
    (nextMode: TrainingMode = trainingMode) => {
      const nextModeOption = getModeOption(nextMode);

      if (missLockTimerRef.current !== null) {
        window.clearTimeout(missLockTimerRef.current);
        missLockTimerRef.current = null;
      }

      missLockEndsAtRef.current = 0;
      challengeStartedAtRef.current = Date.now();
      setTrainingMode(nextMode);
      setHandStats(createEmptyHandStats());
      setChallengeQueue(createChallengeQueue(nextMode, characterStats));
      setPendingRetries([]);
      setScore(0);
      setStreak(0);
      setGauge(startingGauge);
      setHasStarted(false);
      setIsInputLocked(false);
      setLockRemainingMs(0);
      setTimeoutElapsedMs(null);
      sessionStartedAtRef.current = 0;
      setFeedback({
        label: "READY",
        tone: "ready",
        detail: `${nextModeOption.label} 모드로 훈련을 시작합니다`,
      });
    },
    [characterStats, trainingMode],
  );

  // 첫 문제의 반응 시간 측정을 위해 마운트 시점 기준 시간을 기록한다.
  useEffect(() => {
    challengeStartedAtRef.current = Date.now();
  }, []);

  // 사용자가 바꾼 설정은 즉시 localStorage에 동기화한다.
  useEffect(() => {
    writeStoredValue(trainingModeStorageKey, trainingMode);
  }, [trainingMode]);

  useEffect(() => {
    writeStoredValue(endlessModeStorageKey, String(endlessModeEnabled));
  }, [endlessModeEnabled]);

  useEffect(() => {
    writeStoredValue(soundEnabledStorageKey, String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    writeStoredValue(visualEffectsStorageKey, String(visualEffectsEnabled));
  }, [visualEffectsEnabled]);

  useEffect(() => {
    writeStoredValue(
      keyboardPanelVisibleStorageKey,
      String(keyboardPanelVisible),
    );
  }, [keyboardPanelVisible]);

  useEffect(() => {
    writeStoredValue(
      keyboardHintsVisibleStorageKey,
      String(keyboardHintsVisible),
    );
  }, [keyboardHintsVisible]);

  useEffect(() => {
    writeStoredValue(
      typedKeyFlashEnabledStorageKey,
      String(typedKeyFlashEnabled),
    );
  }, [typedKeyFlashEnabled]);

  useEffect(() => {
    writeStoredValue(typingFontStorageKey, selectedFontPresetId);
  }, [selectedFontPresetId]);

  useEffect(() => {
    writeStoredValue(characterStatsStorageKey, JSON.stringify(characterStats));
  }, [characterStats]);

  useEffect(() => {
    writeStoredValue(bestScoreStorageKey, String(bestScore));
  }, [bestScore]);

  useEffect(() => {
    writeStoredValue(bestStreakStorageKey, String(bestStreak));
  }, [bestStreak]);

  useEffect(() => {
    writeStoredValue(bestSurvivalStorageKey, String(bestSurvivalMs));
  }, [bestSurvivalMs]);

  // 언마운트 시 남아 있는 타이머와 오디오 리소스를 정리한다.
  useEffect(() => {
    return () => {
      if (missLockTimerRef.current !== null) {
        window.clearTimeout(missLockTimerRef.current);
      }

      clearTypedKeyFlash();

      if (audioContextRef.current !== null) {
        void audioContextRef.current.close();
      }
    };
  }, [clearTypedKeyFlash]);

  // MISS 잠금 동안 남은 시간을 짧은 간격으로 갱신해 카운트다운을 보여준다.
  useEffect(() => {
    if (!isInputLocked) {
      return undefined;
    }

    const countdownTimer = window.setInterval(() => {
      const remainingMs = Math.max(0, missLockEndsAtRef.current - Date.now());
      setLockRemainingMs(remainingMs);
    }, 16);

    return () => {
      window.clearInterval(countdownTimer);
    };
  }, [isInputLocked]);

  // 플레이가 시작된 뒤에만 집중 게이지 감소 루프를 돌린다.
  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const decayTimer = window.setInterval(() => {
      setGauge((currentGauge) => {
        const nextGauge = Math.max(
          0,
          currentGauge - getGaugeDecayPerTick(currentGauge),
        );

        // 0%에 처음 닿는 순간에만 타임아웃 상태와 경과 시간을 확정한다.
        if (nextGauge === 0 && currentGauge > 0) {
          setStreak(0);
          const elapsedMs =
            sessionStartedAtRef.current > 0
              ? Date.now() - sessionStartedAtRef.current
              : 0;

          setTimeoutElapsedMs(elapsedMs);
          if (!endlessModeEnabled) {
            setBestSurvivalMs((currentBest) =>
              Math.max(currentBest, elapsedMs),
            );
          }
          setFeedback(
            endlessModeEnabled
              ? {
                  label: "TIME OUT",
                  tone: "timeout",
                  detail: "0%까지 버텼지만 무한모드로 계속 진행합니다",
                }
              : {
                  label: "TIME OUT",
                  tone: "gameover",
                  detail: "게이지가 모두 소진되었습니다",
                },
          );
        }

        return nextGauge;
      });
    }, decayIntervalMs);

    return () => {
      window.clearInterval(decayTimer);
    };
  }, [endlessModeEnabled, isRunning]);

  // 전역 keydown 리스너 하나로 입력 판정, 재시작, 재출제 예약을 모두 처리한다.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }

      triggerTypedKeyFlash(getKeyboardEventKeyId(event.code));

      // Ctrl+Enter는 언제든 현재 세션을 즉시 다시 시작한다.
      if (event.ctrlKey && event.key === "Enter") {
        event.preventDefault();
        resetGame();
        return;
      }

      // 진행 불가 상태, 잠금 상태, 길게 누르기, 단독 Shift 입력은 무시한다.
      if (!canAcceptInput || isInputLocked || event.key === "Shift") {
        return;
      }

      const pressedKey = event.key;

      if (pressedKey.length !== 1) {
        return;
      }

      // 첫 유효 입력이 들어온 시점부터 게이지 감소와 생존 시간 측정을 시작한다.
      if (!hasStarted) {
        setHasStarted(true);
        sessionStartedAtRef.current = Date.now();
      }

      console.info(
        `challenge.character: ${challenge.character}, pressedKey: ${pressedKey}`,
      );

      if (pressedKey === challenge.character) {
        // 정답 시에는 통계 갱신 후 큐 전진과 보상 반영을 같은 입력 턴 안에서 처리한다.
        const elapsedMs = Date.now() - challengeStartedAtRef.current;
        const reward = getRewardBySpeed(elapsedMs);
        const nextHandStats = updateHandStats(
          handStats,
          challenge.group,
          "hit",
        );
        const nextCharacterStats = updateCharacterStatsOnHit(
          characterStats,
          challenge.character,
          elapsedMs,
        );
        const advanceResult = advanceChallengeQueueWithRetries(
          challengeQueue,
          trainingMode,
          nextCharacterStats,
          pendingRetries,
          Date.now(),
        );

        setHandStats(nextHandStats);
        setCharacterStats(nextCharacterStats);
        setPendingRetries(advanceResult.pendingRetries);
        setChallengeQueue(advanceResult.queue);
        challengeStartedAtRef.current = Date.now();
        setGauge((currentGauge) =>
          Math.min(gaugeMax, currentGauge + reward.gaugeGain),
        );
        setScore((currentScore) => {
          const nextScore = currentScore + reward.scoreGain;

          if (!endlessModeEnabled) {
            setBestScore((currentBest) => Math.max(currentBest, nextScore));
          }
          return nextScore;
        });
        setStreak((currentStreak) => {
          const nextStreak = currentStreak + 1;

          setBestStreak((currentBest) => Math.max(currentBest, nextStreak));
          return nextStreak;
        });
        setFeedback({
          ...reward.feedback,
          detail: `${getGroupLabel(challenge.group)} ${reward.feedback.detail}`,
        });
        triggerAudioFeedback(reward.feedback.tone);
        triggerVisualFeedback(
          reward.feedback.tone === "perfect" ? "perfect" : "hit",
        );
        return;
      }

      // 오답 문제는 기존 동일 문자 재시도를 대체해 가장 최근 실패 기준으로 다시 예약한다.
      const nextHandStats = updateHandStats(handStats, challenge.group, "miss");
      const nextCharacterStats = updateCharacterStatsOnMiss(
        characterStats,
        challenge.character,
      );

      setHandStats(nextHandStats);
      setCharacterStats(nextCharacterStats);
      setPendingRetries((currentRetries) => {
        const nextRetry: PendingRetry = {
          id: retryIdRef.current,
          entry: challenge,
          dueAt: Date.now() + retryDelayMs,
          remainingSteps: getRandomRetryGap(),
        };
        retryIdRef.current += 1;

        const filteredRetries = currentRetries.filter(
          (retry) => retry.entry.character !== challenge.character,
        );

        return [...filteredRetries, nextRetry];
      });
      const nextGauge = Math.max(0, gauge - missPenalty);
      const didTimeoutByMiss = nextGauge === 0 && gauge > 0;
      const elapsedMs =
        sessionStartedAtRef.current > 0
          ? Date.now() - sessionStartedAtRef.current
          : 0;

      // 오답은 게이지 차감과 잠금 상태를 즉시 적용해 다음 입력을 잠시 막는다.
      setGauge(nextGauge);
      setStreak(0);
      setTimeoutElapsedMs(didTimeoutByMiss ? elapsedMs : null);
      if (didTimeoutByMiss && !endlessModeEnabled) {
        setBestSurvivalMs((currentBest) => Math.max(currentBest, elapsedMs));
      }

      if (!didTimeoutByMiss || endlessModeEnabled) {
        setIsInputLocked(true);
        missLockEndsAtRef.current = Date.now() + missLockMs;
        setLockRemainingMs(missLockMs);

        if (missLockTimerRef.current !== null) {
          window.clearTimeout(missLockTimerRef.current);
        }

        missLockTimerRef.current = window.setTimeout(() => {
          setIsInputLocked(false);
          setLockRemainingMs(0);
          missLockEndsAtRef.current = 0;
          missLockTimerRef.current = null;
        }, missLockMs);
      } else {
        setIsInputLocked(false);
        setLockRemainingMs(0);
        missLockEndsAtRef.current = 0;
      }

      setFeedback(
        didTimeoutByMiss
          ? endlessModeEnabled
            ? {
                label: "TIME OUT",
                tone: "timeout",
                detail: "0%까지 버텼지만 무한모드로 계속 진행합니다",
              }
            : {
                label: "TIME OUT",
                tone: "gameover",
                detail: "게이지가 모두 소진되었습니다",
              }
          : {
              label: "MISS",
              tone: "miss",
              detail: `${getGroupLabel(challenge.group)} 문제에서 "${pressedKey}" 입력, 1초간 입력 잠금`,
            },
      );
      triggerAudioFeedback("miss");
      triggerVisualFeedback("miss");
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    challenge,
    challengeQueue,
    characterStats,
    handStats,
    isInputLocked,
    canAcceptInput,
    gauge,
    hasStarted,
    pendingRetries,
    resetGame,
    triggerAudioFeedback,
    triggerTypedKeyFlash,
    triggerVisualFeedback,
    trainingMode,
    endlessModeEnabled,
  ]);

  return (
    <main className="game-shell" style={appStyle}>
      <section className="game-stage" aria-live="polite">
        <div className="game-stage-main">
          <div
            ref={challengeCardRef}
            className="challenge-card"
            aria-label="현재 문자와 다음 문자"
          >
            {isInputLocked ? (
              <div className="challenge-lock-overlay" aria-hidden="true">
                <div className="challenge-lock-panel">
                  <span className="challenge-lock-detail">
                    INPUT LOCKED INPUT LOCKED INPUT LOCKED INPUT LOCKED INPUT
                    LOCKED INPUT LOCKED LOCKED INPUT LOCKED
                  </span>
                  {/* <span className="challenge-lock-condition">INPUT LOCKED INPUT LOCKED</span> */}
                  <strong className="challenge-lock-title">
                    <span>LOCK '</span>
                    <span className="challenge-lock-time">
                      {Math.max(0, Math.ceil(lockRemainingMs))}ms
                    </span>
                  </strong>
                  <span className="challenge-lock-detail">
                    INPUT LOCKED INPUT LOCKED INPUT LOCKED INPUT LOCKED INPUT
                    LOCKED INPUT LOCKED LOCKED INPUT LOCKED
                  </span>
                </div>
              </div>
            ) : null}
            <div className="challenge-meta" aria-label="현재 훈련 정보">
              <span className="challenge-meta-group-title challenge-meta-group-title-cumulative">
                최고 기록
              </span>
              <div className="challenge-meta-line challenge-meta-line-cumulative-summary">
                <span className="challenge-meta-item">
                  <span className="challenge-meta-key">점수</span>
                  <strong>{bestScore}</strong>
                </span>
                <span className="challenge-meta-item">
                  <span className="challenge-meta-key">연속</span>
                  <strong>{bestStreak}</strong>
                </span>
                <span className="challenge-meta-item">
                  <span className="challenge-meta-key">
                    버틴시간
                    <span className="challenge-meta-sample">(mm:ss.sss)</span>
                  </span>
                  <strong>
                    {bestSurvivalMs > 0
                      ? formatElapsedDisplay(bestSurvivalMs)
                      : "--"}
                  </strong>
                </span>
              </div>
              <div className="challenge-meta-line challenge-meta-line-cumulative-weak">
                <span className="challenge-meta-item challenge-meta-item-long">
                  <span className="challenge-meta-key">
                    많이틀린문자{" "}
                    <span className="challenge-meta-sample">
                      (오답수/시도수)
                    </span>
                  </span>
                  <strong>
                    {mostMissedCharacters.length > 0
                      ? mostMissedCharacters.map((item, index) => (
                          <span key={`${item.character}-${index}`}>
                            {index > 0 ? " · " : ""}
                            {item.character} {item.missRateLabel}{" "}
                            <span className="challenge-meta-sample">
                              {item.sampleLabel}
                            </span>
                          </span>
                        ))
                      : "--"}
                  </strong>
                </span>
              </div>
              <span className="challenge-meta-group-title challenge-meta-group-title-session">
                현재 세션 기록
              </span>
              <div className="challenge-meta-line challenge-meta-line-session-summary">
                <span className="challenge-meta-item">
                  <span className="challenge-meta-key">점수</span>
                  <strong>{score}</strong>
                </span>
                <span className="challenge-meta-item">
                  <span className="challenge-meta-key">연속</span>
                  <strong>{streak}</strong>
                </span>
              </div>
              <div className="challenge-meta-line challenge-meta-line-hand-left">
                <span className="challenge-meta-item">
                  <span className="challenge-meta-key">
                    왼손정확도{" "}
                    <span className="challenge-meta-sample">
                      (정답/오답/정확도)
                    </span>
                  </span>
                  <strong>
                    {handStats.left.hit}/{handStats.left.miss}/
                    {formatAccuracy(handStats.left)}
                  </strong>
                </span>
              </div>
              <span className="challenge-meta-item challenge-meta-item-hand-right">
                <span className="challenge-meta-key">
                  오른손정확도{" "}
                  <span className="challenge-meta-sample">
                    (정답/오답/정확도)
                  </span>
                </span>
                <strong>
                  {handStats.right.hit}/{handStats.right.miss}/
                  {formatAccuracy(handStats.right)}
                </strong>
              </span>
            </div>
            <div className="challenge-card-main">
              <div className="challenge-line">
                <div className="challenge-current">
                  <div className="challenge-focus">
                    <span className="challenge-character challenge-character-current">
                      {challenge.character}
                    </span>
                  </div>
                </div>

                <div
                  className="challenge-upcoming"
                  aria-label="다음에 나올 문자"
                >
                  {upcomingChallenges.map((entry, index) => (
                    <span
                      key={`${entry.character}-${index}`}
                      className="challenge-upcoming-character"
                      style={{
                        opacity:
                          previewOpacities[index] ??
                          previewOpacities[previewOpacities.length - 1] ??
                          0.15,
                      }}
                    >
                      {entry.character}
                    </span>
                  ))}
                </div>
              </div>
              <div
                className="challenge-inline-gauge"
                aria-label={`집중 게이지 ${Math.ceil(gauge)}%`}
              >
                <div
                  className="gauge-track gauge-track-slim"
                  aria-hidden="true"
                >
                  <div className="gauge-fill" style={gaugeFillStyle} />
                </div>
              </div>
            </div>
            <div className={`feedback feedback-slot feedback-${feedback.tone}`}>
              <div className="feedback-copy">
                <span className="feedback-label">{feedback.label}</span>
                <span className="feedback-detail">
                  {feedback.detail}
                  {feedbackDetailAccent !== null ? " " : ""}
                  {feedbackDetailAccent !== null ? (
                    <span
                      className={`feedback-detail-accent feedback-detail-accent-${feedback.tone}`}
                    >
                      {feedbackDetailAccent}
                    </span>
                  ) : null}
                </span>
              </div>
            </div>
          </div>
          {keyboardPanelVisible ? (
            <section className="keyboard-panel" aria-label="키보드 시각화">
              <div className="keyboard-rows">
                {keyboardRows.map((row, rowIndex) => (
                  <div key={`row-${rowIndex}`} className="keyboard-row">
                    {row.map((key) => {
                      const isAction = key.kind === "action";
                      const isActiveKey =
                        keyboardHintsVisible && key.id === challenge.keyId;
                      const isShiftHelper =
                        keyboardHintsVisible && key.id === keyboardShiftKeyId;
                      const isPressedFlash =
                        typedKeyFlashEnabled && key.id === flashedKeyId;
                      const riskAlpha = isAction
                        ? 0
                        : (keyRiskMap[key.id] ?? 0);
                      const keycapStyle = {
                        flex: `${key.widthUnits ?? 1} 1 0`,
                        "--risk-alpha": riskAlpha,
                      } as CSSProperties;
                      const className = [
                        "keycap",
                        isAction ? "keycap-action" : "keycap-char",
                        key.hand ? `keycap-${key.hand}` : "",
                        isActiveKey ? "is-current" : "",
                        isShiftHelper ? "is-shift-helper" : "",
                        isPressedFlash ? "is-pressed-flash" : "",
                      ]
                        .filter(Boolean)
                        .join(" ");

                      return (
                        <div
                          key={key.id}
                          className={className}
                          style={keycapStyle}
                        >
                          {isAction ? (
                            <span className="keycap-action-label">
                              {key.actionLabel}
                            </span>
                          ) : (
                            <>
                              <span className="keycap-shift-label">
                                {key.shifted}
                              </span>
                              <span className="keycap-base-label">
                                {key.base}
                              </span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <footer className="game-stage-footer">
          <p className="status-text">
            {isInputLocked
              ? "오답 직후 1초 동안 입력이 잠겨 있습니다"
              : !hasStarted
                ? "첫 입력 전까지는 게이지가 유지됩니다"
                : !isRunning
                  ? ""
                  : endlessModeEnabled
                    ? `약점 키 ${highlightedWeakKeys}개를 추적하고 있습니다`
                    : "약점 키는 반복 출제됩니다"}
          </p>
          <div className="footer-actions">
            <div className="footer-mode-controls">
              <span className="keyboard-meta-label">훈련모드</span>
              <div className="footer-mode-buttons">
                {modeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`mode-button footer-mode-button ${trainingMode === option.value ? "is-active" : ""}`}
                    onClick={() => resetGame(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
                <button
                  type="button"
                  className={`assist-toggle footer-mode-button ${endlessModeEnabled ? "is-active" : ""}`}
                  aria-pressed={endlessModeEnabled}
                  onClick={() => setEndlessModeEnabled((current) => !current)}
                >
                  무한모드
                </button>
              </div>
            </div>
            <span className="footer-separator" aria-hidden="true" />
            <div
              className="footer-setting-controls"
              aria-label="피드백, 키보드, 폰트 설정"
            >
              <div className="footer-setting-group">
                <span className="keyboard-meta-label">피드백</span>
                <div className="footer-setting-buttons">
                  <button
                    type="button"
                    className={`keyboard-setting-button footer-setting-button ${soundEnabled ? "is-active" : ""}`}
                    aria-pressed={soundEnabled}
                    onClick={() => setSoundEnabled((current) => !current)}
                  >
                    소리
                  </button>
                  <button
                    type="button"
                    className={`keyboard-setting-button footer-setting-button ${visualEffectsEnabled ? "is-active" : ""}`}
                    aria-pressed={visualEffectsEnabled}
                    onClick={() =>
                      setVisualEffectsEnabled((current) => !current)
                    }
                  >
                    시각효과
                  </button>
                </div>
              </div>
              <span className="footer-separator" aria-hidden="true" />
              <div className="footer-setting-group">
                <span className="keyboard-meta-label">키보드</span>
                <div className="footer-setting-buttons">
                  <button
                    type="button"
                    className={`keyboard-setting-button footer-setting-button ${keyboardPanelVisible ? "is-active" : ""}`}
                    aria-pressed={keyboardPanelVisible}
                    onClick={() =>
                      setKeyboardPanelVisible((current) => !current)
                    }
                  >
                    패널
                  </button>
                  <button
                    type="button"
                    className={`keyboard-setting-button footer-setting-button ${keyboardHintsVisible ? "is-active" : ""}`}
                    aria-pressed={keyboardHintsVisible}
                    onClick={() =>
                      setKeyboardHintsVisible((current) => !current)
                    }
                  >
                    가이드
                  </button>
                  <button
                    type="button"
                    className={`keyboard-setting-button footer-setting-button ${typedKeyFlashEnabled ? "is-active" : ""}`}
                    aria-pressed={typedKeyFlashEnabled}
                    onClick={() =>
                      setTypedKeyFlashEnabled((current) => {
                        const nextValue = !current;

                        if (!nextValue) {
                          clearTypedKeyFlash();
                        }

                        return nextValue;
                      })
                    }
                  >
                    반짝
                  </button>
                </div>
              </div>
              <span className="footer-separator" aria-hidden="true" />
              <div className="footer-setting-group">
                <span className="keyboard-meta-label">폰트</span>
                <div className="footer-setting-buttons">
                  {typingFontPresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className={`keyboard-setting-button footer-setting-button ${selectedFontPresetId === preset.id ? "is-active" : ""}`}
                      aria-pressed={selectedFontPresetId === preset.id}
                      onClick={() => setSelectedFontPresetId(preset.id)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <span className="footer-separator" aria-hidden="true" />
            <button
              type="button"
              className="restart-button"
              onClick={() => resetGame()}
            >
              <span className="restart-label">다시 시작</span>
              <span className="restart-shortcut">Ctrl + Enter</span>
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}

export default App;
