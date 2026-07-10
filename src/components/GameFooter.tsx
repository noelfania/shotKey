import { For, type Accessor } from "solid-js";
import { modeOptions, typingFontPresets } from "../game/constants";
import type { TrainingMode, TypingFontPresetId } from "../game/types";

type GameFooterProps = {
  endlessModeEnabled: Accessor<boolean>;
  trainingMode: Accessor<TrainingMode>;
  soundEnabled: Accessor<boolean>;
  visualEffectsEnabled: Accessor<boolean>;
  keyboardPanelVisible: Accessor<boolean>;
  keyboardHintsVisible: Accessor<boolean>;
  typedKeyFlashEnabled: Accessor<boolean>;
  selectedFontPresetId: Accessor<TypingFontPresetId>;
  resetGame: (nextMode?: TrainingMode) => void;
  setEndlessModeEnabled: (value: boolean) => void;
  setSoundEnabled: (value: boolean) => void;
  setVisualEffectsEnabled: (value: boolean) => void;
  setKeyboardPanelVisible: (value: boolean) => void;
  setKeyboardHintsVisible: (value: boolean) => void;
  setTypedKeyFlashEnabled: (value: boolean) => void;
  clearTypedKeyFlash: () => void;
  setSelectedFontPresetId: (value: TypingFontPresetId) => void;
  onOpenLayoutModal: () => void;
};

/**
 * 훈련 모드, 설정 토글, 재시작 버튼을 담은 하단 푸터를 렌더링한다.
 */
export function GameFooter(props: GameFooterProps) {
  return (
    <footer class="game-stage-footer">
      <div class="footer-actions">
        <div class="footer-mode-controls">
          <span class="keyboard-meta-label">Mode</span>
          <div class="footer-mode-buttons">
            <For each={modeOptions}>
              {(option) => (
                <button
                  type="button"
                  class={`mode-button footer-mode-button ${props.trainingMode() === option.value ? "is-active" : ""}`}
                  onClick={() => props.resetGame(option.value)}
                >
                  {option.label}
                </button>
              )}
            </For>
            <button
              type="button"
              class={`assist-toggle footer-mode-button ${props.endlessModeEnabled() ? "is-active" : ""}`}
              aria-pressed={props.endlessModeEnabled()}
              onClick={() =>
                props.setEndlessModeEnabled(!props.endlessModeEnabled())
              }
            >
              Endless
            </button>
          </div>
        </div>
        <span class="footer-separator" aria-hidden="true" />
        <div
          class="footer-setting-controls"
          aria-label="Feedback, keyboard, and font settings"
        >
          <div class="footer-setting-group">
            <span class="keyboard-meta-label">Feedback</span>
            <div class="footer-setting-buttons">
              <button
                type="button"
                class={`keyboard-setting-button footer-setting-button ${props.soundEnabled() ? "is-active" : ""}`}
                aria-pressed={props.soundEnabled()}
                onClick={() => props.setSoundEnabled(!props.soundEnabled())}
              >
                Sound
              </button>
              <button
                type="button"
                class={`keyboard-setting-button footer-setting-button ${props.visualEffectsEnabled() ? "is-active" : ""}`}
                aria-pressed={props.visualEffectsEnabled()}
                onClick={() =>
                  props.setVisualEffectsEnabled(!props.visualEffectsEnabled())
                }
              >
                Visual
              </button>
            </div>
          </div>
          <span class="footer-separator" aria-hidden="true" />
          <div class="footer-setting-group">
            <span class="keyboard-meta-label">Keyboard</span>
            <div class="footer-setting-buttons">
              <button
                type="button"
                class={`keyboard-setting-button footer-setting-button ${props.keyboardPanelVisible() ? "is-active" : ""}`}
                aria-pressed={props.keyboardPanelVisible()}
                onClick={() =>
                  props.setKeyboardPanelVisible(!props.keyboardPanelVisible())
                }
              >
                Panel
              </button>
              <button
                type="button"
                class={`keyboard-setting-button footer-setting-button ${props.keyboardHintsVisible() ? "is-active" : ""}`}
                aria-pressed={props.keyboardHintsVisible()}
                onClick={() =>
                  props.setKeyboardHintsVisible(!props.keyboardHintsVisible())
                }
              >
                Guide
              </button>
              <button
                type="button"
                class={`keyboard-setting-button footer-setting-button ${props.typedKeyFlashEnabled() ? "is-active" : ""}`}
                aria-pressed={props.typedKeyFlashEnabled()}
                onClick={() => {
                  const nextValue = !props.typedKeyFlashEnabled();

                  if (!nextValue) {
                    props.clearTypedKeyFlash();
                  }

                  props.setTypedKeyFlashEnabled(nextValue);
                }}
              >
                Flash
              </button>
              <button
                type="button"
                class="keyboard-setting-button footer-setting-button"
                onClick={() => props.onOpenLayoutModal()}
              >
                Layout
              </button>
            </div>
          </div>
          <span class="footer-separator" aria-hidden="true" />
          <div class="footer-setting-group">
            <span class="keyboard-meta-label">Font</span>
            <div class="footer-setting-buttons">
              <For each={typingFontPresets}>
                {(preset) => (
                  <button
                    type="button"
                    class={`keyboard-setting-button footer-setting-button ${props.selectedFontPresetId() === preset.id ? "is-active" : ""}`}
                    aria-pressed={props.selectedFontPresetId() === preset.id}
                    onClick={() => props.setSelectedFontPresetId(preset.id)}
                  >
                    {preset.label}
                  </button>
                )}
              </For>
            </div>
          </div>
        </div>
        <span class="footer-separator" aria-hidden="true" />
        <button
          type="button"
          class="restart-button"
          onClick={() => props.resetGame()}
        >
          <span class="restart-label">Restart</span>
          <span class="restart-shortcut">Ctrl + Enter</span>
        </button>
      </div>
    </footer>
  );
}
