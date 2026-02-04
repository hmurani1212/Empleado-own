import { Button, IconButton, Input, Popover, PopoverContent, PopoverHandler, Typography } from '@material-tailwind/react';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import { FaTrash } from "react-icons/fa";
import useLeavesPlanner from '../../ViewModel/LeavePlannerViewModel/LeavePlannerServices';
import useGoogleFormServices from '../../ViewModel/LeavePlannerViewModel/googleFormServices';
import leavesPlannerApi from '../../Model/Data/LeavesPlanner/LeavesPlanner';
import { showToast } from '../../Components/Toaster/Toaster';

const GoogleForm = (props) => {
    const { handleGoogleModal, data } = props
    const {branchIdPolicy, policyId} = useGoogleFormServices()
    const { isSubmittingGoogleForm, setIsSubmittingGoogleForm } = useLeavesPlanner()
    const [formData, setFormData] = useState(data);
    const dataHead = ['No#','From' ,'To', 'Description', 'Remove']

    data.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));


    const handleRemove = (index) => {
        const newFormData = formData.filter((_, i) => i !== index);
        setFormData(newFormData);
    };

    const handleChange = (index, field, value) => {
        const newFormData = Array.isArray(formData) ? formData?.map((item, i) => {
            if (i === index) {
                // Check if value is a timestamp (object), then format it
                const formattedValue = typeof value === 'object' ? format(value, "yyyy-MM-dd") : value;
                return { ...item, [field]: formattedValue };
            }
            return item;
        }) : [];
        setFormData(newFormData);
    };

    const handleSubmit = async() => {
    console.log(branchIdPolicy, policyId)

    const emptyDescriptions = formData
        .map((item, index) => item.description === '' ? index+1 : -1)
        .filter(index => index !== -1);

    if (emptyDescriptions.length > 0) {
        const emptyDescriptionIndexes = emptyDescriptions.join(', ');
        showToast(`Description is required for line: ${emptyDescriptionIndexes}`, 'error');
        return;
    }
        // Transform formData into the desired structure
        const transformedData = {
            branch_id : branchIdPolicy === 'all' ? 0 : branchIdPolicy,
            policy_id : policyId || 0,
            start_date: formData.map(item => item.start_date),
            end_date: formData.map(item => item.end_date),
            description: formData.map(item => item.description),
        };
        console.log('transformData', transformedData)

        setIsSubmittingGoogleForm(true)
        try{
            const response = await leavesPlannerApi.addBulkHolidays(transformedData)
            const data = response.data

            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                showToast("Holidays Added Successfully", 'success');
                handleGoogleModal()
            } else {
                showToast(data.DESCRIPTION?.[0]?.ERROR_DESCRIPTION || data.ERROR_DESCRIPTION || 'Error adding holidays', 'error');
            }
            
        }catch(error){
            console.log(error)
        } finally {
            setIsSubmittingGoogleForm(false)
        }
        

    }

    return (
        <div className='flex flex-col gap-4'>
            <div
            className='customScroll'
                style={{
                    height:'calc(100vh - 200px)',
                    overflowY:'auto'
                }}
            >
                
                <table className='w-full min-w-max text-center h-full'>
                    <thead className='sticky top-[-9px] z-20'>
                        <tr>
                            {dataHead?.map((head, i) => (
                                <th
                                key={i}
                                className='border-b border-blue-gray-100 bg-blue-gray-50 p-4'
                                >
                                    <Typography
                                    variant = "small"
                                    color = "blue-gray"
                                    className = "font-normal leading-none opacity-70 capitalize"
                                    >
                                        {head}
                                    </Typography>
                                </th>
                            ))}
                           
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(formData) && formData?.map((item, index) => {
                            const isLast = index === formData.length - 1;
                            const classes = isLast ? "p-4" : "p-4 "


                            return (
                                <tr key={index}>
                                    <td>
                                        {index+1}
                                    </td>
                                    
                                    <td className={classes}>
                                         {/* <div className="w-96"> */}
                                                <Popover placement="bottom" className='z-[9999999]'>
                                                <PopoverHandler>
                                                    <Input
                                                    color='blue'
                                                    label="Start Date"
                                                    value={item.start_date}
                                                    />
                                                </PopoverHandler>
                                                <PopoverContent className='relative z-[999999999]'>
                                                    <Calendar 
                                                    onChange={(selected) => handleChange(index, 'start_date', selected)} 
                                                    className='border-0'
                                                    />
                                                    </PopoverContent>
                                                </Popover>
                                            {/* </div> */}
                                        
                                    {/* <input
                                        type="date"
                                        name={`start_date_${index}`}
                                        value={item.start_date}
                                        onChange={(e) => handleChange(index, 'start_date', e.target.value)}
                                    /> */}
                                </td>
                                <td className={classes}>
                                    <Popover placement="bottom" className='z-[9999999]'>
                                        <PopoverHandler>
                                        <Input
                                        color='blue'
                                        label='To'
                                        name={`end_date_${index}`}
                                        value={item.end_date}
                                        />  
                                        </PopoverHandler>

                                        <PopoverContent className='relative z-[999999999]'>
                                            <Calendar 
                                            onChange={(selected) => handleChange(index, 'end_date', selected)} 
                                            className='border-0'
                                            />

                                        </PopoverContent>
                                    </Popover>
                                    
                                </td>
                                <td className={classes}>
                                    <div className='w-96'>
                                        <Input
                                        color='blue'
                                        type="text"
                                        name={`description_${index}`}
                                        value={item.description}
                                        label={item.description}
                                        onChange={(e) => handleChange(index, 'description', e.target.value)}
                                        />
                                    </div>
                                    
                                </td>
                                <td>
                                    <IconButton color='red' className='w-7 h-7' onClick={() => handleRemove(index)}><FaTrash className='text-white'/></IconButton>
                                </td>
                            </tr>

                            )
                            
                            
})}
                    </tbody>
                </table>
            </div>
            <div className='flex gap-4 justify-end'>
                <Button 
                    variant="gradient" 
                    color="blue" 
                    onClick={handleSubmit} 
                    className='capitalize text-[12px] px-3 py-2 font-medium'
                    loading={isSubmittingGoogleForm}
                    disabled={isSubmittingGoogleForm}
                >
                    <span>Submit</span>
                </Button>
            </div>
        </div>
    );
};

export default GoogleForm;
