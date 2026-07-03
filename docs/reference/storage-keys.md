---
status: active
audience: developer
verified: 2026-07-04
---

# localStorage 키

정의: [`src/game/constants.ts`](../../src/game/constants.ts)

| 키 | 저장 내용 |
|----|-----------|
| `shot-key:training-mode` | `all` \| `left` \| `right` |
| `shot-key:endless-mode` | `true` \| `false` |
| `shot-key:character-stats` | 문자별 학습 JSON |
| `shot-key:sound-enabled` | 효과음 on/off |
| `shot-key:visual-effects-enabled` | 시각효과 on/off |
| `shot-key:keyboard-panel-visible` | 키보드 패널 표시 |
| `shot-key:keyboard-hints-visible` | 키 가이드 하이라이트 |
| `shot-key:typed-key-flash-enabled` | 키캡 반짝 |
| `shot-key:typing-font` | 폰트 프리셋 id |
| `shot-key:best-score` | 최고 점수 |
| `shot-key:best-streak` | 최고 연속 |
| `shot-key:best-survival-ms` | 최고 버틴 시간(ms) |
| `shot-key:theme` | `light` \| `dark` |

읽기/쓰기: [`src/storage/persistence.ts`](../../src/storage/persistence.ts)
