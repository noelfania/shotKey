---
status: active
audience: developer
verified: 2026-07-21
---

# SEO

ShotKey는 GitHub Pages SPA다. 검색·공유용 메타는 [`index.html`](../../index.html)과 [`public/`](../../public/) 정적 파일로 관리한다.

## Canonical

- 사이트: `https://noelfania.github.io/shotKey/`
- `hreflang` en / ko / ja / x-default → 모두 동일 URL (별도 언어 경로 없음)

## 검색 카피 범위

`index.html` description / keywords / Open Graph / Twitter / JSON-LD에 다음을 **명시**한다.

| 언어 | 예시 구문 |
|------|-----------|
| EN | Japanese mobile kana flick keyboard practice, Japanese phone keyboard practice |
| JA | スマホかなフリック練習 |
| KO | 일본어 모바일 자판 연습 |

데스크톱 US/JIS QWERTY 연습과 함께 모바일 카나 플릭이 SEO 범위에 포함된다.

## 정적 파일

| 파일 | URL |
|------|-----|
| `public/robots.txt` | `https://noelfania.github.io/shotKey/robots.txt` |
| `public/sitemap.xml` | `https://noelfania.github.io/shotKey/sitemap.xml` |
| `public/og-image.png` | `https://noelfania.github.io/shotKey/og-image.png` |
| `public/google19a206f5b83a8f38.html` | `https://noelfania.github.io/shotKey/google19a206f5b83a8f38.html` (Search Console 소유권 확인, 삭제 금지) |

## Google Search Console (수동)

1. 속성으로 `https://noelfania.github.io/shotKey/` 추가(또는 `github.io` 도메인 속성)
2. HTML 파일 소유권 확인: `public/google19a206f5b83a8f38.html` 배포 후 Search Console에서 Verify
3. 사이트맵 제출: `https://noelfania.github.io/shotKey/sitemap.xml`
4. 배포 후 URL 검사로 `index.html` 메타·JSON-LD 확인

## 관련

- 배포: [../operations/routine/deploy-github-pages.md](../operations/routine/deploy-github-pages.md)
- 배포 사실: [deployment-facts.md](deployment-facts.md)
