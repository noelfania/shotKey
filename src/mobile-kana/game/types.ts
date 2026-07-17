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
