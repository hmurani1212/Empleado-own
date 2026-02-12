import empTimeAdjustmentApi from "../../../Model/Data/EmpData/EmpTimeAdjustment/EmpTimeAdjunstment"

const empTimeAdjustmentViewModel = (set, get)=>({

    timeAjustmentData :[],
    timeAdjustmentLoading: true,

    getTimeAjustmentData:async()=>{
        set({ timeAdjustmentLoading: true });
        try{
            const response = await empTimeAdjustmentApi.getAllRequest()
            ///onsole.log('response', response)
            const responseData = response.data 
            if(responseData.STATUS === "SUCCESSFUL"){
                const dbData = responseData.DB_DATA 
                set({timeAjustmentData:dbData})
            }
        }catch(err){

        } finally {
            set({ timeAdjustmentLoading: false });
        }
    },
    addnewTimeAdjustment:(data)=>{
        set({timeAjustmentData: [...new Set([ data, ...get().timeAjustmentData])]})
    },



})


export default empTimeAdjustmentViewModel