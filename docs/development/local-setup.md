---
status: active
audience: developer
verified: 2026-07-21
---

# 로컬 개발

## 요구 사항

- Node.js 22 (CI와 동일, `.github/workflows/pages.yml` 기준)
- npm

## 설치

```bash
npm install
```

## 개발 서버

```bash
npm run dev
```

기본 주소: [http://localhost:34567/shotKey/](http://localhost:34567/shotKey/)  
(`vite.config.ts`의 `server.port`. 포트가 쓰 중이면 실패 — `strictPort: true`)

기본 진입은 디바이스 특성에 따라 PC 또는 모바일 카나 모드를 고릅니다.

- PC 강제: [http://localhost:34567/shotKey/?mode=pc](http://localhost:34567/shotKey/?mode=pc)
- 모바일 카나 강제: [http://localhost:34567/shotKey/?mode=kana](http://localhost:34567/shotKey/?mode=kana)

PC 모드는 `keydown`, 카나 모드는 온스크린 플릭 패드의 pointer 입력으로 플레이합니다.

## 프로덕션 빌드 미리보기

GitHub Pages와 동일한 `base: '/shotKey/'`로 미리보려면:

```bash
npm run build
npm run preview
```

## 관련 문서

- push 전 점검: [verify-before-push.md](verify-before-push.md)
- 배포 절차: [../operations/routine/deploy-github-pages.md](../operations/routine/deploy-github-pages.md)
