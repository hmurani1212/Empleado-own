import React from 'react'
import CustomButton from '../../Components/CustomButton/CustomButton'
import { Textarea, Typography, Button } from '@material-tailwind/react'
import CustomDialog from '../../Components/CustomDialog/CustomDialog'
import SubmitButton from '../../Components/SubmitButton/SubmitButton'

const headHist = ['Increment', 'Amount', 'Effective From', 'Description', 'Cancel']
const headRecurringIncentives = ['Title', 'Amount', 'Start Date', 'Description']


const SalaryDetails = (props) => {
    const { salaryDetailsValue, ToggleCancelIncDialog, handleOnChangeCancelInc, handleSubmitCancelInc, handleSalaryIncrement } = props

    const data = salaryDetailsValue?.data
    const summary = data?.summary ?? {}
    const salary = data?.salary ?? {}
    const increments = data?.increments ?? {}
    const incentives = data?.incentives ?? {}
    const rawIncrements = data?.increments
    const incrementDetails = Array.isArray(rawIncrements) ? rawIncrements : (increments?.increment_details ?? [])
    const incentiveDetails = Array.isArray(incentives?.incentive_details) ? incentives.incentive_details : []
    const recurringIncentives = incentiveDetails.filter((inc) => String(inc?.re_occuring || '').toUpperCase() === 'YES')

    const startingSalary = summary?.basic_salary ?? salary?.basic_salary ?? 0
    const currentSalary = summary?.net_salary ?? salary?.current_salary ?? 0
    const employeeInfo = data?.employee_info ?? {}

  return (
    <div className='flex flex-col space-y-6 w-[700] px-4'>
        {/* Salary Overview */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-100 p-4 rounded-lg">
                <Typography variant="small" color="gray" className="mb-1">
                    Starting salary
                </Typography>
                <Typography variant="h6" color="blue-gray">
                    {Number(startingSalary).toLocaleString()}
                </Typography>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
                <Typography variant="small" color="gray" className="mb-1">
                    Current salary
                </Typography>
                <Typography variant="h6" color="blue-gray">
                    {Number(currentSalary).toLocaleString()}
                </Typography>
            </div>
        </div>
        {/* Increment Button */}
        <div className="flex justify-start">
            <Button
                color="blue"
                className='text-[12px] px-10'
                onClick={() => handleSalaryIncrement({ ...employeeInfo, ...salary, ...summary, data: data })}
            >
                Increment
            </Button>
        </div>

        {/* Increments Table */}
        <div>
            <Typography variant="h6" color="blue-gray" className="mb-4">
                Salary Increments
            </Typography>

            {(!incrementDetails || incrementDetails.length === 0) ? (
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
                            {incrementDetails?.map((ele, index) => (
                                <tr key={ele?.id ?? index} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 px-4 py-2">
                                        <Typography variant="small">
                                            {ele.increment ?? ele.amount ?? ele.calculated_value ?? '—'}
                                        </Typography>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        <Typography variant="small">
                                            {(ele.salary_after ?? ele.calculated_value ?? ele.amount ?? 0).toLocaleString?.() ?? String(ele.amount ?? ele.calculated_value ?? '—')}
                                        </Typography>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        <Typography variant="small">
                                            {ele.effective_from_date ?? ele.effective_from ?? '—'}
                                        </Typography>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        <Typography variant="small">
                                            {ele.detail ?? '—'}
                                        </Typography>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        {ele.status === "0" ? (
                                            <div className='text-[12px]'>
                                                <span className='text-red-500 text-[12px]'>Cancelled</span>
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

        {/* Recurring Incentives – only incentives where re_occuring is YES */}
        <div>
            <Typography variant="h6" color="blue-gray" className="mb-4">
                Recurring Incentives
            </Typography>
            {recurringIncentives.length === 0 ? (
                <div className="text-center py-8">
                    <Typography color="gray">No recurring incentives found</Typography>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-50">
                                {headRecurringIncentives.map((head, i) => (
                                    <th key={i} className="border border-gray-300 px-4 py-2 text-left">
                                        <Typography variant="small" color="gray" className='text-black font-medium'>{head}</Typography>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {recurringIncentives.map((inc, i) => (
                                <tr key={inc?.id ?? i} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 px-4 py-2"><Typography variant="small">{inc.title ?? '—'}</Typography></td>
                                    <td className="border border-gray-300 px-4 py-2"><Typography variant="small">{(inc.amount ?? 0).toLocaleString?.() ?? inc.amount}</Typography></td>
                                    <td className="border border-gray-300 px-4 py-2"><Typography variant="small">{inc.start_date_formatted ?? '—'}</Typography></td>
                                    {/* <td className="border border-gray-300 px-4 py-2"><Typography variant="small">{inc.end_date_formatted ?? '—'}</Typography></td> */}
                                    <td className="border border-gray-300 px-4 py-2"><Typography variant="small">{inc.description ?? '—'}</Typography></td>
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