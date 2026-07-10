import { For, Show } from "solid-js";
import { keyboardLayoutOptions } from "../game/constants";
import { getKeyboardRows } from "../game/keyboardLayout";
import type { KeyboardLayoutId } from "../game/types";

type KeyboardLayoutModalProps = {
  open: boolean;
  required: boolean;
  currentLayout: KeyboardLayoutId | null;
  onSelect: (layoutId: KeyboardLayoutId) => void;
  onClose: () => void;
};

/**
 * 키보드 레이아웃 선택 모달을 렌더링한다.
 * @param props.open 모달 표시 여부
 * @param props.required 첫 선택이면 닫기 불가
 * @param props.currentLayout 현재 선택된 레이아웃
 * @param props.onSelect 레이아웃 선택 콜백
 * @param props.onClose 닫기 콜백 (required가 아닐 때만)
 */
export function KeyboardLayoutModal(props: KeyboardLayoutModalProps) {
  /**
   * 배경 클릭 시 필수 선택이 아니면 모달을 닫는다.
   */
  const handleBackdropClick = () => {
    if (!props.required) {
      props.onClose();
    }
  };

  return (
    <Show when={props.open}>
      <div
        class="layout-modal-backdrop"
        role="presentation"
        onClick={handleBackdropClick}
      >
        <div
          class="layout-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="layout-modal-title"
          onClick={(event) => event.stopPropagation()}
        >
          <h2 id="layout-modal-title" class="layout-modal-title">
            Select keyboard layout
          </h2>
          <p class="layout-modal-subtitle">
            Choose the layout that matches your physical keyboard.
          </p>
          <div class="layout-modal-options">
            <For each={keyboardLayoutOptions}>
              {(option) => {
                const previewKeys = () =>
                  getKeyboardRows(option.id)[0]
                    .filter((key) => key.kind === "char")
                    .slice(0, 8);

                return (
                  <button
                    type="button"
                    class={`layout-modal-option ${props.currentLayout === option.id ? "is-active" : ""}`}
                    onClick={() => props.onSelect(option.id)}
                  >
                    <span class="layout-modal-option-label">{option.label}</span>
                    <span class="layout-modal-preview" aria-hidden="true">
                      <For each={previewKeys()}>
                        {(key) => (
                          <span class="layout-modal-preview-key">
                            <span class="layout-modal-preview-shift">
                              {key.shifted ?? ""}
                            </span>
                            <span class="layout-modal-preview-base">
                              {key.base}
                            </span>
                          </span>
                        )}
                      </For>
                    </span>
                  </button>
                );
              }}
            </For>
          </div>
          <Show when={!props.required}>
            <button
              type="button"
              class="layout-modal-cancel"
              onClick={() => props.onClose()}
            >
              Cancel
            </button>
          </Show>
        </div>
      </div>
    </Show>
  );
}
