import { gaugeMax, decayMinPerTick, decayMaxPerTick } from "./constants";

export function getGaugeDecayPerTick(currentGauge: number) {
  const gaugeRatio = Math.max(0, Math.min(1, currentGauge / gaugeMax));

  return (
    decayMinPerTick +
    Math.pow(gaugeRatio, 1.35) * (decayMaxPerTick - decayMinPerTick)
  );
}
export function getRewardBySpeed(elapsedMs: number) {
  if (elapsedMs <= 450) {
    return {
      gaugeGain: 15,
      scoreGain: 180,
      feedback: {
        label: "PERFECT",
        tone: "perfect" as const,
        detail: `${elapsedMs}ms 반응`,
      },
    };
  }

  if (elapsedMs <= 900) {
    return {
      gaugeGain: 6,
      scoreGain: 120,
      feedback: {
        label: "GOOD",
        tone: "good" as const,
        detail: `${elapsedMs}ms 반응`,
      },
    };
  }

  return {
    gaugeGain: 4,
    scoreGain: 80,
    feedback: {
      label: "OK",
      tone: "ok" as const,
      detail: `${elapsedMs}ms 반응`,
    },
  };
}