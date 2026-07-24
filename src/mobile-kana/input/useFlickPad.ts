import type { FlickDirection, FlickKeyId } from "../game/types";
import { resolveFlickCharacter } from "./flickMap";
import type { KanaScript } from "../game/types";

const flickThresholdPx = 28;

type ActivePointer = {
  pointerId: number;
  keyId: FlickKeyId;
  startX: number;
  startY: number;
};

type UseFlickPadOptions = {
  getScript: () => KanaScript;
  onCharacter: (character: string) => void;
  isLocked: () => boolean;
  /** iOS 등에서 오디오 잠금 해제 (pointerdown 제스처) */
  onUnlockAudio?: () => void;
};

/**
 * pointer 제스처로 플릭 문자를 확정한다.
 */
export function createFlickPadController(options: UseFlickPadOptions) {
  let active: ActivePointer | null = null;

  /**
   * 이동량으로 플릭 방향을 판정한다.
   */
  function resolveDirection(dx: number, dy: number): FlickDirection {
    const distance = Math.hypot(dx, dy);
    if (distance < flickThresholdPx) {
      return "center";
    }
    if (Math.abs(dx) >= Math.abs(dy)) {
      return dx < 0 ? "left" : "right";
    }
    return dy < 0 ? "up" : "down";
  }

  /**
   * 키에서 pointerdown을 처리한다.
   */
  function handlePointerDown(
    keyId: FlickKeyId,
    event: PointerEvent,
  ): void {
    // 잠금 중이어도 제스처로 오디오 unlock은 허용
    options.onUnlockAudio?.();

    if (options.isLocked()) {
      return;
    }
    if (active !== null) {
      return;
    }
    const target = event.currentTarget;
    if (target instanceof Element) {
      target.setPointerCapture(event.pointerId);
    }
    active = {
      pointerId: event.pointerId,
      keyId,
      startX: event.clientX,
      startY: event.clientY,
    };
  }

  /**
   * pointerup/cancel 시 문자를 확정한다.
   */
  function handlePointerUp(event: PointerEvent): void {
    if (active === null || active.pointerId !== event.pointerId) {
      return;
    }
    const { keyId, startX, startY } = active;
    active = null;

    if (options.isLocked()) {
      return;
    }

    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    const direction = resolveDirection(dx, dy);
    const character = resolveFlickCharacter(
      options.getScript(),
      keyId,
      direction,
    );
    if (character !== null) {
      options.onCharacter(character);
    }
  }

  /**
   * 캡처 손실 시 활성 제스처를 버린다.
   */
  function handlePointerCancel(event: PointerEvent): void {
    if (active !== null && active.pointerId === event.pointerId) {
      active = null;
    }
  }

  return {
    handlePointerDown,
    handlePointerUp,
    handlePointerCancel,
  };
}
