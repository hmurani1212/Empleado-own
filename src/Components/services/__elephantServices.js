import apiServices from "../Model/Data/APIServices/ApiServices"

const useElephantSerivce = ()=>{



    const fileHitting = async(file, uploadProgress)=>{
        const formData = new FormData();
        formData.append('fileInput', file);
        formData.append('operation', 'store_file')
        
        try{
            const response = await apiServices.elephantApi(formData, uploadProgress)
            const responseData = await response.data
            // console.log('response', response)
            if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                console.log('response', response)
                return responseData.DB_DATA
            }
        }catch(err){

        }
    }

    return {fileHitting}
}
export default useElephantSerivce;