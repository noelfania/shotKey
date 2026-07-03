export type FeedbackAudioTone = "ok" | "good" | "perfect" | "miss";

/** 판정 효과음 공통 gain (Web Audio 1.0 = 최대) */
const FEEDBACK_TONE_VOLUME = 1;

/** * 효과음 재생 함수 묶음을 생성한다.
 * @returns AudioContext 준비, 톤 재생, 판정별 피드백 재생 함수
 */
export function createFeedbackAudio() {
  const audioContextRef: { current: AudioContext | null } = { current: null };
  let soundEnabled = true;

  /**
   * 효과음 사용 여부를 갱신한다.
   * @param enabled 효과음 재생 여부
   */
  function setSoundEnabled(enabled: boolean) {
    soundEnabled = enabled;
  }

  /**
   * 효과음 재생에 사용할 AudioContext를 준비한다.
   * @returns 사용할 수 없는 환경이면 null
   */
  function ensureAudioContext() {
    if (typeof window === "undefined") {
      return null;
    }

    if (audioContextRef.current === null) {
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
    }

    if (audioContextRef.current.state === "suspended") {
      void audioContextRef.current.resume();
    }

    return audioContextRef.current;
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
   * 판정 종류에 맞는 효과음 패턴을 재생한다.
   * @param tone ok, good, perfect, miss 중 하나
   */
  function triggerAudioFeedback(tone: FeedbackAudioTone) {
    if (!soundEnabled) {
      return;
    }

    const context = ensureAudioContext();

    if (context === null) {
      return;
    }

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
   * 사용 중인 AudioContext를 닫는다.
   */
  function closeAudioContext() {
    if (audioContextRef.current !== null) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }

  return {
    ensureAudioContext,
    playTone,
    setSoundEnabled,
    triggerAudioFeedback,
    closeAudioContext,
  };
}
