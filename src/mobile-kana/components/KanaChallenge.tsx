import { For, Show, type Accessor, type JSX } from "solid-js";
import type { KanaFeedback, KanaWeakCharacter } from "../game/types";

type KanaChallengeProps = {
  character: Accessor<string>;
  upcoming: Accessor<string[]>;
  weakestCharacters: Accessor<KanaWeakCharacter[]>;
  feedback: Accessor<KanaFeedback>;
  feedbackDetailAccent: Accessor<string | null>;
  isInputLocked: Accessor<boolean>;
  gauge: Accessor<number>;
  gaugeFillStyle: Accessor<JSX.CSSProperties>;
  streak: Accessor<number>;
  setPromptRef: (el: HTMLElement | undefined) => void;
};

/**
 * 현재 출제 문자·취약 랭킹·게이지·피드백을 표시한다.
 */
export function KanaChallenge(props: KanaChallengeProps) {
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

  const isMissTone = () =>
    props.feedback().tone === "miss" || props.isInputLocked();
  const isHitTone = () => {
    const tone = props.feedback().tone;
    return tone === "perfect" || tone === "good" || tone === "ok";
  };

  return (
    <section class="kana-challenge" aria-live="polite">
      <div class="kana-most-missed" title={mostMissedLabel()}>
        <span class="kana-most-missed-text">{mostMissedLabel()}</span>
      </div>

      <div class="kana-session-meta">
        <span class="kana-session-meta-item">
          <span class="kana-session-meta-key">Streak</span>
          <strong>{props.streak()}</strong>
        </span>
      </div>

      <div
        ref={(el) => props.setPromptRef(el)}
        classList={{
          "kana-prompt": true,
          "is-miss": isMissTone(),
          "is-hit": isHitTone(),
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

        <div
          class="kana-inline-gauge"
          aria-label={`Focus gauge ${Math.ceil(props.gauge())}%`}
        >
          <div class="gauge-track gauge-track-slim" aria-hidden="true">
            <div class="gauge-fill" style={props.gaugeFillStyle()} />
          </div>
        </div>

        <p class="kana-status">{props.feedback().label}</p>
        <p class="kana-status-detail">
          {props.feedback().detail}
          <Show when={props.feedbackDetailAccent() !== null}>
            {" "}
            <span class="kana-status-accent">
              {props.feedbackDetailAccent()}
            </span>
          </Show>
        </p>
      </div>
    </section>
  );
}
