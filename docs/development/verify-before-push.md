---
status: active
audience: developer
verified: 2026-07-04
---

# push 전 검증

`main`에 merge·push하기 전에 아래를 실행합니다.

## 자동 검증

```bash
npm run lint
npm run build
```

## 수동 플레이 (게임 로직 변경 시)

- 훈련 모드 전환 (전체 / 왼손 / 오른손) 및 재시작
- MISS 1초 입력 잠금
- 게이지 decay, TIME OUT / 무한모드
- localStorage 설정 복원 (새로고침 후)
- 라이트 / 다크 테마 전환

## 배포 관련 변경 시

`vite.config.ts`, `.github/workflows/pages.yml`을 수정했다면 [predeploy-checklist.md](../operations/routine/predeploy-checklist.md)도 함께 확인합니다.
