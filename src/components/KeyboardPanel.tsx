import { For, Show, type Accessor, type JSX } from "solid-js";
import { keyboardRows } from "../game/keyboardLayout";
import type { ChallengeEntry } from "../game/types";

type KeyboardPanelProps = {
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
    <section class="keyboard-panel" aria-label="키보드 시각화">
      <div class="keyboard-rows">
        <For each={keyboardRows}>
          {(row) => (
            <div class="keyboard-row">
              <For each={row}>
                {(key) => {
                  const isAction = key.kind === "action";
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
                    flex: `${key.widthUnits ?? 1} 1 0`,
                    "--risk-alpha": riskAlpha(),
                  });
                  const className = () =>
                    [
                      "keycap",
                      isAction ? "keycap-action" : "keycap-char",
                      key.hand ? `keycap-${key.hand}` : "",
                      isActiveKey() ? "is-current" : "",
                      isShiftHelper() ? "is-shift-helper" : "",
                      isPressedFlash() ? "is-pressed-flash" : "",
                    ]
                      .filter(Boolean)
                      .join(" ");

                  return (
                    <div class={className()} style={keycapStyle()}>
                      <Show
                        when={isAction}
                        fallback={
                          <>
                            <span class="keycap-shift-label">{key.shifted}</span>
                            <span class="keycap-base-label">{key.base}</span>
                          </>
                        }
                      >
                        <span class="keycap-action-label">
                          {key.actionLabel}
                        </span>
                      </Show>
                    </div>
                  );
                }}
              </For>
            </div>
          )}
        </For>
      </div>
    </section>
  );
}
