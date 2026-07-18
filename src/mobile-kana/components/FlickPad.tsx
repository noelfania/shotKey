import { For, type Accessor } from "solid-js";
import type { FlickKeyId, KanaScript } from "../game/types";
import { flickPadLayout, getFlickCell } from "../input/flickMap";
import { createFlickPadController } from "../input/useFlickPad";

type FlickPadProps = {
  script: Accessor<KanaScript>;
  isInputLocked: Accessor<boolean>;
  onCharacter: (character: string) => void;
};

/**
 * 일본 10키 스타일 플릭 패드를 렌더링한다.
 */
export function FlickPad(props: FlickPadProps) {
  const controller = createFlickPadController({
    getScript: () => props.script(),
    onCharacter: (character) => props.onCharacter(character),
    isLocked: () => props.isInputLocked(),
  });

  return (
    <section
      class="kana-flick-pad"
      aria-label="Kana flick pad"
      classList={{ "is-locked": props.isInputLocked() }}
    >
      <For each={flickPadLayout}>
        {(row) => (
          <div class="kana-flick-row">
            <For each={row}>
              {(keyId) => {
                if (keyId === null) {
                  return <div class="kana-flick-key is-spacer" aria-hidden="true" />;
                }
                return (
                  <FlickKey
                    keyId={keyId}
                    script={props.script}
                    onPointerDown={(event) =>
                      controller.handlePointerDown(keyId, event)
                    }
                    onPointerUp={controller.handlePointerUp}
                    onPointerCancel={controller.handlePointerCancel}
                  />
                );
              }}
            </For>
          </div>
        )}
      </For>
    </section>
  );
}

type FlickKeyProps = {
  keyId: FlickKeyId;
  script: Accessor<KanaScript>;
  onPointerDown: (event: PointerEvent) => void;
  onPointerUp: (event: PointerEvent) => void;
  onPointerCancel: (event: PointerEvent) => void;
};

/**
 * 단일 플릭 키캡(중앙·방향 힌트)을 표시한다.
 */
function FlickKey(props: FlickKeyProps) {
  const cell = () => getFlickCell(props.script(), props.keyId);

  return (
    <button
      type="button"
      class="kana-flick-key"
      aria-label={`Flick key ${cell().center ?? props.keyId}`}
      onPointerDown={(event) => {
        event.preventDefault();
        props.onPointerDown(event);
      }}
      onPointerUp={(event) => props.onPointerUp(event)}
      onPointerCancel={(event) => props.onPointerCancel(event)}
      onContextMenu={(event) => event.preventDefault()}
    >
      <span class="kana-flick-hint is-up">{cell().up ?? ""}</span>
      <span class="kana-flick-hint is-left">{cell().left ?? ""}</span>
      <span class="kana-flick-center">{cell().center ?? ""}</span>
      <span class="kana-flick-hint is-right">{cell().right ?? ""}</span>
      <span class="kana-flick-hint is-down">{cell().down ?? ""}</span>
    </button>
  );
}
