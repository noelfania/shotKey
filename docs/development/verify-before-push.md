---
status: active
audience: developer
verified: 2026-07-21
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
- PC MISS 1초 입력 잠금
- 게이지 decay, TIME OUT / 무한모드
- localStorage 설정 복원 (새로고침 후)
- 라이트 / 다크 테마 전환
- US/JIS 레이아웃 전환과 키캡·출제 문자 일치

## 모바일 카나 변경 시

- `?mode=kana` 모바일 뷰포트에서 스크롤 없음, 플릭 패드 하단 `33.333dvh` 유지
- 히라가나/카타카나 통계가 각각의 storage 키에 저장·복원되는지 확인
- `Most missed` 순서·비율과 플릭 패드 개별 글자 위험 색상 확인
- MISS 600ms 잠금 중 프롬프트 상·하 띠만 표시되고 문자는 가리지 않는지 확인
- 현재 문자 중심 오차 ≤1px, 다음 3문자와 font-size 동일 확인

## 배포 관련 변경 시

`vite.config.ts`, `.github/workflows/pages.yml`을 수정했다면 [predeploy-checklist.md](../operations/routine/predeploy-checklist.md)도 함께 확인합니다.
