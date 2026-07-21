---
status: active
audience: developer
verified: 2026-07-21
---

# localStorage 키

정의: [`src/game/constants.ts`](../../src/game/constants.ts) (PC), [`src/mobile-kana/hooks/createKanaSession.ts`](../../src/mobile-kana/hooks/createKanaSession.ts) / [`src/mobile-kana/game/kanaStats.ts`](../../src/mobile-kana/game/kanaStats.ts) (카나)

| 키 | 저장 내용 |
|----|-----------|
| `shot-key:training-mode` | `all` \| `left` \| `right` |
| `shot-key:endless-mode` | `true` \| `false` |
| `shot-key:character-stats` | 문자별 학습 JSON |
| `shot-key:sound-enabled` | PC 효과음 on/off (카나는 저장하지 않음) |
| `shot-key:visual-effects-enabled` | 시각효과 on/off |
| `shot-key:keyboard-panel-visible` | 키보드 패널 표시 |
| `shot-key:keyboard-hints-visible` | 키 가이드 하이라이트 |
| `shot-key:typed-key-flash-enabled` | 키캡 반짝 |
| `shot-key:typing-font` | 폰트 프리셋 id |
| `shot-key:best-score` | 최고 점수 |
| `shot-key:best-streak` | 최고 연속 |
| `shot-key:best-survival-ms` | 최고 버틴 시간(ms) |
| `shot-key:theme` | `light` \| `dark` |
| `shot-key:keyboard-layout` | `us` \| `jis` (없으면 선택 모달) |
| `shot-key:kana-script` | `hiragana` \| `katakana` (모바일 카나) |
| `shot-key:kana-character-stats:hiragana` | 히라가나 + 해당 모드 공용 구두점 문자 통계 JSON |
| `shot-key:kana-character-stats:katakana` | 카타카나 + 해당 모드 공용 구두점 문자 통계 JSON |

읽기/쓰기: 공용·PC 키와 `shot-key:kana-script`는 [`src/storage/persistence.ts`](../../src/storage/persistence.ts) 헬퍼를 사용하고, 카나 문자 통계는 `kanaStats.ts`가 직접 검증·저장한다.
