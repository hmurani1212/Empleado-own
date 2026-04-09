import { useEffect, useState } from 'react'
import { resolveDrawerSizePx, STANDARD_APP_SIDE_DRAWER } from '../utils/drawerSizeUtils'

/**
 * Resolves drawer width in px (Material Tailwind Drawer `size` prop).
 * Recomputes on window resize when the spec uses vw or when props change.
 */
export function useDrawerWidthPx({ widthSize, customImg }) {
  /** All app side drawers share 47vw; only the mobile menu (`customImg`) uses an explicit width. */
  const spec = customImg ? widthSize ?? 300 : STANDARD_APP_SIDE_DRAWER

  const [px, setPx] = useState(() => resolveDrawerSizePx(spec))

  useEffect(() => {
    const nextSpec = customImg ? widthSize ?? 300 : STANDARD_APP_SIDE_DRAWER
    const update = () => setPx(resolveDrawerSizePx(nextSpec))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [widthSize, customImg])

  return px
}
