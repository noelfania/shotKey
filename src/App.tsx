import { Show, createSignal, onMount } from "solid-js";
import "./App.css";
import { BuildMeta } from "./components/BuildMeta";
import { ChallengeCard } from "./components/ChallengeCard";
import { GameFooter } from "./components/GameFooter";
import { KeyboardLayoutModal } from "./components/KeyboardLayoutModal";
import { KeyboardPanel } from "./components/KeyboardPanel";
import { createGameSession } from "./hooks/createGameSession";
import { useTheme } from "./hooks/useTheme";
import type { KeyboardLayoutId } from "./game/types";

/**
 * 타이핑 훈련 화면의 최상위 셸 컴포넌트다.
 */
export default function App() {
  const session = createGameSession();
  const theme = useTheme();
  const [layoutModalOpen, setLayoutModalOpen] = createSignal(false);

  onMount(() => {
    if (session.keyboardLayout() === null) {
      setLayoutModalOpen(true);
    }
  });

  /**
   * 레이아웃을 선택하고 모달을 닫는다.
   * @param layoutId us 또는 jis
   */
  const handleSelectLayout = (layoutId: KeyboardLayoutId) => {
    session.setKeyboardLayout(layoutId);
    setLayoutModalOpen(false);
  };

  return (
    <main class="game-shell" style={session.appStyle()}>
      <BuildMeta theme={theme.theme} setTheme={theme.setTheme} />
      <section class="game-stage" aria-live="polite">
        <div class="game-stage-main">
          <ChallengeCard
            setChallengeCardRef={session.setChallengeCardRef}
            isInputLocked={session.isInputLocked}
            lockRemainingMs={session.lockRemainingMs}
            bestScore={session.bestScore}
            bestStreak={session.bestStreak}
            bestSurvivalMs={session.bestSurvivalMs}
            mostMissedCharacters={session.mostMissedCharacters}
            score={session.score}
            streak={session.streak}
            handStats={session.handStats}
            challenge={session.challenge}
            upcomingChallenges={session.upcomingChallenges}
            previewOpacities={session.previewOpacities}
            gauge={session.gauge}
            gaugeFillStyle={session.gaugeFillStyle}
            feedback={session.feedback}
            feedbackDetailAccent={session.feedbackDetailAccent}
          />
          <Show when={session.keyboardPanelVisible()}>
            <KeyboardPanel
              rows={session.keyboardRows}
              challenge={session.challenge}
              keyboardHintsVisible={session.keyboardHintsVisible}
              typedKeyFlashEnabled={session.typedKeyFlashEnabled}
              flashedKeyId={session.flashedKeyId}
              keyboardShiftKeyId={session.keyboardShiftKeyId}
              keyRiskMap={session.keyRiskMap}
            />
          </Show>
        </div>

        <GameFooter
          endlessModeEnabled={session.endlessModeEnabled}
          trainingMode={session.trainingMode}
          soundEnabled={session.soundEnabled}
          visualEffectsEnabled={session.visualEffectsEnabled}
          keyboardPanelVisible={session.keyboardPanelVisible}
          keyboardHintsVisible={session.keyboardHintsVisible}
          typedKeyFlashEnabled={session.typedKeyFlashEnabled}
          selectedFontPresetId={session.selectedFontPresetId}
          resetGame={session.resetGame}
          setEndlessModeEnabled={session.setEndlessModeEnabled}
          setSoundEnabled={session.setSoundEnabled}
          setVisualEffectsEnabled={session.setVisualEffectsEnabled}
          setKeyboardPanelVisible={session.setKeyboardPanelVisible}
          setKeyboardHintsVisible={session.setKeyboardHintsVisible}
          setTypedKeyFlashEnabled={session.setTypedKeyFlashEnabled}
          clearTypedKeyFlash={session.clearTypedKeyFlash}
          setSelectedFontPresetId={session.setSelectedFontPresetId}
          onOpenLayoutModal={() => setLayoutModalOpen(true)}
        />
      </section>

      <KeyboardLayoutModal
        open={layoutModalOpen()}
        required={session.keyboardLayout() === null}
        currentLayout={session.keyboardLayout()}
        onSelect={handleSelectLayout}
        onClose={() => setLayoutModalOpen(false)}
      />
    </main>
  );
}
