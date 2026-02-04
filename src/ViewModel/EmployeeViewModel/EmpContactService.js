import { useState } from "react"
import employeesApi from "../../Model/Data/Employees/Employees";
import { showToast } from "../../Components/Toaster/Toaster";
import useStore from "../../Store/store";

const useEmpContactService = ()=>{

    const deleteSingleContact = useStore((state)=> state.deleteSingleContact)
    const addNewEmpContact = useStore((state)=> state.addNewEmpContact)
    const updateEmpContact = useStore((state)=> state.updateEmpContact)
    const getValue = (val) => (typeof val === 'object' && val !== null ? val.value.toString() : val);

    const [newContactValue, setNewContactValue] = useState({
        show:false,
        contact_type:{value:'mobile',label: 'Mobile Number'},
        contact_title:'',
        mobile_no:'',
        country_code:null,
        network:null,
        email:'',
        address:'',
        addState:true,
        loading:false,
        contact_id:''
    })

    const handleAddNewContact =()=>{
        setNewContactValue((prevState)=>({
            ...prevState,
            show:true,
            contact_type:{value:'mobile',label: 'Mobile Number'},
            contact_title:'',
            mobile_no:'',
            country_code:null,
            network:null,
            email:'',
            address:'',
            addState:true
        }))
    }
    const handleAddNewContactClose =()=>{
        setNewContactValue((prevState)=>({
            ...prevState,
            show:false
        }))
    }


    const handleContactEdit = (data) =>{


        setNewContactValue((prevState)=>({

            ...prevState,
            addState:false,  
            show: true,
            contact_type: getValue(data.contact_type),
            country_id: getValue(data.country_id),
            contact_title: data.contact_title,
            mobile_no: data.contact,
            contact_id: data.id,
            network: getValue(data.mobile_network),
            
        }))
    }


    const handleSelectAddContactChange = (selected, field)=>{
        setNewContactValue((prevState)=>({
            ...prevState,
            [field]:selected
        }))
    }



    const [deleteEmpContact, setDeleteEmpContact] = useState({
        id:'',
        show:false,
        empId:'',
        loading:false
    })

    const deleteContact = (id, empId)=>{
        console.log('id', id)
        console.log('empId', empId)
        setDeleteEmpContact((prevState)=>({
            ...prevState,
            id:id,
            empId:empId,
            show:true
        }))
    }

    const toggleDeleteEmpContact = ()=>{
        setDeleteEmpContact((prevState)=>({
            ...prevState,
            show:false
        }))
    }


    const confirmDeleteContact = async()=>{
        const apiData = {
            emp_data:[
                'contact',
                deleteEmpContact.id,
                deleteEmpContact.empId

            ]
        }
        setDeleteEmpContact((prevState)=>({
            ...prevState,
            loading:true
        }))
        try{
            const response = await employeesApi.deleteFromOfficialInfo(apiData)
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                console.log('Hello')
                deleteSingleContact(deleteEmpContact.id)
                setDeleteEmpContact((prevState)=>({
                    ...prevState,
                    show:false
                }))
                showToast('Contact Removed Successfully', 'success')
            }
        }catch(err){

        }finally{

            setDeleteEmpContact((prevState)=>({
                ...prevState,
                loading:false
            }))
        }
    }


     const handleSubmitNewContact =async(id)=>{

        
        const mobileData = {
            emp_id:id,
            network:getValue(newContactValue.network),
            county_code:`+${getValue(newContactValue.country_code)}`,
            contact:newContactValue.mobile_no,
            contact_title:newContactValue.contact_title,
            contact_type:getValue(newContactValue.contact_type),
            
            
        }

        const phoneData = {
            emp_id:id,
            county_code:`+${getValue(newContactValue.country_code)}`,
            contact:newContactValue.mobile_no,
            contact_title:newContactValue.contact_title,
            contact_type:getValue(newContactValue.contact_type),
        }

        const emailData = {
            emp_id:id,
            contact : newContactValue.mobile_no,
            contact_title:newContactValue.contact_title,
            contact_type:getValue(newContactValue.contact_type),
        }

        const addressData={
            emp_id:id,
            contact : newContactValue.mobile_no,
            contact_title:newContactValue.contact_title,
            contact_type:getValue(newContactValue.contact_type),
        }
        
        const data = getValue(newContactValue.contact_type) === 'mobile' ? mobileData : 
                    getValue(newContactValue.contact_type) === 'phone' ? phoneData : 
                    getValue(newContactValue.contact_type) === 'email' ? emailData : addressData


        setNewContactValue((prevState)=>({
            ...prevState, 
            loading: true
        }))
        try{
            const response = await employeesApi.addContact(data)
            console.log('response',response)
            const responseData = response.data
            if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                showToast('Contact Addedd Successfully', 'success')
                addNewEmpContact(responseData.INSERTED_DATA)
                setNewContactValue((prevState)=>({
                    ...prevState,
                    show:false
                }))
            }else{
                const error = responseData.ERROR_DESCRIPTION
                showToast(error, 'error')
            }
        }catch(err){

        }finally{
            setNewContactValue((prevState)=>({
                ...prevState, 
                loading: false
            }))
        }

    }
     const handleUpdateContact =async(id)=>{

        
        const mobileData = {
            id:newContactValue.contact_id,
            emp_id:id,
            network:getValue(newContactValue.network),
            county_code:`+${getValue(newContactValue.country_code)}`,
            contact:newContactValue.mobile_no,
            contact_title:newContactValue.contact_title,
            contact_type:getValue(newContactValue.contact_type),
            
            
        }

        const phoneData = {
            id:newContactValue.contact_id,
            emp_id:id,
            county_code:`+${getValue(newContactValue.country_code)}`,
            contact:newContactValue.mobile_no,
            contact_title:newContactValue.contact_title,
            contact_type:getValue(newContactValue.contact_type),
        }

        const emailData = {
            id:newContactValue.contact_id,
            emp_id:id,
            contact : newContactValue.mobile_no,
            contact_title:newContactValue.contact_title,
            contact_type:getValue(newContactValue.contact_type),
        }

        const addressData={
            id:newContactValue.contact_id,
            emp_id:id,
            contact : newContactValue.mobile_no,
            contact_title:newContactValue.contact_title,
            contact_type:getValue(newContactValue.contact_type),
        }
        
        const data = getValue(newContactValue.contact_type) === 'mobile' ? mobileData : 
                    getValue(newContactValue.contact_type) === 'phone' ? phoneData : 
                    getValue(newContactValue.contact_type) === 'email' ? emailData : addressData


        setNewContactValue((prevState)=>({
            ...prevState, 
            loading: true
        }))
        try{
            const response = await employeesApi.updateEmpContact(data)
            console.log('response',response)
            const responseData = response.data
            if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                showToast('Contact Updated Successfully', 'success')
                updateEmpContact(responseData.INSERTED_DATA)
                setNewContactValue((prevState)=>({
                    ...prevState,
                    show:false
                }))
            }else{
                const error = responseData.ERROR_DESCRIPTION
                showToast(error, 'error')
            }
        }catch(err){

        }finally{
            setNewContactValue((prevState)=>({
                ...prevState, 
                loading: false
            }))
        }

    }


    const handleNewContactChange = (e)=>{
        const {name, value} = e.target
        setNewContactValue((prevState)=>({
            ...prevState,
            [name]:value
        }))
    }


    return {
        handleAddNewContactClose,handleAddNewContact,newContactValue,
        handleContactEdit, handleSelectAddContactChange,
        deleteEmpContact,deleteContact, toggleDeleteEmpContact, confirmDeleteContact,handleSubmitNewContact,
        handleNewContactChange,
        handleUpdateContact
    }
}

export default useEmpContactService