import attendanceApi from "../../Model/Data/Attendance/Attendance"
import employeesApi from "../../Model/Data/Employees/Employees"
import InboxApiData from "../../Model/Data/inboxDate/InboxApiData"
import { createApiKey, executeApiCall } from "../../services/__apiManager"

const attendanceViewModel = (set, get) => ({
    allLateComers: [],
    allAttArchiveReport: [],
    attArchiveReportLoading: false,
    attendanceBranches: [],
    attBranchWise: [],
    empListAtt: [],
    individualRequestDetail: [],
    requestData: [],
    /** True while adjustment requests list is fetching (replace mode); false for load-more append */
    requestAdjListLoading: false,
    /** Server-side name/ID search for adjustment requests list (Time Adjustment screen); sent as query param `name` */
    requestAdjName: '',
    requestPagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
        hasMore: false
    },
    editData: [],
    tempId: '',
    allFormData: [],
    calendarData: {},
    calendarChartData: [],
    calendarEmp: {},
    showCalendar: false,
    loading: false,
    lastHRPolicy: {},
    rawAttendanceLogParams: { empId: null, month: null, year: null },
    trackPolicyParams: { empId: null, month: null, year: null },
    /** Persisted month/year for individual attendance report (survives navigation; resets on full page refresh) */
    individualAttendanceMonthYear: null,





    settingcalendarData: (data) => {
        set({ calendarData: data })
    },
    settingcalendarEmp: (data) => {
        set({ calendarEmp: data })
    },

    settingcalendarChartData: (data) => {
        set({ calendarChartData: data })
    },

    settingShowCalendar: (toggle) => {
        set({ showCalendar: toggle })
    },

    setLastHRPolicy: (policy) => {
        set({ lastHRPolicy: policy || {} })
    },

    setRawAttendanceLogParams: (params) => {
        set({ rawAttendanceLogParams: params || { empId: null, month: null, year: null } })
    },

    setTrackPolicyParams: (params) => {
        set({ trackPolicyParams: params || { empId: null, month: null, year: null } })
    },

    setIndividualAttendanceMonthYear: (monthYear) => {
        set({ individualAttendanceMonthYear: monthYear || null })
    },

    transformLastPolicyToViewPolicy: (lastPolicy) => {
        if (!lastPolicy || !lastPolicy.id) {
            return {}
        }

        // Helper function to convert payroll string to number
        const payrollToNumber = (payroll) => {
            if (!payroll) return 1
            if (typeof payroll === 'number') return payroll
            const upper = String(payroll).toUpperCase()
            if (upper === 'ONE' || upper === '1') return 1
            if (upper === 'TWO' || upper === '2') return 2
            if (upper === 'THREE' || upper === '3') return 3
            return 1
        }

        // Helper function to convert timeout_policy string to number
        const timeoutPolicyToNumber = (timeout) => {
            if (!timeout) return '0'
            if (typeof timeout === 'string' && !isNaN(timeout)) return timeout
            const upper = String(timeout).toUpperCase()
            if (upper === 'ZERO' || upper === '0') return '0'
            if (upper === 'ONE' || upper === '1') return '1'
            if (upper === 'TWO' || upper === '2') return '2'
            if (upper === 'THREE' || upper === '3') return '3'
            return '0'
        }

        // Helper function to convert early_arrival string to number
        const earlyArrivalToNumber = (arrival) => {
            if (!arrival) return '0'
            if (typeof arrival === 'string' && !isNaN(arrival)) return arrival
            const upper = String(arrival).toUpperCase()
            if (upper === 'ONE' || upper === '1') return '1'
            if (upper === 'ZERO' || upper === '0') return '0'
            return '0'
        }

        // Helper function to convert overtime_pay
        const overtimePayToNumber = (otPay) => {
            if (!otPay) return '0'
            if (typeof otPay === 'string' && !isNaN(otPay)) return otPay
            const upper = String(otPay).toUpperCase()
            if (upper === 'YES' || upper === '1') return '1'
            if (upper === 'NO' || upper === '0') return '0'
            return '0'
        }

        // Helper function to convert use_multi_devices
        const convertMultiDevicesToNumber = (devices) => {
            if (!devices) return '0'
            if (typeof devices === 'string' && !isNaN(devices)) return devices
            const upper = String(devices).toUpperCase()
            if (upper === 'YES' || upper === '1') return '1'
            if (upper === 'NO' || upper === '0') return '0'
            return '0'
        }

        // Convert working_days array to string format if needed
        const workingDaysToString = (days) => {
            if (!days) return ''
            if (typeof days === 'string') return days
            if (Array.isArray(days)) {
                return days.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')
            }
            return ''
        }

        // Transform OTRules to overtime_rules format
        const overtimeRules = lastPolicy.OTRules ? {
            daily_ot_rate: lastPolicy.OTRules.daily_ot_rate || 0,
            daily_ot_val: lastPolicy.OTRules.daily_ot_val || 0,
            holiday_ot_rate: lastPolicy.OTRules.holiday_ot_rate || 0,
            holiday_ot_val: lastPolicy.OTRules.holiday_ot_val || 0,
            h_ot_other_amount: lastPolicy.OTRules.h_ot_other_amount || 0
        } : null

        // Build transformed policy object
        const transformedPolicy = {
            ...lastPolicy,
            // Map OTRules to overtime_rules
            overtime_rules: overtimeRules,
            // Convert working_days array to string format
            working_days: workingDaysToString(lastPolicy.working_days),
            // Convert payroll string to number
            payroll: payrollToNumber(lastPolicy.payroll),
            // Convert overtime_pay
            overtime_pay: overtimePayToNumber(lastPolicy.overtime_pay),
            // Convert timeout_policy
            timeout_policy: timeoutPolicyToNumber(lastPolicy.timeout_policy),
            // Convert early_arrival
            early_arrival: earlyArrivalToNumber(lastPolicy.early_arrival),
            // Convert use_multi_devices
            use_multi_devices: convertMultiDevicesToNumber(lastPolicy.use_multi_devices),
            // Set defaults for fields that might not be in last_policy
            pay_schedule: lastPolicy.pay_schedule || null,
            pay_month: lastPolicy.pay_month || lastPolicy.pay_schedule || null,
            leave_group: lastPolicy.leave_group || lastPolicy.leave_group_id || null,
            swap_policy: lastPolicy.swap_policy || '[]'
        }

        return transformedPolicy
    },





    gettingLateComers: async () => {
        set({ loading: true })
        try {
            const response = await attendanceApi.getMonthLateComers()
            const data = response.data;
            // console.log('data.DB_DATA',data.DB_DATA);
            // console.log('data.STATUS === SUCCESSFUL',data.STATUS === 'SUCCESSFUL')

            if (data.STATUS === 'SUCCESSFUL') {
                set({ allLateComers: data.DB_DATA })
            } else {
                set({ allLateComers: [] })
            }

        } catch (error) {
            console.log(error)
        } finally {
            set({ loading: false })
        }
    },

    gettingAttReportArchive: async () => {
        set({ attArchiveReportLoading: true })
        try {
            const response = await attendanceApi.getAttArchive()
            const data = response.data
            console.log('Att  Archive', data)

            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                set({ allAttArchiveReport: data.DB_DATA })
            } else {
                set({ allAttArchiveReport: [] })
            }

        } catch (error) {
            console.log(error)
            set({ allAttArchiveReport: [] })
        } finally {
            set({ attArchiveReportLoading: false })
        }
    },

    branchesAttendance: async () => {
        try {
            const response = await attendanceApi.allBranchesAttendance()
            const data = response.data
            // console.log('branches response',data)

            if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
                set({ attendanceBranches: data.DB_DATA })
            }
        } catch (err) {
        }
    },

    empSuggestionListAtt: async () => {
        const apiKey = createApiKey('/api/v1/employees/employee/get_all_employee', {});
        try {
            const response = await executeApiCall(apiKey, () => employeesApi.get_all_employeee())
            const data = response.data

            if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
                // Support both DB_DATA as array and DB_DATA.employees; include all employees (e.g. same name)
                const list = Array.isArray(data.DB_DATA) ? data.DB_DATA : (data.DB_DATA?.employees || []);
                set({ empListAtt: list })
            }
        } catch (err) {
            console.log(err)
        }
    },

    gettingRequestAdj: async (loadMore = false, pageNumber = null, options = {}) => {
        const currentState = get()
        const { name: nameOpt } = options

        if (nameOpt !== undefined) {
            set({ requestAdjName: String(nameOpt).trim() })
        }

        const adjName = (nameOpt !== undefined
            ? String(nameOpt).trim()
            : (currentState.requestAdjName || '').trim())

        const currentPage = pageNumber != null
            ? pageNumber
            : loadMore ? currentState.requestPagination.page + 1 : 1
        const shouldAppend = loadMore && pageNumber == null

        if (!shouldAppend) {
            set({ requestAdjListLoading: true })
        }

        const dataReq = {
            form_label: 'ATT_TIME_ADJUSTMENT',
            getall: 'false',
            last_id: '',
            page: currentPage,
            limit: currentState.requestPagination.limit,
            ...(adjName ? { name: adjName } : {})
        }

        try {
            const response = await attendanceApi.getAdjustRequest(dataReq)
            const data = response.data
            console.log('req data', data.DB_DATA?.items)

            if (data.STATUS === 'SUCCESS' || data.STATUS === 'SUCCESSFUL') {
                const dbData = data?.DB_DATA || {}
                const newItems = dbData.items || []
                const page = dbData.page ?? currentPage
                const limit = dbData.limit ?? currentState.requestPagination.limit
                const total = dbData.total ?? 0
                const totalPages = dbData.total_pages ?? Math.max(1, Math.ceil(total / limit))

                set((state) => ({
                    requestData: shouldAppend
                        ? [...state.requestData, ...newItems]
                        : newItems,
                    requestPagination: {
                        page,
                        limit,
                        total,
                        totalPages,
                        hasMore: page < totalPages
                    }
                }))
            }
        } catch (error) {
            console.log(error)
        } finally {
            set({ requestAdjListLoading: false })
        }
    },

    gettingAdjDetail: async (id) => {
        // First try the Forms detail endpoint: GET /api/v1/forms/:id
        try {
            const formsResp = await InboxApiData.getFormDetails(id)
            const formsData = formsResp?.data
            if (formsResp?.status === 200 && formsData?.STATUS === 'SUCCESSFUL') {
                const d = formsData.DB_DATA || {}
                // Merge top-level display fields into form_data so UI has emp_name, branch, etc.
                const formData = { ...(d.form_data || {}) }
                if (d.emp_name != null) formData.emp_name = d.emp_name
                if (d.emp_id != null) formData.emp_id = d.emp_id
                if (d.emp_email != null) formData.emp_email = d.emp_email
                if (d.emp_phone != null) formData.emp_phone = d.emp_phone
                if (d.branch != null) formData.branch = d.branch
                if (d.department != null) formData.department = d.department
                if (d.designation_name != null) formData.designation_name = d.designation_name
                if (d.designation_id != null) formData.designation_id = d.designation_id
                // Map Forms detail to shape expected by UI (root-level date/in_time/out_time for Section 2)
                const mapped = [{
                    _id: d.id ?? d._id ?? (Number(id) || id) ?? null,
                    user_name: d.emp_name ?? d.form_data?.emp_name ?? d.name ?? null,
                    emp_name: d.emp_name ?? d.form_data?.emp_name ?? null,
                    emp_id: d.emp_id ?? d.form_data?.emp_id ?? null,
                    one_id: d.one_id ?? null,
                    entry_time: d.entry_time ?? null,
                    update_time: d.updated_at ?? d.update_time ?? null,
                    date: d.date ?? d.form_data?.date ?? null,
                    in_time: d.in_time ?? d.form_data?.in_time ?? null,
                    out_time: d.out_time ?? d.form_data?.out_time ?? null,
                    form_data: formData,
                    form_labels: {
                        in_time: 'In Time',
                        out_time: 'Out Time'
                    },
                    approval_members: [
                        {
                            approval_index: 1,
                            approved_by: d.approvel_by ?? d.approved_by ?? null,
                            approved_name: d.approvel_flow ?? d.approved_name ?? null,
                            oneid: d.one_id ?? d.employee_info?.user_oneID ?? d.employee_details?.user_oneID ?? null,
                            status_lbl: d.status ?? d.type_base_info ?? null,
                            last_update_time: d.updated_at ?? d.update_time ?? null,
                        }
                    ]
                }]

                set({ individualRequestDetail: mapped })
                set({ allFormData: formData })
                return
            }
        } catch (err) {
            // Ignore and fallback
        }

        // Fallback to existing attendance detail API
        const dataReq = { CF_submission_id: id }
        try {
            const response = await attendanceApi.getIndividualDetail(dataReq)
            const data = response.data
            if (data.STATUS === 'SUCCESS') {
                set({ individualRequestDetail: data.DB_DATA })
                set({ allFormData: data?.DB_DATA?.data })
            } else {
                set({ individualRequestDetail: [] })
                set({ allFormData: [] })
            }
        } catch (error) {
            set({ individualRequestDetail: [] })
            set({ allFormData: [] })
        }

    },

    settingEditData: (data) => {
        // console.log('^^^^^',data)
        set({
            editData: data.form_data
        })
    },

    settingId: (id) => {
        set({
            tempId: id
        })
    },

    updatedAdjRequest: (request) => {
        set({
            individualRequestDetail: get().individualRequestDetail?.map((req) =>
                req._id === request._id
                    ? {
                        ...req,
                        in_time: request.in_time ?? req.in_time,
                        out_time: request.out_time ?? req.out_time,
                        form_data: {
                            ...req.form_data,
                            in_time: request.in_time,
                            out_time: request.out_time,
                        },
                    }
                    : req
            )
        });
    },

    // Update time adjustment via Forms service
    updateTimeAdjustment: async (submissionId, inTime, outTime) => {
        try {
            const response = await InboxApiData.updateAdjustmentTime(submissionId, {
                in_time: inTime,
                out_time: outTime,
            })
            const data = response.data
            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                const updated = data.DB_DATA
                // Update local state to reflect new times
                if (updated && updated._id && updated.form_data) {
                    get().updatedAdjRequest({
                        _id: updated._id,
                        in_time: updated.form_data.in_time,
                        out_time: updated.form_data.out_time,
                    })
                }
                return { success: true, data: data }
            }
            return { success: false, error: data.ERROR_DESCRIPTION }
        } catch (error) {
            return { success: false, error: error?.response?.data?.ERROR_DESCRIPTION || 'Failed to update time adjustment' }
        }
    },

    // Daily attendance adjustment function
    dailyAttAdjust: async (data) => {
        try {
            const response = await attendanceApi.dailyAttAdjust(data);
            const responseData = response.data;
            console.log('Daily Attendance Adjustment Response:', responseData);

            if (responseData.STATUS === 'SUCCESSFUL') {
                return { success: true, data: responseData };
            } else {
                console.error('Failed to adjust daily attendance:', responseData.ERROR_DESCRIPTION);
                return { success: false, error: responseData.ERROR_DESCRIPTION };
            }
        } catch (error) {
            console.error('Error adjusting daily attendance:', error);
            return { success: false, error: 'Failed to adjust daily attendance' };
        }
    },

    // Set manual attendance function
    setManualAttendance: async (data) => {
        try {
            const response = await attendanceApi.setManualAttendance(data);
            const responseData = response.data;

            if (responseData.STATUS === 'SUCCESSFUL') {
                return { success: true, data: responseData };
            } else {
                return { success: false, error: responseData.ERROR_DESCRIPTION };
            }
        } catch (error) {
            return { success: false, error: error?.response?.data?.ERROR_DESCRIPTION };
        }
    },

    // Schedule report function
    scheduleReport: async (data) => {
        try {
            const response = await attendanceApi.scheduleReport(data);
            const responseData = response.data;

            if (responseData.STATUS === 'SUCCESSFUL') {
                return { success: true, data: responseData };
            } else {
                return { success: false, error: responseData.ERROR_DESCRIPTION };
            }
        } catch (error) {
            return { success: false, error: 'Failed to schedule report' };
        }
    },

    // Detailed late comers function
    getDetailedLateComers: async (data) => {
        try {
            const response = await attendanceApi.getDetailedLateComers(data);
            const responseData = response.data;
            ////console.log('Detailed Late Comers Response:', responseData);

            if (responseData.STATUS === 'SUCCESSFUL') {
                return { success: true, data: responseData.DB_DATA };
            } else {
                ///console.error('Failed to get detailed late comers:', responseData.ERROR_DESCRIPTION);
                return { success: false, error: responseData.ERROR_DESCRIPTION };
            }
        } catch (error) {
            console.error('Error getting detailed late comers:', error);
            return { success: false, error: error.response?.data?.ERROR_DESCRIPTION };
        }
    },




})
export default attendanceViewModel