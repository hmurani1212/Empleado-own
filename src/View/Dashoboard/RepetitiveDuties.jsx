import { Button, Typography } from '@material-tailwind/react'
import React from 'react'
import { BsPlus, BsTrash2 } from 'react-icons/bs'
import { CiEdit } from 'react-icons/ci'
import useRepetitiveDutiesService from '../../ViewModel/EmployeeViewModel/RepetitiveDutiesServices'
import CustomDialog from '../../Components/CustomDialog/CustomDialog'
import AddEditRepetitive from './AddEditRepetitive'
import ConfirmationDialog from '../../Components/ConfirmationDialog/ConfirmationDialog'



const dutiesHeader = [
  'Job',	'Frequency',	'Effective From',	'Enforced Till',	'Action'
]

const RepetitiveDuties = (props) => {
  const { data } = props
  const {repetitiveValue, handleRepetitiveAdd, handleAddRepetitiveClose,
    handleChangeRepetitive,handleSelectRepetitive, handleSubmitRepetitive,
    deleteDuty,deleteDutyValue,toggleDeleteDuty,confirmDeleteDuty,getSingleDuty
  } = useRepetitiveDutiesService()
  
  const empExtraData = data.empExtraData
  const empId = data.empView.section.empId
  
 
  return (
    <>
      <div className='space-y-4'>
        <div>
          <span className='text-[#3DA5F4]'>{data.empView.section.title}</span>
        </div>
        <div className='space-y-3 border-t border-gray-500 py-2'>
          <div>
            <div className='flex items-center gap-5 justify-end'>
              <Button className='p-2 capitalize text-[12px] flex items-center gap-1' color='blue'
                onClick={()=>handleRepetitiveAdd(empId)}
              >
                <BsPlus />
                Add Duty
              </Button>
            </div>
            <div>
              <table className="w-full min-w-max table-auto text-start">
                <thead>
                  <tr>
                    {dutiesHeader.map((head) => (
                      <th
                        key={head}
                        className="py-4 text-left"
                      >
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="leading-none font-semibold"
                        >
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {empExtraData?.map((ele, i)=>(
                    <tr key={i}>
                      <td className='py-2'>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {ele?.title}
                        </Typography>
                      </td>
                      <td className='py-2'>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {ele?.frequency}
                        </Typography>
                      </td>
                      <td className='py-2'>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {ele?.effective_from || ele?.effective_date}
                        </Typography>
                      </td>
                      <td className='py-2'>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {ele?.enforced_till || ele?.enforce_till}
                        </Typography>
                      </td>
                      <td className='py-2'>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          <div className='flex  items-center gap-2'>
                            {repetitiveValue?.getLoading[i] ? 
                                <Button loading={true} value={''} className='p-1'></Button> :
                                <span 
                                    className='bg-[#3DA5F4] text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                                    onClick={() => getSingleDuty(ele.id, empId, i)}
                                >
                                    <CiEdit />
                                </span>
                            }
                            <span className='bg-red-400 text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                              onClick={()=> deleteDuty(ele.id, empId)}
                            ><BsTrash2 /></span>
                          </div>
                        </Typography>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div> 
          </div>
        </div>
      </div>
      <CustomDialog 
          openDialog = {repetitiveValue.show}
          handleOpen = {handleAddRepetitiveClose}
          outsidePress = {false}
          title={repetitiveValue.addState ? 'Add New Duty' : 'Update Duty'}
          compo={ <AddEditRepetitive 
            repetitiveValue = {repetitiveValue}
            handleChangeRepetitive = {handleChangeRepetitive}
            handleSelectRepetitive = {handleSelectRepetitive}
            handleSubmitRepetitive = {handleSubmitRepetitive}
          /> }
          footer={false}
          size="lg"
        />
        <ConfirmationDialog 
          openDialog= {deleteDutyValue.show}
          title = 'Delete Confirmation'
          message = 'Are you sure you want to Delete this Role ?'
          handleConfirm = {confirmDeleteDuty}
          handleOpen = {toggleDeleteDuty}
          loading = {deleteDutyValue.loading}

        />
    </>
  )
}

export default RepetitiveDuties