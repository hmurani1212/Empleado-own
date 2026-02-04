import branchesApi from "../Model/Data/Branches/Branch2";

export const getBranchesService = async (data) => {
    try {
        const response = await branchesApi.getBranches(data);
        return response;
    } catch (error) {
        console.error('Error fetching branches:', error);
        throw error;
    }
};

export const getEmployeeSuggestionsService = async (data) => {
    try {
        const response = await branchesApi.empSuggestionsBranches(data);
        return response;
    } catch (error) {
        console.error('Error fetching employee suggestions:', error);
        throw error;
    }
};

export const deleteBranchService = async (branchId) => {
    try {
        const response = await branchesApi.deleteBranch(branchId);
        return response;
    } catch (error) {
        console.error('Error deleting branch:', error);
        throw error;
    }
}; 