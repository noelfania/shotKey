---
status: active
audience: developer
verified: 2026-07-21
---

# 모바일 카나 미니게임 규칙

PC ShotKey(쿼티/`keydown`)와 **별도**인 모바일 전용 미니게임이다. 소스: [`src/mobile-kana/`](../../src/mobile-kana/).

## 범위

**포함**

- 히라가나 / 카타카나 **기본 50음**(빈칸 제외 46자: `あ`~`ん` / `ア`~`ン`)과 공용 출제 문자 `、。?!「」ー`
- 구두점 플릭 키: `、`(탭) / `?`(상) / `。`(좌) / `!`(우)
- `や`행 플릭: `や`(탭) / `ゆ`(상) / `よ`(하) / `「`(좌) / `」`(우)
- `わ`행 플릭: `わ`(탭) / `を`(좌) / `ん`(상) / `ー`(우)
- 자체 온스크린 10키 + pointer(탭·플릭)로 글자 확정
- 플릭 패드 5열 레이아웃: 좌·우(및 탁음 `^^` 자리)는 iOS 기능키 스켈레톤(문자·입력 없음), 중앙 3열이 실키
- 출제 1글자(프롬프트 **가로·세로 중심**) + 오른쪽 다음 3글자 미리보기(동일 font-size, opacity만 단계 감소)
- HIT/MISS, MISS 시 상·하 사선 경고(문자 비가림), 짧은 입력 잠금
- 스크립트별 누적 문자 통계·위험도·`Most missed` 상위 5 랭킹
- 플릭 키 **개별 글자** 위험 색상(키 전체가 아님)
- 스크립트 토글(히라/카타), 효과음 on/off (Restart UI 없음, 효과음 설정은 새로고침 시 기본 on)
- 모바일 뷰포트 고정(스크롤 없음): BuildMeta → 스크립트/사운드 → Most missed/출제 → 하단 1/3 플릭 패드

**미포함**

- 탁음·반탁음·요음·한자 변환(IME)
- 시스템 소프트키보드 / `keydown` 판정
- PC 쿼티 세션·약점 가중·무한모드·키보드 레이아웃 모달
- Score / Streak HUD (카나)

## 진입

[`src/main.tsx`](../../src/main.tsx) 부트스트랩:

1. `?mode=kana` → 카나, `?mode=pc` → 쿼티
2. 그 외 `(pointer: coarse)` 또는 `max-width: 768px` → 카나
3. 그 외 → PC ShotKey

## 입력·판정

- 키 **탭** → 해당 행 대표음(center)
- **플릭**(상·하·좌·우) → 같은 행의 대응하는 음 (`flickMap.ts`)
- 확정 문자 === 출제 문자 → HIT, 아니면 MISS(+600ms 입력 잠금)
- MISS 잠금 중 프롬프트 **상·하**에만 황색/흑색 사선 띠(중앙 LOCKED/blur/문자 덮개 없음)
- `や`행은 `ゆ`/`よ`/`「`/`」` 플릭, `わ`행은 `を`/`ん`/`ー` 플릭, 구두점 키는 빈 방향이 있음(해당 플릭은 무시)

## 통계·랭킹

- 출제 문자 기준으로 HIT/MISS 누적 (`attempts` / `misses` / `recentOutcomes`)
- 스무딩 오답률 + 최근 오답률로 위험도 `0~0.72`
- UI: `Most missed ほ 40% (2/5) · …` (없으면 `Most missed --`)
- 랭킹은 위험도 내림차순(동률은 문자 역순), 표시 `%`는 누적 `misses / attempts`의 반올림 값
- 플릭 패드의 중앙/상/하/좌/우 **각 글자**에 위험도 CSS 변수 적용

## 저장

| 키 | 내용 |
|----|------|
| `shot-key:kana-script` | `hiragana` \| `katakana` |
| `shot-key:kana-character-stats:hiragana` | 히라가나(+해당 스크립트 구두점) 문자 통계 JSON |
| `shot-key:kana-character-stats:katakana` | 카타카나(+해당 스크립트 구두점) 문자 통계 JSON |

테마는 PC와 동일하게 `shot-key:theme`를 공유한다.
구현: [`src/mobile-kana/game/kanaStats.ts`](../../src/mobile-kana/game/kanaStats.ts)
