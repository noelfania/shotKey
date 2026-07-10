import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  type JSX,
} from "solid-js";
import { createFeedbackAudio, type FeedbackAudioTone } from "../audio/feedbackAudio";
import {
  advanceChallengeQueueWithRetries,
  createChallengeQueue,
  getRandomRetryGap,
} from "../game/challengeQueue";
import {
  bestScoreStorageKey,
  bestStreakStorageKey,
  bestSurvivalStorageKey,
  characterStatsStorageKey,
  decayIntervalMs,
  endlessModeStorageKey,
  gaugeMax,
  keyboardHintsVisibleStorageKey,
  keyboardLayoutStorageKey,
  keyboardPanelVisibleStorageKey,
  keycapFlashDurationMs,
  missLockMs,
  missPenalty,
  previewCount,
  retryDelayMs,
  soundEnabledStorageKey,
  startingGauge,
  trainingModeStorageKey,
  typedKeyFlashEnabledStorageKey,
  typingFontPresets,
  typingFontStorageKey,
  visualEffectsStorageKey,
} from "../game/constants";
import {
  formatElapsedDisplay,
  getGroupLabel,
  getModeOption,
} from "../game/formatting";
import {
  getKeyboardEventKeyId,
  getKeyboardKeyMap,
  getKeyboardKeys,
  getKeyboardRows,
} from "../game/keyboardLayout";
import { getGaugeDecayPerTick, getRewardBySpeed } from "../game/scoring";
import {
  createEmptyHandStats,
  getSmoothedMissRate,
  getVisualRiskAlpha,
  updateCharacterStatsOnHit,
  updateCharacterStatsOnMiss,
  updateHandStats,
} from "../game/stats";
import type {
  ChallengeEntry,
  ChallengeQueue,
  CharacterStats,
  FeedbackState,
  HandStats,
  KeyboardLayoutId,
  PendingRetry,
  TrainingMode,
  TypingFontPresetId,
} from "../game/types";
import {
  readStoredBoolean,
  readStoredCharacterStats,
  readStoredKeyboardLayout,
  readStoredNumber,
  readStoredTrainingMode,
  readStoredTypingFontPreset,
  writeStoredValue,
} from "../storage/persistence";

const placeholderChallenge: ChallengeEntry = {
  character: "a",
  group: "left",
  keyId: "key-a",
  requiresShift: false,
};

const placeholderQueue: ChallengeQueue = {
  current: placeholderChallenge,
  upcoming: [],
};

/**
 * 타이핑 훈련 세션의 상태, 입력 처리, 피드백, 출제 큐 갱신을 관리한다.
 * @returns 화면 컴포넌트에 전달할 반응형 상태와 핸들러
 */
export function createGameSession() {
  const initialLayout = readStoredKeyboardLayout();
  const initialMode = readStoredTrainingMode();
  const initialStats = readStoredCharacterStats();
  const [keyboardLayout, setKeyboardLayoutState] = createSignal<
    KeyboardLayoutId | null
  >(initialLayout);
  const [trainingMode, setTrainingMode] = createSignal<TrainingMode>(
    initialMode,
  );
  const [handStats, setHandStats] = createSignal<HandStats>(
    createEmptyHandStats(),
  );
  const [characterStats, setCharacterStats] =
    createSignal<CharacterStats>(initialStats);
  const [challengeQueue, setChallengeQueue] = createSignal<ChallengeQueue>(
    initialLayout
      ? createChallengeQueue(initialMode, initialStats, initialLayout)
      : placeholderQueue,
  );
  const [pendingRetries, setPendingRetries] = createSignal<PendingRetry[]>([]);
  const [score, setScore] = createSignal(0);
  const [bestScore, setBestScore] = createSignal(
    readStoredNumber(bestScoreStorageKey, 0),
  );
  const [bestStreak, setBestStreak] = createSignal(
    readStoredNumber(bestStreakStorageKey, 0),
  );
  const [streak, setStreak] = createSignal(0);
  const [gauge, setGauge] = createSignal(startingGauge);
  const [endlessModeEnabled, setEndlessModeEnabled] = createSignal(
    readStoredBoolean(endlessModeStorageKey, false),
  );
  const [soundEnabled, setSoundEnabled] = createSignal(
    readStoredBoolean(soundEnabledStorageKey, true),
  );
  const [visualEffectsEnabled, setVisualEffectsEnabled] = createSignal(
    readStoredBoolean(visualEffectsStorageKey, true),
  );
  const [keyboardPanelVisible, setKeyboardPanelVisible] = createSignal(
    readStoredBoolean(keyboardPanelVisibleStorageKey, true),
  );
  const [keyboardHintsVisible, setKeyboardHintsVisible] = createSignal(
    readStoredBoolean(keyboardHintsVisibleStorageKey, true),
  );
  const [typedKeyFlashEnabled, setTypedKeyFlashEnabled] = createSignal(
    readStoredBoolean(typedKeyFlashEnabledStorageKey, true),
  );
  const [flashedKeyId, setFlashedKeyId] = createSignal<string | null>(null);
  const [selectedFontPresetId, setSelectedFontPresetId] =
    createSignal<TypingFontPresetId>(readStoredTypingFontPreset());
  const [hasStarted, setHasStarted] = createSignal(false);
  const [isInputLocked, setIsInputLocked] = createSignal(false);
  const [lockRemainingMs, setLockRemainingMs] = createSignal(0);
  const [timeoutElapsedMs, setTimeoutElapsedMs] = createSignal<number | null>(
    null,
  );
  const [bestSurvivalMs, setBestSurvivalMs] = createSignal(
    readStoredNumber(bestSurvivalStorageKey, 0),
  );
  const [feedback, setFeedback] = createSignal<FeedbackState>({
    label: "READY",
    tone: "ready",
    detail: "Type the character shown",
  });

  let challengeStartedAt = 0;
  let sessionStartedAt = 0;
  let missLockTimer: number | null = null;
  let missLockEndsAt = 0;
  let retryId = 0;
  let keycapFlashTimer: number | null = null;
  let keycapFlashFrame: number | null = null;
  let challengeCardEl: HTMLDivElement | undefined;

  const canAcceptInput = createMemo(
    () => keyboardLayout() !== null && (endlessModeEnabled() || gauge() > 0),
  );
  const isRunning = createMemo(() => hasStarted() && canAcceptInput());
  const selectedFontPreset = createMemo(
    () =>
      typingFontPresets.find((preset) => preset.id === selectedFontPresetId()) ??
      typingFontPresets[0],
  );
  const keyboardRows = createMemo(() => {
    const layoutId = keyboardLayout();

    return layoutId ? getKeyboardRows(layoutId) : [];
  });
  const keyboardKeyMap = createMemo(() => {
    const layoutId = keyboardLayout();

    return layoutId ? getKeyboardKeyMap(layoutId) : {};
  });
  const keyboardKeys = createMemo(() => {
    const layoutId = keyboardLayout();

    return layoutId ? getKeyboardKeys(layoutId) : [];
  });
  const challenge = createMemo(() => challengeQueue().current);
  const upcomingChallenges = createMemo(() => challengeQueue().upcoming);
  const previewOpacities = createMemo(() => {
    const maxOpacity = 0.3;
    const minOpacity = 0.1;

    if (previewCount <= 1) {
      return [maxOpacity];
    }

    return Array.from({ length: previewCount }, (_, index) => {
      const ratio = index / (previewCount - 1);

      return maxOpacity - (maxOpacity - minOpacity) * ratio;
    });
  });
  const keyboardShiftKeyId = createMemo(() => {
    const current = challenge();
    const activeKeyboardKey = keyboardKeyMap()[current.keyId];

    return current.requiresShift &&
      activeKeyboardKey?.kind === "char" &&
      activeKeyboardKey.helperShiftKeyId
      ? activeKeyboardKey.helperShiftKeyId
      : null;
  });
  const keyRiskMap = createMemo(() => {
    const nextRiskMap: Record<string, number> = {};
    const stats = characterStats();

    keyboardKeys().forEach((key) => {
      if (key.kind !== "char") {
        return;
      }

      const characters = [key.base, key.shifted].filter(
        (value): value is string => typeof value === "string",
      );
      const riskAlpha = characters.reduce((maxRisk, character) => {
        return Math.max(maxRisk, getVisualRiskAlpha(stats[character]));
      }, 0);

      nextRiskMap[key.id] = riskAlpha;
    });

    return nextRiskMap;
  });
  const highlightedWeakKeys = createMemo(
    () => Object.values(keyRiskMap()).filter((risk) => risk >= 0.45).length,
  );
  const mostMissedCharacters = createMemo(() => {
    return Object.entries(characterStats())
      .filter(([, stat]) => stat.attempts >= 5 && stat.miss > 0)
      .sort(([, leftStat], [, rightStat]) => {
        const leftMissRate = getSmoothedMissRate(leftStat);
        const rightMissRate = getSmoothedMissRate(rightStat);

        if (rightMissRate !== leftMissRate) {
          return rightMissRate - leftMissRate;
        }

        if (rightStat.attempts !== leftStat.attempts) {
          return rightStat.attempts - leftStat.attempts;
        }

        return rightStat.miss - leftStat.miss;
      })
      .slice(0, 5)
      .map(([character, stat]) => ({
        character,
        missRateLabel: `${Math.round(getSmoothedMissRate(stat) * 100)}%`,
        sampleLabel: `(${stat.miss}/${stat.attempts})`,
      }));
  });
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
  const appStyle = createMemo(
    () =>
      ({
        "--typing-display-font": selectedFontPreset().fontFamily,
      }) as JSX.CSSProperties,
  );
  const feedbackDetailAccent = createMemo(() => {
    const currentFeedback = feedback();

    return currentFeedback.tone === "miss" && isInputLocked()
      ? `${Math.max(0, Math.ceil(lockRemainingMs()))}ms`
      : !endlessModeEnabled() &&
          currentFeedback.label === "TIME OUT" &&
          timeoutElapsedMs() !== null
        ? formatElapsedDisplay(timeoutElapsedMs()!)
        : null;
  });

  const feedbackAudio = createFeedbackAudio();

  createEffect(() => {
    feedbackAudio.setSoundEnabled(soundEnabled());
  });

  /**
   * 챌린지 카드 DOM 참조를 저장한다.
   * @param element 연결된 카드 요소
   */
  const setChallengeCardRef = (element: HTMLDivElement) => {
    challengeCardEl = element;
  };

  /**
   * 남아 있는 키캡 반짝 타이머를 정리하고 현재 반짝 상태를 비운다.
   */
  const clearTypedKeyFlash = () => {
    if (keycapFlashTimer !== null) {
      window.clearTimeout(keycapFlashTimer);
      keycapFlashTimer = null;
    }

    if (keycapFlashFrame !== null) {
      window.cancelAnimationFrame(keycapFlashFrame);
      keycapFlashFrame = null;
    }

    setFlashedKeyId(null);
  };

  /**
   * 실제 입력한 키캡에 짧은 흰색 반짝 효과를 재생한다.
   * @param keyId 반짝 효과를 줄 키보드 패널 key id
   */
  const triggerTypedKeyFlash = (keyId: string | null) => {
    if (!typedKeyFlashEnabled() || keyId === null) {
      return;
    }

    clearTypedKeyFlash();
    keycapFlashFrame = window.requestAnimationFrame(() => {
      setFlashedKeyId(keyId);
      keycapFlashFrame = null;
      keycapFlashTimer = window.setTimeout(() => {
        setFlashedKeyId(null);
        keycapFlashTimer = null;
      }, keycapFlashDurationMs);
    });
  };

  /**
   * 동일한 애니메이션 클래스도 다시 재생되도록 강제로 재적용한다.
   * @param element 애니메이션을 적용할 대상 요소
   * @param className 다시 붙일 애니메이션 클래스
   */
  const retriggerAnimationClass = (
    element: HTMLDivElement | undefined,
    className: string,
  ) => {
    if (element === undefined) {
      return;
    }

    element.classList.remove(
      "is-hit-flash",
      "is-perfect-pop",
      "is-miss-shake",
      className,
    );
    void element.offsetWidth;
    element.classList.add(className);
  };

  /**
   * 판정 종류에 맞는 카드 애니메이션을 재생한다.
   * @param kind hit, perfect, miss 중 하나
   */
  const triggerVisualFeedback = (kind: "hit" | "perfect" | "miss") => {
    if (!visualEffectsEnabled()) {
      return;
    }

    if (kind === "miss") {
      retriggerAnimationClass(challengeCardEl, "is-miss-shake");
      return;
    }

    retriggerAnimationClass(
      challengeCardEl,
      kind === "perfect" ? "is-perfect-pop" : "",
    );
  };

  /**
   * 현재 세션 상태를 초기화하고 새 모드 기준으로 게임을 다시 시작한다.
   * @param nextMode 재시작 시 적용할 훈련 모드, 생략 시 현재 모드 유지
   */
  const resetGame = (nextMode: TrainingMode = trainingMode()) => {
    const nextModeOption = getModeOption(nextMode);
    const layoutId = keyboardLayout();

    if (missLockTimer !== null) {
      window.clearTimeout(missLockTimer);
      missLockTimer = null;
    }

    missLockEndsAt = 0;
    challengeStartedAt = Date.now();
    setTrainingMode(nextMode);
    setHandStats(createEmptyHandStats());
    setChallengeQueue(
      layoutId
        ? createChallengeQueue(nextMode, characterStats(), layoutId)
        : placeholderQueue,
    );
    setPendingRetries([]);
    setScore(0);
    setStreak(0);
    setGauge(startingGauge);
    setHasStarted(false);
    setIsInputLocked(false);
    setLockRemainingMs(0);
    setTimeoutElapsedMs(null);
    sessionStartedAt = 0;
    setFeedback({
      label: "READY",
      tone: "ready",
      detail: `Starting ${nextModeOption.label} mode training`,
    });
  };

  /**
   * 키보드 레이아웃을 저장하고 세션을 새 레이아웃 기준으로 재시작한다.
   * @param nextLayout us 또는 jis
   */
  const setKeyboardLayout = (nextLayout: KeyboardLayoutId) => {
    setKeyboardLayoutState(nextLayout);
    writeStoredValue(keyboardLayoutStorageKey, nextLayout);
    resetGame(trainingMode());
  };

  onMount(() => {
    challengeStartedAt = Date.now();
  });

  createEffect(() => {
    writeStoredValue(trainingModeStorageKey, trainingMode());
  });
  createEffect(() => {
    writeStoredValue(endlessModeStorageKey, String(endlessModeEnabled()));
  });
  createEffect(() => {
    writeStoredValue(soundEnabledStorageKey, String(soundEnabled()));
  });
  createEffect(() => {
    writeStoredValue(visualEffectsStorageKey, String(visualEffectsEnabled()));
  });
  createEffect(() => {
    writeStoredValue(
      keyboardPanelVisibleStorageKey,
      String(keyboardPanelVisible()),
    );
  });
  createEffect(() => {
    writeStoredValue(
      keyboardHintsVisibleStorageKey,
      String(keyboardHintsVisible()),
    );
  });
  createEffect(() => {
    writeStoredValue(
      typedKeyFlashEnabledStorageKey,
      String(typedKeyFlashEnabled()),
    );
  });
  createEffect(() => {
    writeStoredValue(typingFontStorageKey, selectedFontPresetId());
  });
  createEffect(() => {
    writeStoredValue(
      characterStatsStorageKey,
      JSON.stringify(characterStats()),
    );
  });
  createEffect(() => {
    writeStoredValue(bestScoreStorageKey, String(bestScore()));
  });
  createEffect(() => {
    writeStoredValue(bestStreakStorageKey, String(bestStreak()));
  });
  createEffect(() => {
    writeStoredValue(bestSurvivalStorageKey, String(bestSurvivalMs()));
  });

  onCleanup(() => {
    if (missLockTimer !== null) {
      window.clearTimeout(missLockTimer);
    }

    clearTypedKeyFlash();
    feedbackAudio.closeAudioContext();
  });

  createEffect(() => {
    if (!isInputLocked()) {
      return;
    }

    const countdownTimer = window.setInterval(() => {
      const remainingMs = Math.max(0, missLockEndsAt - Date.now());
      setLockRemainingMs(remainingMs);
    }, 16);

    onCleanup(() => {
      window.clearInterval(countdownTimer);
    });
  });

  createEffect(() => {
    if (!isRunning()) {
      return;
    }

    const isEndless = endlessModeEnabled();

    const decayTimer = window.setInterval(() => {
      setGauge((currentGauge) => {
        const nextGauge = Math.max(
          0,
          currentGauge - getGaugeDecayPerTick(currentGauge),
        );

        if (nextGauge === 0 && currentGauge > 0) {
          setStreak(0);
          const elapsedMs =
            sessionStartedAt > 0 ? Date.now() - sessionStartedAt : 0;

          setTimeoutElapsedMs(elapsedMs);
          if (!isEndless) {
            setBestSurvivalMs((currentBest) =>
              Math.max(currentBest, elapsedMs),
            );
          }
          setFeedback(
            isEndless
              ? {
                  label: "TIME OUT",
                  tone: "timeout",
                  detail: "Reached 0%, continuing in Endless mode",
                }
              : {
                  label: "TIME OUT",
                  tone: "gameover",
                  detail: "Gauge depleted",
                },
          );
        }

        return nextGauge;
      });
    }, decayIntervalMs);

    onCleanup(() => {
      window.clearInterval(decayTimer);
    });
  });

  onMount(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }

      triggerTypedKeyFlash(getKeyboardEventKeyId(event.code));

      if (event.ctrlKey && event.key === "Enter") {
        event.preventDefault();
        resetGame();
        return;
      }

      if (!canAcceptInput() || isInputLocked() || event.key === "Shift") {
        return;
      }

      if (keyboardLayout() === null) {
        return;
      }

      const pressedKey = event.key;

      if (pressedKey.length !== 1) {
        return;
      }

      if (!hasStarted()) {
        setHasStarted(true);
        sessionStartedAt = Date.now();
      }

      const currentChallenge = challenge();

      console.info(
        `challenge.character: ${currentChallenge.character}, pressedKey: ${pressedKey}`,
      );

      if (pressedKey === currentChallenge.character) {
        const elapsedMs = Date.now() - challengeStartedAt;
        const reward = getRewardBySpeed(elapsedMs);
        const nextHandStats = updateHandStats(
          handStats(),
          currentChallenge.group,
          "hit",
        );
        const nextCharacterStats = updateCharacterStatsOnHit(
          characterStats(),
          currentChallenge.character,
          elapsedMs,
        );
        const advanceResult = advanceChallengeQueueWithRetries(
          challengeQueue(),
          trainingMode(),
          nextCharacterStats,
          keyboardLayout()!,
          pendingRetries(),
          Date.now(),
        );

        setHandStats(nextHandStats);
        setCharacterStats(nextCharacterStats);
        setPendingRetries(advanceResult.pendingRetries);
        setChallengeQueue(advanceResult.queue);
        challengeStartedAt = Date.now();
        setGauge((currentGauge) =>
          Math.min(gaugeMax, currentGauge + reward.gaugeGain),
        );
        setScore((currentScore) => {
          const nextScore = currentScore + reward.scoreGain;

          if (!endlessModeEnabled()) {
            setBestScore((currentBest) => Math.max(currentBest, nextScore));
          }
          return nextScore;
        });
        setStreak((currentStreak) => {
          const nextStreak = currentStreak + 1;

          setBestStreak((currentBest) => Math.max(currentBest, nextStreak));
          return nextStreak;
        });
        setFeedback({
          ...reward.feedback,
          detail: `${getGroupLabel(currentChallenge.group)} ${reward.feedback.detail}`,
        });
        feedbackAudio.triggerAudioFeedback(
          reward.feedback.tone as FeedbackAudioTone,
        );
        triggerVisualFeedback(
          reward.feedback.tone === "perfect" ? "perfect" : "hit",
        );
        return;
      }

      const nextHandStats = updateHandStats(
        handStats(),
        currentChallenge.group,
        "miss",
      );
      const nextCharacterStats = updateCharacterStatsOnMiss(
        characterStats(),
        currentChallenge.character,
      );

      setHandStats(nextHandStats);
      setCharacterStats(nextCharacterStats);
      setPendingRetries((currentRetries) => {
        const nextRetry: PendingRetry = {
          id: retryId,
          entry: currentChallenge,
          dueAt: Date.now() + retryDelayMs,
          remainingSteps: getRandomRetryGap(),
        };
        retryId += 1;

        const filteredRetries = currentRetries.filter(
          (retry) => retry.entry.character !== currentChallenge.character,
        );

        return [...filteredRetries, nextRetry];
      });
      const currentGauge = gauge();
      const nextGauge = Math.max(0, currentGauge - missPenalty);
      const didTimeoutByMiss = nextGauge === 0 && currentGauge > 0;
      const elapsedMs =
        sessionStartedAt > 0 ? Date.now() - sessionStartedAt : 0;

      setGauge(nextGauge);
      setStreak(0);
      setTimeoutElapsedMs(didTimeoutByMiss ? elapsedMs : null);
      if (didTimeoutByMiss && !endlessModeEnabled()) {
        setBestSurvivalMs((currentBest) => Math.max(currentBest, elapsedMs));
      }

      if (!didTimeoutByMiss || endlessModeEnabled()) {
        setIsInputLocked(true);
        missLockEndsAt = Date.now() + missLockMs;
        setLockRemainingMs(missLockMs);

        if (missLockTimer !== null) {
          window.clearTimeout(missLockTimer);
        }

        missLockTimer = window.setTimeout(() => {
          setIsInputLocked(false);
          setLockRemainingMs(0);
          missLockEndsAt = 0;
          missLockTimer = null;
        }, missLockMs);
      } else {
        setIsInputLocked(false);
        setLockRemainingMs(0);
        missLockEndsAt = 0;
      }

      setFeedback(
        didTimeoutByMiss
          ? endlessModeEnabled()
            ? {
                label: "TIME OUT",
                tone: "timeout",
                detail: "Reached 0%, continuing in Endless mode",
              }
            : {
                label: "TIME OUT",
                tone: "gameover",
                detail: "Gauge depleted",
              }
          : {
              label: "MISS",
              tone: "miss",
              detail: `${getGroupLabel(currentChallenge.group)}: typed "${pressedKey}", input locked for 1s`,
            },
      );
      feedbackAudio.triggerAudioFeedback("miss");
      triggerVisualFeedback("miss");
    };

    window.addEventListener("keydown", handleKeyDown);

    onCleanup(() => {
      window.removeEventListener("keydown", handleKeyDown);
    });
  });

  return {
    appStyle,
    bestScore,
    bestStreak,
    bestSurvivalMs,
    challenge,
    setChallengeCardRef,
    clearTypedKeyFlash,
    endlessModeEnabled,
    feedback,
    feedbackDetailAccent,
    flashedKeyId,
    gauge,
    gaugeFillStyle,
    handStats,
    hasStarted,
    highlightedWeakKeys,
    isInputLocked,
    isRunning,
    keyboardHintsVisible,
    keyboardLayout,
    keyboardPanelVisible,
    keyboardRows,
    keyboardShiftKeyId,
    keyRiskMap,
    lockRemainingMs,
    mostMissedCharacters,
    previewOpacities,
    resetGame,
    score,
    selectedFontPresetId,
    setEndlessModeEnabled,
    setKeyboardHintsVisible,
    setKeyboardLayout,
    setKeyboardPanelVisible,
    setSelectedFontPresetId,
    setSoundEnabled,
    setTypedKeyFlashEnabled,
    setVisualEffectsEnabled,
    soundEnabled,
    streak,
    trainingMode,
    typedKeyFlashEnabled,
    upcomingChallenges,
    visualEffectsEnabled,
  };
}

export type GameSession = ReturnType<typeof createGameSession>;
