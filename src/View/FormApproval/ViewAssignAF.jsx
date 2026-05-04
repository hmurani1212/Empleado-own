import React from 'react'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import CustomButton from '../../Components/CustomButton/CustomButton'

const ViewAssignAF = (props) => {
    const {data, assingApprovalFlow, handlesSelectAAF} = props
  return (
    <div className='space-y-3'>
        <div className='text-[14px]'>
            <span>Current Assigned Flow : {data?.currentAssignedFlow || 'Not Assigned'}</span>
        </div>
        <form onSubmit={assingApprovalFlow} className='space-y-4'>
            <div className='space-y-2'>
                <label className='text-[#698592] text-[12px]'>Approval Template</label>
                <CustomSelect 
                    placeHolderTitle = 'Approval Template'
                    value={data?.approvalFlowId}
                    options={Array.isArray(data?.approvalFlowList) ? data.approvalFlowList.map((approvalFlow) => ({ value: approvalFlow.id, label: approvalFlow.title})) : []} 
                    onChangeHandler={(selectedOption) => handlesSelectAAF(selectedOption, 'approvalFlowId')}
                    customStyles={false}
                    
                />
            </div>
            <div>
                <CustomButton 
                    title="submit"
                    loading={data.loading}

                />
            </div>
        </form>
    </div>
  )
}

export default ViewAssignAF