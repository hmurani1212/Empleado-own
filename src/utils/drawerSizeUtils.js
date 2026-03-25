/**
 * Material Tailwind <Drawer size={...}> expects a number (width in px).
 * Call sites often pass "45vw", "500px", or empty string from the store.
 */
const DEFAULT_PX = 620;
const FALLBACK_VIEWPORT = 1200;

export function resolveDrawerSizePx(widthSize) {
  if (widthSize == null || widthSize === '') {
    return DEFAULT_PX;
  }
  if (typeof widthSize === 'number') {
    return Number.isFinite(widthSize) && widthSize > 0 ? widthSize : DEFAULT_PX;
  }
  if (typeof widthSize === 'string') {
    const trimmed = widthSize.trim();
    const vwMatch = trimmed.match(/^([\d.]+)\s*vw$/i);
    if (vwMatch) {
      const vw = typeof window !== 'undefined' ? window.innerWidth : FALLBACK_VIEWPORT;
      return Math.round((parseFloat(vwMatch[1], 10) / 100) * vw);
    }
    const pxMatch = trimmed.match(/^([\d.]+)\s*px$/i);
    if (pxMatch) {
      const n = Math.round(parseFloat(pxMatch[1], 10));
      return n > 0 ? n : DEFAULT_PX;
    }
    const n = Number(trimmed);
    if (!Number.isNaN(n) && n > 0) {
      return n;
    }
  }
  return DEFAULT_PX;
}
