# Responsive Smoke

이 프로젝트의 현재 변경이 반응형 레이아웃에 영향을 주는지 빠르게 점검하는 프로젝트용 샘플 커맨드다.

## Objective

다음 기준으로 화면을 검토한다.

- 핵심 레이아웃이 작은 화면에서 겹치지 않는지 확인한다.
- `challenge-card`, `keyboard-panel`, `game-stage-footer` 배치가 무너지지 않는지 본다.
- 현재 문자, 다음 문자, 판정 텍스트가 잘리는지 확인한다.
- 모바일 카나에서 스크롤 없이 BuildMeta·컨트롤·프롬프트가 보이고 플릭 패드가 하단 1/3을 유지하는지 본다.
- 카나 `Most missed`는 한 줄 말줄임, 현재 문자는 프롬프트 중심, 다음 3문자는 동일 크기로 보이는지 확인한다.

## Project Context

- [docs/reference/gameplay-rules.md](../../docs/reference/gameplay-rules.md) — UI 구성
- [docs/reference/architecture.md](../../docs/reference/architecture.md) — 컴포넌트 위치
- 구현: `src/App.tsx`, `src/components/`, `src/mobile-kana/`

## Instructions

1. 현재 변경 파일과 관련된 화면 영역을 먼저 요약한다.
2. PC는 `?mode=pc`, 모바일 카나는 `?mode=kana`로 강제 진입해 데스크톱·태블릿·모바일 기준으로 깨질 가능성이 큰 구간을 찾는다.
3. 가능하면 브라우저 확인 또는 코드 근거를 함께 제시한다.
4. 발견한 문제는 재현 조건과 수정 방향까지 적는다.

## Output

아래 형식으로 답한다.

```markdown
## 점검 범위
- ...

## 문제 없음
- ...

## 수정 필요
- ...

## 추가 확인
- ...
```
