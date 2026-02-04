import { useState } from "react"
import empApplicationApi from "../../../Model/Data/EmpData/EmpApplication/EmpApplication"
import { showToast } from "../../../Components/Toaster/Toaster"
import axios from "axios"

const useTADAServices = ()=>{

    const [tadaFormValue, setTadaFormValue] = useState({
        show:false,
        city:'',
        purpose:'',
        leaveDate:'',
        leaveTime:'',
        returnDate:'',
        returnTime:'',
        fuel:'',
        fuleVoucher:'',
        tax:'',
        taxVoucher:'',
        misc:'',
        miscVoucher:'',
        hotelCharges:'',
        daRate:'',
        daDays:'',
        loading:false,
    }) 


    const handleTadaAllowance = ()=>{
        setTadaFormValue((prevState)=>({
            ...prevState,
            show:true
        }))
    }


    const toggleTadaAllowance = ()=>{
        setTadaFormValue((prevState)=>({
            ...prevState,
            show:false,
            city:'',
            purpose:'',
            leaveDate:'',
            leaveTime:'',
            returnDate:'',
            returnTime:'',
            fuel:'',
            fuleVoucher:'',
            tax:'',
            taxVoucher:'',
            misc:'',
            miscVoucher:'',
            hotelCharges:'',
            daRate:'',
            daDays:''
        }))
    }

    const handleChangeTADA = (e)=>{
        const { name, type, value, files } = e.target;

        // Determine the value based on the input type
        const inputValue = type === 'file' ? (files[0] ? files[0] : null) : value;

        setTadaFormValue((prevState) => ({
            ...prevState,
            [name]: inputValue,
        }));
    }

    const handleAddTadaForm = async(e)=>{
        e.preventDefault()
        
        // Form validation for required fields
        const {city, purpose, leaveDate, leaveTime, returnDate, returnTime} = tadaFormValue;
        
        if (!city.trim()) {
            showToast('City/Cities Visited is required', 'error');
            return;
        }
        
        if (!purpose.trim()) {
            showToast('Purpose of Visit is required', 'error');
            return;
        }
        
        if (!leaveDate) {
            showToast('Leave Date is required', 'error');
            return;
        }
        
        if (!leaveTime) {
            showToast('Leave Time is required', 'error');
            return;
        }
        
        if (!returnDate) {
            showToast('Return Date is required', 'error');
            return;
        }
        
        if (!returnTime) {
            showToast('Return Time is required', 'error');
            return;
        }
        
        const formData = new FormData();

        const {city: cityValue, purpose: purposeValue, leaveDate: leaveDateValue, leaveTime: leaveTimeValue, returnDate: returnDateValue, returnTime: returnTimeValue, fuel, fuleVoucher, tax, taxVoucher,
            misc, miscVoucher, hotelCharges, daRate, daDays

        } = tadaFormValue

        // Upload files and get URLs
        let fuelVoucherUrl = '';
        let tollVoucherUrl = '';
        let miscVoucherUrl = '';

        if (fuleVoucher) {
            try {
                const uploadFormData = new FormData();
                uploadFormData.append('file', fuleVoucher);
                const uploadResponse = await axios.post('http://172.18.0.34:4120/api/make_url', uploadFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (uploadResponse.data && uploadResponse.data.FILE_URL) {
                    fuelVoucherUrl = uploadResponse.data.FILE_URL;
                }
            } catch (error) {
                console.error('Fuel voucher upload error:', error);
            }
        }

        if (taxVoucher) {
            try {
                const uploadFormData = new FormData();
                uploadFormData.append('file', taxVoucher);
                const uploadResponse = await axios.post('http://172.18.0.34:4120/api/make_url', uploadFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (uploadResponse.data && uploadResponse.data.FILE_URL) {
                    tollVoucherUrl = uploadResponse.data.FILE_URL;
                }
            } catch (error) {
                console.error('Toll voucher upload error:', error);
            }
        }

        if (miscVoucher) {
            try {
                const uploadFormData = new FormData();
                uploadFormData.append('file', miscVoucher);
                const uploadResponse = await axios.post('http://172.18.0.34:4120/api/make_url', uploadFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (uploadResponse.data && uploadResponse.data.FILE_URL) {
                    miscVoucherUrl = uploadResponse.data.FILE_URL;
                }
            } catch (error) {
                console.error('Misc voucher upload error:', error);
            }
        }

        // Append each field to the FormData
        formData.append('operation', 'set_application');
        formData.append('appType', 'tada');
        formData.append('city_visited', cityValue);
        formData.append('visit_purpose', purposeValue);
        formData.append('leave_date', leaveDateValue);
        formData.append('leave_time', leaveTimeValue);
        formData.append('return_date', returnDateValue);
        formData.append('return_time', returnTimeValue);
        formData.append('fuel_expense', fuel);
        formData.append('fuel_expense_voucher', fuelVoucherUrl);
        formData.append('toll_tax', tax);
        formData.append('toll_tax_voucher', tollVoucherUrl);
        formData.append('misc_amount', misc);
        formData.append('misc_attachment', miscVoucherUrl);
        formData.append('hotel_charges', hotelCharges);
        formData.append('DA_rate', daRate);
        formData.append('DA_days', daDays);
        formData.append('emp_id', ''); // Keep empty for employee side
        formData.append('emp_name', ''); // Keep empty for employee side
        formData.append('form_data.form_type', 'TADA');


       try{

            setTadaFormValue((prevState)=>({
                ...prevState,
                loading:true
            }))

            const response = await empApplicationApi.addMedicalAllowance(formData)
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                showToast('TADA Appplication Submitted Successfully', 'success')
                toggleTadaAllowance()

            }else{
                const error = responseData.ERROR_DESCRIPTION
                showToast(error, 'error')
            }
            console.log('respponse', response)
        }catch(err){

        }finally{
            setTadaFormValue((prevState)=>({
                ...prevState,
                loading:false
            }))
        }

    }



    return {
        tadaFormValue, handleTadaAllowance, toggleTadaAllowance,
        handleChangeTADA,
        handleAddTadaForm
    }


}

export default useTADAServices