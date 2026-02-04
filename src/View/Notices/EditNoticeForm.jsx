import { Button, Input, Option, Select, Textarea } from '@material-tailwind/react'
import React from 'react'
import useNotice from '../../ViewModel/NoticeViewModel/NoticeServices';
import useEditNoticeService from '../../ViewModel/NoticeViewModel/NoticeEditService';
import { Loader2 } from 'lucide-react';

const EditNoticeForm = (props) => {

  // Edit Notice
    const { handleNewNotice, handleAddNoticeBranch, handleEditNotice,
      noticesBranches,  filterDepartmentsNotices, addNoticeValue, loading

    } = props
   

  return (
    <>
    <form onSubmit={handleEditNotice}>
        <div className='flex flex-col gap-4'>
            <div className='w-100'>
            <Select label='Branch' color='blue' className='h-9' name = 'branch_id' 
        value={addNoticeValue.branch_id}
        onChange={(event) => {handleAddNoticeBranch("branch_id", event)}}
      >
          {noticesBranches?.map((ele)=>(
              <Option  key={`${ele.id}`} value={ele.id}>{ele.branch_name}</Option>
          ))}
        </Select>
        </div>

        <div className='w-100'>
        <Select label='Department' color='blue'  name='deptt_id'  
          value={addNoticeValue.deptt_id}
          onChange={(event) => {handleAddNoticeBranch("deptt_id", event)}}
        >
        {filterDepartmentsNotices?.map((dept) => (
            <Option key={`${dept.id}`} value={dept.id}>{dept.name}</Option>
          ))}
    
        </Select>
      </div>

      <div className='w-100'>
        <Input label='Notice Title' color='blue' value={addNoticeValue.title} name='title' onChange={handleNewNotice}/>
      </div>

      <div className="w-100">
        <Textarea label="Notice Detail" color='blue' name='notice' value={addNoticeValue.notice} onChange={handleNewNotice}/>
      </div>

      <div>
              {/* {isLoading ? (
                <Button className='bg-blue-300 py-[10px] capitalize' loading={true}>
                  Loading
                </Button>
              ) : ( */}
                <Button type='submit' className='bg-blue-300 py-[10px] capitalize'>
                  {loading ? <Loader2 className='animate-spin w-4 h-4' /> : 'Submit'}
                </Button>
              {/* )} */}
            </div>


        </div>
    </form>
    
    </>
  )
}

export default EditNoticeForm