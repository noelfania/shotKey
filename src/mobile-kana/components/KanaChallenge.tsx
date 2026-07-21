import { For, Show, type Accessor } from "solid-js";
import type { KanaFeedback, KanaWeakCharacter } from "../game/types";

type KanaChallengeProps = {
  character: Accessor<string>;
  upcoming: Accessor<string[]>;
  weakestCharacters: Accessor<KanaWeakCharacter[]>;
  feedback: Accessor<KanaFeedback>;
  isInputLocked: Accessor<boolean>;
};

/**
 * 현재 출제 문자·취약 랭킹·피드백을 표시한다.
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

  const mostMissedLabel = () => {
    const ranking = props.weakestCharacters();
    if (ranking.length === 0) {
      return "Most missed --";
    }
    return `Most missed ${ranking
      .map(
        (item) =>
          `${item.character} ${item.missRateLabel} ${item.sampleLabel}`,
      )
      .join(" · ")}`;
  };

  return (
    <section class="kana-challenge" aria-live="polite">
      <div class="kana-most-missed" title={mostMissedLabel()}>
        <span class="kana-most-missed-text">{mostMissedLabel()}</span>
      </div>

      <div
        classList={{
          "kana-prompt": true,
          "is-miss": props.feedback() === "miss",
          "is-hit": props.feedback() === "hit",
          "is-locked": props.isInputLocked(),
        }}
      >
        <Show when={props.isInputLocked()}>
          <div class="kana-lock-stripes" aria-hidden="true" />
        </Show>

        <div class="kana-prompt-stage">
          <div class="kana-current-slot">
            <span class="kana-current">{props.character()}</span>
          </div>
          <div class="kana-upcoming-slot" aria-label="Upcoming kana">
            <For each={props.upcoming().slice(0, 3)}>
              {(item, index) => (
                <span
                  class="kana-upcoming"
                  style={{ "--upcoming-opacity": String(0.55 - index() * 0.12) }}
                >
                  {item}
                </span>
              )}
            </For>
          </div>
        </div>

        <p class="kana-status">{statusLabel()}</p>
        <p class="kana-status-detail">{statusDetail()}</p>
      </div>
    </section>
  );
}
