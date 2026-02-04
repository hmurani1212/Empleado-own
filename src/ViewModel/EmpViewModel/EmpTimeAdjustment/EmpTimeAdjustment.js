import empTimeAdjustmentApi from "../../../Model/Data/EmpData/EmpTimeAdjustment/EmpTimeAdjunstment"

const empTimeAdjustmentViewModel = (set, get)=>({


    timeAjustmentData :[],


    getTimeAjustmentData:async()=>{
        try{
            const response = await empTimeAdjustmentApi.getAllRequest()
            ///onsole.log('response', response)
            const responseData = response.data 
            if(responseData.STATUS === "SUCCESSFUL"){
                const dbData = responseData.DB_DATA 
                set({timeAjustmentData:dbData})
            }
        }catch(err){

        }
    },
    addnewTimeAdjustment:(data)=>{
        set({timeAjustmentData: [...new Set([ data, ...get().timeAjustmentData])]})
    },



})


export default empTimeAdjustmentViewModel