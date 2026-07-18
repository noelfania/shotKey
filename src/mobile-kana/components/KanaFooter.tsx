import type { Accessor } from "solid-js";
import type { AppTheme } from "../../game/types";
import type { KanaScript } from "../game/types";

type KanaFooterProps = {
  script: Accessor<KanaScript>;
  setScript: (script: KanaScript) => void;
  soundEnabled: Accessor<boolean>;
  setSoundEnabled: (enabled: boolean) => void;
  theme: Accessor<AppTheme>;
  setTheme: (theme: AppTheme) => void;
};

/**
 * 히라/카타 토글·사운드·테마 (Restart 없음).
 */
export function KanaFooter(props: KanaFooterProps) {
  const toggleTheme = () => {
    props.setTheme(props.theme() === "light" ? "dark" : "light");
  };

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
          onClick={() => props.setSoundEnabled(!props.soundEnabled())}
        >
          Sound
        </button>
      </div>

      <button
        type="button"
        class="kana-theme-toggle"
        aria-label={
          props.theme() === "light" ? "Switch to dark theme" : "Switch to light theme"
        }
        aria-pressed={props.theme() === "dark"}
        onClick={toggleTheme}
      >
        {props.theme() === "light" ? (
          <svg
            class="kana-theme-toggle-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        ) : (
          <svg
            class="kana-theme-toggle-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3a7 7 0 0 0 11.5 11.5z" />
          </svg>
        )}
      </button>
    </footer>
  );
}
