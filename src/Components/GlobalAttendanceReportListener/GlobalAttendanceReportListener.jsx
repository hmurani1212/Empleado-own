import { useEffect } from 'react'
import useSocket from '../useSocket/useSocket'
import { getDecodedToken } from '../../Authentication/jwt_decode'
import { showToast } from '../Toaster/Toaster'
import { clearAttendanceLongWaitToast } from '../../services/attendanceExportDelayedToast'

const ATTENDANCE_PENDING_EXPORT_KEY = 'attendance_pending_export'

const readPendingExport = () => {
  try {
    const raw = localStorage.getItem(ATTENDANCE_PENDING_EXPORT_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const clearPendingExport = () => {
  localStorage.removeItem(ATTENDANCE_PENDING_EXPORT_KEY)
}

const GlobalAttendanceReportListener = () => {
  const { socketIoRef } = useSocket()

  useEffect(() => {
    if (!socketIoRef.current) return

    const onAttendanceReportReady = (data) => {
      if (!data || !data.file_url) return

      const pending = readPendingExport()
      if (!pending?.requestId) return

      const requestIdMatch = data.request_id != null && String(data.request_id) === String(pending.requestId)
      const oneIdMatch =
        data.one_id != null &&
        getDecodedToken()?.oneid != null &&
        String(data.one_id) === String(getDecodedToken().oneid)
      const legacyNoId = data.request_id == null && data.one_id == null

      if (!requestIdMatch && !oneIdMatch && !legacyNoId) return

      clearAttendanceLongWaitToast()

      const elapsedMs = pending.startedAt ? Date.now() - pending.startedAt : null
      const elapsedSec = elapsedMs != null ? (elapsedMs / 1000).toFixed(1) : null
      console.log('📥 Attendance report socket response received (global listener)', {
        requestId: pending.requestId,
        oneId: data.one_id,
        reportType: data.report_type,
        exportType: data.export_type,
        elapsedMs,
        elapsedSec
      })

      clearPendingExport()
      showToast('Your attendance report is ready! Downloading...', 'success')

      try {
        const link = document.createElement('a')
        link.href = data.file_url
        link.rel = 'noopener noreferrer'
        const filename = data.file_name || `${data.report_type}_${data.export_type}_${new Date().toISOString().split('T')[0]}.xlsx`
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        console.error('Failed to download attendance report from socket response', error)
        showToast('Failed to download the report', 'error')
      }
    }

    socketIoRef.current.on('attendance_report_ready', onAttendanceReportReady)
    return () => {
      if (socketIoRef.current) {
        socketIoRef.current.off('attendance_report_ready', onAttendanceReportReady)
      }
    }
  }, [socketIoRef])

  return null
}

export default GlobalAttendanceReportListener
