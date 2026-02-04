import employeeDutiesApi from "../../../Model/Data/Employees/EmployeeDuties"
import { showToast } from "../../../Components/Toaster/Toaster"

const empDutiesViewModel = (set, get) => ({
    // State
    employeeDuties: {
        employee: null,
        duties: []
    },
    loading: false,

    // Actions
    gettingEmployeeDuties: async () => {
        try {
            set({ loading: true })
            
            const response = await employeeDutiesApi.getEmployeeDuties()
            const responseData = response.data
            
            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                set({
                    employeeDuties: responseData.DB_DATA || { employee: null, duties: [] },
                    loading: false
                })
            } else {
                showToast('Failed to fetch employee duties', 'error')
                set({ loading: false })
            }
        } catch (error) {
            console.error('Error fetching employee duties:', error)
            showToast('Error fetching employee duties', 'error')
            set({ loading: false })
        }
    },

    // Refresh data
    refreshEmployeeDuties: () => {
        const { gettingEmployeeDuties } = get()
        gettingEmployeeDuties()
    }
})

export default empDutiesViewModel
