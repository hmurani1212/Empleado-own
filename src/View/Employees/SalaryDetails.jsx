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

    // Support new salary-history API (DB_DATA: starting_salary, current_salary, increment_history, recurring_incentives)
    const isNewApi = Array.isArray(data?.increment_history)
    const startingSalary = isNewApi ? (data?.starting_salary ?? 0) : (data?.summary?.basic_salary ?? data?.salary?.basic_salary ?? 0)
    const currentSalary = isNewApi ? (data?.current_salary ?? 0) : (data?.summary?.net_salary ?? data?.salary?.current_salary ?? 0)
    const incrementDetails = isNewApi ? (data?.increment_history ?? []) : (Array.isArray(data?.increments) ? data.increments : (data?.increments?.increment_details ?? []))
    const recurringIncentives = isNewApi ? (data?.recurring_incentives ?? []) : (Array.isArray(data?.incentives?.incentive_details) ? data.incentives.incentive_details.filter((inc) => String(inc?.re_occuring || '').toUpperCase() === 'YES') : [])

    const summary = data?.summary ?? {}
    const salary = data?.salary ?? {}
    const employeeInfo = data?.employee_info ?? {}
    const basicSalary = Number(salary?.basic_salary ?? summary?.basic_salary ?? 0)

    // Old API: sort by effective_from and compute cumulative amount; New API: use as-is and salary_after
    const sortedIncrementDetails = isNewApi ? incrementDetails : [...(incrementDetails || [])].sort((a, b) => (a.effective_from ?? 0) - (b.effective_from ?? 0))
    const getAmountDisplay = (index) => {
        if (isNewApi && sortedIncrementDetails[index]?.salary_after != null) return Number(sortedIncrementDetails[index].salary_after).toLocaleString()
        let salaryAfter = basicSalary
        for (let i = 0; i <= index; i++) {
            const inc = sortedIncrementDetails[i]
            salaryAfter += Number(inc?.calculated_value ?? inc?.increment_amount ?? inc?.amount ?? 0)
        }
        return Number(salaryAfter).toLocaleString()
    }
    const formatCancelTime = (unix) => {
        if (unix == null) return '—'
        const d = new Date(unix * 1000)
        return d.toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
    }

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
                onClick={() => handleSalaryIncrement({
                    ...employeeInfo,
                    ...salary,
                    ...summary,
                    data: data,
                    emp_id: employeeInfo?.emp_id ?? employeeInfo?.id ?? data?.emp_id ?? data?.employee_info?.emp_id
                })}
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
                            {sortedIncrementDetails?.map((ele, index) => {
                                const isCancelled = ele.status === '0' || ele.status === 0
                                const ci = ele.cancelled_info
                                const cancelledBy = ci?.cancelled_by_name ?? ele.cancelled_by ?? '—'
                                const cancelledTime = ci?.unix_timestamp != null ? formatCancelTime(ci.unix_timestamp) : (ele.cancelled_at ?? ele.cancelled_at_formatted ?? '—')
                                const cancelledDetail = ci?.reason ?? ele.cancel_reason ?? ele.cancel_detail ?? ele.reason ?? '—'
                                const cancelBlock = (
                                    <div className='text-[12px]'>
                                        <div className='text-red-500 font-semibold'>Cancelled</div>
                                        <div className='mt-1.5 space-y-1 text-black'>
                                            <div><span className='font-semibold'>Cancelled By:</span> {cancelledBy}</div>
                                            <div><span className='font-semibold'>Time:</span> {cancelledTime}</div>
                                            <div><span className='font-semibold'>Detail:</span> {cancelledDetail}</div>
                                        </div>
                                    </div>
                                )
                                return (
                                <tr key={ele?.id ?? index} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 px-4 py-2">
                                        <Typography variant="small" className={isCancelled ? 'line-through' : ''}>
                                            {ele.increment ?? ele.increment_amount ?? ele.amount ?? ele.calculated_value ?? '—'}
                                        </Typography>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        <Typography variant="small" className={isCancelled ? 'line-through' : ''}>
                                            {getAmountDisplay(index)}
                                        </Typography>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        <Typography variant="small">
                                            {ele.effective_from ?? ele.effective_from_date ?? '—'}
                                        </Typography>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        <Typography variant="small">
                                            {ele.detail ?? '—'}
                                        </Typography>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        {isCancelled ? cancelBlock : (
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
                                )
                            })}
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
                                    <td className="border border-gray-300 px-4 py-2"><Typography variant="small">{typeof (inc.amount ?? inc.amount_value) === 'number' ? Number(inc.amount ?? inc.amount_value).toLocaleString() : (inc.amount ?? inc.amount_value ?? '—')}</Typography></td>
                                    <td className="border border-gray-300 px-4 py-2"><Typography variant="small">{inc.start_date_formatted ?? inc.start_date ?? '—'}</Typography></td>
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