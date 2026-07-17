import { For, type Accessor } from "solid-js";
import type { KanaFeedback } from "../game/types";

type KanaChallengeProps = {
  character: Accessor<string>;
  upcoming: Accessor<string[]>;
  score: Accessor<number>;
  streak: Accessor<number>;
  feedback: Accessor<KanaFeedback>;
  isInputLocked: Accessor<boolean>;
};

/**
 * 현재 출제 문자와 점수·피드백을 표시한다.
 */
export function KanaChallenge(props: KanaChallengeProps) {
  const statusLabel = () => {
    if (props.isInputLocked() || props.feedback() === "miss") {
      return "MISS";
    }
    if (props.feedback() === "hit") {
      return "HIT";
    }
    return "READY";
  };

  const statusDetail = () => {
    if (props.feedback() === "miss") {
      return "Wrong kana — try again";
    }
    if (props.feedback() === "hit") {
      return "Nice";
    }
    return "Flick or tap the matching kana";
  };

  return (
    <section class="kana-challenge" aria-live="polite">
      <div class="kana-stats">
        <div class="kana-stat">
          <span class="kana-stat-label">Score</span>
          <span class="kana-stat-value">{props.score()}</span>
        </div>
        <div class="kana-stat">
          <span class="kana-stat-label">Streak</span>
          <span class="kana-stat-value">{props.streak()}</span>
        </div>
      </div>

      <div
        classList={{
          "kana-prompt": true,
          "is-miss": props.feedback() === "miss",
          "is-hit": props.feedback() === "hit",
          "is-locked": props.isInputLocked(),
        }}
      >
        <div class="kana-line">
          <span class="kana-current">{props.character()}</span>
          <For each={props.upcoming()}>
            {(item) => <span class="kana-upcoming">{item}</span>}
          </For>
        </div>
        <p class="kana-status">{statusLabel()}</p>
        <p class="kana-status-detail">{statusDetail()}</p>
      </div>
    </section>
  );
}
