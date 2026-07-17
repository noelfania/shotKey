---
status: active
audience: developer
verified: 2026-07-04
---

# 게임·UI 규칙

## 서비스 목적

- 영문 키보드(US QWERTY / Japanese JIS) 기준으로 단일 문자 입력 정확도와 반응 속도를 훈련하는 웹서비스
- 입력창 없이 `keydown`만으로 플레이
- 백엔드·계정 없이 브라우저 단독 SolidJS 프론트엔드

## 키보드 레이아웃

- 지원: **US QWERTY**, **Japanese (JIS)**
- 최초 방문 시 `shot-key:keyboard-layout`이 없으면 중앙 모달에서 선택 (필수)
- 푸터 **Layout** 버튼으로 언제든 재선택
- 레이아웃에 따라 온스크린 키캡·출제 풀(`base`/`shifted`/`keyId`)이 바뀜
- 판정은 `event.key`와 도전 문자 문자열 일치
- 새 레이아웃 추가 절차: [keyboard-layout-extensibility.md](keyboard-layout-extensibility.md)

## 핵심 플레이

- 훈련 문자: 영문자, 숫자, 기호 (선택한 레이아웃 배열)
- 현재 문자 1개 + 다음 문자 N개 미리보기
- 정답: 즉시 다음 문자, 반응 속도에 따른 점수·게이지 보상
- 오답: `MISS` + 1초 입력 잠금
- 오답 문자: 몇 문제 뒤 재출제

## 훈련 모드

| 모드 | 설명 |
|------|------|
| All | 레이아웃 전체 |
| Left | 왼손 담당 기본/Shift 문자 |
| Right | 오른손 담당 기본/Shift 문자 |
| Endless | 게이지 0%여도 세션 계속 |

일반 모드: 게이지 0% → `TIME OUT`, 버틴 시간 표시.

## 판정·게이지

- 판정: `PERFECT`, `GOOD`, `OK`, `MISS`, `TIME OUT`
- 게이지 100% 시작, **첫 입력 전까지 감소 없음**
- 플레이 시작 후 비선형 decay
- 빠른 정답 → 큰 보상, 오답 → 즉시 감소

## UI 구성

- **challenge-card** — 현재/다음 문자, HUD 메타, 게이지, 판정
- **keyboard-panel** — 키 시각화, 약점 하이라이트
- **game-stage-footer** — 모드, 설정, 재시작

(구 mode-panel / hud / game-stage 역할은 위 컴포넌트에 통합)

## 피드백

- 현재 입력 키 키보드 강조
- Shift 필요 시 보조 Shift 키 하이라이트
- 약점 키: 누적 데이터 기반 색 짙어짐
- 정답/오답: 카드 애니메이션·효과음 (각 on/off)

## 사용자 설정·저장

`localStorage`에 모드, 무한모드, 효과음, 시각효과, 키보드 패널, 폰트, **테마** 저장.

문자별 시도·오답·느린 반응·최근 이력도 저장 → 약점 강조·가중 출제.

키 목록: [storage-keys.md](storage-keys.md)

## 범위·비범위

**포함:** 브라우저 단독 타이핑 훈련

**미포함:** 로그인, 계정, 서버 저장, DB

모바일에서는 별도 **카나 플릭 미니게임**이 열린다(쿼티와 소스·입력 모델 분리). 규칙: [kana-minigame-rules.md](kana-minigame-rules.md). 데스크톱에서 카나를 보려면 `?mode=kana`.
