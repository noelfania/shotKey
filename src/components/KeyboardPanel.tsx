import { For, Show, type Accessor, type JSX } from "solid-js";
import type { ChallengeEntry, KeyboardKey } from "../game/types";

type KeyboardPanelProps = {
  rows: Accessor<KeyboardKey[][]>;
  challenge: Accessor<ChallengeEntry>;
  keyboardHintsVisible: Accessor<boolean>;
  typedKeyFlashEnabled: Accessor<boolean>;
  flashedKeyId: Accessor<string | null>;
  keyboardShiftKeyId: Accessor<string | null>;
  keyRiskMap: Accessor<Record<string, number>>;
};

/**
 * 현재 입력 키와 약점 하이라이트를 키보드 패널로 시각화한다.
 */
export function KeyboardPanel(props: KeyboardPanelProps) {
  return (
    <section class="keyboard-panel" aria-label="Keyboard">
      <div class="keyboard-rows">
        <For each={props.rows()}>
          {(row) => (
            <div class="keyboard-row">
              <For each={row}>
                {(key) => {
                  const units = key.widthUnits ?? 1;
                  const widthStyle = (): JSX.CSSProperties => ({
                    "--width-units": units,
                  });

                  // 홈행 줄기 자리만 확보 (보이지 않음)
                  if (key.shape === "jis-enter-slot") {
                    return (
                      <div
                        class="keycap-jis-enter-slot"
                        style={widthStyle()}
                        aria-hidden="true"
                      />
                    );
                  }

                  const isAction = key.kind === "action";
                  const isJisEnter = key.shape === "jis-enter";
                  const isActiveKey = () =>
                    props.keyboardHintsVisible() &&
                    key.id === props.challenge().keyId;
                  const isShiftHelper = () =>
                    props.keyboardHintsVisible() &&
                    key.id === props.keyboardShiftKeyId();
                  const isPressedFlash = () =>
                    props.typedKeyFlashEnabled() &&
                    key.id === props.flashedKeyId();
                  const riskAlpha = () =>
                    isAction ? 0 : (props.keyRiskMap()[key.id] ?? 0);
                  const keycapStyle = (): JSX.CSSProperties => ({
                    ...widthStyle(),
                    "--risk-alpha": riskAlpha(),
                  });
                  const className = () =>
                    [
                      "keycap",
                      isAction ? "keycap-action" : "keycap-char",
                      key.hand ? `keycap-${key.hand}` : "",
                      isJisEnter ? "keycap-jis-enter" : "",
                      isActiveKey() ? "is-current" : "",
                      isShiftHelper() ? "is-shift-helper" : "",
                      isPressedFlash() ? "is-pressed-flash" : "",
                    ]
                      .filter(Boolean)
                      .join(" ");

                  const keycap = (
                    <div class={className()} style={keycapStyle()}>
                      <Show when={isJisEnter}>
                        <svg
                          class="keycap-jis-enter-shape"
                          viewBox="0 0 69.4 116"
                          preserveAspectRatio="none"
                          aria-hidden="true"
                        >
                          <path d="M16.75 .75 H53.4 C62.24 .75 69.4 7.91 69.4 16.75 V99.25 C69.4 108.09 62.24 115.25 53.4 115.25 H28.6 C19.76 115.25 12.6 108.09 12.6 99.25 V70 C12.6 61.7 7.7 55.2 .75 54 V16.75 C.75 7.91 7.91 .75 16.75 .75 Z" />
                        </svg>
                      </Show>
                      <Show
                        when={isAction}
                        fallback={
                          <>
                            <span class="keycap-shift-label">{key.shifted}</span>
                            <span class="keycap-base-label">{key.base}</span>
                          </>
                        }
                      >
                        <Show when={key.actionLabel}>
                          <Show
                            when={key.actionLabelLines}
                            fallback={
                              <span class="keycap-action-label">
                                {key.actionLabel}
                              </span>
                            }
                          >
                            {(lines) => (
                              <span class="keycap-action-label keycap-action-label-lines">
                                <For each={lines()}>
                                  {(line) => <span>{line}</span>}
                                </For>
                              </span>
                            )}
                          </Show>
                        </Show>
                      </Show>
                    </div>
                  );

                  // L자 Enter는 앵커 폭만 Q행에 두고, 키캡은 2행으로 절대 배치한다.
                  if (isJisEnter) {
                    return (
                      <div
                        class="keycap-jis-enter-anchor"
                        style={widthStyle()}
                      >
                        {keycap}
                      </div>
                    );
                  }

                  return keycap;
                }}
              </For>
            </div>
          )}
        </For>
      </div>
    </section>
  );
}
