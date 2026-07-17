import { getGojuonPool } from "./gojuon";
import type { KanaChallenge, KanaScript } from "./types";

const previewCount = 3;

/**
 * 출제 풀에서 무작위 문자를 고른다.
 */
export function pickRandomChallenge(
  script: KanaScript,
  avoid?: string,
): KanaChallenge {
  const pool = getGojuonPool(script);
  if (pool.length === 0) {
    return { character: script === "hiragana" ? "あ" : "ア" };
  }

  let next = pool[Math.floor(Math.random() * pool.length)]!;
  if (pool.length > 1 && avoid !== undefined) {
    let guard = 0;
    while (next === avoid && guard < 8) {
      next = pool[Math.floor(Math.random() * pool.length)]!;
      guard += 1;
    }
  }
  return { character: next };
}

/**
 * 미리보기용 다음 문자 목록을 만든다.
 */
export function buildUpcoming(script: KanaScript, current: string): string[] {
  const upcoming: string[] = [];
  let previous = current;
  for (let i = 0; i < previewCount; i += 1) {
    const next = pickRandomChallenge(script, previous).character;
    upcoming.push(next);
    previous = next;
  }
  return upcoming;
}
