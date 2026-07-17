import { createSignal } from "solid-js";
import { createFeedbackAudio } from "../../audio/feedbackAudio";
import { writeStoredValue } from "../../storage/persistence";
import { buildUpcoming, pickRandomChallenge } from "../game/challenge";
import type { KanaFeedback, KanaScript } from "../game/types";

export const kanaScriptStorageKey = "shot-key:kana-script";
export const kanaMissLockMs = 600;

/**
 * 저장된 카나 스크립트를 읽는다.
 */
export function readStoredKanaScript(): KanaScript {
  if (typeof window === "undefined") {
    return "hiragana";
  }
  try {
    const stored = window.localStorage.getItem(kanaScriptStorageKey);
    if (stored === "hiragana" || stored === "katakana") {
      return stored;
    }
  } catch {
    // localStorage 불가 시 기본값
  }
  return "hiragana";
}

/**
 * 카나 미니게임 세션 상태를 생성한다. (keydown 없음)
 */
export function createKanaSession() {
  const feedbackAudio = createFeedbackAudio();
  const initialScript = readStoredKanaScript();
  const initialChallenge = pickRandomChallenge(initialScript);

  const [script, setScriptState] = createSignal<KanaScript>(initialScript);
  const [challenge, setChallenge] = createSignal(initialChallenge);
  const [upcoming, setUpcoming] = createSignal(
    buildUpcoming(initialScript, initialChallenge.character),
  );
  const [score, setScore] = createSignal(0);
  const [streak, setStreak] = createSignal(0);
  const [feedback, setFeedback] = createSignal<KanaFeedback>("ready");
  const [isInputLocked, setIsInputLocked] = createSignal(false);
  const [soundEnabled, setSoundEnabledState] = createSignal(true);

  let lockTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * 스크립트에 맞춰 출제·미리보기를 다시 뽑는다.
   */
  function reshuffle(nextScript: KanaScript) {
    const next = pickRandomChallenge(nextScript);
    setChallenge(next);
    setUpcoming(buildUpcoming(nextScript, next.character));
    setFeedback("ready");
  }

  /**
   * 히라가나/카타카나를 전환한다.
   */
  function setScript(next: KanaScript) {
    setScriptState(next);
    writeStoredValue(kanaScriptStorageKey, next);
    setScore(0);
    setStreak(0);
    clearLock();
    reshuffle(next);
  }

  /**
   * 입력 잠금을 해제한다.
   */
  function clearLock() {
    if (lockTimer !== null) {
      clearTimeout(lockTimer);
      lockTimer = null;
    }
    setIsInputLocked(false);
  }

  /**
   * MISS 후 짧게 입력을 잠근다.
   */
  function lockInput() {
    clearLock();
    setIsInputLocked(true);
    lockTimer = setTimeout(() => {
      lockTimer = null;
      setIsInputLocked(false);
    }, kanaMissLockMs);
  }

  /**
   * 플릭/탭으로 확정된 문자를 판정한다.
   */
  function submitCharacter(character: string) {
    if (isInputLocked()) {
      return;
    }

    const current = challenge().character;
    if (character === current) {
      setScore((value) => value + 1);
      setStreak((value) => value + 1);
      setFeedback("hit");
      if (soundEnabled()) {
        feedbackAudio.triggerAudioFeedback("ok");
      }

      const queue = upcoming();
      const nextCharacter = queue[0] ?? pickRandomChallenge(script()).character;
      const rest = queue.slice(1);
      while (rest.length < 3) {
        const filler = pickRandomChallenge(
          script(),
          rest[rest.length - 1] ?? nextCharacter,
        ).character;
        rest.push(filler);
      }
      setChallenge({ character: nextCharacter });
      setUpcoming(rest);
      return;
    }

    setStreak(0);
    setFeedback("miss");
    if (soundEnabled()) {
      feedbackAudio.triggerAudioFeedback("miss");
    }
    lockInput();
  }

  /**
   * 점수·출제를 초기화한다.
   */
  function restart() {
    setScore(0);
    setStreak(0);
    clearLock();
    reshuffle(script());
  }

  /**
   * 효과음 on/off.
   */
  function setSoundEnabled(enabled: boolean) {
    setSoundEnabledState(enabled);
    feedbackAudio.setSoundEnabled(enabled);
  }

  return {
    script,
    setScript,
    challenge,
    upcoming,
    score,
    streak,
    feedback,
    isInputLocked,
    soundEnabled,
    setSoundEnabled,
    submitCharacter,
    restart,
  };
}
