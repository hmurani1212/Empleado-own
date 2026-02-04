import { useState } from "react"
import employeesApi from "../../Model/Data/Employees/Employees"
import useStore from "../../Store/store"
import { showToast } from "../../Components/Toaster/Toaster"

const useEmpAccelerateService = ()=>{

    const settingNewAccelerateData = useStore((state)=> state.settingNewAccelerateData)
    const gettingEmpAccelerate = useStore((state)=> state.gettingEmpAccelerate)

    const selectType = [
        {id: 1, name: 'Select Report Type'},
        {id: 2, name: 'Datewise'},
        {id: 3, name: 'Monthly'},
    ]


    const [accelerateValue, setAccelerateValue ] = useState({
        reportType:null,
        date:'',
        to_date:'',
        month:null,
        year:null,
        loading:false,



    })


    const handleSelectChange = (selected, field)=>{

        if(field === 'reportType'){

            if(selected.value === 1){
                setAccelerateValue((prevState)=>({
                    ...prevState,
                    reportType:selected,
                    date:'',
                    to_date:'',
                    month:null,
                    year:null,
                    loading:false,
                }))
            }
            if(selected.value === 2){
                setAccelerateValue((prevState)=>({
                    ...prevState,
                    reportType:selected,
                    month:null,
                    year:null,
                    loading:false,
                }))
            }
            if(selected.value === 3){
                setAccelerateValue((prevState)=>({
                    ...prevState,
                    reportType:selected,
                    date:'',
                    to_date:'',
                    loading:false,
                }))
            }
            
        }
       
        setAccelerateValue((prevState)=>({
            ...prevState,
            [field]: selected
        }))

    }


    const handleChangeAccelerateValue = (e)=>{
        const { name, value } = e.target

         setAccelerateValue((prevState)=>({
            ...prevState,
            [name]: value
        }))
    }


    const getAccelerateData = (empId)=>{

        const type = accelerateValue.reportType.value 
        switch (type) {
            case 1:
                gettingEmpAccelerate(empId)
                break;
        
            case 2:
                getDateWiseAccelerateData(empId)

                break
            case 3:
                getMontWiseAccelerateData(empId)
                break

            default:
                break;
        }

       

    }


    const regularValidation = ()=>{
        const { date, to_data } = accelerateValue

        if(date === ''){
            showToast('Select From Date', 'error')
            return
        }
        else if(to_data === ''){
            showToast('Select To Date', 'error')
            return 
        }

        return true
    }
    const monthlyValidation = ()=>{
        const { month, year } = accelerateValue

        if(month === null){
            showToast('Select Month', 'error')
            return
        }
        else if(year === ''){
            showToast('Select To Year', 'error')
            return 
        }

        return true
    }

    const getDateWiseAccelerateData = async(id)=>{

        const validation = regularValidation()

        if(validation){

        
            const apiData  = {
                emp_id:id, 
                exportType:'regular',
                date:accelerateValue.date,
                to_date:accelerateValue.to_date,

            }
            setAccelerateValue((prevState)=>({
                ...prevState,
                loading:true
            }))
            try {

                const response = await employeesApi.getRegularAccelerateData(apiData)
                console.log('response', response)
                const responseData = response.data 
                if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                    const newData = responseData.DB_DATA
                    settingNewAccelerateData(newData)
                }else{
                    settingNewAccelerateData([])
                }
            } catch (error) {
                
            }finally{
                setAccelerateValue((prevState)=>({
                    ...prevState,
                    loading:false
                }))
            }
        }
    }
    const getMontWiseAccelerateData = async(id)=>{

        const validation = monthlyValidation()

        if(validation){

        
            const apiData  = {
                emp_id:id, 
                exportType:'monthly',
                month:accelerateValue.month.value,
                year:accelerateValue.year.value,

            }
            setAccelerateValue((prevState)=>({
                ...prevState,
                loading:true
            }))
            try {

                const response = await employeesApi.getRegularAccelerateData(apiData)
                console.log('response', response)
                const responseData = response.data 
                if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                    const newData = responseData.DB_DATA
                    settingNewAccelerateData(newData)
                }else{
                    settingNewAccelerateData([])
                }
            } catch (error) {
                
            }finally{
                setAccelerateValue((prevState)=>({
                    ...prevState,
                    loading:false
                }))
            }
        }
    }


    return {selectType,accelerateValue,handleSelectChange, handleChangeAccelerateValue,
        getAccelerateData
    }

}

export default useEmpAccelerateService