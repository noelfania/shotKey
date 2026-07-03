import type { HandGroup, HandRecord, TrainingMode } from "./types";
import { modeOptions } from "./constants";

/**
 * 손 영역 값을 화면용 한글 라벨로 변환한다.
 * @param group left 또는 right
 * @returns 화면에 표시할 한글 라벨
 */
export function getGroupLabel(group: HandGroup) {
  return group === "left" ? "왼손" : "오른손";
}

/**
 * 현재 훈련 모드에 대응하는 표시용 메타 정보를 찾는다.
 * @param mode 전체/왼손/오른손 중 현재 모드
 * @returns 대응 항목이 없으면 첫 번째 모드 정보
 */
export function getModeOption(mode: TrainingMode) {
  return modeOptions.find((option) => option.value === mode) ?? modeOptions[0];
}

/**
 * 특정 손 영역의 정확도를 계산한다.
 * @param record 손 영역별 hit, miss 기록
 * @returns 아직 시도가 없으면 null
 */
export function getGroupAccuracy(record: HandRecord) {
  const total = record.hit + record.miss;

  if (total === 0) {
    return null;
  }

  return record.hit / total;
}

/**
 * 손 영역 정확도를 화면 표시용 문자열로 변환한다.
 * @param record 손 영역별 hit, miss 기록
 * @returns 시도 전이면 --, 아니면 백분율 문자열
 */
export function formatAccuracy(record: HandRecord) {
  const accuracy = getGroupAccuracy(record);

  if (accuracy === null) {
    return "--";
  }

  return `${Math.round(accuracy * 100)}%`;
}

/**
 * 경과 시간을 mm:ss.000 형식의 문자열로 변환한다.
 * @param elapsedMs 밀리초 단위 경과 시간
 * @returns 화면 표시용 시간 문자열
 */
export function formatElapsedDisplay(elapsedMs: number) {
  const safeElapsedMs = Math.max(0, elapsedMs);
  const minutes = Math.floor(safeElapsedMs / 60000);
  const seconds = Math.floor((safeElapsedMs % 60000) / 1000);
  const milliseconds = safeElapsedMs % 1000;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
}

/**
 * 도전 문자의 대소문자에 맞는 CSS 클래스를 반환한다.
 * @param character 화면에 표시할 단일 문자
 * @returns 대문자·소문자·기타에 대응하는 클래스명
 */
export function getChallengeCharacterCaseClass(character: string) {
  if (character.length !== 1) {
    return "challenge-character-neutral";
  }

  if (character >= "A" && character <= "Z") {
    return "challenge-character-upper";
  }

  if (character >= "a" && character <= "z") {
    return "challenge-character-lower";
  }

  return "challenge-character-neutral";
}
