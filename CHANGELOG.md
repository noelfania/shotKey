# Changelog

이 프로젝트의 주요 변경 사항을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를 따릅니다.

## [Unreleased]

### Added

- US QWERTY / Japanese (JIS) keyboard layouts with first-run selection modal
- Footer Layout button to change keyboard layout anytime
- JIS Enter keycap rendered as an L-shape (`jis-enter` + `jis-enter-slot`, fixed key unit)
- `docs/reference/keyboard-layout-extensibility.md` — 향후 레이아웃 추가 가이드
- `docs/` 폴더 문서 구조 (development, operations, planning, reference)
- 게임 규칙·코딩 규칙·배포 절차 docs 이전, `.cursor` rules link-only화

### Changed

- Visible UI strings switched to English
- Project name ShotKey (npm `shot-key`, GitHub Pages `/shotKey/`)
- localStorage prefix `shot-key:`

### Removed

- ShotKey와 무관한 `NOTICE.md` (PowerToys 서드파티 내용)
- `doc/issues/` (planning/backlog로 흡수)

## [1.0.0] - 2026-07-04

### Added

- QWERTY 영문 타이핑 훈련 (전체 / 왼손 / 오른손, 무한모드)
- 판정(PERFECT · GOOD · OK · MISS · TIME OUT)과 집중 게이지
- 자주 틀린 문자 재출제, 약점 키 키보드 하이라이트
- 효과음·시각효과·폰트·키보드 패널 설정 (`localStorage` 저장)
- 대소문자 가독성 구분 (대문자 굵게, 소문자 보통)
- 빌드 버전·Last update·변경 이력 링크 (좌하단)
- 라이트 / 다크 테마

### Changed

- React에서 SolidJS로 마이그레이션
- `App.tsx` 단일 파일을 모듈 구조로 분리
