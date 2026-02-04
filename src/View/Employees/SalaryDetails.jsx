import React from 'react'
import CustomButton from '../../Components/CustomButton/CustomButton'
import { Textarea, Typography, Button } from '@material-tailwind/react'
import CustomDialog from '../../Components/CustomDialog/CustomDialog'
import SubmitButton from '../../Components/SubmitButton/SubmitButton'

const headHist = ['Increment', 'Salary', 'Effective From', 'Description', 'Cancel']


const SalaryDetails = (props) => {
    const {salaryDetailsValue,ToggleCancelIncDialog,handleOnChangeCancelInc,handleSubmitCancelInc,handleSalaryIncrement} = props

    const historyDataSalary =  salaryDetailsValue?.data
    const historyDataDetails =  salaryDetailsValue?.data?.increments

  return (
    <div className='flex flex-col space-y-6 w-[700] px-4'>
        {/* Salary Overview */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-100 p-4 rounded-lg">
                <Typography variant="small" color="gray" className="mb-1">
                    Starting salary
                </Typography>
                <Typography variant="h6" color="blue-gray">
                    {historyDataSalary?.base_salary ? historyDataSalary.base_salary.toLocaleString() : '0'}
                </Typography>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
                <Typography variant="small" color="gray" className="mb-1">
                    Current salary
                </Typography>
                <Typography variant="h6" color="blue-gray">
                    {historyDataSalary?.current_salary ? historyDataSalary.current_salary.toLocaleString() : '0'}
                </Typography>
            </div>
        </div>
        {/* Increment Button */}
        <div className="flex justify-start">
            <Button
                color="blue"
                className='text-[12px] px-10'
                onClick={() => handleSalaryIncrement(historyDataSalary)}
            >
                Increment
            </Button>
        </div>

        {/* Increments Table */}
        <div>
            <Typography variant="h6" color="blue-gray" className="mb-4">
                Salary Increments
            </Typography>
            
            {historyDataDetails?.length === 0 ? (
                <div className="text-center py-8">
                    <Typography color="gray">No salary increments found</Typography>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-50">
                                {headHist?.map((head, i) => (
                                    <th key={i} className="border border-gray-300 px-4 py-2 text-left">
                                        <Typography variant="small" color="gray" className='text-black font-medium'>
                                            {head}
                                        </Typography>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {historyDataDetails?.map((ele, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 px-4 py-2">
                                        <Typography variant="small">
                                            {ele.increment}
                                        </Typography>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        <Typography variant="small">
                                            {ele.salary_after?.toLocaleString()}
                                        </Typography>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        <Typography variant="small">
                                            {ele.effective_from}
                                        </Typography>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        <Typography variant="small">
                                            {ele.detail}
                                        </Typography>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        {ele.status === "0" ? (
                                            <div className='text-[12px]'>
                                                <div>
                                                    <span className='text-red-500 text-[12px]'>Cancelled</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                color="red"
                                                variant="outlined"
                                                onClick={() => ToggleCancelIncDialog(ele.id)}
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

        {/* Dialogs */}
        {salaryDetailsValue.showDialog && 
                <CustomDialog 
                    size = 'sm'
                    openDialog = {salaryDetailsValue.showDialog}
                    handleOpen = {ToggleCancelIncDialog}
                    title = 'Confirm Cancellation'
                    compo = {
                        <CancelInc 
                            salaryDetailsValue = {salaryDetailsValue}
                            handleOnChangeCancelInc = {handleOnChangeCancelInc}
                            handleSubmitCancelInc = {handleSubmitCancelInc}
                        />    
                    }
                    footer = {false}
                        
                />}
    </div>
  )
}

export default SalaryDetails



const CancelInc = (props)=>{


    const { handleOnChangeCancelInc,salaryDetailsValue, handleSubmitCancelInc} = props

    return(
        <form onSubmit={handleSubmitCancelInc}>
            <div>
                <div>
                    <Textarea label='Reason' color='blue' value={salaryDetailsValue.reason}  name='reason' onChange={handleOnChangeCancelInc} />
                </div>
                
                <div>
                    <SubmitButton title='Confirm'
                        loading={salaryDetailsValue.loading}
                    />
                </div>
            </div>
        </form>
    )

}