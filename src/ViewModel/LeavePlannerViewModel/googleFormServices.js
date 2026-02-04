import { useState } from "react";
import useStore from "../../Store/store";
import { format } from "date-fns";

const useGoogleFormServices = (googleHolidays)=>{
    const removeDataFromGoogleHoliday = useStore((state)=> state.removeDataFromGoogleHoliday)
    const branchIdPolicy = useStore((state)=> state.branchIdPolicy)
    const policyId = useStore((state)=> state.policyId)
    const [formData, setFormData] = useState(googleHolidays)



    const handleRemove = (index) => {
        const newFormData = formData.filter((_, i) => i !== index);
        removeDataFromGoogleHoliday(index)
        setFormData(newFormData);
    };

    const handleChange = (index, field, value) => {
       
        const newFormData = formData.map((item, i) => {
            if (i === index) {
                return { ...item, [field]: value };
            }
            return item;
        });
        setFormData(newFormData);
    };


    const handleSubmit = () => {
        // Transform formData into the desired structure
        const transformedData = {
            branch_id : '',
            policy_id:'',
            start_date: formData.map(item => item.start_date),
            end_date: formData.map(item => item.end_date),
            description: formData.map(item => item.description),
           
        };
        console.log('transformedData', transformedData)

    }


    return {handleRemove, handleChange, handleSubmit, formData, branchIdPolicy,
        policyId }
}

export default useGoogleFormServices