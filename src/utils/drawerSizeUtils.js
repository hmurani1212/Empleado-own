/**
 * Material Tailwind <Drawer size={...}> expects a number (width in px).
 * Call sites often pass "45vw", "500px", or empty string from the store.
 *
 * Standard side drawers use a viewport share (47%) so width scales with screen size.
 */
export const STANDARD_APP_SIDE_DRAWER = '47vw'

/** SSR / non-browser fallback when resolving vw (47% of a typical desktop width). */
const FALLBACK_VIEWPORT = 1200

function defaultStandardDrawerWidthPx() {
  const w = typeof window !== 'undefined' ? window.innerWidth : FALLBACK_VIEWPORT
  return Math.round(0.47 * w)
}

/**
 * @deprecated Use STANDARD_APP_SIDE_DRAWER + resolveDrawerSizePx; kept for any legacy imports.
 * Approximate px at fallback viewport for 47vw.
 */
export const STANDARD_APP_SIDE_DRAWER_PX = Math.round(0.47 * FALLBACK_VIEWPORT)

export function resolveDrawerSizePx(widthSize) {
  if (widthSize == null || widthSize === '') {
    return defaultStandardDrawerWidthPx()
  }
  if (typeof widthSize === 'number') {
    return Number.isFinite(widthSize) && widthSize > 0 ? widthSize : defaultStandardDrawerWidthPx()
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
      return n > 0 ? n : defaultStandardDrawerWidthPx();
    }
    const n = Number(trimmed);
    if (!Number.isNaN(n) && n > 0) {
      return n;
    }
  }
  return defaultStandardDrawerWidthPx();
}
