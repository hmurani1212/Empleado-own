import { Card, CardBody, Typography } from '@material-tailwind/react'
import React from 'react'
import useFormApproval from '../../ViewModel/FormApprovalViewModel/FormApprovalServices'
import { FaCheckCircle } from "react-icons/fa";
import ViewApprovalFlowSkeleton from './ViewApprovalFlowSkeleton';

const ViewApprovalFlow = () => {
    const {viewApproval, viewApprovalLoading} = useFormApproval()
    console.log('ViewApprovalFlow data:', viewApproval)
    console.log('ViewApprovalFlow loading:', viewApprovalLoading)
    
    if (viewApprovalLoading) {
        return <ViewApprovalFlowSkeleton />
    }

    if (!viewApproval || viewApproval.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="text-[#698592] text-[14px] mb-2">No approval flow data available</div>
                <div className="text-[#999] text-[12px]">Please check if the approval flow exists or try again later.</div>
            </div>
        )
    }
    
    return (
        <>
        <div className="flex flex-col space-y-4">
            <div className='text-[12px] font-semibold flex gap-2'>
                <div>Approval Type</div>
                <span className='text-[#333333]'>{viewApproval[0]?.level || 'N/A'}</span>
            </div>

            {viewApproval?.map((ele, index) => (
                <Card className="border border-[#3DA5F4] shadow-none w-full" key={index}>
                    <CardBody className='p-0'>
                        <div className='grid grid-cols-4'>
                            <div className='bg-[#F8F9FF] rounded-l-[11px] '>
                                <div className='justify-center flex p-[17px]'>
                                    <FaCheckCircle className='text-[30px] text-[#03a9f3]'/>
                                </div>
                            </div>

                            <div className='col-span-3 flex flex-col space-y-3 p-4 text-[12px]'>
                                <div className='flex gap-2'>
                                    <div className='font-semibold text-[#698592]'>Approval By:</div>
                                    <span className='text-[#333333]'>{ele.level_id || 'N/A'}</span>
                                </div>

                                <div className='flex gap-2'>
                                    <div className='font-semibold text-[#698592]'>Approval Index:</div>
                                    <span className='text-[#333333]'>{ele.approval_index || 'N/A'}</span>
                                </div>

                                <div className='flex gap-2'>
                                    <div className='font-semibold text-[#698592]'>Level:</div>
                                    <span className='text-[#333333]'>{ele.level || 'N/A'}</span>
                                </div>

                                <div className='flex gap-2'>
                                    <div className='font-semibold text-[#698592]'>Approval Hierarchy:</div>
                                    <span className='text-[#333333]'>{ele.approval_hierarchy || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            ))}
        </div>
        </>
    )
}

export default ViewApprovalFlow