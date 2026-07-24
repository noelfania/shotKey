import type { Accessor } from "solid-js";
import type { KanaWeakCharacter } from "../game/types";

type KanaMostMissedProps = {
  weakestCharacters: Accessor<KanaWeakCharacter[]>;
};

/**
 * Most missed 한 줄 랭킹 바.
 */
export function KanaMostMissed(props: KanaMostMissedProps) {
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
    <div class="kana-most-missed" title={mostMissedLabel()}>
      <span class="kana-most-missed-text">{mostMissedLabel()}</span>
    </div>
  );
}
