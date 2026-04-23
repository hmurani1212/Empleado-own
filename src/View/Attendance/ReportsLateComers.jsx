import { Checkbox, Input, Button } from '@material-tailwind/react'
import React, { useState, useEffect } from 'react'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import useAttendance from '../../ViewModel/AttendanceViewModel/AttendanceServices'
import { showToast } from '../../Components/Toaster/Toaster'
import employeesApi from '../../Model/Data/Employees/Employees'
import useStore from '../../Store/store'
import { FaFileExcel, FaFilePdf } from 'react-icons/fa'
import { getOrganizationData, getUserData } from '../../Authentication/jwt_decode'
import { appendExcelSignatureRowExcelJS } from '../../utils/excelExportSignature'

/** Detail columns (per attendance row). Minute fields use “Min” in headers. */
const DETAIL_COLUMNS = [
  { key: 'sNo', header: 'S.No', pdfHeader: '#', width: 7 },
  { key: 'name', header: 'Name', pdfHeader: 'Name', width: 24 },
  { key: 'fatherName', header: 'Father Name', pdfHeader: 'Father', width: 20 },
  { key: 'empleadoId', header: 'Employee ID', pdfHeader: 'Emp ID', width: 13 },
  { key: 'branch', header: 'Branch', pdfHeader: 'Branch', width: 16 },
  { key: 'signIn', header: 'Sign In', pdfHeader: 'Sign In', width: 20 },
  { key: 'signOut', header: 'Sign Out', pdfHeader: 'Sign Out', width: 20 },
  { key: 'late', header: 'Late Min', pdfHeader: 'Late Min', width: 12 },
  { key: 'adjusted', header: 'Adjusted Min', pdfHeader: 'Adj. Min', width: 12 },
  { key: 'actual', header: 'Actual Min', pdfHeader: 'Act. Min', width: 12 },
  { key: 'earlyLeave', header: 'Early Leave Min', pdfHeader: 'Early Min', width: 12 },
]

/** Under parent “Total” — merged vertically per employee in exports. */
const TOTAL_CHILD_COLUMNS = [
  { key: 'totalLateMin', header: 'Total Late Min', pdfHeader: 'Σ Late', width: 14 },
  { key: 'totalEarlyLeave', header: 'Total Early Leave', pdfHeader: 'Σ Early', width: 14 },
]

const DETAIL_COUNT = DETAIL_COLUMNS.length
const TOTAL_COUNT = TOTAL_CHILD_COLUMNS.length
const ALL_COL_COUNT = DETAIL_COUNT + TOTAL_COUNT

/** Main heading date only — e.g. "Apr, 2026" (no weekday or day-of-month). */
const formatLateComersHeadingMonthYear = (d = new Date()) => {
  const month = d.toLocaleDateString('en-US', { month: 'short' })
  return `${month}, ${d.getFullYear()}`
}

/** Prefer report period start (`fromDate` YYYY-MM-DD); else current month/year. */
const headingMonthYearFromFilter = (filterSnapshot) => {
  const raw = filterSnapshot?.fromDate
  if (typeof raw === 'string' && raw.length >= 7) {
    const y = parseInt(raw.slice(0, 4), 10)
    const m = parseInt(raw.slice(5, 7), 10)
    if (Number.isFinite(y) && Number.isFinite(m) && m >= 1 && m <= 12) {
      return formatLateComersHeadingMonthYear(new Date(y, m - 1, 1))
    }
  }
  return formatLateComersHeadingMonthYear()
}

const pickStr = (row, keys, fallback = '—') => {
  for (const k of keys) {
    const v = row[k]
    if (v != null && String(v).trim() !== '') return String(v).trim()
  }
  return fallback
}

/** Parse minutes from "75 Minutes", "0", or numeric. */
const parseMinutesFlexible = (val) => {
  if (val == null || val === '') return 0
  if (typeof val === 'number' && Number.isFinite(val)) return Math.max(0, val)
  const s = String(val).trim()
  const m = s.match(/(\d+(?:\.\d+)?)/)
  return m ? Math.max(0, parseFloat(m[1])) : 0
}

const formatMinutesLabel = (n) => {
  if (!Number.isFinite(n) || n <= 0) return '0 Minutes'
  const rounded = Math.round(n)
  return `${rounded} Minute${rounded === 1 ? '' : 's'}`
}

const employeeGroupKey = (row) => {
  const id = row.empleadoId
  if (id && id !== '—') return `id:${id}`
  return `nm:${row.name}|${row.fatherName}`
}

const mapLateComerToExportRow = (item, index) => {
  const lateStr = pickStr(item, ['late', 'Late', 'late_minutes'])
  const earlyStr = pickStr(item, ['earlyLeave', 'early_leave', 'EarlyLeave', 'early'])
  return {
    sNo: index + 1,
    name: pickStr(item, ['name', 'Name', 'employee_name']),
    fatherName: pickStr(item, ['FatherName', 'father_name', 'fatherName']),
    empleadoId: pickStr(item, ['EmpleadoID', 'empleado_id', 'emp_id', 'employee_id']),
    branch: pickStr(item, ['branch_name', 'branch', 'Branch']),
    signIn: pickStr(item, ['SignIn', 'sign_in', 'signIn']),
    signOut: pickStr(item, ['SignOut', 'sign_out', 'signOut']),
    late: lateStr,
    adjusted: pickStr(item, ['adjusted', 'Adjusted']),
    actual: pickStr(item, ['Actual', 'actual']),
    earlyLeave: earlyStr,
    lateMinutesNum: parseMinutesFlexible(item.late ?? item.Late ?? item.late_minutes ?? lateStr),
    earlyLeaveMinutesNum: parseMinutesFlexible(
      item.earlyLeave ?? item.early_leave ?? item.EarlyLeave ?? item.early ?? earlyStr
    ),
  }
}

/**
 * Sort by employee, then sign-in; attach total late / early sums and merge metadata for each group.
 */
const buildGroupedExportRows = (rows) => {
  const sorted = [...rows].sort((a, b) => {
    const g = employeeGroupKey(a).localeCompare(employeeGroupKey(b))
    if (g !== 0) return g
    return String(a.signIn).localeCompare(String(b.signIn))
  })

  const keysOrder = []
  const seen = new Set()
  sorted.forEach((r) => {
    const k = employeeGroupKey(r)
    if (!seen.has(k)) {
      seen.add(k)
      keysOrder.push(k)
    }
  })

  const out = []
  keysOrder.forEach((k) => {
    const group = sorted.filter((r) => employeeGroupKey(r) === k)
    let sumLate = 0
    let sumEarly = 0
    group.forEach((r) => {
      sumLate += r.lateMinutesNum ?? 0
      sumEarly += r.earlyLeaveMinutesNum ?? 0
    })
    const n = group.length
    const totalLateDisplay = formatMinutesLabel(sumLate)
    const totalEarlyDisplay = formatMinutesLabel(sumEarly)
    group.forEach((r, i) => {
      out.push({
        ...r,
        totalLateMin: totalLateDisplay,
        totalEarlyLeave: totalEarlyDisplay,
        _groupRowIndex: i,
        _groupSize: n,
      })
    })
  })

  return out.map((r, idx) => ({ ...r, sNo: idx + 1 }))
}

const ReportsLateComers = () => {
  const { handleCheckboxChangeAtt, isIndividualAtt } = useAttendance()
  const getDetailedLateComers = useStore((state) => state.getDetailedLateComers)
  const closeDrawer = useStore((state) => state.closeDrawer)

  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    branch: null,
    department: null,
    employee: null,
    employeeId: '',
  })

  const [empBranches, setEmpBranches] = useState([])
  const [dept_subDept, setDept_subDept] = useState([])
  const [empList, setEmpList] = useState([])
  const [loadingBranches, setLoadingBranches] = useState(false)
  const [loadingDepartments, setLoadingDepartments] = useState(false)
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [exportData, setExportData] = useState([])
  const [filterSnapshot, setFilterSnapshot] = useState(null)

  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    setLoadingBranches(true)
    try {
      const response = await employeesApi.gettingAllBranches()
      const data = response.data
      if (data.STATUS === 'SUCCESSFUL') {
        setEmpBranches(data.DB_DATA.branches || [])
      }
    } catch (err) {
      console.error('Error fetching branches:', err)
    } finally {
      setLoadingBranches(false)
    }
  }

  const fetchDepartments = async (branchId) => {
    setLoadingDepartments(true)
    try {
      const data = { parent_id: 0, branch_id: branchId, getAll: true }
      const response = await employeesApi.gettingSubDepts(data)
      const resData = response.data
      if (resData.STATUS === 'SUCCESSFUL') {
        setDept_subDept(resData.DB_DATA)
      } else {
        setDept_subDept([])
      }
    } catch (err) {
      console.error('Error fetching departments:', err)
      setDept_subDept([])
    } finally {
      setLoadingDepartments(false)
    }
  }

  const fetchEmployees = async (departmentId) => {
    setLoadingEmployees(true)
    try {
      const response = await employeesApi.get_all_employeee(departmentId)
      const data = response.data
      if (data.STATUS === 'SUCCESSFUL') {
        setEmpList(data.DB_DATA || [])
      } else {
        setEmpList([])
      }
    } catch (err) {
      console.error('Error fetching employees:', err)
      setEmpList([])
    } finally {
      setLoadingEmployees(false)
    }
  }

  const flattenDeptOptions = (data) => {
    const flattenedOptions = [{ label: 'All Departments', value: 0, isParent: false }]
    const send_data = data?.departments
    if (send_data && Array.isArray(send_data)) {
      send_data.forEach((dept) => {
        flattenedOptions.push({
          label: dept.name,
          value: dept.id,
          isParent: true,
        })
      })
    }
    return flattenedOptions
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleBranchChange = (selectedOption) => {
    handleInputChange('branch', selectedOption)
    handleInputChange('department', null)
    handleInputChange('employee', null)
    setDept_subDept([])
    setEmpList([])
    if (selectedOption) {
      fetchDepartments(selectedOption.value)
    }
  }

  const handleDepartmentChange = (selectedOption) => {
    handleInputChange('department', selectedOption)
    handleInputChange('employee', null)
    setEmpList([])
    if (selectedOption && selectedOption.value !== 0) {
      fetchEmployees(selectedOption.value)
    }
  }

  const canSubmit = () => {
    if (!formData.fromDate || !formData.toDate || !formData.branch) return false
    if (isIndividualAtt && !formData.employee && !formData.employeeId?.trim()) return false
    return true
  }

  const handleExportSubmit = async () => {
    if (!canSubmit()) {
      if (!formData.fromDate || !formData.toDate) {
        showToast('Please select both From Date and To Date', 'error')
        return
      }
      if (!formData.branch) {
        showToast('Please select a branch', 'error')
        return
      }
      if (isIndividualAtt && !formData.employee && !formData.employeeId?.trim()) {
        showToast('Please select an employee or enter Employee ID for individual export', 'error')
        return
      }
      return
    }

    setIsLoading(true)
    try {
      const apiData = {
        branch_id: formData.branch.value,
        dept_id: formData.department?.value !== undefined ? formData.department.value : null,
        emp_id: isIndividualAtt ? formData.employee?.value || formData.employeeId : null,
        from_date: formData.fromDate,
        to_date: formData.toDate,
      }

      const result = await getDetailedLateComers(apiData)

      if (result.success) {
        const raw = result.data
        if (raw && raw.length > 0) {
          const mapped = raw.map((item, index) => mapLateComerToExportRow(item, index))
          const rows = buildGroupedExportRows(mapped)
          setExportData(rows)
          setFilterSnapshot({
            fromDate: formData.fromDate,
            toDate: formData.toDate,
            branchLabel: formData.branch?.label || '—',
            deptLabel: formData.department?.label || 'All',
          })
          setShowExportOptions(true)
          showToast(`Data loaded successfully (${raw.length} records). Choose export format.`, 'success')
        } else {
          setExportData([])
          setShowExportOptions(false)
          showToast('No late comers data found for the selected criteria', 'warning')
        }
      } else {
        showToast(result.error || 'Failed to fetch late comers data', 'error')
        setShowExportOptions(false)
        setExportData([])
      }
    } catch (error) {
      console.error('Error exporting late comers report:', error)
      showToast('An error occurred while loading the report', 'error')
      setShowExportOptions(false)
      setExportData([])
    } finally {
      setIsLoading(false)
    }
  }

  const getDetailCellValue = (row, col) => {
    const v = row[col.key]
    return v != null && String(v).trim() !== '' ? v : '—'
  }

  const getTotalCellValue = (row, key) => {
    const v = row[key]
    return v != null && String(v).trim() !== '' ? v : '—'
  }

  const handleExcelExport = async () => {
    try {
      const ExcelJS = (await import('exceljs')).default
      const orgName = getOrganizationData()?.orgName || getUserData()?.org_name || 'Organization Name'
      const reportDate = headingMonthYearFromFilter(filterSnapshot)

      const ORG_HEADER_BG = 'FF1F4E79'
      const DATE_HEADER_BG = 'FF2E75B6'
      const COLUMN_HEADER_BG = 'FF1F4E79'
      const GRID_COLOR = 'FFD1D5DB'
      const ROW_FILL_WHITE = 'FFFFFFFF'

      const workbook = new ExcelJS.Workbook()
      const sheet = workbook.addWorksheet('Late Comers', {
        views: [{ rightToLeft: false }],
        properties: { defaultRowHeight: 28 },
      })

      const widths = [...DETAIL_COLUMNS.map((c) => c.width), ...TOTAL_CHILD_COLUMNS.map((c) => c.width)]
      sheet.columns = widths.map((w) => ({ width: w }))

      const styleHeaderCell = (cell) => {
        cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLUMN_HEADER_BG } }
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true, indent: 0 }
        cell.border = {
          top: { style: 'thin', color: { argb: GRID_COLOR } },
          bottom: { style: 'thin', color: { argb: GRID_COLOR } },
          left: { style: 'thin', color: { argb: GRID_COLOR } },
          right: { style: 'thin', color: { argb: GRID_COLOR } },
        }
      }

      let rowPtr = 1

      const orgRow = sheet.addRow([`Organization: ${orgName}`])
      orgRow.height = 32
      sheet.mergeCells(rowPtr, 1, rowPtr, ALL_COL_COUNT)
      orgRow.getCell(1).font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } }
      orgRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
      orgRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ORG_HEADER_BG } }
      rowPtr += 1

      const titleRow = sheet.addRow([`Late Comers Export — ${reportDate}`])
      titleRow.height = 34
      sheet.mergeCells(rowPtr, 1, rowPtr, ALL_COL_COUNT)
      titleRow.getCell(1).font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } }
      titleRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
      titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DATE_HEADER_BG } }
      rowPtr += 1

      if (filterSnapshot) {
        const meta = sheet.addRow([
          `Period: ${filterSnapshot.fromDate} → ${filterSnapshot.toDate}  |  Branch: ${filterSnapshot.branchLabel}  |  Department: ${filterSnapshot.deptLabel}`,
        ])
        meta.height = 26
        sheet.mergeCells(rowPtr, 1, rowPtr, ALL_COL_COUNT)
        meta.getCell(1).font = { size: 11, italic: true }
        meta.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
        rowPtr += 1
      }

      const headerRow1 = rowPtr
      const r1 = [...DETAIL_COLUMNS.map((c) => c.header), 'Total', '']
      const r2 = [...Array(DETAIL_COUNT).fill(null), TOTAL_CHILD_COLUMNS[0].header, TOTAL_CHILD_COLUMNS[1].header]
      sheet.addRow(r1)
      sheet.addRow(r2)
      sheet.getRow(headerRow1).height = 26
      const headerRow2 = headerRow1 + 1
      sheet.getRow(headerRow2).height = 26

      for (let c = 1; c <= DETAIL_COUNT; c++) {
        sheet.mergeCells(headerRow1, c, headerRow2, c)
        const cell = sheet.getCell(headerRow1, c)
        cell.value = DETAIL_COLUMNS[c - 1].header
        styleHeaderCell(cell)
      }
      sheet.mergeCells(headerRow1, DETAIL_COUNT + 1, headerRow1, DETAIL_COUNT + 2)
      const totalParent = sheet.getCell(headerRow1, DETAIL_COUNT + 1)
      totalParent.value = 'Total'
      styleHeaderCell(totalParent)

      styleHeaderCell(sheet.getCell(headerRow2, DETAIL_COUNT + 1))
      styleHeaderCell(sheet.getCell(headerRow2, DETAIL_COUNT + 2))

      rowPtr = headerRow2 + 1

      const t1 = DETAIL_COUNT + 1
      const t2 = DETAIL_COUNT + 2
      const mergeJobs = []

      exportData.forEach((row) => {
        const detailVals = DETAIL_COLUMNS.map((col) => getDetailCellValue(row, col))
        const isFirst = row._groupRowIndex === 0
        const gSize = row._groupSize || 1
        const dataRow =
          isFirst || gSize === 1 ? sheet.addRow([...detailVals, '', '']) : sheet.addRow(detailVals)
        dataRow.height = 30
        const excelRowIndex = dataRow.number
        rowPtr = excelRowIndex + 1

        for (let c = 1; c <= DETAIL_COUNT; c++) {
          const cell = dataRow.getCell(c)
          const col = DETAIL_COLUMNS[c - 1]
          const isNum = col.key === 'sNo'
          cell.font = { size: 11 }
          cell.alignment = {
            horizontal: isNum ? 'center' : 'left',
            vertical: 'middle',
            wrapText: ['name', 'branch', 'fatherName'].includes(col.key),
            indent: !isNum ? 1 : 0,
          }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ROW_FILL_WHITE } }
          cell.border = {
            top: { style: 'thin', color: { argb: GRID_COLOR } },
            bottom: { style: 'thin', color: { argb: GRID_COLOR } },
            left: { style: 'thin', color: { argb: GRID_COLOR } },
            right: { style: 'thin', color: { argb: GRID_COLOR } },
          }
        }

        if (!isFirst) return

        const cLate = sheet.getCell(excelRowIndex, t1)
        const cEarly = sheet.getCell(excelRowIndex, t2)
        cLate.value = getTotalCellValue(row, 'totalLateMin')
        cEarly.value = getTotalCellValue(row, 'totalEarlyLeave')
        ;[cLate, cEarly].forEach((cell) => {
          cell.font = { size: 11, color: { argb: 'FF334155' } }
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ROW_FILL_WHITE } }
          cell.border = {
            top: { style: 'thin', color: { argb: GRID_COLOR } },
            bottom: { style: 'thin', color: { argb: GRID_COLOR } },
            left: { style: 'thin', color: { argb: GRID_COLOR } },
            right: { style: 'thin', color: { argb: GRID_COLOR } },
          }
        })
        if (gSize > 1) {
          mergeJobs.push({ start: excelRowIndex, gSize })
        }
      })

      mergeJobs.forEach(({ start, gSize }) => {
        sheet.mergeCells(start, t1, start + gSize - 1, t1)
        sheet.mergeCells(start, t2, start + gSize - 1, t2)
      })

      await appendExcelSignatureRowExcelJS(sheet, ALL_COL_COUNT)

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `late_comers_export_${new Date().toISOString().split('T')[0]}.xlsx`
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      showToast('Excel file downloaded successfully', 'success')
      closeDrawer()
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      showToast('Error exporting to Excel', 'error')
    }
  }

  const handlePdfExport = () => {
    try {
      const printWindow = window.open('', '_blank', 'width=1000,height=700')
      if (!printWindow) {
        showToast('Please allow popups to print PDF', 'warning')
        return
      }
      const orgName = getOrganizationData()?.orgName || getUserData()?.org_name || 'Organization Name'
      const reportDate = headingMonthYearFromFilter(filterSnapshot)

      const detailThRow1 = DETAIL_COLUMNS.map((col) => {
        const isNum = col.key === 'sNo'
        return `<th rowspan="2" class="${isNum ? 'th-num' : ''}">${col.pdfHeader}</th>`
      }).join('')

      const thead = `
        <tr>
          ${detailThRow1}
          <th colspan="2" class="th-group-total">Total</th>
        </tr>
        <tr>
          <th class="th-sub-total">${TOTAL_CHILD_COLUMNS[0].pdfHeader}</th>
          <th class="th-sub-total">${TOTAL_CHILD_COLUMNS[1].pdfHeader}</th>
        </tr>
      `

      const tableRows =
        exportData.length > 0
          ? exportData
              .map((row) => {
                const detailTds = DETAIL_COLUMNS.map((col) => {
                  const display = getDetailCellValue(row, col)
                  const isNum = col.key === 'sNo'
                  return `<td class="${isNum ? 'td-num' : ''}">${display}</td>`
                }).join('')

                const isFirst = row._groupRowIndex === 0
                const gSize = row._groupSize || 1
                if (isFirst && gSize > 1) {
                  return `<tr class="row-body">
                    ${detailTds}
                    <td class="td-total" rowspan="${gSize}">${getTotalCellValue(row, 'totalLateMin')}</td>
                    <td class="td-total" rowspan="${gSize}">${getTotalCellValue(row, 'totalEarlyLeave')}</td>
                  </tr>`
                }
                if (!isFirst) {
                  return `<tr class="row-body">
                    ${detailTds}
                  </tr>`
                }
                return `<tr class="row-body">
                  ${detailTds}
                  <td class="td-total">${getTotalCellValue(row, 'totalLateMin')}</td>
                  <td class="td-total">${getTotalCellValue(row, 'totalEarlyLeave')}</td>
                </tr>`
              })
              .join('')
          : `<tr><td colspan="${ALL_COL_COUNT}" class="no-data">No data available for export.</td></tr>`

      const metaLine =
        filterSnapshot != null
          ? `<div class="filter-meta">Period: ${filterSnapshot.fromDate} → ${filterSnapshot.toDate} &nbsp;|&nbsp; Branch: ${filterSnapshot.branchLabel} &nbsp;|&nbsp; Department: ${filterSnapshot.deptLabel}</div>`
          : ''

      const colgroupCols = Array.from({ length: ALL_COL_COUNT }, () => '<col class="col-dyn">').join('')

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Late Comers Export</title>
          <style>
            @page { margin: 1cm; size: A4 landscape; }
            * { box-sizing: border-box; }
            body { margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 11px; color: #1e293b; background: #fff; }
            .header-org { background: #1F4E79; color: #fff; padding: 12px 20px; text-align: left; font-weight: 700; font-size: 15px; letter-spacing: 0.02em; }
            .header-date { background: #2E75B6; color: #fff; padding: 14px 20px; text-align: left; font-weight: 700; font-size: 17px; letter-spacing: 0.02em; }
            .filter-meta { padding: 10px 20px; font-size: 11px; color: #475569; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
            .table-wrap { overflow-x: auto; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 11px; }
            col.col-dyn { min-width: 48px; }
            th, td { padding: 8px 6px; border: 1px solid #e2e8f0; }
            th { background: #1F4E79; color: #fff; font-weight: 600; font-size: 9px; text-align: left; white-space: nowrap; }
            th.th-group-total { text-align: center; background: #1F4E79 !important; color: #fff !important; font-size: 10px; }
            th.th-sub-total { text-align: center; background: #1F4E79 !important; color: #fff !important; font-size: 9px; font-weight: 600; }
            th.th-num { text-align: center; }
            .row-body td { background: #fff; color: #334155; }
            .row-body td.td-num { text-align: center; font-variant-numeric: tabular-nums; }
            .row-body td.td-total { text-align: center; vertical-align: middle; font-weight: 400; color: #334155; background: #fff !important; font-size: 11px; }
            .no-data { text-align: center; padding: 40px; color: #64748b; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="header-org">Organization: ${orgName}</div>
          <div class="header-date">Late Comers Export — ${reportDate}</div>
          ${metaLine}
          <div class="table-wrap">
            <table>
              <colgroup>${colgroupCols}</colgroup>
              <thead>${thead}</thead>
              <tbody>${tableRows}</tbody>
            </table>
          </div>
        </body>
        </html>
      `
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.onload = () => {
        printWindow.print()
        setTimeout(() => printWindow.close(), 1000)
      }
      showToast('PDF print dialog opened', 'success')
      closeDrawer()
    } catch (error) {
      console.error('Error printing PDF:', error)
      showToast('Error printing PDF', 'error')
    }
  }

  const handleCancel = () => {
    setFormData({
      fromDate: '',
      toDate: '',
      branch: null,
      department: null,
      employee: null,
      employeeId: '',
    })
    setDept_subDept([])
    setEmpList([])
    setShowExportOptions(false)
    setExportData([])
    setFilterSnapshot(null)
    closeDrawer()
  }

  const branchOptions = [{ value: 0, label: 'All Branches' }, ...(empBranches?.map((b) => ({ value: b.id, label: b.branch_name })) || [])]

  return (
    <div className="p-6 space-y-6">
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-[#698592] text-[12px] font-semibold mb-2 block">From Date</label>
          <input
            type="date"
            value={formData.fromDate}
            onChange={(e) => handleInputChange('fromDate', e.target.value)}
            className="w-full text-[#698592] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex-1">
          <label className="text-[#698592] text-[12px] font-semibold mb-2 block">To Date</label>
          <input
            type="date"
            value={formData.toDate}
            onChange={(e) => handleInputChange('toDate', e.target.value)}
            className="w-full text-[#698592] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-[#698592] text-[12px] font-semibold mb-2 block">Select Branch</label>
          <div className="w-full">
            <CustomSelect
              key={`late-branch-${formData.branch?.value ?? 'empty'}`}
              placeHolderTitle="Select Branch"
              value={formData.branch}
              options={branchOptions}
              onChangeHandler={handleBranchChange}
              customStyles={false}
            />
          </div>
          {loadingBranches && <div className="text-sm text-gray-500 mt-1">Loading branches...</div>}
        </div>
        <div className="flex-1">
          <label className="text-[#698592] text-[12px] font-semibold mb-2 block">Select Department</label>
          <div className="w-full">
            <CustomSelect
              key={`late-dept-${formData.department?.value ?? 'empty'}`}
              placeHolderTitle="Select Department"
              value={formData.department}
              options={flattenDeptOptions(dept_subDept)}
              onChangeHandler={handleDepartmentChange}
              customStyles={false}
              disabled={!formData.branch}
            />
          </div>
          {loadingDepartments && <div className="text-sm text-gray-500 mt-1">Loading departments...</div>}
        </div>
      </div>

      <div className="text-[14px] space-y-3">
        <div>
          <Checkbox label="Export an individual attendance" color="blue" onChange={handleCheckboxChangeAtt} />
        </div>
        {isIndividualAtt && (
          <div className="max-w-md pl-[10px] space-y-3">
            <div>
              <label className="text-[#698592] text-[12px] font-semibold mb-2 block">Select Employee (Optional)</label>
              <CustomSelect
                placeHolderTitle="Employee"
                value={formData.employee}
                options={empList?.map((emp) => ({ value: emp.id, label: emp.name }))}
                onChangeHandler={(selectedOption) => handleInputChange('employee', selectedOption)}
                customStyles={false}
                disabled={!formData.department}
              />
              {loadingEmployees && <div className="text-sm text-gray-500 mt-1">Loading employees...</div>}
            </div>
            <div>
              <Input
                label="Or Enter Employee ID"
                color="blue"
                value={formData.employeeId}
                onChange={(e) => handleInputChange('employeeId', e.target.value)}
                placeholder="Enter Employee ID manually"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <Button variant="outlined" color="blue-gray" onClick={handleCancel} className="px-6 cursor-pointer">
          Cancel
        </Button>

        {!showExportOptions ? (
          <Button color="blue" onClick={handleExportSubmit} className="px-6 cursor-pointer" disabled={isLoading || !canSubmit()}>
            {isLoading ? 'Loading...' : 'Export'}
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button color="green" onClick={handleExcelExport} className="px-6 cursor-pointer py-2 flex items-center gap-2">
              <FaFileExcel className="text-lg" />
              Excel
            </Button>
            <Button color="red" onClick={handlePdfExport} className="px-6 py-2 cursor-pointer flex items-center gap-2">
              <FaFilePdf className="text-lg" />
              PDF
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportsLateComers
