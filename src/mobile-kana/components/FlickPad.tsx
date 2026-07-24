import { For, Match, Switch, type Accessor } from "solid-js";
import type { FlickKeyId, KanaScript } from "../game/types";
import {
  flickPadLayout,
  getFlickCell,
  type FlickPadCell,
} from "../input/flickMap";
import { createFlickPadController } from "../input/useFlickPad";

type FlickPadProps = {
  script: Accessor<KanaScript>;
  isInputLocked: Accessor<boolean>;
  characterRiskMap: Accessor<Record<string, number>>;
  onCharacter: (character: string) => void;
  onRestart: () => void;
  onUnlockAudio?: () => void;
};

/**
 * 일본 10키 스타일 플릭 패드를 렌더링한다.
 * 좌·우·하단 기능키 자리는 스켈레톤, 우하단은 Restart.
 */
export function FlickPad(props: FlickPadProps) {
  const controller = createFlickPadController({
    getScript: () => props.script(),
    onCharacter: (character) => props.onCharacter(character),
    isLocked: () => props.isInputLocked(),
    onUnlockAudio: () => props.onUnlockAudio?.(),
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
              {(cell) => (
                <PadCellView
                  cell={cell}
                  script={props.script}
                  characterRiskMap={props.characterRiskMap}
                  onRestart={props.onRestart}
                  onUnlockAudio={props.onUnlockAudio}
                  onPointerDown={(keyId, event) =>
                    controller.handlePointerDown(keyId, event)
                  }
                  onPointerUp={controller.handlePointerUp}
                  onPointerCancel={controller.handlePointerCancel}
                />
              )}
            </For>
          </div>
        )}
      </For>
    </section>
  );
}

type PadCellViewProps = {
  cell: FlickPadCell;
  script: Accessor<KanaScript>;
  characterRiskMap: Accessor<Record<string, number>>;
  onRestart: () => void;
  onUnlockAudio?: () => void;
  onPointerDown: (keyId: FlickKeyId, event: PointerEvent) => void;
  onPointerUp: (event: PointerEvent) => void;
  onPointerCancel: (event: PointerEvent) => void;
};

/**
 * 스켈레톤·Restart·실키를 분기한다.
 */
function PadCellView(props: PadCellViewProps) {
  return (
    <Switch
      fallback={
        <FlickKey
          keyId={props.cell as FlickKeyId}
          script={props.script}
          characterRiskMap={props.characterRiskMap}
          onPointerDown={(event) =>
            props.onPointerDown(props.cell as FlickKeyId, event)
          }
          onPointerUp={props.onPointerUp}
          onPointerCancel={props.onPointerCancel}
        />
      }
    >
      <Match when={props.cell === null}>
        <div class="kana-flick-key is-spacer" aria-hidden="true" />
      </Match>
      <Match when={props.cell === "restart"}>
        <button
          type="button"
          class="kana-flick-key is-restart"
          aria-label="Restart"
          onPointerDown={(event) => {
            event.preventDefault();
            props.onUnlockAudio?.();
          }}
          onClick={() => props.onRestart()}
        >
          <span class="kana-restart-label">Restart</span>
        </button>
      </Match>
      <Match when={props.cell === "skeleton"}>
        <div
          class="kana-flick-key is-skeleton"
          aria-hidden="true"
        />
      </Match>
    </Switch>
  );
}

type FlickKeyProps = {
  keyId: FlickKeyId;
  script: Accessor<KanaScript>;
  characterRiskMap: Accessor<Record<string, number>>;
  onPointerDown: (event: PointerEvent) => void;
  onPointerUp: (event: PointerEvent) => void;
  onPointerCancel: (event: PointerEvent) => void;
};

/**
 * 글자별 위험도를 CSS 변수로 넘긴다.
 * @param riskMap 문자→위험도 맵
 * @param character 대상 문자
 */
function riskStyle(
  riskMap: Record<string, number>,
  character: string | null | undefined,
) {
  if (!character) {
    return { "--glyph-risk": "0" };
  }
  return { "--glyph-risk": String(riskMap[character] ?? 0) };
}

/**
 * 단일 플릭 키캡(중앙·방향 힌트)을 표시한다.
 */
function FlickKey(props: FlickKeyProps) {
  const cell = () => getFlickCell(props.script(), props.keyId);
  const riskMap = () => props.characterRiskMap();

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
      <span
        class="kana-flick-hint is-up kana-flick-glyph"
        style={riskStyle(riskMap(), cell().up)}
      >
        {cell().up ?? ""}
      </span>
      <span
        class="kana-flick-hint is-left kana-flick-glyph"
        style={riskStyle(riskMap(), cell().left)}
      >
        {cell().left ?? ""}
      </span>
      <span
        class="kana-flick-center kana-flick-glyph"
        style={riskStyle(riskMap(), cell().center)}
      >
        {cell().center ?? ""}
      </span>
      <span
        class="kana-flick-hint is-right kana-flick-glyph"
        style={riskStyle(riskMap(), cell().right)}
      >
        {cell().right ?? ""}
      </span>
      <span
        class="kana-flick-hint is-down kana-flick-glyph"
        style={riskStyle(riskMap(), cell().down)}
      >
        {cell().down ?? ""}
      </span>
    </button>
  );
}
