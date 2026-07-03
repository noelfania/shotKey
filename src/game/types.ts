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

export type KeyboardKey = {
  id: string;
  kind: "char" | "action";
  base?: string;
  shifted?: string;
  helperShiftKeyId?: ShiftKeyId;
  actionLabel?: string;
  hand?: BaseHand;
  widthUnits?: number;
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
