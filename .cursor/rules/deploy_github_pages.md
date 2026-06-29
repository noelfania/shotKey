# GitHub Pages 배포 가이드

## 목표

- React + Vite 정적 빌드를 GitHub Pages에 호스팅한다.
- `main` push 시 GitHub Actions가 빌드 artifact를 Pages에 직접 배포한다.

## 저장소 설정 (최초 1회, 필수)

1. [Settings → Pages](https://github.com/noelfania/hitKey/settings/pages) 이동
2. **Build and deployment → Source**를 **GitHub Actions**로 선택

저장소가 **private**이면 무료 플랜에서는 Pages를 쓸 수 없다. public 저장소인지 확인한다.

## 배포 URL

- `https://noelfania.github.io/hitKey/`
- Vite `base`는 저장소명과 일치: `/hitKey/`

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

1. `main` push (또는 Actions에서 `workflow_dispatch`)
2. `build` job: install → lint → build → artifact 업로드
3. `deploy` job: `actions/deploy-pages`로 Pages에 배포

## 관련 파일

- `vite.config.ts` — `base: '/hitKey/'`
- `.github/workflows/pages.yml` — CI/CD 워크플로

## 문제 해결

### deploy 단계 404 / `Creating Pages deployment failed`

- Pages Source가 **GitHub Actions**가 아니면 404가 난다.
- 위 **저장소 설정**을 완료한 뒤 워크플로를 다시 실행한다.

## 체크리스트

- `npm run lint` 통과
- `npm run build` 통과
- Pages Source = **GitHub Actions**
- Actions 워크플로 성공 확인
- 배포 URL에서 앱 로드 확인
