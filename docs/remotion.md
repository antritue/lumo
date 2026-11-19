# Promo Video (Remotion)

The marketing hero section features a generated promo video built with [Remotion](https://remotion.dev). The source lives in `remotion/`, separate from the Next.js app.

---

## Compositions

| ID              | Component            | Duration         | Description                                                       |
| --------------- | -------------------- | ---------------- | ----------------------------------------------------------------- |
| `Promo`         | `Promo.tsx`          | 23s (690 frames) | Full video (English) — Pain → BoardMini → PaymentRecords → Finale |
| `PromoVi`       | `Promo.tsx`          | 23s (690 frames) | Full video (Vietnamese) — same timeline, localized copy/seed      |
| `promo-Scene01` | `Pain.tsx`           | 5s               | Spreadsheet chaos                                                 |
| `promo-Scene02` | `BoardMini.tsx`      | 9s               | Lumo dashboard overview                                           |
| `promo-Scene03` | `PaymentRecords.tsx` | 6s               | Payment history                                                   |
| `promo-Scene04` | `Finale.tsx`         | 3s               | CTA                                                               |

---

## Static Assets

Audio lives in `remotion/public/` — excluded from the Next.js build (not served to users) but available at Remotion render time via `setPublicDir` in `remotion.config.ts`.

| File                              | Purpose                                                                      |
| --------------------------------- | ---------------------------------------------------------------------------- |
| `remotion/public/promo-track.mp3` | Background music — CC BY 4.0 (see `remotion/public/promo-track.LICENSE.txt`) |

Rendered output lives in Next's `public/` and is served to users:

| File                        | Purpose                                       |
| --------------------------- | --------------------------------------------- |
| `public/promo.mp4`          | Final video (English, h264 + aac)             |
| `public/promo-thumb.jpg`    | Poster frame (English, board after update)    |
| `public/promo-vi.mp4`       | Final video (Vietnamese, h264 + aac)          |
| `public/promo-vi-thumb.jpg` | Poster frame (Vietnamese, board after update) |

---

## Commands

```bash
npm run remotion:studio      # Preview in browser
npm run remotion:render:en   # Render English promo.mp4 + poster thumb to public/
npm run remotion:render:vi   # Render Vietnamese promo-vi.mp4 + poster thumb to public/
npm run remotion:render      # Render both locales
```

---

## Updating the Video

1. Edit scenes in `remotion/promo-scenes/`, copy in `remotion/promo-copy.ts`, or shared components in `remotion/shared/`
2. Preview changes with `npm run remotion:studio` (use the `Promo` / `PromoVi` compositions)
3. Re-render with `npm run remotion:render`
4. Commit the source changes and the updated promo assets in `public/` (`promo.mp4`, `promo-thumb.jpg`, `promo-vi.mp4`, `promo-vi-thumb.jpg`)
