import { Button, Input, Option, Select, Textarea } from '@material-tailwind/react'
import React from 'react'
import useNotice from '../../ViewModel/NoticeViewModel/NoticeServices';
import useEditNoticeService from '../../ViewModel/NoticeViewModel/NoticeEditService';
import { Loader2 } from 'lucide-react';
import CustomSelect from '../../Components/CustomSelect/CustomSelect';

const EditNoticeForm = (props) => {

  // Edit Notice
    const { handleNewNotice, handleAddNoticeBranch, handleEditNotice,
      noticesBranches,  filterDepartmentsNotices, addNoticeValue, loading,
      departmentsLoading = false,
      departmentsLoadedForBranchId = null,

    } = props
   
    const selectedBranchIdRaw =
      addNoticeValue?.branch_id?.value !== undefined
        ? addNoticeValue.branch_id.value
        : addNoticeValue?.branch_id;

    const isBranchDropdownLoading =
      Boolean(departmentsLoading) && (!noticesBranches || noticesBranches.length === 0);

    const isDepartmentDropdownLoading =
      Boolean(departmentsLoading) &&
      selectedBranchIdRaw !== undefined &&
      selectedBranchIdRaw !== null &&
      selectedBranchIdRaw !== '' &&
      String(departmentsLoadedForBranchId) !== String(selectedBranchIdRaw);

    const isBranchSelected =
      selectedBranchIdRaw !== undefined &&
      selectedBranchIdRaw !== null &&
      selectedBranchIdRaw !== '';


  return (
    <div className='p-6 h-full flex flex-col'>
    <form onSubmit={handleEditNotice} className="flex flex-col gap-6 h-full">
        <div className='flex flex-col gap-5 flex-1'>
            
            <div className='flex flex-col gap-2'>
                <label className="text-sm font-semibold text-gray-700 font-poppins">Branch</label>
                <div className="w-full">
                    <CustomSelect 
                        placeHolderTitle='Select Branch'
                        value={addNoticeValue.branch_id}
                        options={
                          isBranchDropdownLoading
                            ? []
                            : noticesBranches?.map(ele => ({
                                value: ele.id === '0' ? 0 : ele.id,
                                label: ele.branch_name
                              }))
                        }
                        onChangeHandler={(option) => handleAddNoticeBranch("branch_id", option)}
                        customStyles={false}
                        menuLoading={isBranchDropdownLoading}
                        menuLoadingLabel="Loading branches..."
                        hideControlLoadingIndicator
                    />
                </div>
            </div>

            <div className='flex flex-col gap-2'>
                <label className="text-sm font-semibold text-gray-700 font-poppins">Department</label>
                <div className="w-full">
                    <CustomSelect 
                        placeHolderTitle={isBranchSelected ? 'Select Department' : 'Select Branch'}
                        value={addNoticeValue.deptt_id}
                        options={
                          isDepartmentDropdownLoading
                            ? []
                            : filterDepartmentsNotices?.map(dept => ({
                                value: dept.id === '0' ? 0 : dept.id,
                                label: dept.name
                              }))
                        }
                        onChangeHandler={(option) => handleAddNoticeBranch("deptt_id", option)}
                        customStyles={false}
                        menuLoading={isDepartmentDropdownLoading}
                        menuLoadingLabel="Loading departments..."
                        hideControlLoadingIndicator
                    />
                </div>
            </div>

            <div className='flex flex-col gap-2'>
                <label className="text-sm font-semibold text-gray-700 font-poppins">Notice Title</label>
                <Input 
                    color='blue' 
                    placeholder='Enter notice title'
                    className='!border !border-gray-200 bg-white text-gray-900 ring-4 ring-transparent placeholder:text-gray-500 placeholder:opacity-100 [&::placeholder]:opacity-100 focus:!border-blue-500 focus:!border-t-blue-500 focus:ring-blue-500/10 rounded-lg'
                    labelProps={{
                        className: "hidden",
                    }}
                    value={addNoticeValue.title} 
                    name='title' 
                    onChange={handleNewNotice}
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 font-poppins">Notice Details</label>
                <Textarea 
                    color='blue' 
                    className='!border !border-gray-200 bg-white text-gray-900 ring-4 ring-transparent placeholder:text-gray-500 focus:!border-blue-500 focus:!border-t-blue-500 focus:ring-blue-500/10 rounded-lg min-h-[150px]'
                    labelProps={{
                        className: "hidden",
                    }}
                    name='notice' 
                    value={addNoticeValue.notice} 
                    onChange={handleNewNotice}
                />
            </div>

        </div>

        <div className='mt-auto flex justify-end gap-3'>
            <Button 
                type='submit' 
                className='font-poppins font-medium cursor-pointer capitalize bg-bgBlue shadow-blue-500/20 hover:shadow-blue-500/40 min-w-[120px] flex items-center justify-center py-2.5 rounded-xl'
                disabled={loading}
            >
                {loading ? <Loader2 className='animate-spin w-4 h-4' /> : 'Update Notice'}
            </Button>
        </div>

    </form>
    </div>
  )
}

export default EditNoticeForm