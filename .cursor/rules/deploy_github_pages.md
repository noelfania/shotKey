# GitHub Pages 배포 가이드

## 목표

- React + Vite 정적 빌드를 GitHub Pages에 호스팅한다.
- `main` 브랜치 push 시 GitHub Actions가 자동으로 빌드·배포한다.

## 저장소 설정

1. GitHub 저장소 **Settings → Pages**
2. **Build and deployment → Source**를 **GitHub Actions**로 선택

## 배포 URL

- 프로젝트 사이트: `https://noelfania.github.io/hitKey/`
- Vite `base` 경로는 저장소명과 일치해야 한다: `/hitKey/`

## 로컬 개발

```bash
npm install
npm run dev
```

## 배포 전 로컬 검증

```bash
npm run lint
npm run build
npm run preview
```

## 배포 흐름

1. `main`에 push (또는 Actions에서 `workflow_dispatch` 수동 실행)
2. `.github/workflows/deploy.yml`이 lint → build → Pages artifact 업로드 → deploy 수행
3. 배포 완료 후 위 URL에서 확인

## 관련 파일

- `vite.config.ts` — `base: '/hitKey/'`
- `.github/workflows/deploy.yml` — CI/CD 워크플로

## 체크리스트

- `npm run lint` 통과
- `npm run build` 통과
- GitHub Pages Source가 **GitHub Actions**로 설정됨
- Actions 워크플로 성공 확인
- 배포 URL에서 앱 로드 확인
