# Predeploy Check

GitHub Pages 배포 전 점검을 반복 실행하기 위한 커맨드.

## Objective

현재 변경이 GitHub Pages 배포 기준과 충돌하지 않는지 확인한다.

## Project Context

- [docs/operations/routine/predeploy-checklist.md](../../docs/operations/routine/predeploy-checklist.md)를 먼저 읽는다.
- [docs/operations/routine/deploy-github-pages.md](../../docs/operations/routine/deploy-github-pages.md) — 배포 절차
- `package.json`의 `build`, `lint` 스크립트
- `vite.config.ts`, `.github/workflows/pages.yml` 변경 시 함께 검토

## Instructions

1. 변경된 파일 중 배포에 영향 주는 파일을 찾는다.
2. docs와 코드가 일치하는지 비교한다.
3. predeploy-checklist 항목을 빠뜨리지 않고 점검한다.
4. 실행 가능한 검증과 아직 확인하지 못한 항목을 구분해 적는다.

## Output

```markdown
## 일치 항목
- ...

## 불일치 항목
- ...

## 배포 전 실행 권장
- ...

## 남은 위험
- ...
```
