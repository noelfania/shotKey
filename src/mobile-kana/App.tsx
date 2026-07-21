import { onCleanup, onMount } from "solid-js";
import "../App.css";
import { BuildMeta } from "../components/BuildMeta";
import { useTheme } from "../hooks/useTheme";
import { FlickPad } from "./components/FlickPad";
import { KanaChallenge } from "./components/KanaChallenge";
import { KanaFooter } from "./components/KanaFooter";
import { createKanaSession } from "./hooks/createKanaSession";
import "./styles.css";

/**
 * 모바일 히라가나/카타카나 플릭 미니게임 셸.
 * 상단: BuildMeta → 컨트롤, 하단 1/3: 플릭 패드. Restart 없음.
 */
export default function KanaApp() {
  const theme = useTheme();
  const session = createKanaSession();

  onMount(() => {
    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.documentElement.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    onCleanup(() => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overscrollBehavior = previousOverscroll;
    });
  });

  return (
    <main class="kana-shell">
      <div class="kana-main">
        <BuildMeta theme={theme.theme} setTheme={theme.setTheme} />
        <KanaFooter
          script={session.script}
          setScript={session.setScript}
          soundEnabled={session.soundEnabled}
          setSoundEnabled={session.setSoundEnabled}
        />
        <KanaChallenge
          character={() => session.challenge().character}
          upcoming={session.upcoming}
          weakestCharacters={session.weakestCharacters}
          feedback={session.feedback}
          isInputLocked={session.isInputLocked}
        />
        <FlickPad
          script={session.script}
          isInputLocked={session.isInputLocked}
          characterRiskMap={session.characterRiskMap}
          onCharacter={session.submitCharacter}
        />
      </div>
    </main>
  );
}
