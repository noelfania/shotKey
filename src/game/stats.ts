import {
  recentHistoryLimit,
  slowResponseThresholdMs,
  visualMissPriorRate,
  visualRecentPriorSamples,
  visualSlowPriorRate,
  visualTotalPriorSamples,
} from "./constants";
import type {
  CharacterStat,
  CharacterStats,
  HandGroup,
  HandStats,
  RecentOutcome,
} from "./types";

export function createEmptyHandStats(): HandStats {
  return {
    left: { hit: 0, miss: 0 },
    right: { hit: 0, miss: 0 },
  };
}

/**
 * 문자별 누적 학습 데이터의 초기값을 생성한다.
 * @returns 출제 가중치 계산과 시각화에 필요한 기본 통계
 */
export function createEmptyCharacterStat(): CharacterStat {
  return {
    attempts: 0,
    seen: 0,
    miss: 0,
    solvedCount: 0,
    totalResponseMs: 0,
    slowCount: 0,
    lastSeenAt: 0,
    recentOutcomes: [],
  };
}
export function getAverageResponseMs(stat?: CharacterStat) {
  if (!stat || stat.solvedCount === 0) {
    return null;
  }

  return stat.totalResponseMs / stat.solvedCount;
}
export function appendRecentOutcome(
  recentOutcomes: RecentOutcome[],
  nextOutcome: RecentOutcome,
) {
  return [...recentOutcomes, nextOutcome].slice(-recentHistoryLimit);
}

/**
 * 최근 성과 이력 기준의 miss/slow 비율을 계산한다.
 * @param stat 문자별 누적 학습 데이터
 * @returns 최근 miss 비율과 slow 비율
 */
export function getRecentRates(stat?: CharacterStat) {
  if (!stat || stat.recentOutcomes.length === 0) {
    return {
      recentMissRate: 0,
      recentSlowRate: 0,
    };
  }

  const recentAttempts = stat.recentOutcomes.length;
  const recentMissCount = stat.recentOutcomes.filter(
    (outcome) => outcome === "miss",
  ).length;
  const recentSlowCount = stat.recentOutcomes.filter(
    (outcome) => outcome === "slow",
  ).length;

  return {
    recentMissRate: recentMissCount / recentAttempts,
    recentSlowRate: recentSlowCount / recentAttempts,
  };
}

/**
 * 적은 표본에서도 비율이 과하게 튀지 않도록 베이지안 스무딩 비율을 계산한다.
 * @param hitCount 특정 결과가 발생한 횟수
 * @param totalCount 전체 시도 수
 * @param priorRate 사전 기대 비율
 * @param priorSamples 사전 표본 수
 * @returns 스무딩된 비율
 */
export function getSmoothedRate(
  hitCount: number,
  totalCount: number,
  priorRate: number,
  priorSamples: number,
) {
  if (totalCount <= 0) {
    return 0;
  }

  return (hitCount + priorRate * priorSamples) / (totalCount + priorSamples);
}

/**
 * 문자 통계에서 시각화와 메타 랭킹에 공통으로 쓸 스무딩 오답률을 계산한다.
 * @param stat 특정 문자에 대한 누적 학습 데이터
 * @returns 베이지안 스무딩이 적용된 오답률
 */
export function getSmoothedMissRate(stat?: CharacterStat) {
  if (!stat || stat.attempts === 0) {
    return 0;
  }

  return getSmoothedRate(
    stat.miss,
    stat.attempts,
    visualMissPriorRate,
    visualTotalPriorSamples,
  );
}

/**
 * 문자 통계에서 시각화에 쓸 스무딩 느림 비율을 계산한다.
 * @param stat 특정 문자에 대한 누적 학습 데이터
 * @returns 베이지안 스무딩이 적용된 느림 비율
 */
export function getSmoothedSlowRate(stat?: CharacterStat) {
  if (!stat || stat.solvedCount === 0) {
    return 0;
  }

  return getSmoothedRate(
    stat.slowCount,
    stat.solvedCount,
    visualSlowPriorRate,
    visualTotalPriorSamples,
  );
}

/**
 * 최근 이력 구간에 베이지안 스무딩을 적용한 비율과 신뢰도를 계산한다.
 * @param stat 특정 문자에 대한 누적 학습 데이터
 * @returns 최근 miss/slow 비율과 최근 표본 신뢰도
 */
export function getSmoothedRecentRates(stat?: CharacterStat) {
  if (!stat || stat.recentOutcomes.length === 0) {
    return {
      recentMissRate: 0,
      recentSlowRate: 0,
      recentWeight: 0,
    };
  }

  const recentAttempts = stat.recentOutcomes.length;
  const recentMissCount = stat.recentOutcomes.filter(
    (outcome) => outcome === "miss",
  ).length;
  const recentSlowCount = stat.recentOutcomes.filter(
    (outcome) => outcome === "slow",
  ).length;

  return {
    recentMissRate: getSmoothedRate(
      recentMissCount,
      recentAttempts,
      visualMissPriorRate,
      visualRecentPriorSamples,
    ),
    recentSlowRate: getSmoothedRate(
      recentSlowCount,
      recentAttempts,
      visualSlowPriorRate,
      visualRecentPriorSamples,
    ),
    recentWeight: Math.min(1, recentAttempts / (recentAttempts + 3)),
  };
}

/**
 * 문자별 누적 성과를 바탕으로 출제 가중치에 사용할 리스크 점수를 계산한다.
 * @param stat 특정 문자에 대한 누적 학습 데이터
 * @returns 0 이상 출제 우선도 계산에 사용할 점수
 */
export function getCharacterRiskScore(stat?: CharacterStat) {
  if (!stat || stat.attempts === 0) {
    return 0;
  }

  // 전체 성과와 최근 성과를 함께 반영해 최근에 흔들린 문자도 다시 자주 나오게 한다.
  const totalMissRate = stat.miss / stat.attempts;
  const totalSlowRate =
    stat.solvedCount > 0 ? stat.slowCount / stat.solvedCount : 0;
  const { recentMissRate, recentSlowRate } = getRecentRates(stat);
  const averageResponseMs = getAverageResponseMs(stat) ?? 0;
  const responsePenalty =
    stat.solvedCount > 0 ? Math.max(0, (averageResponseMs - 700) / 500) : 0;
  const sampleWeight = Math.min(1, stat.attempts / 8);

  return (
    (totalMissRate * 2.4 +
      totalSlowRate * 1 +
      recentMissRate * 2.8 +
      recentSlowRate * 1.2 +
      responsePenalty * 0.6) *
    sampleWeight
  );
}

/**
 * 문자별 약점 정도를 키보드 하이라이트 강도로 변환한다.
 * @param stat 특정 문자에 대한 누적 학습 데이터
 * @returns 0~0.72 범위의 시각화 알파값
 */
export function getVisualRiskAlpha(stat?: CharacterStat) {
  if (!stat || stat.attempts === 0) {
    return 0;
  }

  const totalMissRate = getSmoothedMissRate(stat);
  const totalSlowRate = getSmoothedSlowRate(stat);
  const { recentMissRate, recentSlowRate, recentWeight } =
    getSmoothedRecentRates(stat);
  const averageResponseMs = getAverageResponseMs(stat) ?? 0;
  const responsePenalty =
    stat.solvedCount > 0 ? Math.max(0, (averageResponseMs - 900) / 700) : 0;
  const sampleWeight = Math.min(1, stat.attempts / (stat.attempts + 2));
  const rawAlpha =
    (totalMissRate * 0.34 +
      totalSlowRate * 0.12 +
      recentMissRate * 0.24 * recentWeight +
      recentSlowRate * 0.1 * recentWeight +
      responsePenalty * 0.07) *
    sampleWeight;
  const earlyAlphaCap = stat.attempts < 5 ? 0.16 + stat.attempts * 0.03 : 0.72;

  return Math.min(rawAlpha, earlyAlphaCap);
}

/**
 * 정답 입력 시 문자별 누적 학습 데이터를 갱신한다.
 * @param characterStats 전체 문자 통계 맵
 * @param character 이번에 맞힌 문자
 * @param elapsedMs 이번 입력 반응 시간
 * @returns 정답 반영 후의 문자 통계 맵
 */
export function updateCharacterStatsOnHit(
  characterStats: CharacterStats,
  character: string,
  elapsedMs: number,
) {
  const currentStat = characterStats[character] ?? createEmptyCharacterStat();
  const nextOutcome: RecentOutcome =
    elapsedMs > slowResponseThresholdMs ? "slow" : "hit";

  return {
    ...characterStats,
    [character]: {
      ...currentStat,
      attempts: currentStat.attempts + 1,
      seen: currentStat.seen + 1,
      solvedCount: currentStat.solvedCount + 1,
      totalResponseMs: currentStat.totalResponseMs + elapsedMs,
      slowCount:
        currentStat.slowCount + (elapsedMs > slowResponseThresholdMs ? 1 : 0),
      lastSeenAt: Date.now(),
      recentOutcomes: appendRecentOutcome(
        currentStat.recentOutcomes,
        nextOutcome,
      ),
    },
  };
}

/**
 * 오답 입력 시 문자별 누적 학습 데이터를 갱신한다.
 * @param characterStats 전체 문자 통계 맵
 * @param character 이번에 틀린 문제 문자
 * @returns 오답 반영 후의 문자 통계 맵
 */
export function updateCharacterStatsOnMiss(
  characterStats: CharacterStats,
  character: string,
) {
  const currentStat = characterStats[character] ?? createEmptyCharacterStat();

  return {
    ...characterStats,
    [character]: {
      ...currentStat,
      attempts: currentStat.attempts + 1,
      seen: currentStat.seen + 1,
      miss: currentStat.miss + 1,
      lastSeenAt: Date.now(),
      recentOutcomes: appendRecentOutcome(currentStat.recentOutcomes, "miss"),
    },
  };
}
export function updateHandStats(
  handStats: HandStats,
  group: HandGroup,
  result: "hit" | "miss",
) {
  return {
    ...handStats,
    [group]: {
      ...handStats[group],
      [result]: handStats[group][result] + 1,
    },
  };
}