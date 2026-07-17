import { BuildMeta } from "../components/BuildMeta";
import { useTheme } from "../hooks/useTheme";
import { FlickPad } from "./components/FlickPad";
import { KanaChallenge } from "./components/KanaChallenge";
import { KanaFooter } from "./components/KanaFooter";
import { createKanaSession } from "./hooks/createKanaSession";
import "./styles.css";

/**
 * 모바일 히라가나/카타카나 플릭 미니게임 셸.
 */
export default function KanaApp() {
  const theme = useTheme();
  const session = createKanaSession();

  return (
    <main class="kana-shell">
      <BuildMeta theme={theme.theme} setTheme={theme.setTheme} />
      <div class="kana-main">
        <KanaChallenge
          character={() => session.challenge().character}
          upcoming={session.upcoming}
          score={session.score}
          streak={session.streak}
          feedback={session.feedback}
          isInputLocked={session.isInputLocked}
        />
        <FlickPad
          script={session.script}
          isInputLocked={session.isInputLocked}
          onCharacter={session.submitCharacter}
        />
        <KanaFooter
          script={session.script}
          setScript={session.setScript}
          soundEnabled={session.soundEnabled}
          setSoundEnabled={session.setSoundEnabled}
          onRestart={session.restart}
        />
      </div>
    </main>
  );
}
