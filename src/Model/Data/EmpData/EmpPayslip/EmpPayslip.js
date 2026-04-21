import { payRollinstancemodule } from "../../../base";

const empPayslipApi = {
    getComprehensiveSalary: function (oneId) {
        return payRollinstancemodule.request({
            method: "GET",
            url: `/manage_payslip/employees/comprehensive-salary`,
            params: {
                oneid: oneId,
            },
        });
    },
};

export default empPayslipApi;
