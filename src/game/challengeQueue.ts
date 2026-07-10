import { previewCount, retryMaxGap, retryMinGap } from "./constants";
import {
  getChallengePool,
  getChallengePoolsByGroup,
} from "./keyboardLayout";
import { getCharacterRiskScore } from "./stats";
import type {
  ChallengeEntry,
  ChallengeQueue,
  CharacterStats,
  KeyboardLayoutId,
  PendingRetry,
  TrainingMode,
} from "./types";

export function getRandomRetryGap() {
  return (
    retryMinGap + Math.floor(Math.random() * (retryMaxGap - retryMinGap + 1))
  );
}

/**
 * 현재 모드·레이아웃에 맞는 출제 후보 풀을 반환한다.
 * @param mode 훈련 모드
 * @param layoutId 키보드 레이아웃
 */
export function getChallengeCandidates(
  mode: TrainingMode,
  layoutId: KeyboardLayoutId,
) {
  if (mode === "all") {
    return getChallengePool(layoutId);
  }

  return getChallengePoolsByGroup(layoutId)[mode];
}

/**
 * 문자별 리스크를 반영해 다음 문제를 가중 랜덤으로 뽑는다.
 * @param mode 현재 훈련 모드
 * @param characterStats 문자별 누적 학습 데이터
 * @param layoutId 키보드 레이아웃
 * @param previousChallenge 직전 문자 중복을 줄이기 위한 이전 문자
 * @returns 다음에 출제할 문제 정보
 */
export function getRandomChallenge(
  mode: TrainingMode,
  characterStats: CharacterStats,
  layoutId: KeyboardLayoutId,
  previousChallenge?: string,
) {
  // 직전 문자와 같은 문자는 우선 제외해 즉시 반복 출제를 줄인다.
  const pool = getChallengeCandidates(mode, layoutId);
  const filteredPool = pool.filter(
    ({ character }) => character !== previousChallenge,
  );
  const candidates = filteredPool.length > 0 ? filteredPool : pool;
  // 리스크가 높은 문자는 기본 가중치 1 위에 추가 가중치를 더한다.
  const weightedCandidates = candidates.map((entry) => ({
    entry,
    weight:
      1 + Math.min(getCharacterRiskScore(characterStats[entry.character]), 4.2),
  }));
  const totalWeight = weightedCandidates.reduce(
    (sum, candidate) => sum + candidate.weight,
    0,
  );
  let cursor = Math.random() * totalWeight;

  for (const candidate of weightedCandidates) {
    cursor -= candidate.weight;

    if (cursor <= 0) {
      return candidate.entry;
    }
  }

  return weightedCandidates[weightedCandidates.length - 1].entry;
}

/**
 * 현재 문제 뒤에 붙일 미리보기 큐를 채운다.
 * @param mode 현재 훈련 모드
 * @param characterStats 문자별 누적 학습 데이터
 * @param layoutId 키보드 레이아웃
 * @param recentCharacter 직전에 배치된 문자
 * @param count 채울 미리보기 개수
 * @returns 현재 문제 뒤에 이어질 미리보기 큐
 */
export function fillUpcomingQueue(
  mode: TrainingMode,
  characterStats: CharacterStats,
  layoutId: KeyboardLayoutId,
  recentCharacter: string,
  count = previewCount,
) {
  const upcomingChallenges: ChallengeEntry[] = [];
  let previousChallenge = recentCharacter;

  for (let index = 0; index < count; index += 1) {
    const nextChallenge = getRandomChallenge(
      mode,
      characterStats,
      layoutId,
      previousChallenge,
    );
    upcomingChallenges.push(nextChallenge);
    previousChallenge = nextChallenge.character;
  }

  return upcomingChallenges;
}

/**
 * 현재 문제와 미리보기 큐를 포함한 출제 큐를 생성한다.
 * @param mode 현재 훈련 모드
 * @param characterStats 문자별 누적 학습 데이터
 * @param layoutId 키보드 레이아웃
 * @returns 현재 문제와 미리보기 큐를 포함한 새 출제 큐
 */
export function createChallengeQueue(
  mode: TrainingMode,
  characterStats: CharacterStats,
  layoutId: KeyboardLayoutId,
): ChallengeQueue {
  const current = getRandomChallenge(mode, characterStats, layoutId);

  return {
    current,
    upcoming: fillUpcomingQueue(
      mode,
      characterStats,
      layoutId,
      current.character,
    ),
  };
}

/**
 * 정답 입력 후 출제 큐를 한 칸 전진시킨다.
 * @param queue 현재 문제와 미리보기 큐
 * @param mode 현재 훈련 모드
 * @param characterStats 문자별 누적 학습 데이터
 * @param layoutId 키보드 레이아웃
 * @returns 한 칸 전진한 출제 큐
 */
export function advanceChallengeQueue(
  queue: ChallengeQueue,
  mode: TrainingMode,
  characterStats: CharacterStats,
  layoutId: KeyboardLayoutId,
): ChallengeQueue {
  const [nextCurrent, ...rest] = queue.upcoming;

  if (!nextCurrent) {
    return createChallengeQueue(mode, characterStats, layoutId);
  }

  const lastCharacter =
    rest.length > 0 ? rest[rest.length - 1].character : nextCurrent.character;
  const nextTail = getRandomChallenge(
    mode,
    characterStats,
    layoutId,
    lastCharacter,
  );

  return {
    current: nextCurrent,
    upcoming: [...rest, nextTail],
  };
}

/**
 * 오답 재출제 문제를 미리보기 큐 안의 목표 위치에 삽입한다.
 * @param queue 현재 출제 큐
 * @param entry 다시 출제할 문제
 * @param targetStep 현재 문제 기준 몇 문제 뒤에 넣을지
 * @returns 재출제 문제가 반영된 출제 큐
 */
export function insertRetryIntoQueue(
  queue: ChallengeQueue,
  entry: ChallengeEntry,
  targetStep: number,
) {
  if (queue.upcoming.length === 0) {
    return queue;
  }

  const nextUpcoming = [...queue.upcoming];
  let targetIndex = Math.max(
    0,
    Math.min(nextUpcoming.length - 1, targetStep - 1),
  );

  // 같은 문자가 바로 이어지지 않도록 목표 위치를 뒤로 밀어낸다.
  while (
    targetIndex < nextUpcoming.length - 1 &&
    (targetIndex === 0
      ? queue.current.character === entry.character
      : nextUpcoming[targetIndex - 1].character === entry.character)
  ) {
    targetIndex += 1;
  }

  nextUpcoming[targetIndex] = entry;

  return {
    ...queue,
    upcoming: nextUpcoming,
  };
}

/**
 * 기본 큐 전진 후 조건이 맞는 오답 재출제를 미리보기 큐에 반영한다.
 * @param queue 현재 출제 큐
 * @param mode 현재 훈련 모드
 * @param characterStats 문자별 누적 학습 데이터
 * @param layoutId 키보드 레이아웃
 * @param pendingRetries 아직 대기 중인 재출제 목록
 * @param now 현재 시각
 * @returns 큐 전진 결과와 남은 재출제 목록
 */
export function advanceChallengeQueueWithRetries(
  queue: ChallengeQueue,
  mode: TrainingMode,
  characterStats: CharacterStats,
  layoutId: KeyboardLayoutId,
  pendingRetries: PendingRetry[],
  now: number,
) {
  const nextQueue = advanceChallengeQueue(
    queue,
    mode,
    characterStats,
    layoutId,
  );
  const nextPendingRetries = pendingRetries.map((retry) => ({
    ...retry,
    remainingSteps: retry.remainingSteps - 1,
  }));
  const sortedRetries = [...nextPendingRetries].sort(
    (left, right) => left.dueAt - right.dueAt,
  );
  let queueWithRetries = nextQueue;
  const remainingRetries: PendingRetry[] = [];

  // 재출제는 남은 거리와 지연 시간이 모두 충족된 경우에만 큐에 삽입한다.
  sortedRetries.forEach((retry) => {
    if (retry.dueAt > now || retry.remainingSteps > previewCount) {
      remainingRetries.push(retry);
      return;
    }

    queueWithRetries = insertRetryIntoQueue(
      queueWithRetries,
      retry.entry,
      Math.max(1, retry.remainingSteps),
    );
  });

  return {
    queue: queueWithRetries,
    pendingRetries: remainingRetries,
  };
}
