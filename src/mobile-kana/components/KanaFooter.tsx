import type { Accessor } from "solid-js";
import type { KanaScript } from "../game/types";

type KanaFooterProps = {
  script: Accessor<KanaScript>;
  setScript: (script: KanaScript) => void;
  soundEnabled: Accessor<boolean>;
  setSoundEnabled: (
    enabled: boolean,
    options?: { playChime?: boolean },
  ) => void;
};

/**
 * 히라/카타 토글·사운드 (테마는 BuildMeta, Restart는 플릭 패드 tall 키).
 */
export function KanaFooter(props: KanaFooterProps) {
  return (
    <footer class="kana-footer">
      <div class="kana-footer-group" role="group" aria-label="Script">
        <span class="kana-footer-label">SCRIPT</span>
        <button
          type="button"
          classList={{
            "kana-footer-button": true,
            "is-active": props.script() === "hiragana",
          }}
          onClick={() => props.setScript("hiragana")}
        >
          Hiragana
        </button>
        <button
          type="button"
          classList={{
            "kana-footer-button": true,
            "is-active": props.script() === "katakana",
          }}
          onClick={() => props.setScript("katakana")}
        >
          Katakana
        </button>
      </div>

      <div class="kana-footer-group" role="group" aria-label="Feedback">
        <span class="kana-footer-label">SOUND</span>
        <button
          type="button"
          classList={{
            "kana-footer-button": true,
            "is-active": props.soundEnabled(),
          }}
          onClick={() => {
            const next = !props.soundEnabled();
            props.setSoundEnabled(next, { playChime: next });
          }}
        >
          Sound
        </button>
      </div>
    </footer>
  );
}
