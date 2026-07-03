import { For, Show, type Accessor, type JSX } from "solid-js";
import { formatAccuracy, formatElapsedDisplay } from "../game/formatting";
import type { ChallengeEntry, FeedbackState, HandStats } from "../game/types";
import { ChallengeCharacter } from "./ChallengeCharacter";

type MostMissedCharacter = {
  character: string;
  missRateLabel: string;
  sampleLabel: string;
};

type ChallengeCardProps = {
  setChallengeCardRef: (element: HTMLDivElement) => void;
  isInputLocked: Accessor<boolean>;
  lockRemainingMs: Accessor<number>;
  bestScore: Accessor<number>;
  bestStreak: Accessor<number>;
  bestSurvivalMs: Accessor<number>;
  mostMissedCharacters: Accessor<MostMissedCharacter[]>;
  score: Accessor<number>;
  streak: Accessor<number>;
  handStats: Accessor<HandStats>;
  challenge: Accessor<ChallengeEntry>;
  upcomingChallenges: Accessor<ChallengeEntry[]>;
  previewOpacities: Accessor<number[]>;
  gauge: Accessor<number>;
  gaugeFillStyle: Accessor<JSX.CSSProperties>;
  feedback: Accessor<FeedbackState>;
  feedbackDetailAccent: Accessor<string | null>;
};

/**
 * 현재 문자, 미리보기, HUD 메타, 게이지, 판정 피드백을 표시한다.
 */
export function ChallengeCard(props: ChallengeCardProps) {
  return (
    <div
      ref={props.setChallengeCardRef}
      class="challenge-card"
      aria-label="현재 문자와 다음 문자"
    >
      <Show when={props.isInputLocked()}>
        <div class="challenge-lock-overlay" aria-hidden="true">
          <div class="challenge-lock-panel">
            <span class="challenge-lock-detail">
              INPUT LOCKED INPUT LOCKED INPUT LOCKED INPUT LOCKED INPUT LOCKED
              INPUT LOCKED LOCKED INPUT LOCKED
            </span>
            <strong class="challenge-lock-title">
              <span>LOCK '</span>
              <span class="challenge-lock-time">
                {Math.max(0, Math.ceil(props.lockRemainingMs()))}ms
              </span>
            </strong>
            <span class="challenge-lock-detail">
              INPUT LOCKED INPUT LOCKED INPUT LOCKED INPUT LOCKED INPUT LOCKED
              INPUT LOCKED LOCKED INPUT LOCKED
            </span>
          </div>
        </div>
      </Show>
      <div class="challenge-meta" aria-label="현재 훈련 정보">
        <span class="challenge-meta-group-title challenge-meta-group-title-cumulative">
          최고 기록
        </span>
        <div class="challenge-meta-line challenge-meta-line-cumulative-summary">
          <span class="challenge-meta-item">
            <span class="challenge-meta-key">점수</span>
            <strong>{props.bestScore()}</strong>
          </span>
          <span class="challenge-meta-item">
            <span class="challenge-meta-key">연속</span>
            <strong>{props.bestStreak()}</strong>
          </span>
          <span class="challenge-meta-item">
            <span class="challenge-meta-key">
              버틴시간
              <span class="challenge-meta-sample">(mm:ss.sss)</span>
            </span>
            <strong>
              {props.bestSurvivalMs() > 0
                ? formatElapsedDisplay(props.bestSurvivalMs())
                : "--"}
            </strong>
          </span>
        </div>
        <div class="challenge-meta-line challenge-meta-line-cumulative-weak">
          <span class="challenge-meta-item challenge-meta-item-long">
            <span class="challenge-meta-key">
              많이틀린문자{" "}
              <span class="challenge-meta-sample">(오답수/시도수)</span>
            </span>
            <strong>
              <Show
                when={props.mostMissedCharacters().length > 0}
                fallback={"--"}
              >
                <For each={props.mostMissedCharacters()}>
                  {(item, index) => (
                    <span>
                      {index() > 0 ? " · " : ""}
                      {item.character} {item.missRateLabel}{" "}
                      <span class="challenge-meta-sample">
                        {item.sampleLabel}
                      </span>
                    </span>
                  )}
                </For>
              </Show>
            </strong>
          </span>
        </div>
        <span class="challenge-meta-group-title challenge-meta-group-title-session">
          현재 세션 기록
        </span>
        <div class="challenge-meta-line challenge-meta-line-session-summary">
          <span class="challenge-meta-item">
            <span class="challenge-meta-key">점수</span>
            <strong>{props.score()}</strong>
          </span>
          <span class="challenge-meta-item">
            <span class="challenge-meta-key">연속</span>
            <strong>{props.streak()}</strong>
          </span>
        </div>
        <div class="challenge-meta-line challenge-meta-line-hand-left">
          <span class="challenge-meta-item">
            <span class="challenge-meta-key">
              왼손정확도{" "}
              <span class="challenge-meta-sample">(정답/오답/정확도)</span>
            </span>
            <strong>
              {props.handStats().left.hit}/{props.handStats().left.miss}/
              {formatAccuracy(props.handStats().left)}
            </strong>
          </span>
        </div>
        <span class="challenge-meta-item challenge-meta-item-hand-right">
          <span class="challenge-meta-key">
            오른손정확도{" "}
            <span class="challenge-meta-sample">(정답/오답/정확도)</span>
          </span>
          <strong>
            {props.handStats().right.hit}/{props.handStats().right.miss}/
            {formatAccuracy(props.handStats().right)}
          </strong>
        </span>
      </div>
      <div class="challenge-card-main">
        <div class="challenge-line">
          <div class="challenge-current">
            <div class="challenge-focus">
              <ChallengeCharacter
                character={props.challenge().character}
                class="challenge-character challenge-character-current"
              />
            </div>
          </div>

          <div class="challenge-upcoming" aria-label="다음에 나올 문자">
            <For each={props.upcomingChallenges()}>
              {(entry, index) => (
                <ChallengeCharacter
                  character={entry.character}
                  class="challenge-upcoming-character"
                  style={{
                    opacity:
                      props.previewOpacities()[index()] ??
                      props.previewOpacities()[
                        props.previewOpacities().length - 1
                      ] ??
                      0.15,
                  }}
                />
              )}
            </For>
          </div>
        </div>
        <div
          class="challenge-inline-gauge"
          aria-label={`집중 게이지 ${Math.ceil(props.gauge())}%`}
        >
          <div class="gauge-track gauge-track-slim" aria-hidden="true">
            <div class="gauge-fill" style={props.gaugeFillStyle()} />
          </div>
        </div>
      </div>
      <div class={`feedback feedback-slot feedback-${props.feedback().tone}`}>
        <div class="feedback-copy">
          <span class="feedback-label">{props.feedback().label}</span>
          <span class="feedback-detail">
            {props.feedback().detail}
            {props.feedbackDetailAccent() !== null ? " " : ""}
            <Show when={props.feedbackDetailAccent() !== null}>
              <span
                class={`feedback-detail-accent feedback-detail-accent-${props.feedback().tone}`}
              >
                {props.feedbackDetailAccent()}
              </span>
            </Show>
          </span>
        </div>
      </div>
    </div>
  );
}
