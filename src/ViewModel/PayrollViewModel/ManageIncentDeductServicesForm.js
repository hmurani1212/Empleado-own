import React, { useState } from 'react'
import payrollApi from '../../Model/Data/Payroll/Payroll'
import { showToast } from '../../Components/Toaster/Toaster'
import useStore from '../../Store/store'

const useIncentDeductServicesForm = (employeeId = null, refreshDataCallback = null, currentList = [], allIncentDeductListBoth = []) => {
    const idSet = useStore((state) => state.idSet)
    const currentEmployeeId = employeeId || idSet
    const [isChecked, setIsChecked] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [loading, setLoading] = useState(false);

    // Helper function to safely parse dates
    const safeParseDate = (dateString) => {
        if (!dateString) return null;
        
        try {
            // Try to parse the date string
            const date = new Date(dateString);
            
            // Check if the date is valid
            if (isNaN(date.getTime())) {
                console.warn('Invalid date string:', dateString);
                return null;
            }
            
            return date;
        } catch (error) {
            console.warn('Error parsing date:', dateString, error);
            return null;
        }
    };

    // Helper function to parse custom date format like "07-November-25"
    const parseCustomDate = (dateString) => {
        if (!dateString || dateString === 'N/A' || dateString === 'n/a' || dateString.trim() === '') {
            return null;
        }
        
        try {
            // Handle custom format like "07-November-25" or "07-Nov-25"
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                              'July', 'August', 'September', 'October', 'November', 'December'];
            const monthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            // Try to parse the custom format
            const parts = dateString.split('-');
            if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const monthName = parts[1];
                const year = parseInt('20' + parts[2], 10); // Convert "25" to "2025"
                
                let monthIndex = monthNames.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
                if (monthIndex === -1) {
                    monthIndex = monthAbbr.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
                }
                
                if (monthIndex !== -1 && !isNaN(day) && !isNaN(year)) {
                    return new Date(year, monthIndex, day);
                }
            }
            
            // Fallback to standard date parsing
            return safeParseDate(dateString);
        } catch (error) {
            console.warn('Error parsing custom date:', dateString, error);
            return safeParseDate(dateString);
        }
    };

    // Helper function to format date for month input (YYYY-MM)
    const formatDateForMonthInput = (dateString) => {
        if (!dateString || dateString === 'N/A' || dateString === 'n/a' || dateString.trim() === '') {
            return '';
        }
        
        const date = parseCustomDate(dateString);
        if (!date) return '';
        
        try {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            return `${year}-${month}`;
        } catch (error) {
            console.warn('Error formatting date for month input:', dateString, error);
            return '';
        }
    };

    // Helper function to format date for date input (YYYY-MM-DD)
    const formatDateForDateInput = (dateString) => {
        if (!dateString || dateString === 'N/A' || dateString === 'n/a' || dateString.trim() === '') {
            return '';
        }
        
        const date = parseCustomDate(dateString);
        if (!date) return '';
        
        try {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch (error) {
            console.warn('Error formatting date for date input:', dateString, error);
            return '';
        }
    };
    
    const handleCheckboxChange = (event) => {
        setIsChecked(event.target.checked);
        setAddIncDecValues((prevState) => ({
            ...prevState,
            subject_to_att: event.target.checked
        }));
    };
    

    const [addIncDecValues, setAddIncDecValues] = useState({
        type:'0',
        id : '',
        description : '',
        onetime_month : '',
        end_month : '',
        inc_recursion_limit : 'unlimited',
        recursion : '1',
        total_amount : '',
        other_title : '',
        a_per_day_rate_type : '',
        title : '',
        emp_id:'',
        is_taxable:'0',
        subject_to_att : false,
        unlimited_start_date : ''
    })

    // Helper function to parse number exactly without precision loss
    const parseExactNumber = (value) => {
        if (value === '' || value === null || value === undefined) {
            return '';
        }
        // Convert to string, remove any commas or formatting
        const stringValue = String(value).replace(/,/g, '').trim();
        if (stringValue === '') {
            return '';
        }
        // Check if it's a valid number
        const numValue = Number(stringValue);
        if (isNaN(numValue)) {
            return value; // Return original if not a valid number
        }
        // For form input, return as string to preserve exact value
        // This prevents any automatic conversion or rounding
        return stringValue;
    };

    const handleChangeType = (e) => {
        const { name, value } = e.target;
        
        // For number fields, parse exactly to avoid precision issues
        if (name === 'total_amount') {
            const exactValue = parseExactNumber(value);
            console.log('Amount input change:', {
                inputValue: value,
                parsedValue: exactValue,
                inputType: typeof value,
                parsedType: typeof exactValue
            });
            setAddIncDecValues((prevState) => ({
                ...prevState,
                [name]: exactValue,
            }));
        } else {
            setAddIncDecValues((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        }
    };

    const handleChangeSelect = (selectedOption, field) => {
      console.log(selectedOption, field)
      setAddIncDecValues((prevState) => ({
        ...prevState,
        [field]: selectedOption

      }))
    }

    const handleAddIncDeduct = async (e) => {
        e.preventDefault()
        
        console.log('Employee ID Debug:', {
            employeeId,
            idSet,
            currentEmployeeId,
            isEditing,
            editingItem,
            finalEmpId: parseInt(currentEmployeeId)
        })
        
        // Validate required fields
        if (!addIncDecValues.title) {
            showToast('Title is required', 'error')
            return
        }
        if (!addIncDecValues.total_amount) {
            showToast('Total amount is required', 'error')
            return
        }
        
        // Validate employee ID
        if (!currentEmployeeId || currentEmployeeId === '123') {
            showToast('Employee ID not found. Please login again.', 'error')
            return
        }
        
        // Validate update ID when editing
        if (isEditing && (!addIncDecValues.id || addIncDecValues.id === '')) {
            showToast('Invalid record ID. Please try editing again.', 'error')
            console.error('Edit mode but no ID found:', addIncDecValues)
            return
        }
        
        // Prepare payload based on operation type
        let addData;
        
        if (isEditing) {
            // For updates, use the specific payload structure for /manage_payslip/add-incentives
            console.log('Form values before creating update payload:', {
                total_amount: addIncDecValues.total_amount,
                total_amount_type: typeof addIncDecValues.total_amount
            });
            
            // Parse total_amount exactly to avoid precision issues
            // Get the raw value and ensure it's the exact number entered
            const exactTotalAmount = addIncDecValues.total_amount === '' || addIncDecValues.total_amount === null || addIncDecValues.total_amount === undefined
                ? 0
                : (() => {
                    // Convert to string first to preserve exact value
                    let stringValue = String(addIncDecValues.total_amount).replace(/,/g, '').trim();
                    if (stringValue === '') {
                        return 0;
                    }
                    // Convert to number for the payload
                    const numValue = Number(stringValue);
                    if (isNaN(numValue)) {
                        console.warn('Invalid number value:', addIncDecValues.total_amount);
                        return 0;
                    }
                    // Return the exact number (for integers, return as integer; for decimals, return as float with 2 decimals)
                    return numValue % 1 === 0 ? numValue : parseFloat(numValue.toFixed(2));
                })();
            
            console.log('Amount conversion for update:', {
                original: addIncDecValues.total_amount,
                type: typeof addIncDecValues.total_amount,
                converted: exactTotalAmount,
                convertedType: typeof exactTotalAmount
            });
            
            // Final validation - ensure we're sending the exact value
            const finalAmount = exactTotalAmount;
            console.log('Final amount being sent in update payload:', finalAmount);
            
            addData = {
                action: "update",
                type: addIncDecValues.type,
                status: String("1"), // Explicitly convert to string
                title: addIncDecValues.title?.label || addIncDecValues.title,
                title_id: addIncDecValues.title?.value || null,
                id: parseInt(addIncDecValues.id), // Include id field
                update_id: parseInt(addIncDecValues.id), // Keep update_id for backward compatibility
                emp_id: parseInt(currentEmployeeId),
                total_amount: finalAmount,
                recursion: addIncDecValues.recursion,
                is_taxable: addIncDecValues.is_taxable,
                onetime_month: addIncDecValues.onetime_month,
                end_month: addIncDecValues.end_month,
                description: addIncDecValues.description,
                subject_to_att: addIncDecValues.subject_to_att,
                a_per_day_rate_type: addIncDecValues.a_per_day_rate_type,
                unlimited_start_date: addIncDecValues.unlimited_start_date,
                inc_recursion_limit: addIncDecValues.inc_recursion_limit
            };
        } else {
            // For creating new items, use the original payload structure
            // Parse total_amount exactly to avoid precision issues
            // Get the raw value and ensure it's the exact number entered
            const exactTotalAmount = addIncDecValues.total_amount === '' || addIncDecValues.total_amount === null || addIncDecValues.total_amount === undefined
                ? 0
                : (() => {
                    // Convert to string first to preserve exact value
                    let stringValue = String(addIncDecValues.total_amount).replace(/,/g, '').trim();
                    if (stringValue === '') {
                        return 0;
                    }
                    // Convert to number for the payload
                    const numValue = Number(stringValue);
                    if (isNaN(numValue)) {
                        console.warn('Invalid number value:', addIncDecValues.total_amount);
                        return 0;
                    }
                    // Return the exact number (for integers, return as integer; for decimals, return as float with 2 decimals)
                    return numValue % 1 === 0 ? numValue : parseFloat(numValue.toFixed(2));
                })();
            
            console.log('Amount conversion for create:', {
                original: addIncDecValues.total_amount,
                type: typeof addIncDecValues.total_amount,
                converted: exactTotalAmount,
                convertedType: typeof exactTotalAmount
            });
            
            // Final validation - ensure we're sending the exact value
            const finalAmount = exactTotalAmount;
            console.log('Final amount being sent in create payload:', finalAmount);
            
            addData = {
                emp_id: parseInt(currentEmployeeId),
                title: addIncDecValues.title?.label || addIncDecValues.title,
                total_amount: finalAmount,
                recursion: addIncDecValues.recursion,
                type: addIncDecValues.type,
                is_taxable: addIncDecValues.is_taxable,
                onetime_month: addIncDecValues.onetime_month,
                end_month: addIncDecValues.end_month,
                description: addIncDecValues.description,
                subject_to_att: addIncDecValues.subject_to_att,
                a_per_day_rate_type: addIncDecValues.a_per_day_rate_type,
                unlimited_start_date: addIncDecValues.unlimited_start_date,
                inc_recursion_limit: addIncDecValues.inc_recursion_limit
            };
        }

        console.log('Final payload data:', addData)
        console.log('Payload field types:', {
            action: typeof addData.action,
            type: typeof addData.type,
            status: typeof addData.status,
            title: typeof addData.title,
            update_id: typeof addData.update_id
        });
        console.log('Status value specifically:', {
            status: addData.status,
            statusType: typeof addData.status,
            statusString: String(addData.status)
        });
        console.log('Form state at submission:', addIncDecValues)
        
        setLoading(true);
        try {
            let response;
            
            if (isEditing) {
                // Use the specific update endpoint for editing
                console.log('Using updateIncentiveDeduction API for editing');
                console.log('Data being sent to API:', JSON.stringify(addData, null, 2));
                console.log('Update ID:', addData.update_id, 'ID:', addData.id);
                response = await payrollApi.updateIncentiveDeduction(addData);
            } else {
                // Use the original endpoint for creating new items
                console.log('Using manageIncentDeduct API for creating');
                response = await payrollApi.manageIncentDeduct(addData);
            }
            
            const data = response.data
            console.log('API response:', data)
            
            if(response.status === 200 && (data.STATUS === 'SUCCESS' || data.STATUS === 'SUCCESSFUL')){
                const successMessage = isEditing ? 
                    (data.MESSAGE || 'Incentive/Deduction updated successfully') : 
                    (data.MESSAGE || 'Incentive/Deduction added successfully');
                showToast(successMessage, 'success')
                
                // Refresh the data to reflect changes in UI
                if (refreshDataCallback) {
                    console.log('Refreshing data after successful operation - isEditing:', isEditing);
                    try {
                        refreshDataCallback();
                        console.log('Refresh callback executed successfully');
                    } catch (error) {
                        console.error('Error executing refresh callback:', error);
                    }
                } else {
                    console.warn('No refresh callback provided');
                }
                
                // Reset form and edit state
                setAddIncDecValues({
                    type:'0',
                    id : '',
                    description : '',
                    onetime_month : '',
                    end_month : '',
                    inc_recursion_limit : 'unlimited',
                    recursion : '1',
                    total_amount : '',
                    other_title : '',
                    a_per_day_rate_type : '',
                    title : '',
                    emp_id:'',
                    is_taxable:'0',
                    subject_to_att : false,
                    unlimited_start_date : ''
                })
                setIsChecked(false)
                setIsEditing(false)
                setEditingItem(null)
            } else {
                showToast(data.ERROR_DESCRIPTION || data.MESSAGE || 'Error occurred', 'error')
            }
        } catch(error) {
            console.log('Error adding/updating incentive/deduction:', error)
            const backendMessage =
                error?.response?.data?.ERROR_DESCRIPTION ||
                error?.response?.data?.MESSAGE;

            showToast(
                backendMessage ||
                (isEditing
                    ? 'Failed to update incentive/deduction'
                    : 'Failed to add incentive/deduction'),
                    'error'
                );
            // const errorMessage = isEditing ? 'Failed to update incentive/deduction' : 'Failed to add incentive/deduction';
            // showToast(errorMessage, 'error')
        } finally {
            setLoading(false);
        }
    }

    // Handle edit functionality
    const handleEditItem = (item) => {
        // Find the item by ID from the current list to ensure we have the latest data
        const freshItem = currentList.find(listItem => listItem.id === item.id) || item;
        
        console.log('Editing item:', freshItem);
        console.log('All item fields:', Object.keys(freshItem));
        console.log('Item amount details:', {
            amount: freshItem.amount,
            amount_type: typeof freshItem.amount,
            monthly_amount: freshItem.monthly_amount,
            total_processed_amount: freshItem.total_processed_amount,
            total_amount: freshItem.total_amount
        });
        console.log('Item description details:', {
            description: freshItem.description,
            desc: freshItem.desc,
            reason: freshItem.reason
        });
        console.log('Item date details:', {
            start_date: freshItem.start_date,
            end_date: freshItem.end_date,
            onetime_month: freshItem.onetime_month,
            end_month: freshItem.end_month,
            unlimited_start_date: freshItem.unlimited_start_date,
            start_date_type: typeof freshItem.start_date,
            end_date_type: typeof freshItem.end_date
        });
        console.log('Current list length:', currentList.length);
        console.log('Found fresh item:', freshItem !== item ? 'Yes' : 'No');
        
        setIsEditing(true);
        setEditingItem(freshItem);
        
        // Find the matching title option from allIncentDeductListBoth
        // The item might have title_id or we need to match by title string
        let titleOption = null;
        if (allIncentDeductListBoth && allIncentDeductListBoth.length > 0) {
            // Try to find by title_id first, then by title string
            titleOption = allIncentDeductListBoth.find(option => 
                option.id === freshItem.title_id || 
                option.id === freshItem.inc_deduct_id ||
                option.title === freshItem.title
            );
            
            // If found, format it for CustomSelect
            if (titleOption) {
                titleOption = { value: titleOption.id, label: titleOption.title };
            } else {
                // If not found, create a temporary option from the title string
                titleOption = freshItem.title ? { value: freshItem.title_id || freshItem.inc_deduct_id || '', label: freshItem.title } : null;
            }
        } else {
            // Fallback: create option from title string if available
            titleOption = freshItem.title ? { value: freshItem.title_id || freshItem.inc_deduct_id || '', label: freshItem.title } : null;
        }
        
        // Get dates from various possible field names first (needed for recursion limit check)
        // Handle "N/A" values - convert to empty string
        let itemStartDate = freshItem.start_date || 
                          freshItem.unlimited_start_date || 
                          freshItem.onetime_month || 
                          '';
        if (itemStartDate === 'N/A' || itemStartDate === 'n/a') {
            itemStartDate = '';
        }
        
        // Prefer end_month (used for "limited") so we don't lose it when end_date is "N/A"
        let itemEndDate = freshItem.end_month ||
                         freshItem.endMonth ||
                         freshItem.end_date ||
                         freshItem.stop_month ||
                         '';
        if (itemEndDate === 'N/A' || itemEndDate === 'n/a' || String(itemEndDate).trim() === '') {
            itemEndDate = '';
        }
        
        let itemOnetimeMonth = freshItem.onetime_month || 
                              freshItem.start_date || 
                              freshItem.unlimited_start_date || 
                              '';
        if (itemOnetimeMonth === 'N/A' || itemOnetimeMonth === 'n/a') {
            itemOnetimeMonth = '';
        }
        
        // Determine recursion value based on re_occuring field
        let recursionValue = '1'; // Default to recurring
        if (freshItem.re_occuring === 'NO' || 
            freshItem.re_occuring === 'One Time' || 
            freshItem.re_occuring === 'ONE TIME' ||
            freshItem.re_occuring === '0') {
            recursionValue = '0';
        }
        
        // Determine inc_recursion_limit: use API value first, else infer from re_occuring + dates
        // When re_occuring = YES and only start_date → Unlimited; when both start_date and end_date → Limited
        let incRecursionLimit = 'unlimited';
        const apiRecursionLimit = (freshItem.inc_recursion_limit ?? freshItem.recursion_limit ?? '').toString().toLowerCase();
        if (['limited', '1'].includes(apiRecursionLimit) || freshItem.inc_recursion_limit === 1 || freshItem.recursion_limit === 1) {
            incRecursionLimit = 'limited';
        } else if (['unlimited', '0'].includes(apiRecursionLimit) || freshItem.inc_recursion_limit === 0 || freshItem.recursion_limit === 0) {
            incRecursionLimit = 'unlimited';
        } else if (recursionValue === '1') {
            // Recurring (re_occuring YES): both start and end date → Limited; only start date → Unlimited
            const hasEndDate = itemEndDate && String(itemEndDate).trim() !== '';
            incRecursionLimit = hasEndDate ? 'limited' : 'unlimited';
        }
        
        // Get amount from various possible field names and remove commas
        let itemAmount = freshItem.amount || 
                        freshItem.total_amount || 
                        freshItem.monthly_amount || 
                        freshItem.total_processed_amount || 
                        '';
        
        // Remove commas and convert to number if it's a string with commas
        if (itemAmount && typeof itemAmount === 'string') {
            itemAmount = itemAmount.replace(/,/g, '').trim();
        }
        // Convert to string for form input (empty string if 0 or invalid)
        if (itemAmount === 0 || itemAmount === '0' || itemAmount === '') {
            itemAmount = '';
        } else {
            itemAmount = String(itemAmount);
        }
        
        // Get description from various possible field names
        const itemDescription = freshItem.description || 
                               freshItem.desc || 
                               freshItem.reason || 
                               '';
        
        console.log('Extracted values for form:', {
            amount: itemAmount,
            description: itemDescription,
            start_date: itemStartDate,
            end_date: itemEndDate,
            onetime_month: itemOnetimeMonth,
            re_occuring: freshItem.re_occuring,
            isTaxable: freshItem.isTaxable,
            subject_to_att: freshItem.subject_to_att
        });
        
        // Populate form with fresh item data
        setAddIncDecValues({
            type: freshItem.d_type === 'INCENTIVE' ? '0' : '1',
            id: freshItem.id,
            description: itemDescription,
            onetime_month: formatDateForMonthInput(itemOnetimeMonth),
            end_month: formatDateForMonthInput(itemEndDate),
            inc_recursion_limit: incRecursionLimit,
            recursion: recursionValue,
            total_amount: itemAmount,
            other_title: '',
            a_per_day_rate_type: freshItem.a_per_day_rate_type || '',
            title: titleOption,
            emp_id: freshItem.emp_id || currentEmployeeId,
            is_taxable: freshItem.is_taxable === 1 || freshItem.is_taxable === '1' || freshItem.isTaxable === true ? '1' : '0',
            subject_to_att: freshItem.subject_to_att === 1 || freshItem.subject_to_att === true,
            unlimited_start_date: formatDateForMonthInput(itemStartDate)
        });
        
        // Set checkbox state
        setIsChecked(freshItem.subject_to_att === 1 || freshItem.subject_to_att === true);
    };

    // Handle cancel edit
    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingItem(null);
        setIsChecked(false);
        
        // Reset form to initial state
        setAddIncDecValues({
            type:'0',
            id : '',
            description : '',
            onetime_month : '',
            end_month : '',
            inc_recursion_limit : 'unlimited',
            recursion : '1',
            total_amount : '',
            other_title : '',
            a_per_day_rate_type : '',
            title : '',
            emp_id:'',
            is_taxable:'0',
            subject_to_att : false,
            unlimited_start_date : ''
        });
    };


  return {isChecked, handleCheckboxChange, handleAddIncDeduct, addIncDecValues, handleChangeType, handleChangeSelect, isEditing, editingItem, handleEditItem, handleCancelEdit, loading }
}

export default useIncentDeductServicesForm