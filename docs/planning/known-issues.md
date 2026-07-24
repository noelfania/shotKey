---
status: active
audience: developer
verified: 2026-07-24
---

# 알려진 이슈

해결 전 이슈. 고치면 CHANGELOG에 옮기고 여기서 삭제합니다.

## iOS / WebKit — 카나·PC 효과음이 불안정하거나 무음

**증상**

- iPhone(Safari / Edge 등 WebKit)에서 Sound가 켜져 있어도 판정 효과음이 안 나거나, 처음엔 없다가 나중에야 간헐적으로 난다.
- Sound 토글 확인음도 기기·브라우저에 따라 들리지 않을 수 있다.

**시도한 완화 (아직 근본 해결 아님)**

- [`src/audio/feedbackAudio.ts`](../../src/audio/feedbackAudio.ts): 사용자 제스처에서 `AudioContext.resume()`, silent `AudioBuffer` unlock, `interrupted` 재시도, Sound ON 시 확인음
- 카나: 플릭/`Restart` `pointerdown`에서 `unlockAudio`
- PC: `keydown`에서 `unlockAudio`

**추정 원인**

- iOS는 제스처 밖·제스처와 끊긴 async 경로의 Web Audio를 막거나 `suspended`/`interrupted`로 둔다.
- 하드웨어 무음(링/무음 스위치)이 켜져 있으면 Web Audio도 묵음일 수 있다(앱에서 우회 불가).
- Edge on iOS도 WebKit이라 Safari와 동일 제약이 적용된다.

**재현 메모**

- 기기: iPhone + Edge(또는 Safari), 링 모드 ON, Sound 토글 ON
- `?mode=kana`에서 플릭 HIT/MISS, Sound 토글 확인음

**다음 후보**

- 제스처 안에서 `resume`까지 **동기적으로** 끝낸 뒤 같은 콜스택에서만 톤 스케줄
- `<audio>` + 짧은 WAV/data URL fallback (Web Audio 실패 시)
- 첫 화면 “Tap to enable sound” 명시적 unlock UI
- iOS에서 `playsInline` / 별도 unlock 플래그 상태 표시
