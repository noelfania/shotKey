import { onCleanup, onMount } from "solid-js";
import "../App.css";
import { BuildMeta } from "../components/BuildMeta";
import { useTheme } from "../hooks/useTheme";
import { FlickPad } from "./components/FlickPad";
import { KanaChallenge } from "./components/KanaChallenge";
import { KanaFooter } from "./components/KanaFooter";
import { KanaMostMissed } from "./components/KanaMostMissed";
import { createKanaSession } from "./hooks/createKanaSession";
import "./styles.css";

/**
 * 모바일 히라가나/카타카나 플릭 미니게임 셸.
 * BuildMeta → 컨트롤 → 출제 → Most missed → 플릭 패드(고정 높이) → 여백.
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
          feedback={session.feedback}
          feedbackDetailAccent={session.feedbackDetailAccent}
          isInputLocked={session.isInputLocked}
          gauge={session.gauge}
          gaugeFillStyle={session.gaugeFillStyle}
          setPromptRef={session.setPromptRef}
        />
        <KanaMostMissed weakestCharacters={session.weakestCharacters} />
        <FlickPad
          script={session.script}
          isInputLocked={() =>
            session.isInputLocked() || !session.canAcceptInput()
          }
          characterRiskMap={session.characterRiskMap}
          onCharacter={session.submitCharacter}
          onRestart={session.restart}
          onUnlockAudio={session.unlockAudio}
        />
        <div class="kana-main-spacer" aria-hidden="true" />
      </div>
    </main>
  );
}
