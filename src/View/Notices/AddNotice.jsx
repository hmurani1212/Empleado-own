import { Button, Checkbox, Input, Option, Select, Textarea } from '@material-tailwind/react'
import React, { useEffect, useRef } from 'react'
import useNotice from '../../ViewModel/NoticeViewModel/NoticeServices'
import CustomSelect from '../../Components/CustomSelect/CustomSelect';
import { Loader2 } from 'lucide-react';

const AddNotice = () => {
  const {noticesBranches, addNoticeValue, getBranchesOnly, handleAddNoticeBranch, handleDeptChange, employeeOptions, addNewNotice, filterDepartmentsNotices, handleCheckboxChange, handleChangeEmpName, showEmployeeName, handleNewNotice,
    handleNoticesSearchEmp, fetchAllEmployees, loading
  } = useNotice();

  const hasFetchedBranches = useRef(false);

  useEffect(() => {
    if (hasFetchedBranches.current) return;
    hasFetchedBranches.current = true;
    getBranchesOnly();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className='p-6'>
      <form onSubmit={(e) => addNewNotice(e)} className="flex flex-col gap-6">
        
        {/* Branch & Department Group */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className='flex flex-col gap-2'>
                <label className="text-sm font-semibold text-gray-700 font-poppins">Target Branch</label>
                <div className="w-full">
                    <CustomSelect 
                        placeHolderTitle='Select Branch'
                        value={addNoticeValue.branch_id}
                        options={noticesBranches?.map(ele => ({
                            value: ele.id,
                            label: ele.branch_name
                        }))}
                        onChangeHandler={(option) => handleAddNoticeBranch("branch_id", option)}
                        customStyles={false}
                    />
                </div>
            </div>

            <div className='flex flex-col gap-2'>
                <label className="text-sm font-semibold text-gray-700 font-poppins">Department</label>
                <div className="w-full">
                    <CustomSelect 
                        placeHolderTitle='Select Department'
                        value={addNoticeValue.deptt_id}
                        options={filterDepartmentsNotices?.map(dept => ({
                            value: dept.id,
                            label: dept.name
                        }))}
                        onChangeHandler={(option) => handleAddNoticeBranch("deptt_id", option)}
                        customStyles={false}
                    />
                </div>
            </div>
        </div>

        {/* Individual Employee Selection */}
        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 transition-all duration-300">
            <div className='flex items-center mb-3'>
                <Checkbox 
                    color="blue" 
                    label={
                        <span className="text-sm font-medium text-gray-700 font-poppins ml-2">
                            Send to specific employee only
                        </span>
                    }
                    className="h-5 w-5 rounded-md border-gray-300 transition-all hover:scale-105 checked:bg-blue-500 checked:border-transparent focus:ring-blue-500/20"
                    containerProps={{ className: "p-0" }}
                    checked={showEmployeeName} 
                    onChange={handleCheckboxChange}
                />
            </div>
            
            {showEmployeeName && (
                <div className='animate-in fade-in slide-in-from-top-2 duration-300'>
                    <label className="text-sm font-semibold text-gray-700 font-poppins mb-2 block">Employee</label>
                    <CustomSelect 
                        placeHolderTitle='Search Employee by Name or ID'
                        color='blue'
                        name='emp_id'
                        value={addNoticeValue.emp_id}
                        options={employeeOptions}
                        onHandleSelectSearch={handleNoticesSearchEmp}
                        customStyle={false}
                        onChangeHandler={(field)=>handleAddNoticeBranch('emp_id', field)}
                    />
                </div>
            )}
        </div>

        {/* Notice Content */}
        <div className="space-y-4">
            <div className='flex flex-col gap-2'>
                <label className="text-sm font-semibold text-gray-700 font-poppins">Title</label>
                <Input 
                    type="text"
                    color='blue' 
                    className='!border !border-gray-200 bg-white text-gray-900 ring-4 ring-transparent placeholder:text-gray-500 focus:!border-blue-500 focus:!border-t-blue-500 focus:ring-blue-500/10 rounded-lg'
                    labelProps={{
                        className: "hidden",
                    }}
                    placeholder="Enter notice title"
                    containerProps={{ className: "min-w-[100px]" }}
                    value={addNoticeValue.title} 
                    name='title' 
                    onChange={handleNewNotice}
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 font-poppins">Details</label>
                <Textarea 
                    color='blue' 
                    className='!border !border-gray-200 bg-white text-gray-900 ring-4 ring-transparent placeholder:text-gray-500 focus:!border-blue-500 focus:!border-t-blue-500 focus:ring-blue-500/10 rounded-lg min-h-[120px]'
                    labelProps={{
                        className: "hidden",
                    }}
                    placeholder="Write the notice content here..."
                    containerProps={{ className: "min-w-[100px]" }}
                    name='notice' 
                    value={addNoticeValue.notice} 
                    onChange={handleNewNotice}
                />
            </div>
        </div>

        {/* Notification Options */}
        <div className='flex gap-6 py-2 border-t border-gray-100 mt-2'>
            <div className='flex items-center'>
                <Checkbox 
                    color="blue" 
                    label={<span className="text-sm font-medium text-gray-600 font-poppins ml-2">Send SMS</span>}
                    className="h-5 w-5 rounded-md border-gray-300 transition-all hover:scale-105"
                    containerProps={{ className: "p-0" }}
                    name='send_sms_notice' 
                    value={addNoticeValue.send_sms_notice} 
                    onChange={handleNewNotice} 
                />
            </div>
            <div className='flex items-center'>
                <Checkbox 
                    color="blue" 
                    label={<span className="text-sm font-medium text-gray-600 font-poppins ml-2">Send Email</span>}
                    className="h-5 w-5 rounded-md border-gray-300 transition-all hover:scale-105"
                    containerProps={{ className: "p-0" }}
                    name='send_email_notice' 
                    value={addNoticeValue.send_email_notice} 
                    onChange={handleNewNotice}
                />
            </div>
        </div>

        {/* Action Buttons */}
        <div className='mt-4 flex justify-end gap-3 pt-4 border-t border-gray-100'>
             <Button 
                variant="text" 
                color="gray" 
                onClick={() => {/* Close drawer logic if needed or passed as prop */}}
                className="font-poppins font-medium capitalize"
            >
                Cancel
            </Button> 
            <Button 
                color='blue' 
                type='submit' 
                className='font-poppins font-medium capitalize bg-bgBlue shadow-blue-500/20 hover:shadow-blue-500/40 min-w-[120px] flex items-center justify-center'
                disabled={loading}
            >
                {loading ? <Loader2 className='animate-spin w-4 h-4' /> : 'Add Notice'}
            </Button>
        </div>
      </form>
    </div>
  )
}

export default AddNotice