import { showToast } from '../Components/Toaster/Toaster'

const DELAY_MS = 10_000

let delayedInfoToastTimer = null

/** Show "long wait" info toast only if report is still pending after 10s. Clears any previous timer. */
export function scheduleAttendanceLongWaitToast() {
  clearAttendanceLongWaitToast()
  delayedInfoToastTimer = setTimeout(() => {
    delayedInfoToastTimer = null
    showToast(
      'Your report may take some time. Once ready, it will download automatically in your browser.',
      'info'
    )
  }, DELAY_MS)
}

/** Call when socket delivers the report or scheduling fails — cancels the delayed toast if still pending. */
export function clearAttendanceLongWaitToast() {
  if (delayedInfoToastTimer) {
    clearTimeout(delayedInfoToastTimer)
    delayedInfoToastTimer = null
  }
}
