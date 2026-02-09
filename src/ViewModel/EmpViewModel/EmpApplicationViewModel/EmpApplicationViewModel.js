import empApplicationApi from "../../../Model/Data/EmpData/EmpApplication/EmpApplication"

const empApplicationViewModel = (set, get)=>({
    existingApplication:[],
    lastId:'',
    fetchNext:true,
    isEmpApplicationLoading: false,




    getAllEmpExistingApplication:async(data)=>{
        set({isEmpApplicationLoading: true})
        try {
            const response = await empApplicationApi.getAllEmpApplication(data)
            console.log('response', response)
            const responseData = response.data
            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                const dbData = responseData.DB_DATA
                set({existingApplication:dbData})
                set({lastId:responseData?.LAST_PULL_ID})
            }
        } catch (error) {
            
        } finally {
            set({isEmpApplicationLoading: false})
        }
    },

    getNextEmpExistingApplication: async()=>{

        const lastID = get().lastId

        const apiData = {
            last_id:lastID
        }
       

        if(get().fetchNext){
            
            try{
                const response = await empApplicationApi.getAllEmpApplication(apiData)
                console.log('next response', response)
                const responseData = response.data
                if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                    const dbData = responseData.DB_DATA
                    set({existingApplication:[...get().existingApplication, ...dbData]})
                    set({lastId:responseData?.LAST_PULL_ID})
                }else{
                    set({fetchNext:false})
                    set({lastId:''})
                }
            } catch(error){
                console.log(error)
            }
        }
        
    },
})


export default empApplicationViewModel