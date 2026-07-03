import type { ChallengeEntry, HandGroup, KeyboardKey } from './types';

export const keyboardRows: KeyboardKey[][] = [
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

export const keyboardKeys = keyboardRows.flat();
export const keyboardKeyMap = Object.fromEntries(
  keyboardKeys.map((key) => [key.id, key] as const),
);

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
  };

  return keyboardEventCodeMap[code] ?? null;
}

export const challengePool = keyboardKeys.flatMap((key) => {
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

export const challengePoolsByGroup: Record<HandGroup, ChallengeEntry[]> = {
  left: challengePool.filter((entry) => entry.group === "left"),
  right: challengePool.filter((entry) => entry.group === "right"),
};