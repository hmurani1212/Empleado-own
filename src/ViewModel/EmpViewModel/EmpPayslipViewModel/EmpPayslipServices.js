import empPayslipApi from "../../../Model/Data/EmpData/EmpPayslip/EmpPayslip";

const useEmpPayslipServices = () => {
    const getComprehensiveSalaryData = async (oneId) => {
        if (!oneId) {
            return null;
        }

        try {
            const response = await empPayslipApi.getComprehensiveSalary(oneId);
            const responseData = response?.data;

            if (response?.status === 200 && responseData?.STATUS === "SUCCESSFUL") {
                return responseData;
            }

            return null;
        } catch (error) {
            return null;
        }
    };

    return {
        getComprehensiveSalaryData,
    };
};

export default useEmpPayslipServices;
