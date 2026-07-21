---
name: gameplay-review
description: 게임 규칙, 판정, 게이지, 키보드 UI 변경을 프로젝트 규칙 문서와 대조해 검토한다. 타이핑 흐름, 모드 규칙, HUD 및 keyboard-panel 일관성을 확인해야 할 때 사용한다.
---

# Gameplay Review

## 목적

타이핑 플레이 경험과 UI 변경이 프로젝트 게임 규칙과 충돌하지 않는지 점검한다.

## 기본 참조 문서

- [docs/reference/gameplay-rules.md](../../docs/reference/gameplay-rules.md)
- [docs/reference/kana-minigame-rules.md](../../docs/reference/kana-minigame-rules.md)
- [docs/reference/architecture.md](../../docs/reference/architecture.md)
- [.cursor/rules/project-standards.mdc](../../rules/project-standards.mdc) — 요약·링크表

## 주로 쓰는 상황

- `createGameSession`, `challengeQueue`, 판정·입력 처리 수정
- ChallengeCard, KeyboardPanel, GameFooter UI 변경
- 전체 / 왼손 / 오른손 / 무한모드 동작 변경
- 모바일 카나 FlickPad, KanaChallenge, 문자 통계·랭킹 변경

## 작업 순서

1. 변경 범위를 요약한다.
2. gameplay-rules와 맞는지 확인한다.
3. UI 텍스트와 실제 동작이 어긋나지 않는지 본다.
4. 빠진 수동 확인 항목을 적는다.

## 핵심 체크리스트

- 현재 입력 문자 1개가 명확히 보이는가
- 다음 문자 미리보기가 깨지지 않는가
- 정답 시 즉시 다음 문자로 진행하는가
- 오답 시 MISS + 1초 잠금이 유지되는가
- 집중 게이지 시작·감소·종료 규칙이 유지되는가
- 모드·무한모드 설명과 동작이 맞는가
- 키보드 패널 강조와 입력 대상이 일치하는가
- 카나 MISS 600ms 잠금 띠가 현재/다음 문자를 가리지 않는가
- 카나 통계가 스크립트별로 분리되고 개별 글자 위험 색상·랭킹과 일치하는가
- 카나 현재 문자가 프롬프트 중심에 있고 다음 3문자와 font-size가 같은가

## 출력 형식

```markdown
## 변경 요약
- ...

## 규칙 일치 여부
- 일치: ...
- 불일치: ...

## 확인 필요 항목
- ...
```

## 주의

- 새 규칙을 임의로 확정하지 않는다. 애매하면 gameplay-rules와 docs를 우선한다.
