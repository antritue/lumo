# Promo Video (Remotion)

The marketing hero section features a generated promo video built with [Remotion](https://remotion.dev). The source lives in `remotion/`, separate from the Next.js app.

---

## Compositions

| ID | Component | Duration | Description |
|----|-----------|----------|-------------|
| `Promo` | `Promo.tsx` | 23s (690 frames) | Full video — Pain → BoardMini → PaymentRecords → Finale |
| `promo-Scene01` | `Pain.tsx` | 5s | Spreadsheet chaos |
| `promo-Scene02` | `BoardMini.tsx` | 9s | Lumo dashboard overview |
| `promo-Scene03` | `PaymentRecords.tsx` | 6s | Payment history |
| `promo-Scene04` | `Finale.tsx` | 3s | CTA |

---

## Static Assets

Audio lives in `remotion/public/` — excluded from the Next.js build (not served to users) but available at Remotion render time via `setPublicDir` in `remotion.config.ts`.

| File | Purpose |
|------|---------|
| `remotion/public/promo-track.mp3` | Background music — CC BY 4.0 (see `remotion/public/promo-track.LICENSE.txt`) |

Rendered output lives in Next's `public/` and is served to users:

| File | Purpose |
|------|---------|
| `public/promo.mp4` | Final video (h264 + aac) |
| `public/promo-thumb.jpg` | Poster frame (frame 0) |

---

## Commands

```bash
npm run remotion:studio   # Preview in browser
npm run remotion:render   # Render promo.mp4 + poster thumb to public/
```

---

## Updating the Video

1. Edit scenes in `remotion/promo-scenes/` or shared components in `remotion/shared/`
2. Preview changes with `npm run remotion:studio`
3. Re-render with `npm run remotion:render`
4. Commit both the source changes and the updated `public/promo.mp4` + `public/promo-thumb.jpg`
