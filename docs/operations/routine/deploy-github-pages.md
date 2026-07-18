---
status: active
audience: operations
verified: 2026-07-04
---

# GitHub Pages 배포

## 목표

SolidJS + Vite 정적 빌드를 GitHub Pages에 호스팅합니다. `main` push 시 Actions가 artifact를 Pages에 배포합니다.

## 사실 참고

URL, `base`, CI 트리거: [../../reference/deployment-facts.md](../../reference/deployment-facts.md)

## 로컬 개발

```bash
npm install
npm run dev
```

상세: [../../development/local-setup.md](../../development/local-setup.md)

## 배포 전 로컬 검증

```bash
npm run lint
npm run build
npm run preview
```

체크리스트: [predeploy-checklist.md](predeploy-checklist.md)

## 배포 흐름

1. `main` push (또는 Actions `workflow_dispatch`)
2. **build** job: install → lint → build → artifact 업로드
3. **deploy** job: `actions/deploy-pages`

## 관련 파일

- `vite.config.ts` — `base: '/shotKey/'`
- `.github/workflows/pages.yml`

## 문제 해결

### deploy 404 / `Creating Pages deployment failed`

- Pages Source가 **GitHub Actions**가 아니면 404
- [pages-first-time-setup.md](../migration/pages-first-time-setup.md) 확인 후 워크플로 재실행

## 체크리스트

- [ ] `npm run lint` 통과
- [ ] `npm run build` 통과
- [ ] Pages Source = GitHub Actions
- [ ] Actions 성공
- [ ] `https://noelfania.github.io/shotKey/` 로드 확인
- [ ] (선택) Search Console에 sitemap 제출 — [seo.md](../../reference/seo.md)

## 최초 1회 설정

저장소 Pages Source 설정은 [../migration/pages-first-time-setup.md](../migration/pages-first-time-setup.md) (archived, 이미 완료된 경우 참고만).
