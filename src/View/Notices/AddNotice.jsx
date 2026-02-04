import { Button, Checkbox, Input, Option, Select, Textarea } from '@material-tailwind/react'
import React, { useEffect } from 'react'
import useNotice from '../../ViewModel/NoticeViewModel/NoticeServices'
import CustomSelect from '../../Components/CustomSelect/CustomSelect';
import { Loader, Loader2 } from 'lucide-react';

const AddNotice = () => {
  const {noticesBranches, addNoticeValue, getAllDepartmentsNotices, handleAddNoticeBranch, handleDeptChange, employeeOptions, addNewNotice, filterDepartmentsNotices, handleCheckboxChange, handleChangeEmpName, showEmployeeName, handleNewNotice,
    handleNoticesSearchEmp, fetchAllEmployees, loading
  } = useNotice();

  useEffect(() => {
    getAllDepartmentsNotices()
    // fetchAllEmployees()
  }, [])

  return (
    <>
      <form onSubmit={(e) => addNewNotice(e)}>
        <div className='flex flex-col items-center gap-2 mt-4'>
          <div className='w-96'>
            {/* <Select label='Branch' color='blue' className='h-9' name = 'branch_id'  */}
            <Select label='Branch' color='blue' className='h-9 bg-white drop-shadow-sm' name = 'branch_id' 
              onChange={(event) => {handleAddNoticeBranch("branch_id", event)}}
            >
              {noticesBranches?.map((ele)=>(
                  <Option  key={`${ele.id}`} value={ele.id}>{ele.branch_name}</Option>
              ))}
            </Select>
          </div>
          <div className='w-96'>
            <Select label='Department' color='blue' className='h-9 bg-white drop-shadow-sm' name='deptt_id'  
            // <Select label='Department' color='blue'  name='deptt_id'  
              onChange={(event) => {handleAddNoticeBranch("deptt_id", event)}}
            >
            {filterDepartmentsNotices?.map((dept) => (
                <Option key={`${dept.id}`} value={dept.id}>{dept.name}</Option>
              ))}
        
            </Select>
          </div>
          <div className='w-96 flex items-center'>
            <Checkbox color="blue" label='Notice for individual Employee' className='text-[13px]' checked={showEmployeeName} onChange={handleCheckboxChange}/>
          </div>
          {showEmployeeName && (
            <div className='w-96'>
              <CustomSelect 
                placeHolderTitle='Employee Name/ID'
                color='blue'
                name='emp_id'
                value={addNoticeValue.emp_id}
                options={employeeOptions}
                onHandleSelectSearch = {handleNoticesSearchEmp}
                customStyle={false}
                onChangeHandler={(field)=>handleAddNoticeBranch('emp_id', field)}
              />
              {/* <Input label='Employee Name/ID' color='blue' placeholder='Employee Name/ID' name='emp_id' onChange={handleChangeEmpName} value={addNoticeValue.emp_id}/> */}
            </div>
          )}
          <div className='w-96'>
            <Input label='Notice Title' color='blue' className='h-9 bg-white drop-shadow-sm' value={addNoticeValue.title} name='title' onChange={handleNewNotice}/>
          </div>
          <div className="w-96">
            <Textarea label="Notice Detail" color='blue' className='h-9 bg-white drop-shadow-sm' name='notice' value={addNoticeValue.notice} onChange={handleNewNotice}/>
          </div>
          <div className='w-96 flex items-center'>
            <Checkbox color="blue" label='Send SMS' className='text-[13px]' name='send_sms_notice' value={addNoticeValue.send_sms_notice} onChange={handleNewNotice} />
          </div>
          <div className='w-96 flex items-center'>
            <Checkbox color="blue" label='Send Email' className='text-[13px]' name='send_email_notice' value={addNoticeValue.send_email_notice} onChange={handleNewNotice}/>
          </div>
          <div className='w-96'>
            <Button color='blue' type='submit' className='font-normal bg-[#3da5f4] text-white hover:bg-[#3da5f4]/80'>{loading ? <Loader2 className='animate-spin w-4 h-4' /> : 'Add Notice'}</Button>
          </div>
        </div>
      </form>
    </>
    
   
  )
}

export default AddNotice