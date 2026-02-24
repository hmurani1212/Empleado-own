import React, { useState, useEffect } from 'react'
import useStore from '../../Store/store'
import { showToast } from '../../Components/Toaster/Toaster'
import attendanceApi from '../../Model/Data/Attendance/Attendance'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Timer,
  LogIn,
  LogOut,
} from 'lucide-react'

const SingleDayDetails = (props) => {
  const { singleDayService, addMoreInput, updateSingleDayData, onDataRefreshed, searchingEmpValue, attendanceData } = props
  const data = singleDayService?.data

  const dailyAttAdjust = useStore((state) => state.dailyAttAdjust)
  const setManualAttendance = useStore((state) => state.setManualAttendance)

  const [timePairs, setTimePairs] = useState([{ in: '', out: '' }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dataUpdateKey, setDataUpdateKey] = useState(0)
  const [userSubmitted, setUserSubmitted] = useState(false)

  const hasTimings = data?.timings && data.timings.length > 0

  const convertTimestampToTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp * 1000)
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const convertTimeToHHMM = (timeString) => {
    if (!timeString) return ''
    return timeString
  }

  const secondsToHoursMinutesVerbose = (seconds) => {
    const total = Number(seconds) || 0
    const hours = Math.floor(total / 3600)
    const minutes = Math.floor((total % 3600) / 60)
    return `${hours} Hours, ${minutes} Minutes`
  }

  useEffect(() => {
    if (userSubmitted) return

    const currentDateString = data?.date_string
    let freshData = data

    if (currentDateString && attendanceData?.attendanceAttr?.attendance) {
      const freshDayData = attendanceData.attendanceAttr.attendance.find(day =>
        day.date_string === currentDateString
      )
      if (freshDayData) freshData = freshDayData
    }

    const timings = freshData?.timings || []
    const pairs = []
    for (let i = 0; i < timings.length; i += 2) {
      const inTime = timings[i] ? convertTimestampToTime(timings[i]) : ''
      const outTime = timings[i + 1] ? convertTimestampToTime(timings[i + 1]) : ''
      pairs.push({ in: inTime, out: outTime })
    }
    if (pairs.length === 0) pairs.push({ in: '', out: '' })
    setTimePairs(pairs)
  }, [data, dataUpdateKey, attendanceData, userSubmitted])

  const refreshIndividualAttendanceData = async () => {
    try {
      let empId = searchingEmpValue?.empId?.value || searchingEmpValue?.empId || searchingEmpValue?.emp_id || data?.emp_id || data?.id || 9119528
      if (typeof empId === 'object' && empId !== null) {
        empId = empId.value || empId.id || empId.emp_id
      }
      const year = searchingEmpValue?.year?.value || searchingEmpValue?.year || new Date().getFullYear()
      const month = searchingEmpValue?.month?.value || searchingEmpValue?.month || new Date().getMonth() + 1

      const apiData = { empId, emp_id: empId, month, year, filter: 'specific_month' }
      const [individualRes, graphRes] = await Promise.all([
        attendanceApi.getIndividualDetail(apiData),
        attendanceApi.getAttendanceGraph(apiData),
      ])
      if (individualRes?.data && onDataRefreshed) {
        onDataRefreshed(individualRes, graphRes)
        return true
      }
    } catch (e) { /* ignore */ }
    return false
  }

  const handleMarkAction = async (action) => {
    setIsSubmitting(true)
    setUserSubmitted(true)

    try {
      let empId = searchingEmpValue?.empId?.value || searchingEmpValue?.empId || searchingEmpValue?.emp_id || data?.emp_id || data?.id
      if (typeof empId === 'object' && empId !== null) empId = empId.value || empId.id || empId.emp_id
      if (!empId || empId === '' || (typeof empId === 'object' && Object.keys(empId).length === 0)) {
        showToast('Please select an employee first', 'error')
        setIsSubmitting(false)
        setUserSubmitted(false)
        return
      }

      const dateString = data?.date_string
      const [day, month, year] = dateString.split('-')
      const formattedDate = `${year}-${month}-${day}`

      let result
      if (action === 'absent') {
        const payload = {
          emp_id: parseInt(empId),
          date: formattedDate,
          reason: 'unauthorized_absence',
          admin_notes: 'Marked absent by admin',
          penalty_applicable: true,
          notify_employee: true,
        }
        const response = await attendanceApi.MarkAbsent(payload)
        result = {
          success: response.status === 200,
          error: response.data?.ERROR_DESCRIPTION || 'Failed to mark absent',
        }
      } else {
        const payload = {
          emp_id: empId,
          date: formattedDate,
          att_status: action === 'present' ? 'present' : 'holiday',
          reason: action === 'holiday' ? 'National holiday' : undefined,
        }
        result = await setManualAttendance(payload)
      }

      if (result.success) {
        showToast('Attendance marked successfully', 'success')
        if (updateSingleDayData) {
          const updatedData = {
            ...data,
            att_label: action === 'present' ? 'P' : action === 'holiday' ? 'H' : 'A',
            timings: [],
          }
          updateSingleDayData(updatedData)
          setDataUpdateKey((prev) => prev + 1)
        }
        setTimeout(() => refreshIndividualAttendanceData(), 300)
        setTimeout(() => {
          setUserSubmitted(false)
          addMoreInput()
        }, 1000)
      } else {
        if (result.error?.includes('person bio ID is not registered')) {
          showToast('person bio ID is not registered Please update employee information.', 'error')
        } else {
          showToast(result.error || `Failed to mark as ${action}`, 'error')
        }
      }
    } catch (error) {
      showToast(error?.response?.data?.ERROR_DESCRIPTION || 'An error occurred', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    let empId = searchingEmpValue?.empId?.value || searchingEmpValue?.empId || searchingEmpValue?.emp_id || data?.emp_id || data?.id
    if (typeof empId === 'object' && empId !== null) empId = empId.value || empId.id || empId.emp_id
    if (!empId || empId === '' || (typeof empId === 'object' && Object.keys(empId).length === 0)) {
      showToast('Please select an employee first', 'error')
      return
    }

    setIsSubmitting(true)
    setUserSubmitted(true)

    try {
      const payload = { id: data?.id || 12345 }
      timePairs.forEach((pair, index) => {
        const inTimeFormatted = convertTimeToHHMM(pair.in)
        const outTimeFormatted = convertTimeToHHMM(pair.out)
        const inTime = inTimeFormatted?.trim() ? inTimeFormatted : 0
        const outTime = outTimeFormatted?.trim() ? outTimeFormatted : 0
        if (index === 0) {
          payload.in_time = inTime
          payload.out_time = outTime
        } else {
          payload[`in_time${index + 1}`] = inTime
          payload[`out_time${index + 1}`] = outTime
        }
      })
      const maxPairsToClear = 4
      for (let i = timePairs.length; i < maxPairsToClear; i++) {
        const suffix = i + 1
        payload[`in_time${suffix}`] = 0
        payload[`out_time${suffix}`] = 0
      }

      const result = await dailyAttAdjust(payload)

      if (result.success) {
        showToast('Attendance updated successfully!', 'success')
        if (result.data?.DB_DATA) {
          const { in_1, out_1 } = result.data.DB_DATA
          if (updateSingleDayData) {
            updateSingleDayData({ ...data, timings: [in_1, out_1] })
            setDataUpdateKey((prev) => prev + 1)
          }
          setTimeout(() => refreshIndividualAttendanceData(), 2000)
        }
        setTimeout(() => {
          setUserSubmitted(false)
          addMoreInput()
        }, 1000)
      } else {
        showToast(result.error || 'Failed to adjust attendance', 'error')
      }
    } catch (error) {
      showToast('An error occurred while adjusting attendance', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTimeChange = (index, field, value) => {
    const newPairs = [...timePairs]
    newPairs[index][field] = value
    setTimePairs(newPairs)
  }

  const handleAddTimePair = () => setTimePairs([...timePairs, { in: '', out: '' }])

  const handleRemoveTimePair = (index) => {
    if (timePairs.length > 1) setTimePairs(timePairs.filter((_, i) => i !== index))
  }

  const formatTimeDisplay = (time24) => {
    if (!time24) return '--:-- --'
    const [hours, minutes] = time24.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${String(hour12).padStart(2, '0')}:${minutes} ${ampm}`
  }

  const getStatusLabel = () => {
    if (data?.att_label === 'MAL') return 'Monthly Allowed Leave'
    if (data?.att_label === 'H' && data?.extra) return data.extra
    if (data?.att_label === 'H' && data?.extra === null) return 'Weekly Holiday'
    if (data?.att_label === 'A') return 'Absent'
    if (data?.att_label === 'CL') return 'Casual Leave'
    if (data?.att_label === 'AL') return 'Annual Leave'
    if (data?.att_label === 'L') return data?.extra || 'Leave'
    if (data?.extra === 'Manually marked holiday') return 'Manually Marked Holiday'
    return data?.extra || ''
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.05 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Attendance Summary ΓÇô shown when timings exist */}
      <AnimatePresence mode="wait">
        {hasTimings ? (
          <motion.div
            key="summary"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="shrink-0"
          >
            <div className="relative rounded-2xl bg-white border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,0.9)] p-6 mb-6 overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/60 before:via-transparent before:to-transparent before:pointer-events-none before:rounded-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 font-poppins">Today&apos;s Summary</p>
              {/* Time Pairs Row */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-5">
                {timePairs.map((pair, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-br from-white to-slate-50/90 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,0.9)]"
                  >
                    <div className="flex items-center gap-2">
                      <LogIn className="w-4 h-4 text-blue-500 shrink-0" aria-hidden />
                      <span className="text-sm text-slate-600">In{timePairs.length > 1 ? ` ${idx + 1}` : ''}:</span>
                      <span className="text-sm font-semibold text-slate-900">{formatTimeDisplay(pair.in)}</span>
                    </div>
                    <span className="text-slate-300">ΓåÆ</span>
                    <div className="flex items-center gap-2">
                      <LogOut className="w-4 h-4 text-amber-500 shrink-0" aria-hidden />
                      <span className="text-sm text-slate-600">Out{timePairs.length > 1 ? ` ${idx + 1}` : ''}:</span>
                      <span className="text-sm font-semibold text-slate-900">{formatTimeDisplay(pair.out)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              {/* Hours Stats Row */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/60 border border-emerald-200/60 shadow-[0_1px_3px_rgba(5,150,105,0.08),inset_0_1px_0_0_rgba(255,255,255,0.7)]">
                  <Timer className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden />
                  <span className="text-xs font-medium text-emerald-700">Expected</span>
                  <span className="text-sm font-semibold text-emerald-900">{secondsToHoursMinutesVerbose(data?.expected)}</span>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/60 border border-blue-200/60 shadow-[0_1px_3px_rgba(59,130,246,0.08),inset_0_1px_0_0_rgba(255,255,255,0.7)]">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" aria-hidden />
                  <span className="text-xs font-medium text-blue-700">Earned</span>
                  <span className="text-sm font-semibold text-blue-900">{secondsToHoursMinutesVerbose(data?.earned)}</span>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100/60 border border-violet-200/60 shadow-[0_1px_3px_rgba(139,92,246,0.08),inset_0_1px_0_0_rgba(255,255,255,0.7)]">
                  <Timer className="w-4 h-4 text-violet-600 shrink-0" aria-hidden />
                  <span className="text-xs font-medium text-violet-700">Overtime</span>
                  <span className="text-sm font-semibold text-violet-900">{secondsToHoursMinutesVerbose(data?.overtime)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!hasTimings ? (
          <motion.div
            key="no-timings"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center justify-center gap-8 py-12"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center border border-slate-200/80 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.9)]">
                <Calendar className="w-10 h-10 text-slate-500" aria-hidden />
              </div>
              <p className="text-base font-semibold text-slate-800 font-poppins text-center">{getStatusLabel()}</p>
              <p className="text-sm text-slate-500">Mark attendance for this day</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                type="button"
                onClick={() => handleMarkAction('present')}
                disabled={isSubmitting}
                whileHover={{ scale: 1.03, boxShadow: '0 20px 25px -5px rgba(5, 150, 105, 0.2)' }}
                whileTap={{ scale: 0.98 }}
                style={{ background: 'linear-gradient(180deg, #10b981 0%, #059669 50%, #047857 100%)', color: '#ffffff', boxShadow: '0 4px 14px -2px rgba(5, 150, 105, 0.35), inset 0 1px 0 0 rgba(255,255,255,0.2)' }}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <CheckCircle2 className="w-4 h-4" aria-hidden />}
                <span style={{ color: '#ffffff' }}>{isSubmitting ? 'Processing...' : 'Mark Present'}</span>
              </motion.button>
              <motion.button
                type="button"
                onClick={() => handleMarkAction('holiday')}
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ background: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)', color: '#ffffff', boxShadow: '0 4px 14px -2px rgba(245, 158, 11, 0.35), inset 0 1px 0 0 rgba(255,255,255,0.2)' }}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Calendar className="w-4 h-4" aria-hidden />}
                <span style={{ color: '#ffffff' }}>{isSubmitting ? 'Processing...' : 'Mark as Holiday'}</span>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="with-timings"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="flex-1 overflow-y-auto customScroll pr-1 -mr-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 font-poppins">Time Entries</p>
              {timePairs.map((pair, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="mb-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.03),inset_0_1px_0_0_rgba(255,255,255,0.9)] overflow-hidden"
                >
                  <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-slate-50 to-slate-100/80 border-b border-slate-200/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)]">
                    <span className="text-sm font-semibold text-slate-700 font-poppins">Time Pair {index + 1}</span>
                    {timePairs.length > 1 && (
                      <motion.button
                        type="button"
                        onClick={() => handleRemoveTimePair(index)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-200"
                        aria-label={`Remove time pair ${index + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden />
                        Remove
                      </motion.button>
                    )}
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-slate-600 w-16 shrink-0">In {index + 1}</label>
                      <input
                        type="time"
                        value={pair.in}
                        onChange={(e) => handleTimeChange(index, 'in', e.target.value)}
                        className="flex-1 min-w-0 text-sm text-slate-800 rounded-xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/80 px-4 py-2.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] transition-all"
                        aria-label={`In time ${index + 1}`}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-slate-600 w-16 shrink-0">Out {index + 1}</label>
                      <input
                        type="time"
                        value={pair.out}
                        onChange={(e) => handleTimeChange(index, 'out', e.target.value)}
                        className="flex-1 min-w-0 text-sm text-slate-800 rounded-xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/80 px-4 py-2.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] transition-all"
                        aria-label={`Out time ${index + 1}`}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}

              <motion.div variants={itemVariants} className="flex justify-center py-3">
                <motion.button
                  type="button"
                  onClick={handleAddTimePair}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-dashed border-slate-200/80 text-slate-500 text-sm font-medium bg-gradient-to-b from-slate-50/50 to-white hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/70 hover:shadow-[0_2px_8px_-2px_rgba(16,185,129,0.2)] focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
                >
                  <Plus className="w-4 h-4" aria-hidden />
                  Add Time Pair
                </motion.button>
              </motion.div>
            </div>

            {/* Action Buttons Footer */}
            <div className="shrink-0 pt-6 mt-4 border-t border-slate-200/80 bg-gradient-to-b from-white via-slate-50/50 to-white rounded-2xl px-4 py-5 shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,0.9)]">
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap justify-center gap-3"
              >
                <motion.button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)', color: '#ffffff', boxShadow: '0 4px 14px -2px rgba(37, 99, 235, 0.4), inset 0 1px 0 0 rgba(255,255,255,0.2)' }}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl !text-white text-sm font-semibold hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : null}
                  {isSubmitting ? 'Saving...' : 'Adjust Timings'}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => handleMarkAction('absent')}
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ background: 'linear-gradient(180deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)', color: '#ffffff', boxShadow: '0 4px 14px -2px rgba(220, 38, 38, 0.4), inset 0 1px 0 0 rgba(255,255,255,0.2)' }}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl !text-white text-sm font-semibold hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <XCircle className="w-4 h-4" aria-hidden />}
                  {isSubmitting ? 'Processing...' : 'Mark Absent'}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => handleMarkAction('holiday')}
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ background: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)', color: '#ffffff', boxShadow: '0 4px 14px -2px rgba(245, 158, 11, 0.35), inset 0 1px 0 0 rgba(255,255,255,0.2)' }}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl !text-white text-sm font-semibold hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Calendar className="w-4 h-4" aria-hidden />}
                  {isSubmitting ? 'Processing...' : 'Mark Holiday'}
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SingleDayDetails
