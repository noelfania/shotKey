import type { JSX } from "solid-js";
import { getChallengeCharacterCaseClass } from "../game/formatting";

type ChallengeCharacterProps = {
  character: string;
  class?: string;
  style?: JSX.CSSProperties;
};

/**
 * 도전 문자를 대소문자에 맞는 스타일로 렌더링한다.
 * @param props.character 표시할 단일 문자
 * @param props.class 추가 CSS 클래스
 * @param props.style 인라인 스타일 (미리보기 opacity 등)
 */
export function ChallengeCharacter(props: ChallengeCharacterProps) {
  const caseClass = () => getChallengeCharacterCaseClass(props.character);

  return (
    <span class={`${props.class ?? ""} ${caseClass()}`.trim()} style={props.style}>
      {props.character}
    </span>
  );
}
