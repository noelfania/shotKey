export type FeedbackAudioTone = "ok" | "good" | "perfect" | "miss";

/** 판정 효과음 공통 gain (Web Audio 1.0 = 최대) */
const FEEDBACK_TONE_VOLUME = 1;

/**
 * 효과음 재생 함수 묶음을 생성한다.
 * iOS/WebKit은 AudioContext가 suspended로 시작하므로,
 * 사용자 제스처에서 unlock하고 resume 완료 뒤에만 톤을 재생한다.
 * @returns AudioContext 준비, 톤 재생, 판정별 피드백 재생 함수
 */
export function createFeedbackAudio() {
  const audioContextRef: { current: AudioContext | null } = { current: null };
  let soundEnabled = true;
  let unlockPromise: Promise<AudioContext | null> | null = null;

  /**
   * AudioContext 인스턴스를 만들거나 기존 것을 반환한다.
   * @returns 사용할 수 없는 환경이면 null
   */
  function getOrCreateAudioContext(): AudioContext | null {
    if (typeof window === "undefined") {
      return null;
    }

    if (audioContextRef.current !== null) {
      return audioContextRef.current;
    }

    const AudioContextConstructor =
      window.AudioContext ||
      (
        window as Window &
          typeof globalThis & { webkitAudioContext?: typeof AudioContext }
      ).webkitAudioContext;

    if (!AudioContextConstructor) {
      return null;
    }

    audioContextRef.current = new AudioContextConstructor();
    return audioContextRef.current;
  }

  /**
   * AudioContext를 준비하고 suspended면 resume이 끝날 때까지 기다린다.
   * 호출은 가능하면 click/pointerdown 등 사용자 제스처 안에서 시작한다.
   * @returns running에 가까운 context, 불가 시 null
   */
  async function ensureAudioContext(): Promise<AudioContext | null> {
    const context = getOrCreateAudioContext();
    if (context === null) {
      return null;
    }

    if (context.state === "suspended") {
      if (unlockPromise === null) {
        unlockPromise = context
          .resume()
          .then(() => {
            unlockPromise = null;
            return audioContextRef.current;
          })
          .catch(() => {
            unlockPromise = null;
            return audioContextRef.current;
          });
      }
      await unlockPromise;
    }

    return audioContextRef.current;
  }

  /**
   * 사용자 제스처에서 오디오 잠금을 푼다. (Sound 토글·플릭 pointerdown 등)
   */
  function unlockAudio() {
    void ensureAudioContext();
  }

  /**
   * 효과음 사용 여부를 갱신한다. 켤 때는 iOS unlock도 시도한다.
   * @param enabled 효과음 재생 여부
   */
  function setSoundEnabled(enabled: boolean) {
    soundEnabled = enabled;
    if (enabled) {
      unlockAudio();
    }
  }

  /**
   * 짧은 효과음을 오실레이터 기반으로 재생한다.
   * @param context 재생에 사용할 AudioContext
   * @param frequency 재생할 주파수
   * @param startAt 재생 시작 시각
   * @param duration 재생 길이
   * @param volume 최대 볼륨
   * @param type 오실레이터 파형 종류
   */
  function playTone(
    context: AudioContext,
    frequency: number,
    startAt: number,
    duration: number,
    volume: number,
    type: OscillatorType,
  ) {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startAt);
    gainNode.gain.setValueAtTime(0.0001, startAt);
    gainNode.gain.exponentialRampToValueAtTime(volume, startAt + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.02);
  }

  /**
   * resume 이후 판정 톤을 스케줄한다.
   * @param context 재생에 사용할 AudioContext
   * @param tone ok, good, perfect, miss 중 하나
   */
  function playFeedbackTone(context: AudioContext, tone: FeedbackAudioTone) {
    const startAt = context.currentTime + 0.005;

    if (tone === "perfect") {
      playTone(context, 1244, startAt, 0.08, FEEDBACK_TONE_VOLUME, "sine");
      playTone(
        context,
        1568,
        startAt + 0.05,
        0.12,
        FEEDBACK_TONE_VOLUME,
        "triangle",
      );
      return;
    }

    if (tone === "miss") {
      playTone(context, 165, startAt, 0.11, FEEDBACK_TONE_VOLUME, "triangle");
      return;
    }

    playTone(
      context,
      tone === "good" ? 988 : 880,
      startAt,
      tone === "good" ? 0.07 : 0.06,
      FEEDBACK_TONE_VOLUME,
      "square",
    );
  }

  /**
   * 판정 종류에 맞는 효과음 패턴을 재생한다.
   * @param tone ok, good, perfect, miss 중 하나
   */
  function triggerAudioFeedback(tone: FeedbackAudioTone) {
    if (!soundEnabled) {
      return;
    }

    void (async () => {
      const context = await ensureAudioContext();
      if (context === null || context.state !== "running") {
        return;
      }
      playFeedbackTone(context, tone);
    })();
  }

  /**
   * 사용 중인 AudioContext를 닫는다.
   */
  function closeAudioContext() {
    unlockPromise = null;
    if (audioContextRef.current !== null) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }

  return {
    ensureAudioContext,
    unlockAudio,
    playTone,
    setSoundEnabled,
    triggerAudioFeedback,
    closeAudioContext,
  };
}
