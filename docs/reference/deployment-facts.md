---
status: active
audience: operations
verified: 2026-07-21
---

# 배포 사실 (reference)

절차(How-to)는 [../operations/routine/deploy-github-pages.md](../operations/routine/deploy-github-pages.md)를 참고합니다.

## URL

- 프로덕션: `https://noelfania.github.io/shotKey/`
- 저장소: `https://github.com/noelfania/shotKey`

## Vite

- `base`: `/shotKey/` ([`vite.config.ts`](../../vite.config.ts))
- 저장소명(`shotKey`)과 일치해야 GitHub Pages project site에서 asset 경로가 맞습니다.

## GitHub Actions

- 워크플로: [`.github/workflows/pages.yml`](../../.github/workflows/pages.yml)
- 트리거: `main` push, `workflow_dispatch`
- build: `npm ci` → lint → build → `dist` artifact
- deploy: `actions/deploy-pages`

## Pages Source

- **GitHub Actions** (Deploy from a branch 아님)
- 최초 설정: [../operations/migration/pages-first-time-setup.md](../operations/migration/pages-first-time-setup.md)

## 스택

- SolidJS + Vite 정적 빌드
- DB·백엔드 없음
