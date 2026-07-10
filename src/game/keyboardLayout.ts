import type {
  ChallengeEntry,
  HandGroup,
  KeyboardKey,
  KeyboardLayoutDefinition,
  KeyboardLayoutId,
} from "./types";

const usKeyboardRows: KeyboardKey[][] = [
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

/** Windows Japanese (JIS) 레이아웃 — 반각/전각 키는 훈련 대상에서 제외 */
const jisKeyboardRows: KeyboardKey[][] = [
  [
    {
      id: "backquote",
      kind: "action",
      actionLabel: "IME",
      widthUnits: 1,
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
      shifted: '"',
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
      shifted: "&",
      hand: "left",
      helperShiftKeyId: "shift-right",
    },
    {
      id: "digit-7",
      kind: "char",
      base: "7",
      shifted: "'",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "digit-8",
      kind: "char",
      base: "8",
      shifted: "(",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "digit-9",
      kind: "char",
      base: "9",
      shifted: ")",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "digit-0",
      kind: "char",
      base: "0",
      hand: "right",
    },
    {
      id: "minus",
      kind: "char",
      base: "-",
      shifted: "=",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "equal",
      kind: "char",
      base: "^",
      shifted: "~",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "intl-yen",
      kind: "char",
      base: "¥",
      shifted: "|",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "backspace",
      kind: "action",
      actionLabel: "Backspace",
      actionLabelLines: ["Back", "Space"],
      widthUnits: 1.5,
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
      base: "@",
      shifted: "`",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "bracket-right",
      kind: "char",
      base: "[",
      shifted: "{",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "enter",
      kind: "action",
      actionLabel: "Enter",
      // 줄기 1.25u에 0.275u 돌출부만 더해 이전 돌출 폭을 절반으로 줄인다.
      widthUnits: 1.525,
      shape: "jis-enter",
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
      shifted: "+",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "quote",
      kind: "char",
      base: ":",
      shifted: "*",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "backslash",
      kind: "char",
      base: "]",
      shifted: "}",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "enter-stem",
      kind: "action",
      actionLabel: "",
      widthUnits: 1.25,
      shape: "jis-enter-slot",
    },
  ],
  [
    {
      id: "shift-left",
      kind: "action",
      actionLabel: "Shift",
      widthUnits: 2.1,
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
      id: "intl-ro",
      kind: "char",
      base: "\\",
      shifted: "_",
      hand: "right",
      helperShiftKeyId: "shift-left",
    },
    {
      id: "shift-right",
      kind: "action",
      actionLabel: "Shift",
      widthUnits: 1.9,
    },
  ],
];

export const keyboardLayouts: Record<
  KeyboardLayoutId,
  KeyboardLayoutDefinition
> = {
  us: {
    id: "us",
    label: "US QWERTY",
    rows: usKeyboardRows,
  },
  jis: {
    id: "jis",
    label: "Japanese",
    rows: jisKeyboardRows,
  },
};

/**
 * 레이아웃 키 배열에서 챌린지 풀을 만든다.
 * @param keys 평탄화된 키보드 키 목록
 */
function buildChallengePool(keys: KeyboardKey[]): ChallengeEntry[] {
  return keys.flatMap((key) => {
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
}

const layoutCache = Object.fromEntries(
  (Object.keys(keyboardLayouts) as KeyboardLayoutId[]).map((id) => {
    const rows = keyboardLayouts[id].rows;
    const keys = rows.flat();
    const pool = buildChallengePool(keys);

    return [
      id,
      {
        rows,
        keys,
        keyMap: Object.fromEntries(keys.map((key) => [key.id, key] as const)),
        challengePool: pool,
        challengePoolsByGroup: {
          left: pool.filter((entry) => entry.group === "left"),
          right: pool.filter((entry) => entry.group === "right"),
        } satisfies Record<HandGroup, ChallengeEntry[]>,
      },
    ] as const;
  }),
) as Record<
  KeyboardLayoutId,
  {
    rows: KeyboardKey[][];
    keys: KeyboardKey[];
    keyMap: Record<string, KeyboardKey>;
    challengePool: ChallengeEntry[];
    challengePoolsByGroup: Record<HandGroup, ChallengeEntry[]>;
  }
>;

/**
 * 레이아웃별 키보드 행을 반환한다.
 * @param layoutId us 또는 jis
 */
export function getKeyboardRows(layoutId: KeyboardLayoutId): KeyboardKey[][] {
  return layoutCache[layoutId].rows;
}

/**
 * 레이아웃별 키 id → KeyboardKey 맵을 반환한다.
 * @param layoutId us 또는 jis
 */
export function getKeyboardKeyMap(
  layoutId: KeyboardLayoutId,
): Record<string, KeyboardKey> {
  return layoutCache[layoutId].keyMap;
}

/**
 * 레이아웃별 평탄화된 키 목록을 반환한다.
 * @param layoutId us 또는 jis
 */
export function getKeyboardKeys(layoutId: KeyboardLayoutId): KeyboardKey[] {
  return layoutCache[layoutId].keys;
}

/**
 * 레이아웃별 챌린지 풀을 반환한다.
 * @param layoutId us 또는 jis
 */
export function getChallengePool(layoutId: KeyboardLayoutId): ChallengeEntry[] {
  return layoutCache[layoutId].challengePool;
}

/**
 * 레이아웃별 손 영역 챌린지 풀을 반환한다.
 * @param layoutId us 또는 jis
 */
export function getChallengePoolsByGroup(
  layoutId: KeyboardLayoutId,
): Record<HandGroup, ChallengeEntry[]> {
  return layoutCache[layoutId].challengePoolsByGroup;
}

/**
 * 브라우저 KeyboardEvent.code 값을 키보드 패널에서 쓰는 key id로 변환한다.
 * @param code 브라우저가 제공하는 물리 키 코드
 * @returns 매핑 가능한 키면 key id, 아니면 null
 */
export function getKeyboardEventKeyId(code: string): string | null {
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
    IntlRo: "intl-ro",
    IntlYen: "intl-yen",
  };

  return keyboardEventCodeMap[code] ?? null;
}
