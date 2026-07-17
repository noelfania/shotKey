import { render } from "solid-js/web";
import "./index.css";
import App from "./App";
import KanaApp from "./mobile-kana/App";
import { setupInfoConsole } from "./infoConsole";

setupInfoConsole();

/**
 * URL·디바이스 특성으로 PC 쿼티 / 카나 미니게임을 고른다.
 * ?mode=kana | ?mode=pc 가 최우선이다.
 */
function resolveEntryMode(): "kana" | "pc" {
  const params = new URLSearchParams(window.location.search);
  const forced = params.get("mode");
  if (forced === "kana" || forced === "pc") {
    return forced;
  }

  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const narrowViewport = window.matchMedia("(max-width: 768px)").matches;
  if (coarsePointer || narrowViewport) {
    return "kana";
  }
  return "pc";
}

const root = document.getElementById("root");

if (root !== null) {
  const mode = resolveEntryMode();
  render(() => (mode === "kana" ? <KanaApp /> : <App />), root);
}
