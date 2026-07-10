export type BaseHand = "left" | "right";
export type HandGroup = BaseHand;
export type TrainingMode = "all" | BaseHand;
export type ShiftKeyId = "shift-left" | "shift-right";
export type FeedbackTone =
  | "ready"
  | "perfect"
  | "good"
  | "ok"
  | "miss"
  | "timeout"
  | "gameover";
export type TypingFontPresetId = "balanced" | "cascadia" | "consolas" | "classic";

export type FeedbackState = {
  label: string;
  tone: FeedbackTone;
  detail: string;
};

export type HandRecord = {
  hit: number;
  miss: number;
};

export type HandStats = Record<HandGroup, HandRecord>;

export type RecentOutcome = "hit" | "slow" | "miss";

export type CharacterStat = {
  attempts: number;
  seen: number;
  miss: number;
  solvedCount: number;
  totalResponseMs: number;
  slowCount: number;
  lastSeenAt: number;
  recentOutcomes: RecentOutcome[];
};

export type CharacterStats = Record<string, CharacterStat>;

export type ChallengeEntry = {
  character: string;
  group: HandGroup;
  keyId: string;
  requiresShift: boolean;
};

export type ModeOption = {
  value: TrainingMode;
  label: string;
  shortLabel: string;
  description: string;
};

/** 키캡 외형. jis-enter = L자 Enter 본체, jis-enter-slot = 홈행 줄기 자리 확보용 */
export type KeycapShape = "standard" | "jis-enter" | "jis-enter-slot";

export type KeyboardKey = {
  id: string;
  kind: "char" | "action";
  base?: string;
  shifted?: string;
  helperShiftKeyId?: ShiftKeyId;
  actionLabel?: string;
  actionLabelLines?: string[];
  hand?: BaseHand;
  widthUnits?: number;
  shape?: KeycapShape;
};

export type ChallengeQueue = {
  current: ChallengeEntry;
  upcoming: ChallengeEntry[];
};

export type PendingRetry = {
  id: number;
  entry: ChallengeEntry;
  dueAt: number;
  remainingSteps: number;
};

export type TypingFontPreset = {
  id: TypingFontPresetId;
  label: string;
  fontFamily: string;
};

export type AppTheme = "light" | "dark";

export type KeyboardLayoutId = "us" | "jis";

export type KeyboardLayoutDefinition = {
  id: KeyboardLayoutId;
  label: string;
  rows: KeyboardKey[][];
};
