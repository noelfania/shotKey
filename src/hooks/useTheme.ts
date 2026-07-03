import { createEffect, createSignal, onMount } from "solid-js";
import { themeStorageKey } from "../game/constants";
import type { AppTheme } from "../game/types";
import {
  applyTheme,
  readStoredTheme,
  writeStoredValue,
} from "../storage/persistence";

/**
 * 라이트/다크 테마 상태를 관리하고 document에 반영한다.
 * @returns 현재 테마와 변경 함수
 */
export function useTheme() {
  const [theme, setThemeState] = createSignal<AppTheme>(readStoredTheme());

  onMount(() => {
    applyTheme(theme());
  });

  createEffect(() => {
    const nextTheme = theme();
    applyTheme(nextTheme);
    writeStoredValue(themeStorageKey, nextTheme);
  });

  /**
   * UI 테마를 변경한다.
   * @param nextTheme light 또는 dark
   */
  const setTheme = (nextTheme: AppTheme) => {
    setThemeState(nextTheme);
  };

  return { theme, setTheme };
}
