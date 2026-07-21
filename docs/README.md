# ShotKey 문서

ShotKey 프로젝트 문서 모음입니다. 역할별로 아래 폴더를 사용합니다.

| 폴더 | 용도 | 언제 읽나 |
|------|------|-----------|
| [development/](development/) | 로컬 개발, 코딩 규칙 | 매일 코딩·테스트할 때 |
| [operations/](operations/) | 배포·점검·장애 대응 | push 전, 배포 후, 문제 발생 시 |
| [planning/](planning/) | 로드맵·아이디어 | 다음에 뭘 할지 정할 때 |
| [reference/](reference/) | 사실·아키텍처 (읽기 전용) | 동작·구조를 확인할 때 |

## planning vs CHANGELOG

- **planning/** — 앞으로 할 일 (로드맵, 백로그)
- **[CHANGELOG.md](../CHANGELOG.md)** — 이미 릴리스된 변경 (앱의 `Changelog` 링크: PC 하단, 카나 상단)
- planning 항목이 완료되면 CHANGELOG에 기록하고 planning에서는 삭제하거나 완료 링크만 남깁니다.

## 문서 메타

각 본문 문서 상단 frontmatter:

```yaml
---
status: active      # active | archived
audience: developer # developer | operations
verified: YYYY-MM-DD
---
```

- **reference/** — 사실(What is). How-to는 **operations/** 또는 **development/**.
- **operations/migration/** — 일회성·전환 작업. 완료 후 `status: archived`.
