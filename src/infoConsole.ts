type InfoConsoleStore = typeof globalThis & {
  __shotKeyOriginalConsoleInfo__?: Console["info"];
  __shotKeyInfoConsoleInstalled__?: boolean;
};

const infoConsoleStore = globalThis as InfoConsoleStore;

/**
 * 개발 환경에서만 console.info 출력이 유지되도록 전역 정보 콘솔을 초기화한다.
 *
 * 같은 세션에서 여러 번 호출돼도 최초 1회만 패치한다.
 */
export function setupInfoConsole(): void {
  if (!infoConsoleStore.__shotKeyOriginalConsoleInfo__) {
    infoConsoleStore.__shotKeyOriginalConsoleInfo__ = console.info.bind(console);
  }

  if (infoConsoleStore.__shotKeyInfoConsoleInstalled__) {
    return;
  }

  const originalInfo = infoConsoleStore.__shotKeyOriginalConsoleInfo__;

  // 프로덕션에서는 info만 조용히 무시하고 다른 콘솔 메서드는 건드리지 않는다.
  console.info = import.meta.env.DEV ? originalInfo : () => undefined;
  infoConsoleStore.__shotKeyInfoConsoleInstalled__ = true;
}
