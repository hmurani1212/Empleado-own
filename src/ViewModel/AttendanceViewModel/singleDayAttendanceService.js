import { useState } from "react"

const useSingleAttendanceService = ()=>{

    const [singleDayService, setSingleDayService] = useState({
        show:false,
        data:{},
        inputs:[
            {inTime:'', outTime:''},
        ]
    })


    const gettingSingleData = (data)=>{

        setSingleDayService((prevState)=>({
            ...prevState,
            show:true,
            data:data
        }))

        console.log(data)
    }



    const toggleSingleAttendance = ()=>{
        setSingleDayService((prevState)=>({
            ...prevState,
            show:false, 
            data:{}
        }))
    }


    const addMoreInput = ()=>{
        setSingleDayService((prevState)=>({
            ...prevState,
            inputs:[...prevState.inputs , {inTime:'', outTime:''}]
        }))
    }

    const closeModal = ()=>{
        setSingleDayService((prevState)=>({
            ...prevState,
            show:false, 
            data:{}
        }))
    }

    const updateSingleDayData = (updatedData) => {
        setSingleDayService((prevState)=>({
            ...prevState,
            data: {
                ...prevState.data,
                ...updatedData
            }
        }))
    }



    return { gettingSingleData, toggleSingleAttendance, singleDayService, addMoreInput, closeModal, updateSingleDayData }


}


export default useSingleAttendanceService