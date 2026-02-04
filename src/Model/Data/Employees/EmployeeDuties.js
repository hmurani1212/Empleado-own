import { axiosInstancecoremodule } from "../../base"

const employeeDutiesApi = {
    getEmployeeDuties: function() {
        return axiosInstancecoremodule.request({
            method: "GET",
            url: `/api/v1/employee_v3/get_employee_duties`
        })
    }
}

export default employeeDutiesApi
