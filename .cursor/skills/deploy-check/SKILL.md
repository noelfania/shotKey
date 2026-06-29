---
name: deploy-check
description: GitHub Pages 배포 전 점검 흐름을 프로젝트 배포 문서와 스크립트 기준으로 검토한다. build, lint, vite base, Actions 워크플로 확인이 필요할 때 사용한다.
---

# Deploy Check

## 목적

배포 관련 변경이 생겼을 때 GitHub Pages 배포 기준과 맞는지 확인한다.

## 기본 참조 문서

- `.cursor/rules/deploy_github_pages.md`
- `package.json`
- `.github/workflows/deploy.yml`
- `vite.config.ts`

## 주로 쓰는 상황

- `vite.config.ts`의 `base` 경로를 수정했을 때
- `.github/workflows/deploy.yml`을 변경했을 때
- GitHub Pages 배포 절차 문서와 실제 코드가 맞는지 확인하고 싶을 때

## 작업 순서

1. 변경된 배포 관련 파일을 확인한다.
2. `package.json` 스크립트와 배포 문서가 일치하는지 본다.
3. Vite `base`가 저장소명과 일치하는지 점검한다.
4. 실제 배포 전 필요한 검증 항목을 정리한다.

## 핵심 체크리스트

- `npm run lint` 기준이 여전히 유효한가
- `npm run build`가 성공하는가
- `vite.config.ts`의 `base`가 `/hitKey/`인가
- `.github/workflows/deploy.yml`이 `main` push와 `workflow_dispatch`를 트리거하는가
- GitHub Pages Source가 GitHub Actions로 설정되어 있는가

## 출력 형식

```markdown
## 점검 결과
- 일치: ...
- 불일치: ...

## 배포 전 확인
- ...

## 위험 요소
- ...
```

## 주의

- 배포 절차를 임의로 단순화하지 않는다.
- 문서와 코드가 다르면 둘 중 어느 쪽을 기준으로 바꿔야 하는지 명시한다.
- 실제 배포 명령 실행 전에는 현재 작업 트리 상태를 확인한다.
