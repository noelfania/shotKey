---
status: active
audience: developer
verified: 2026-07-17
---

# SEO

ShotKey는 GitHub Pages SPA다. 검색·공유용 메타는 [`index.html`](../../index.html)과 [`public/`](../../public/) 정적 파일로 관리한다.

## Canonical

- 사이트: `https://noelfania.github.io/shotKey/`
- `hreflang` en / ko / ja / x-default → 모두 동일 URL (별도 언어 경로 없음)

## 정적 파일

| 파일 | URL |
|------|-----|
| `public/robots.txt` | `https://noelfania.github.io/shotKey/robots.txt` |
| `public/sitemap.xml` | `https://noelfania.github.io/shotKey/sitemap.xml` |
| `public/og-image.png` | `https://noelfania.github.io/shotKey/og-image.png` |

## Google Search Console (수동)

1. 속성으로 `https://noelfania.github.io/shotKey/` 추가(또는 `github.io` 도메인 속성)
2. 사이트맵 제출: `https://noelfania.github.io/shotKey/sitemap.xml`
3. 배포 후 URL 검사로 `index.html` 메타·JSON-LD 확인

## 관련

- 배포: [../operations/routine/deploy-github-pages.md](../operations/routine/deploy-github-pages.md)
- 배포 사실: [deployment-facts.md](deployment-facts.md)
