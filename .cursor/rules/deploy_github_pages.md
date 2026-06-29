# GitHub Pages 배포 가이드

## 목표

- React + Vite 정적 빌드를 GitHub Pages에 호스팅한다.
- `main` push 시 GitHub Actions가 빌드 후 `gh-pages` 브랜치에 배포한다.

## 저장소 설정 (최초 1회)

1. `main`에 push해 워크플로를 한 번 실행한다. (`gh-pages` 브랜치가 생성됨)
2. [Settings → Pages](https://github.com/noelfania/hitKey/settings/pages) 이동
3. **Build and deployment → Source**를 **Deploy from a branch**로 선택
4. **Branch**: `gh-pages` / **Folder**: `/ (root)` → **Save**

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
2. lint → build → `gh-pages` 브랜치에 `dist/` 내용 push
3. Pages Source가 `gh-pages` / root로 설정되어 있으면 자동 반영

## 관련 파일

- `vite.config.ts` — `base: '/hitKey/'`
- `.github/workflows/pages.yml` — CI/CD 워크플로

## 문제 해결

### 이전 `deploy-pages` 404 오류

- **GitHub Actions** Source 방식은 Pages를 미리 켜 두지 않으면 404가 난다.
- 현재 워크플로는 `gh-pages` 브랜치 push 방식이라 해당 API를 쓰지 않는다.

### 사이트가 404

- Pages Source가 `gh-pages` / root인지 확인
- 워크플로가 성공했는지, `gh-pages` 브랜치에 `index.html`이 있는지 확인

## 체크리스트

- `npm run lint` 통과
- `npm run build` 통과
- 워크플로 성공 및 `gh-pages` 브랜치 생성 확인
- Pages Source = `gh-pages` / root
- 배포 URL에서 앱 로드 확인
