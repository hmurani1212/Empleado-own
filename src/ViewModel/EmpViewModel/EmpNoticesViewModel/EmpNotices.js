import { useState } from "react"
import empNoticesApi from "../../../Model/Data/EmpData/EmpNotices/EmpNotices"

const useEmpNoticesServices = ()=>{

    const [noticesData, setNoticeData] = useState([])
    const [noticesLoading, setNoticesLoading] = useState(true)
    const [noticesPagination, setNoticesPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0,
        limit: 15,
    })


    const getEmpNoticesData = async(filters = {})=>{
        setNoticesLoading(true)
        try {
            const response = await empNoticesApi.getEmpNoticesData(filters)
            const responseData = response.data
            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                const dbData = responseData.DB_DATA || {}
                const noticesList = Array.isArray(dbData?.notices) ? dbData.notices : []
                const pagination = dbData?.pagination || {}
                const reqPage = Number(filters?.page) || 1
                const reqLimit = Number(filters?.limit) || 15

                const currentPage =
                    Number(pagination.current_page) ||
                    Number(pagination.currentPage) ||
                    Number(pagination.page) ||
                    Number(dbData.current_page) ||
                    Number(dbData.currentPage) ||
                    Number(dbData.page) ||
                    reqPage

                const totalRecords =
                    Number(pagination.total_records) ||
                    Number(pagination.totalRecords) ||
                    Number(pagination.total) ||
                    Number(dbData.total_records) ||
                    Number(dbData.totalRecords) ||
                    Number(dbData.total) ||
                    noticesList.length ||
                    0

                const limit =
                    Number(pagination.limit) ||
                    Number(pagination.per_page) ||
                    Number(pagination.perPage) ||
                    Number(dbData.limit) ||
                    Number(dbData.per_page) ||
                    Number(dbData.perPage) ||
                    reqLimit

                const totalPages =
                    Number(pagination.total_pages) ||
                    Number(pagination.totalPages) ||
                    Number(pagination.pages) ||
                    Number(dbData.total_pages) ||
                    Number(dbData.totalPages) ||
                    Number(dbData.pages) ||
                    Math.max(1, Math.ceil(totalRecords / Math.max(1, limit)))

                setNoticeData(noticesList)
                setNoticesPagination({
                    currentPage,
                    totalPages,
                    totalRecords,
                    limit,
                })
            }
            
        } catch (error) {
            
        } finally {
            setNoticesLoading(false)
        }
    }



    return {getEmpNoticesData, noticesData, noticesLoading, noticesPagination}

}


export default useEmpNoticesServices