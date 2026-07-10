import type {
  KeyboardLayoutId,
  ModeOption,
  TypingFontPreset,
} from "./types";

export const gaugeMax = 100;
export const startingGauge = 100;
export const decayMinPerTick = 0.08;
export const decayMaxPerTick = 0.68;
export const decayIntervalMs = 120;
export const missPenalty = 15;
export const missLockMs = 1000;
export const previewCount = 3;
export const slowResponseThresholdMs = 900;
export const recentHistoryLimit = 10;
export const retryDelayMs = 5000;
export const retryMinGap = 3;
export const retryMaxGap = 8;
export const visualMissPriorRate = 0.12;
export const visualSlowPriorRate = 0.18;
export const visualTotalPriorSamples = 6;
export const visualRecentPriorSamples = 4;
export const trainingModeStorageKey = "shot-key:training-mode";
export const endlessModeStorageKey = "shot-key:endless-mode";
export const characterStatsStorageKey = "shot-key:character-stats";
export const soundEnabledStorageKey = "shot-key:sound-enabled";
export const visualEffectsStorageKey = "shot-key:visual-effects-enabled";
export const keyboardPanelVisibleStorageKey = "shot-key:keyboard-panel-visible";
export const keyboardHintsVisibleStorageKey = "shot-key:keyboard-hints-visible";
export const typedKeyFlashEnabledStorageKey = "shot-key:typed-key-flash-enabled";
export const typingFontStorageKey = "shot-key:typing-font";
export const bestScoreStorageKey = "shot-key:best-score";
export const bestStreakStorageKey = "shot-key:best-streak";
export const bestSurvivalStorageKey = "shot-key:best-survival-ms";
export const themeStorageKey = "shot-key:theme";
export const keyboardLayoutStorageKey = "shot-key:keyboard-layout";
export const keycapFlashDurationMs = 180;

export const keyboardLayoutOptions: {
  id: KeyboardLayoutId;
  label: string;
}[] = [
  { id: "us", label: "US QWERTY" },
  { id: "jis", label: "Japanese" },
];

export const typingFontPresets: TypingFontPreset[] = [
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

export const modeOptions: ModeOption[] = [
  {
    value: "all",
    label: "All",
    shortLabel: "ALL",
    description: "Train the full keyboard evenly.",
  },
  {
    value: "left",
    label: "Left",
    shortLabel: "L",
    description: "Train base and Shift characters for the left hand.",
  },
  {
    value: "right",
    label: "Right",
    shortLabel: "R",
    description: "Train base and Shift characters for the right hand.",
  },
];
