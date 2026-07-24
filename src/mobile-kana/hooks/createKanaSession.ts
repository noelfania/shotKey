import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  type JSX,
} from "solid-js";
import {
  createFeedbackAudio,
  type FeedbackAudioTone,
} from "../../audio/feedbackAudio";
import {
  decayIntervalMs,
  gaugeMax,
  missPenalty,
  startingGauge,
} from "../../game/constants";
import { formatElapsedDisplay } from "../../game/formatting";
import {
  getGaugeDecayPerTick,
  getRewardBySpeed,
} from "../../game/scoring";
import { writeStoredValue } from "../../storage/persistence";
import { buildUpcoming, pickRandomChallenge } from "../game/challenge";
import {
  buildKanaCharacterRiskMap,
  getWeakestKanaCharacters,
  readStoredKanaCharacterStats,
  updateKanaStatsOnHit,
  updateKanaStatsOnMiss,
  writeStoredKanaCharacterStats,
} from "../game/kanaStats";
import type {
  KanaCharacterStats,
  KanaFeedback,
  KanaScript,
} from "../game/types";

export const kanaScriptStorageKey = "shot-key:kana-script";
export const kanaMissLockMs = 600;

const readyFeedback: KanaFeedback = {
  label: "READY",
  tone: "ready",
  detail: "Flick or tap the matching kana",
};

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
  const initialStats = readStoredKanaCharacterStats(initialScript);

  const [script, setScriptState] = createSignal<KanaScript>(initialScript);
  const [challenge, setChallenge] = createSignal(initialChallenge);
  const [upcoming, setUpcoming] = createSignal(
    buildUpcoming(initialScript, initialChallenge.character),
  );
  const [characterStats, setCharacterStats] =
    createSignal<KanaCharacterStats>(initialStats);
  const [feedback, setFeedback] = createSignal<KanaFeedback>(readyFeedback);
  const [isInputLocked, setIsInputLocked] = createSignal(false);
  const [soundEnabled, setSoundEnabledState] = createSignal(true);
  const [gauge, setGauge] = createSignal(startingGauge);
  const [hasStarted, setHasStarted] = createSignal(false);
  const [timeoutElapsedMs, setTimeoutElapsedMs] = createSignal<number | null>(
    null,
  );

  let lockTimer: ReturnType<typeof setTimeout> | null = null;
  let challengeStartedAt = Date.now();
  let sessionStartedAt = 0;
  let promptEl: HTMLElement | undefined;

  const canAcceptInput = createMemo(() => gauge() > 0);
  const isRunning = createMemo(() => hasStarted() && canAcceptInput());

  const characterRiskMap = createMemo(() =>
    buildKanaCharacterRiskMap(characterStats()),
  );
  const weakestCharacters = createMemo(() =>
    getWeakestKanaCharacters(characterStats(), 5),
  );

  const gaugeFillStyle = createMemo(() => {
    const currentGauge = gauge();
    const clampedGauge = Math.max(0, Math.min(currentGauge, gaugeMax));
    const gaugeRatio = clampedGauge / gaugeMax;
    const glowAlpha = 0.18 + gaugeRatio * 0.2;
    const gaugeLowStart = [255, 95, 95] as const;
    const gaugeLowEnd = [255, 150, 102] as const;
    const gaugeHigh = [109, 247, 193] as const;
    const blendChannel = (low: number, high: number) => {
      return Math.round(low + (high - low) * gaugeRatio);
    };
    const startColor = gaugeLowStart.map((channel, index) =>
      blendChannel(channel, gaugeHigh[index]),
    );
    const endColor = gaugeLowEnd.map((channel, index) =>
      blendChannel(channel, gaugeHigh[index]),
    );

    return {
      width: `${clampedGauge}%`,
      "--gauge-fill-start": `rgb(${startColor.join(", ")})`,
      "--gauge-fill-end": `rgb(${endColor.join(", ")})`,
      "--gauge-fill-shadow": `rgba(${endColor.join(", ")}, ${glowAlpha})`,
    } as JSX.CSSProperties;
  });

  const feedbackDetailAccent = createMemo(() => {
    const current = feedback();
    if (
      current.label === "TIME OUT" &&
      current.tone === "gameover" &&
      timeoutElapsedMs() !== null
    ) {
      return formatElapsedDisplay(timeoutElapsedMs()!);
    }
    return null;
  });

  /**
   * 프롬프트 DOM을 등록한다. (판정 애니메이션용)
   * @param el 프롬프트 루트 요소
   */
  function setPromptRef(el: HTMLElement | undefined) {
    promptEl = el;
  }

  /**
   * 애니메이션 클래스를 강제로 다시 재생한다.
   * @param element 대상 요소
   * @param className 재생할 클래스
   */
  function retriggerAnimationClass(
    element: HTMLElement | undefined,
    className: string,
  ) {
    if (!element || !className) {
      return;
    }
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  }

  /**
   * 판정에 맞는 프롬프트 애니메이션을 재생한다.
   * @param kind hit, perfect, miss 중 하나
   */
  function triggerVisualFeedback(kind: "hit" | "perfect" | "miss") {
    if (kind === "miss") {
      retriggerAnimationClass(promptEl, "is-miss-shake");
      return;
    }
    if (kind === "perfect") {
      retriggerAnimationClass(promptEl, "is-perfect-pop");
      return;
    }
    retriggerAnimationClass(promptEl, "is-hit-flash");
  }

  /**
   * 스크립트에 맞춰 출제·미리보기를 다시 뽑는다.
   * @param nextScript 적용할 스크립트
   */
  function reshuffle(nextScript: KanaScript) {
    const next = pickRandomChallenge(nextScript);
    setChallenge(next);
    setUpcoming(buildUpcoming(nextScript, next.character));
    setFeedback(readyFeedback);
    challengeStartedAt = Date.now();
  }

  /**
   * 통계를 갱신하고 저장한다.
   * @param nextStats 저장할 문자 통계
   */
  function persistStats(nextStats: KanaCharacterStats) {
    setCharacterStats(nextStats);
    writeStoredKanaCharacterStats(script(), nextStats);
  }

  /**
   * 히라가나/카타카나를 전환한다.
   * @param next 전환할 스크립트
   */
  function setScript(next: KanaScript) {
    setScriptState(next);
    writeStoredValue(kanaScriptStorageKey, next);
    setCharacterStats(readStoredKanaCharacterStats(next));
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
   * TIME OUT 피드백을 세팅한다.
   * @param elapsedMs 세션 경과 시간
   */
  function applyTimeout(elapsedMs: number) {
    setTimeoutElapsedMs(elapsedMs);
    setFeedback({
      label: "TIME OUT",
      tone: "gameover",
      detail: "Gauge depleted",
    });
  }

  /**
   * 다음 출제 문자로 큐를 한 칸 전진한다.
   */
  function advanceChallenge() {
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
    challengeStartedAt = Date.now();
  }

  /**
   * 플릭/탭으로 확정된 문자를 판정한다.
   * @param character 확정된 입력 문자
   */
  function submitCharacter(character: string) {
    if (!canAcceptInput() || isInputLocked()) {
      return;
    }

    if (!hasStarted()) {
      setHasStarted(true);
      sessionStartedAt = Date.now();
    }

    const current = challenge().character;
    if (character === current) {
      const elapsedMs = Date.now() - challengeStartedAt;
      const reward = getRewardBySpeed(elapsedMs);

      persistStats(updateKanaStatsOnHit(characterStats(), current));
      setGauge((currentGauge) =>
        Math.min(gaugeMax, currentGauge + reward.gaugeGain),
      );
      setFeedback(reward.feedback);
      if (soundEnabled()) {
        feedbackAudio.triggerAudioFeedback(
          reward.feedback.tone as FeedbackAudioTone,
        );
      }
      triggerVisualFeedback(
        reward.feedback.tone === "perfect" ? "perfect" : "hit",
      );
      advanceChallenge();
      return;
    }

    persistStats(updateKanaStatsOnMiss(characterStats(), current));
    const currentGauge = gauge();
    const nextGauge = Math.max(0, currentGauge - missPenalty);
    const didTimeoutByMiss = nextGauge === 0 && currentGauge > 0;
    const elapsedMs =
      sessionStartedAt > 0 ? Date.now() - sessionStartedAt : 0;

    setGauge(nextGauge);
    setTimeoutElapsedMs(didTimeoutByMiss ? elapsedMs : null);

    if (didTimeoutByMiss) {
      clearLock();
      applyTimeout(elapsedMs);
    } else {
      setFeedback({
        label: "MISS",
        tone: "miss",
        detail: "Wrong kana — try again",
      });
      lockInput();
    }

    if (soundEnabled()) {
      feedbackAudio.triggerAudioFeedback("miss");
    }
    triggerVisualFeedback("miss");
  }

  /**
   * 게이지·스트릭·출제를 초기화한다. (누적 통계는 유지)
   */
  function restart() {
    clearLock();
    setGauge(startingGauge);
    setHasStarted(false);
    setTimeoutElapsedMs(null);
    sessionStartedAt = 0;
    reshuffle(script());
  }

  /**
   * 효과음 on/off. 켤 때는 iOS unlock(+ 확인음)을 시도한다.
   * @param enabled 효과음 사용 여부
   * @param options.playChime 토글 제스처에서 확인음 재생
   */
  function setSoundEnabled(
    enabled: boolean,
    options?: { playChime?: boolean },
  ) {
    setSoundEnabledState(enabled);
    feedbackAudio.setSoundEnabled(enabled, options);
  }

  /**
   * 플릭 pointerdown 등 사용자 제스처에서 오디오 잠금을 푼다.
   */
  function unlockAudio() {
    feedbackAudio.unlockAudio();
  }

  createEffect(() => {
    if (!isRunning()) {
      return;
    }

    const decayTimer = window.setInterval(() => {
      setGauge((currentGauge) => {
        const nextGauge = Math.max(
          0,
          currentGauge - getGaugeDecayPerTick(currentGauge),
        );

        if (nextGauge === 0 && currentGauge > 0) {
          const elapsedMs =
            sessionStartedAt > 0 ? Date.now() - sessionStartedAt : 0;
          applyTimeout(elapsedMs);
        }

        return nextGauge;
      });
    }, decayIntervalMs);

    onCleanup(() => {
      window.clearInterval(decayTimer);
    });
  });

  return {
    script,
    setScript,
    challenge,
    upcoming,
    characterStats,
    characterRiskMap,
    weakestCharacters,
    feedback,
    feedbackDetailAccent,
    isInputLocked,
    soundEnabled,
    setSoundEnabled,
    unlockAudio,
    gauge,
    gaugeFillStyle,
    hasStarted,
    canAcceptInput,
    setPromptRef,
    submitCharacter,
    restart,
  };
}
