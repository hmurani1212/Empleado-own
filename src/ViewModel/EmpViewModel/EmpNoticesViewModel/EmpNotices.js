import { useState } from "react"
import empNoticesApi from "../../../Model/Data/EmpData/EmpNotices/EmpNotices"

const useEmpNoticesServices = ()=>{

    const [noticesData, setNoticeData] = useState([])


    const getEmpNoticesData = async()=>{
        try {
            const response = await empNoticesApi.getEmpNoticesData()
            console.log('response', response)
            const responseData = response.data
            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                const dbData = responseData.DB_DATA.notices  
                setNoticeData(dbData)
            }
            
        } catch (error) {
            
        }
    }



    return {getEmpNoticesData, noticesData}

}


export default useEmpNoticesServices