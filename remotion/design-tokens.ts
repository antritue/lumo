/**
 * Exact design tokens from app/globals.css + Tailwind theme.
 * Used by all Remotion scenes to match the real product.
 * Only tokens actually used by scenes live here — no extras.
 */

// --- Font ---
export const FONT_SANS = "Inter, system-ui, -apple-system, sans-serif";

// --- Colors (HSL → hex for inline styles) ---
// Background / Foreground
export const BG = "#FAFAF8"; // hsl(145 3% 99%)
export const FG = "#1C2420"; // hsl(145 5% 12%)

// Primary (Sage green)
export const PRIMARY = "#4E7C5B"; // hsl(145 28% 50%)

// Secondary
export const SECONDARY = "#F2F4F2"; // hsl(145 4% 96%)

// Muted
export const MUTED_FG = "#8F9A94"; // hsl(145 3% 40%)

// Card
export const CARD = "#FFFFFF"; // hsl(0 0% 100%)

// Border
export const BORDER = "#D8DDD9"; // hsl(145 5% 88%)

// Status — Paid (green)
export const PAID = "#22C55E"; // hsl(142 71% 45%)
export const PAID_BG = "rgba(34,197,94,0.1)";
export const PAID_BORDER = "rgba(34,197,94,0.4)";

// Status — Pending (amber)
export const PENDING = "#F59E0B"; // hsl(38 92% 50%)
export const PENDING_BG = "rgba(245,158,11,0.1)";
export const PENDING_BORDER = "rgba(245,158,11,0.4)";

// --- Corner radii (px at 1080p) ---
// The app renders in a max-w-4xl (~875px) column where rounded-xl/lg = 12px
// and rounded-md = 10px (repo shadcn theme, see app/globals.css). The video
// card spans ~1680px, so identical px corners look much tighter — values here
// are scaled ~2x to wear the same. Count pill stays full-round.
export const CARD_RADIUS = 24;
export const ROW_RADIUS = 24;
export const PILL_RADIUS = 20;
