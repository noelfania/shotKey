import type {
  KanaCharacterStat,
  KanaCharacterStats,
  KanaRecentOutcome,
  KanaScript,
  KanaWeakCharacter,
} from "./types";

export const kanaCharacterStatsStorageKeyPrefix =
  "shot-key:kana-character-stats";
const recentHistoryLimit = 10;
const missPriorRate = 0.12;
const missPriorSamples = 4;
const recentPriorSamples = 3;

/**
 * 스크립트별 localStorage 키를 반환한다.
 */
export function getKanaCharacterStatsStorageKey(script: KanaScript): string {
  return `${kanaCharacterStatsStorageKeyPrefix}:${script}`;
}

/**
 * 빈 문자 통계를 만든다.
 */
export function createEmptyKanaCharacterStat(): KanaCharacterStat {
  return {
    attempts: 0,
    misses: 0,
    recentOutcomes: [],
  };
}

/**
 * 최근 이력을 길이 제한과 함께 추가한다.
 */
function appendRecentOutcome(
  recentOutcomes: KanaRecentOutcome[],
  nextOutcome: KanaRecentOutcome,
): KanaRecentOutcome[] {
  return [...recentOutcomes, nextOutcome].slice(-recentHistoryLimit);
}

/**
 * 적은 표본에서도 튀지 않도록 스무딩 비율을 계산한다.
 */
function getSmoothedRate(
  hitCount: number,
  totalCount: number,
  priorRate: number,
  priorSamples: number,
): number {
  if (totalCount <= 0) {
    return 0;
  }
  return (hitCount + priorRate * priorSamples) / (totalCount + priorSamples);
}

/**
 * 문자 위험도(0~0.95)를 계산한다.
 */
export function getKanaVisualRiskAlpha(stat?: KanaCharacterStat): number {
  if (!stat || stat.attempts === 0) {
    return 0;
  }

  const totalMissRate = getSmoothedRate(
    stat.misses,
    stat.attempts,
    missPriorRate,
    missPriorSamples,
  );
  const recentAttempts = stat.recentOutcomes.length;
  const recentMissCount = stat.recentOutcomes.filter(
    (outcome) => outcome === "miss",
  ).length;
  const recentMissRate =
    recentAttempts === 0
      ? 0
      : getSmoothedRate(
          recentMissCount,
          recentAttempts,
          missPriorRate,
          recentPriorSamples,
        );
  const recentWeight = Math.min(1, recentAttempts / (recentAttempts + 3));
  const sampleWeight = Math.min(1, stat.attempts / (stat.attempts + 2));
  const rawAlpha =
    (totalMissRate * 0.42 + recentMissRate * 0.34 * recentWeight) *
    sampleWeight;
  // 초기 샘플은 과한 빨강을 막고, 이후 상한은 0.95
  const earlyAlphaCap = stat.attempts < 5 ? 0.21 + stat.attempts * 0.04 : 0.95;
  return Math.min(rawAlpha, earlyAlphaCap);
}

/**
 * 문자별 위험도 맵을 만든다.
 */
export function buildKanaCharacterRiskMap(
  stats: KanaCharacterStats,
): Record<string, number> {
  const nextMap: Record<string, number> = {};
  Object.entries(stats).forEach(([character, stat]) => {
    const risk = getKanaVisualRiskAlpha(stat);
    if (risk > 0) {
      nextMap[character] = risk;
    }
  });
  return nextMap;
}

/**
 * 상위 취약 문자 랭킹을 만든다.
 */
export function getWeakestKanaCharacters(
  stats: KanaCharacterStats,
  limit = 5,
): KanaWeakCharacter[] {
  return Object.entries(stats)
    .map(([character, stat]) => {
      const risk = getKanaVisualRiskAlpha(stat);
      const missRate = stat.attempts > 0 ? stat.misses / stat.attempts : 0;
      return {
        character,
        risk,
        missRateLabel: `${Math.round(missRate * 100)}%`,
        sampleLabel: `(${stat.misses}/${stat.attempts})`,
      };
    })
    .filter((item) => item.risk > 0 && item.sampleLabel !== "(0/0)")
    .sort((left, right) => {
      if (right.risk !== left.risk) {
        return right.risk - left.risk;
      }
      return right.character.localeCompare(left.character);
    })
    .slice(0, limit);
}

/**
 * 정답 반영.
 */
export function updateKanaStatsOnHit(
  stats: KanaCharacterStats,
  character: string,
): KanaCharacterStats {
  const current = stats[character] ?? createEmptyKanaCharacterStat();
  return {
    ...stats,
    [character]: {
      ...current,
      attempts: current.attempts + 1,
      recentOutcomes: appendRecentOutcome(current.recentOutcomes, "hit"),
    },
  };
}

/**
 * 오답 반영.
 */
export function updateKanaStatsOnMiss(
  stats: KanaCharacterStats,
  character: string,
): KanaCharacterStats {
  const current = stats[character] ?? createEmptyKanaCharacterStat();
  return {
    ...stats,
    [character]: {
      ...current,
      attempts: current.attempts + 1,
      misses: current.misses + 1,
      recentOutcomes: appendRecentOutcome(current.recentOutcomes, "miss"),
    },
  };
}

/**
 * localStorage에서 스크립트별 통계를 읽는다.
 */
export function readStoredKanaCharacterStats(
  script: KanaScript,
): KanaCharacterStats {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const storedValue = window.localStorage.getItem(
      getKanaCharacterStatsStorageKey(script),
    );
    if (storedValue === null) {
      return {};
    }

    const parsedValue = JSON.parse(storedValue) as Record<
      string,
      Partial<KanaCharacterStat>
    >;
    if (
      parsedValue === null ||
      typeof parsedValue !== "object" ||
      Array.isArray(parsedValue)
    ) {
      return {};
    }

    const nextStats: KanaCharacterStats = {};
    Object.entries(parsedValue).forEach(([character, stat]) => {
      if (stat === null || typeof stat !== "object" || Array.isArray(stat)) {
        return;
      }
      nextStats[character] = {
        attempts: typeof stat.attempts === "number" ? stat.attempts : 0,
        misses: typeof stat.misses === "number" ? stat.misses : 0,
        recentOutcomes: Array.isArray(stat.recentOutcomes)
          ? stat.recentOutcomes
              .filter(
                (outcome): outcome is KanaRecentOutcome =>
                  outcome === "hit" || outcome === "miss",
              )
              .slice(-recentHistoryLimit)
          : [],
      };
    });
    return nextStats;
  } catch {
    return {};
  }
}

/**
 * 스크립트별 통계를 localStorage에 저장한다.
 */
export function writeStoredKanaCharacterStats(
  script: KanaScript,
  stats: KanaCharacterStats,
): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(
      getKanaCharacterStatsStorageKey(script),
      JSON.stringify(stats),
    );
  } catch {
    // 저장 실패는 무시
  }
}
