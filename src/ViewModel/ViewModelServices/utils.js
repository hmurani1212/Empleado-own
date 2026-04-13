import apiServices from "../../Model/Data/APIServices/ApiServices"
import employeesApi from "../../Model/Data/Employees/Employees"
import country from "../../services/country/country_list.js"
import { executeApiCall, createApiKey } from "../../services/__apiManager"

const utilsViewModel = (set, get)=>({

    allCountries :[],
    utilsBranches: [],
    utilsDepartments:[],
    

    gettingCountries : async()=>{
        try{
            // Use hardcoded country data instead of API call
            set({allCountries: country})
        }catch(err){
            console.error('Error setting countries data:', err)
        }
    },
    gettingUtilsBranches : async()=>{
        try{
            // Check if branches data is already available in the store
            const currentState = get();
            if (currentState.utilsBranches && currentState.utilsBranches.length > 0) {
                // Use existing data if available
                return;
            }
            
            const apiKey = createApiKey('/api/v1/branches/get_branch_employee');
            const response = await executeApiCall(apiKey, () => employeesApi.gettingAllBranches());
            const data = response.data;
            
            if(data.STATUS === "SUCCESSFUL"){
            //   console.log("datadata", data?.DB_DATA?.branches) 
                set({utilsBranches: data?.DB_DATA?.branches})
        
            }
            
        }catch(err){

        }
    },
    gettingUtilsDepartments: async(id)=>{
        const data = {parent_id: 0,branchId:id,getAll:true}
        try{

            const response = await employeesApi.gettingSubDepts(data)
            const resData = response.data
            if(response.status === 200 && resData.STATUS === "SUCCESSFUL"){
                set({utilsDepartments:resData.DB_DATA})
            }else{
            }
        }catch(err){
            // flattenOptions()
        }
    }

})

export default utilsViewModel