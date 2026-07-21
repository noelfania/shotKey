---
status: active
audience: operations
verified: 2026-07-21
---

# 배포 전 점검

배포 관련 변경 또는 `main` push 전에 확인합니다.

## 문서·코드 일치

1. 배포 영향 파일 변경 여부 확인 (`vite.config.ts`, `.github/workflows/pages.yml`, `package.json`)
2. [deploy-github-pages.md](deploy-github-pages.md)와 [deployment-facts.md](../../reference/deployment-facts.md)와 코드 비교

## 필수 항목

- [ ] Vite `base` = `/shotKey/`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `package.json`과 `package-lock.json`의 앱 버전 일치
- [ ] `.github/workflows/pages.yml` — `main` push + `workflow_dispatch`, artifact `dist`
- [ ] GitHub Pages Source = **GitHub Actions**

## 출력 형식 (에이전트·수동 점검)

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

## Cursor

반복 점검: `.cursor/commands/predeploy-check.md`, skill `deploy-check`
