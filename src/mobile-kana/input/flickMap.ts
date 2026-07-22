import type { FlickDirection, FlickKeyId, KanaScript } from "../game/types";

type FlickCell = Partial<Record<FlickDirection, string>>;

/** 구두점 플릭 키 (히라/카타 공통): 탭=、 상=? 좌=。 우=! */
const punctuationFlick: FlickCell = {
  center: "、",
  up: "?",
  left: "。",
  right: "!",
};

/** 표준 일본 10키 플릭(기본 50음 + 구두점). center=탭, 나머지는 방향 플릭 */
const hiraganaFlickMap: Record<FlickKeyId, FlickCell> = {
  a: { center: "あ", left: "い", up: "う", right: "え", down: "お" },
  ka: { center: "か", left: "き", up: "く", right: "け", down: "こ" },
  sa: { center: "さ", left: "し", up: "す", right: "せ", down: "そ" },
  ta: { center: "た", left: "ち", up: "つ", right: "て", down: "と" },
  na: { center: "な", left: "に", up: "ぬ", right: "ね", down: "の" },
  ha: { center: "は", left: "ひ", up: "ふ", right: "へ", down: "ほ" },
  ma: { center: "ま", left: "み", up: "む", right: "め", down: "も" },
  ya: { center: "や", left: "「", up: "ゆ", right: "」", down: "よ" },
  ra: { center: "ら", left: "り", up: "る", right: "れ", down: "ろ" },
  wa: { center: "わ", left: "を", up: "ん", right: "ー" },
  punct: punctuationFlick,
};

const katakanaFlickMap: Record<FlickKeyId, FlickCell> = {
  a: { center: "ア", left: "イ", up: "ウ", right: "エ", down: "オ" },
  ka: { center: "カ", left: "キ", up: "ク", right: "ケ", down: "コ" },
  sa: { center: "サ", left: "シ", up: "ス", right: "セ", down: "ソ" },
  ta: { center: "タ", left: "チ", up: "ツ", right: "テ", down: "ト" },
  na: { center: "ナ", left: "ニ", up: "ヌ", right: "ネ", down: "ノ" },
  ha: { center: "ハ", left: "ヒ", up: "フ", right: "ヘ", down: "ホ" },
  ma: { center: "マ", left: "ミ", up: "ム", right: "メ", down: "モ" },
  ya: { center: "ヤ", left: "「", up: "ユ", right: "」", down: "ヨ" },
  ra: { center: "ラ", left: "リ", up: "ル", right: "レ", down: "ロ" },
  wa: { center: "ワ", left: "ヲ", up: "ン", right: "ー" },
  punct: punctuationFlick,
};

/**
 * 패드 셀: 실키 / 투명 빈칸 / iOS 기능키 자리 스켈레톤 / 세로 2행 스켈레톤(Enter).
 * 스켈레톤은 입력 없음(장식만).
 */
export type FlickPadCell =
  | FlickKeyId
  | null
  | "skeleton"
  | "skeleton-tall";

/**
 * FlickPad 그리드 (5열 × 4행).
 * 좌열·우열·탁음(^^) 자리는 iOS 불필요 키 스켈레톤. 우하단 Enter는 2행 span.
 * 마지막 행은 Enter span 때문에 4칸만 둔다.
 */
export const flickPadLayout: FlickPadCell[][] = [
  ["skeleton", "a", "ka", "sa", "skeleton"],
  ["skeleton", "ta", "na", "ha", "skeleton"],
  ["skeleton", "ma", "ya", "ra", "skeleton-tall"],
  ["skeleton", "skeleton", "wa", "punct"],
];

/**
 * 키·방향·스크립트에 대응하는 문자를 반환한다.
 */
export function resolveFlickCharacter(
  script: KanaScript,
  keyId: FlickKeyId,
  direction: FlickDirection,
): string | null {
  const map = script === "hiragana" ? hiraganaFlickMap : katakanaFlickMap;
  return map[keyId][direction] ?? null;
}

/**
 * 키캡에 표시할 플릭 셀을 반환한다.
 */
export function getFlickCell(
  script: KanaScript,
  keyId: FlickKeyId,
): FlickCell {
  const map = script === "hiragana" ? hiraganaFlickMap : katakanaFlickMap;
  return map[keyId];
}
