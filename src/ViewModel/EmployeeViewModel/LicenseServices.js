import { useState } from "react"
import employeesApi from "../../Model/Data/Employees/Employees"
import useStore from "../../Store/store"
import { showToast } from "../../Components/Toaster/Toaster"

const useLicenseServices = ()=>{

    const addNewLicense = useStore((state)=> state.addNewLicense)
    const updateSingleLicense = useStore((state)=> state.updateSingleLicense)
    const deleteSingleLicense = useStore((state)=> state.deleteSingleLicense)

    const [licenseValue, setLicenseValue] = useState({
        emp_id:'',
        show:false,
        addState:true,
        loading:false,
        addType:false,
        license_type:null,
        license_type_list:[],
        license_title:'',
        expiry_date:'',
        issue_date:'',
        issuing_authority:'',
        license_number:'',
        license_Id:'',

    })

    const handleLicenseAdd = async(empID)=>{

        try{
            const response = await employeesApi.getAllLicencesType()
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                setLicenseValue((prevState)=>({
                    ...prevState,
                    show:true,
                    addType:false,
                    emp_id:empID,
                    license_type:null,
                    license_type_list:responseData.DB_DATA,
                    license_title:'',
                    expiry_date:'',
                    issue_date:'',
                    issuing_authority:'',
                    license_number:''

                    
                }))
            }
            console.log('response', response)
        }catch(err){
            console.log(err)
        }
        

    }
    const handleLicenseTypeAdd = (empID)=>{
        setLicenseValue((prevState)=>({
            ...prevState,
           
            emp_id:empID,
            license_type:null,
            license_type_list:[],
            license_title:'',
            expiry_date:'',
            issue_date:'',
            issuing_authority:'',
            license_number:'',
            license_Id:'',
            addType:true,
            show:true,

            
        }))

    }

    const handleLicenseAddClose = ()=>{
        setLicenseValue((prevState)=>({
            ...prevState, 
            show:false
        }))
    }

    const getValue = (val) => (typeof val === 'object' && val !== null ? val.value.toString() : val);


    const licenseValidation = ()=>{
        const {license_title, license_type, license_number, issuing_authority,
            issue_date, expiry_date
        } = licenseValue
        
        if(license_title === ''){
            showToast('License title is Required', 'error')
            return
        }
        else if(license_type === null){
            showToast('Select License type', 'error')
            return
        }
        else if(license_number === ''){
            showToast('License number is Required', 'error')
            return
        }
        else if(issuing_authority === ''){
            showToast('Issuing Authority description is Required', 'error')
            return
        }
        else if(issue_date === ''){
            showToast('Select Issuing Date', 'error')
            return
        }
        else if(expiry_date === ''){
            showToast('Select Expiry Date', 'error')
            return
        }
        return true

    }


    const getSingleLicense = async(id, empId)=>{

        setLicenseValue((prevState)=>({
            ...prevState, 
            addState:false,
            show:true,
            loading:true,
            addType:false,
        }))
        const apiData = {
            id:id, 
            emp_id:empId

        }
        try {
            const response = await employeesApi.getSingleLicense(apiData)
            console.log('respponse', response)
            const responseData = response.data
            if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                const DB_DATA =responseData.DB_DATA
                setLicenseValue((prevState)=>({
                    ...prevState,
                    addState:false,
                    license_type_list:responseData.licsense_types,
                    license_title:DB_DATA.license_title,
                    license_type:DB_DATA.license_type,
                    expiry_date:DB_DATA.expiry_date,
                    issue_date:DB_DATA.issue_date,
                    issuing_authority:DB_DATA.issuing_authority,
                    license_number:DB_DATA.license_number,
                    emp_id:empId,
                    license_Id:id,
                    show:true,

                }))

            }

        } catch (error) {
            
        }finally{
            setLicenseValue((prevState)=>({
                ...prevState, 
                loading:false,
            }))
        }
    }



    const handleSubmitLicense = async()=>{
        const setapiData = {
            emp_id:licenseValue.emp_id,
            expiry_date:licenseValue.expiry_date,
            salary:licenseValue.salary,
            issue_date:licenseValue.issue_date,
            date_from:licenseValue.date_from,
            issuing_authority:licenseValue.issuing_authority,
            license_number:licenseValue.license_number,
            license_title:licenseValue.license_title,
            license_type:getValue(licenseValue.license_type),

        }
        const updateapiData = {
            emp_id:licenseValue.emp_id,
            expiry_date:licenseValue.expiry_date,
            salary:licenseValue.salary,
            issue_date:licenseValue.issue_date,
            date_from:licenseValue.date_from,
            issuing_authority:licenseValue.issuing_authority,
            license_number:licenseValue.license_number,
            license_title:licenseValue.license_title,
            license_type:getValue(licenseValue.license_type),
            id:licenseValue.license_Id
        }
        const validation = licenseValidation()
        if(validation){

        
            setLicenseValue((prevState)=>({
                ...prevState,
                loading:true
            }))
            try{
                const response = await employeesApi.addLicense(licenseValue.addState ? setapiData : updateapiData )
                const responseData = await response.data 
                if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                    let newData = responseData.INSERTED_DATA
                    newData = {
                        ...newData,
                        lic_type:licenseValue.license_type.label 
                    }
                    console.log('newData', newData)

                    if(licenseValue.addState){

                        addNewLicense(newData)
                        showToast('License Added Successfully', 'success')
                        setLicenseValue((prevState)=>({
                            ...prevState,
                            show:false,
                            addState:true,
                            addType:true,
                            license_type_list:[],
                            license_title:'',
                            expiry_date:'',
                            issue_date:'',
                            issuing_authority:'',
                            license_number:'',
                            license_Id:null
                            
                        }))
                    }else{
                        updateSingleLicense(newData)
                        showToast('Experience Updated Successfully', 'success')
                        setLicenseValue((prevState)=>({
                            ...prevState,
                            show:false,
                            addState:true,
                            addType:false,
                            license_type_list:[],
                            license_title:'',
                            expiry_date:'',
                            issue_date:'',
                            issuing_authority:'',
                            license_number:'',
                            license_Id:null
                        }))
                    }
                }else{
                    const error = responseData.ERROR_DESCRIPTION
                    showToast(error, 'error')
                }
            }catch(err){
                console.log(err)    
            }finally{
                setLicenseValue((prevState)=>({
                    ...prevState,
                    loading:false
                }))
            }
        }
    }
    

    const handleLicenseInputChange = (e)=>{
        const {name, value} = e.target
        setLicenseValue((prevState)=>({
            ...prevState,
            [name]:value
        }))
    }

    const handleSelectLicense = (selected, field)=>{
        setLicenseValue((prevState)=>({
            ...prevState,
            [field]:selected
        }))
    }





    const [deleteLicenseValue, setDeleteLicenseValue] = useState({
        id:'',
        show:false,
        empId:'',
        loading:false
    })

    const deleteLicense = (id, empId)=>{
        setDeleteLicenseValue((prevState)=>({
            ...prevState,
            id:id,
            empId:empId,
            show:true
        }))
    }

    const toggleDeleteLicense = ()=>{
        setDeleteLicenseValue((prevState)=>({
            ...prevState,
            show:false
        }))
    }


    const confirmDeleteLicense = async()=>{
        const apiData = {
            emp_data:[
                'license',
                deleteLicenseValue.id,
                deleteLicenseValue.empId

            ]
        }
        setDeleteLicenseValue((prevState)=>({
            ...prevState,
            loading:true
        }))
        try{
            const response = await employeesApi.deleteFromOfficialInfo(apiData)
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                console.log('Hello')
                deleteSingleLicense(deleteLicenseValue.id)
                setDeleteLicenseValue((prevState)=>({
                    ...prevState,
                    show:false
                }))
                showToast('License Removed Successfully', 'success')
            }
        }catch(err){

        }finally{

            setDeleteLicenseValue((prevState)=>({
                ...prevState,
                loading:false
            }))
        }
    }


    const handleSubmitLicenseType = async()=>{
        const apiData = {
            new_license_type:licenseValue.license_type
        }

        if(licenseValue.license_type === null || licenseValue.license_type === ''){
            showToast('License Type is required', 'error')
            return
        }

            setLicenseValue((prevState)=>({
                ...prevState,
                loading:true
            }))

        try{
            const response = await employeesApi.addLicenseType(apiData)
            const responseData = response.data
            if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                showToast('License Type Added Successfully')
                setLicenseValue((prevState)=>({
                    ...prevState,
                    show:false
                }))
            }
        }catch(err){

        }finally{

            setLicenseValue((prevState)=>({
                ...prevState,
                loading:false
            }))
        }
    }





    return { 
        licenseValue, handleLicenseAdd,handleLicenseTypeAdd,handleLicenseAddClose,
        handleSubmitLicense,handleLicenseInputChange,handleSelectLicense,getSingleLicense, deleteLicenseValue,
        confirmDeleteLicense, toggleDeleteLicense,deleteLicense,handleSubmitLicenseType
    }

}

export default useLicenseServices