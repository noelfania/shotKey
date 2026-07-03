import type { Accessor } from "solid-js";
import { appBuildDate, appVersion, changelogUrl } from "../buildMeta";
import type { AppTheme } from "../game/types";

type BuildMetaProps = {
  theme: Accessor<AppTheme>;
  setTheme: (value: AppTheme) => void;
};

/**
 * 좌하단 테마 토글과 빌드 버전·변경 이력 영역을 렌더링한다.
 * @param props.theme 현재 light/dark 테마
 * @param props.setTheme 테마 변경 함수
 */
export function BuildMeta(props: BuildMetaProps) {
  /**
   * 라이트/다크 테마를 전환한다.
   */
  const toggleTheme = () => {
    props.setTheme(props.theme() === "light" ? "dark" : "light");
  };

  return (
    <div class="app-build-meta-bar">
      <button
        type="button"
        class="app-theme-toggle"
        aria-label={
          props.theme() === "light" ? "다크 테마로 전환" : "라이트 테마로 전환"
        }
        aria-pressed={props.theme() === "dark"}
        onClick={toggleTheme}
      >
        {props.theme() === "light" ? (
          <svg
            class="app-theme-toggle-icon"
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
            class="app-theme-toggle-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>

      <aside class="app-build-meta" aria-label="앱 버전 정보">
        <span class="app-build-meta-version">v{appVersion}</span>
        <span class="app-build-meta-separator" aria-hidden="true">
          ·
        </span>
        <span class="app-build-meta-date">Last update {appBuildDate}</span>
        <span class="app-build-meta-separator" aria-hidden="true">
          ·
        </span>
        <a
          class="app-build-meta-link"
          href={changelogUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          변경 내역
        </a>
      </aside>
    </div>
  );
}
