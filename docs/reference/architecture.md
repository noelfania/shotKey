---
status: active
audience: developer
verified: 2026-07-17
---

# 아키텍처

SolidJS + Vite 단일 페이지 앱. PC 쿼티와 모바일 카나 미니게임은 **진입만 공유**하고 게임 로직·UI는 분리한다.

## 진입 분기

[`src/main.tsx`](../../src/main.tsx): `?mode=` 강제 → 아니면 coarse pointer / 좁은 뷰포트면 `mobile-kana`, 아니면 PC `App`.

## `src/` 모듈 맵

```
src/
  main.tsx              # bootstrap: pc | kana 선택 후 render
  App.tsx               # PC ShotKey 셸
  buildMeta.ts
  infoConsole.ts
  game/                 # PC 쿼티 전용
    constants.ts
    types.ts
    keyboardLayout.ts
    challengeQueue.ts
    scoring.ts
    stats.ts
    formatting.ts
  storage/
    persistence.ts
  audio/
    feedbackAudio.ts    # PC·카나 모두 import 가능 (상태 비공유)
  hooks/
    createGameSession.ts
    useTheme.ts
  components/           # PC UI (+ BuildMeta는 카나도 사용)
  mobile-kana/          # 모바일 카나 미니게임 (쿼티 로직 비재사용)
    App.tsx
    styles.css
    game/               # gojuon, challenge
    input/              # flickMap, useFlickPad
    hooks/createKanaSession.ts
    components/         # KanaChallenge, FlickPad, KanaFooter
```

## 데이터 흐름 (PC 요약)

1. `createGameSession` — signal 상태, `keydown` 입력, gauge decay, `keyboardLayout` id
2. `keyboardLayout` → `getChallengePool(layoutId)` / `getKeyboardRows(layoutId)`
3. `challengeQueue` — 가중 랜덤 출제, MISS 재출제 삽입
4. `characterStats` — localStorage 동기화, 약점 키 색상·재출제 가중치

## 데이터 흐름 (카나 요약)

1. `createKanaSession` — 출제·점수·스크립트 토글 (keydown 없음)
2. `FlickPad` pointer → `flickMap`으로 문자 확정 → `submitCharacter`
3. 테마·BuildMeta만 PC와 공유

## 관련 문서

- 게임 규칙: [gameplay-rules.md](gameplay-rules.md)
- 카나 미니게임: [kana-minigame-rules.md](kana-minigame-rules.md)
- 레이아웃 확장: [keyboard-layout-extensibility.md](keyboard-layout-extensibility.md)
- storage 키: [storage-keys.md](storage-keys.md)
