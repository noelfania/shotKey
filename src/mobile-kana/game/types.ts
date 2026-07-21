export type KanaScript = "hiragana" | "katakana";

export type FlickDirection = "center" | "left" | "up" | "right" | "down";

export type FlickKeyId =
  | "a"
  | "ka"
  | "sa"
  | "ta"
  | "na"
  | "ha"
  | "ma"
  | "ya"
  | "ra"
  | "wa"
  | "punct";

export type KanaChallenge = {
  character: string;
};

export type KanaFeedback = "ready" | "hit" | "miss";

export type KanaRecentOutcome = "hit" | "miss";

export type KanaCharacterStat = {
  attempts: number;
  misses: number;
  recentOutcomes: KanaRecentOutcome[];
};

export type KanaCharacterStats = Record<string, KanaCharacterStat>;

export type KanaWeakCharacter = {
  character: string;
  missRateLabel: string;
  sampleLabel: string;
  risk: number;
};
