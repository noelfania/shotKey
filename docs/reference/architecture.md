---
status: active
audience: developer
verified: 2026-07-10
---

# 아키텍처

SolidJS + Vite 단일 페이지 앱. 게임 로직은 프레임워크 무관 모듈, UI는 컴ponent + `createGameSession`.

## `src/` 모듈 맵

```
src/
  main.tsx              # Solid render 진입
  App.tsx               # 레이아웃 셸
  buildMeta.ts          # 빌드 버전·날짜 (Vite define)
  infoConsole.ts        # dev 전용 console.info
  game/
    constants.ts        # 게임 상수, storage key, modeOptions
    types.ts
    keyboardLayout.ts   # 레이아웃 레지스트리, challenge pool, code→keyId
    challengeQueue.ts   # 출제·재출제 큐 (layoutId 인자)
    scoring.ts          # 판정·게이지 보상
    stats.ts            # 문자/손 통계, 약점 리스크
    formatting.ts       # 표시용 포맷, 대소문자 CSS 클래스
  storage/
    persistence.ts      # localStorage read/write
  audio/
    feedbackAudio.ts    # 효과음
  hooks/
    createGameSession.ts  # 상태, keydown, 타이머
    useTheme.ts           # 라이트/다크
  components/
    ChallengeCard.tsx
    KeyboardPanel.tsx
    KeyboardLayoutModal.tsx
    GameFooter.tsx
    BuildMeta.tsx
    ChallengeCharacter.tsx
```

## 데이터 흐름 (요약)

1. `createGameSession` — signal 상태, `keydown` 입력, gauge decay, `keyboardLayout` id
2. `keyboardLayout` → `getChallengePool(layoutId)` / `getKeyboardRows(layoutId)`
3. `challengeQueue` — 가중 랜덤 출제, MISS 재출제 삽입
4. `characterStats` — localStorage 동기화, 약점 키 색상·재출제 가중치

## 관련 문서

- 게임 규칙: [gameplay-rules.md](gameplay-rules.md)
- 레이아웃 확장: [keyboard-layout-extensibility.md](keyboard-layout-extensibility.md)
- storage 키: [storage-keys.md](storage-keys.md)
