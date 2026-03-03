import React, { useState } from 'react'
import useManageEmpSalary from '../../ViewModel/PayrollViewModel/ManageEmpSalaryServices'
import CustomButton from '../../Components/CustomButton/CustomButton'
import { Textarea, Typography } from '@material-tailwind/react'
import CustomDialog from '../../Components/CustomDialog/CustomDialog'
import CancelInc from './CancelInc'

// Format unix timestamp (seconds) to "YYYY-MM-DD hh:mm am/pm"
const formatCancelTime = (unixTimestamp) => {
  if (unixTimestamp == null) return '—'
  const date = new Date(Number(unixTimestamp) * 1000)
  if (isNaN(date.getTime())) return '—'
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = date.getHours()
  const min = String(date.getMinutes()).padStart(2, '0')
  const ampm = h >= 12 ? 'pm' : 'am'
  const h12 = h % 12 || 12
  return `${y}-${m}-${d} ${String(h12).padStart(2, '0')}:${min} ${ampm}`
}

const SalaryHistory = () => {
    const {historyDataSalary, historyDataDetails, handleDialogCancel, openDialogCancel, loading, handleChangeCancel, cancelIncValues, handleCancelInc} = useManageEmpSalary()
    const headHist = ['Increment', 'Salary', 'Effective From', 'Description', 'Cancel']
    const [ids, setIds] = useState(null)

  return (
    <>
    <div className='flex flex-col space-y-4 pt-6'>
        <div className='text-[12px]'>
            <table className='w-full border-collapse border border-slate-500'>
                <thead>
                    <tr>
                        <th className='border border-slate-500 py-3'>
                            Starting Salary
                        </th>
                        <th className='border border-slate-500 font-medium'>
                            {historyDataSalary.starting_salary}
                        </th>
                        <th className='border border-slate-500'>
                            Current Salary
                        </th>
                        <th className='border border-slate-500 font-medium'>
                            {Number(historyDataSalary.current_salary).toFixed(0)}
                        </th>
                    </tr> 
                </thead>
            </table>
        </div>

        <div>
            <CustomButton title='Increment'/>
        </div>

        <div>
            <table className='w-full border-collapse border border-slate-500'>
                <thead>
                    <tr>
                        {headHist?.map((head, i) => (
                        <th

                        key={i}
                        className="border border-slate-500 py-3"
                        >
                            <Typography
                            variant='small'
                            color='blue-gray'
                            className="font-semibold leading-none opacity-70 capitalize"
                            >
                                {head}
                            </Typography>
                        </th>
                    ))}
                    </tr>
                </thead>

                <tbody>
                    {historyDataDetails?.map((ele, index) => {
                        const classes = "p-3 border border-blue-gray-50 text-center"

                        return(
                            <tr key={index}>
                                <td className={classes}>
                                    <Typography
                                    variant='small'
                                    color='blue-gray'
                                    className="font-normal">
                                        {ele.increment || ele.increment_amount}
                                    </Typography>
                                </td>

                                <td className={classes}>
                                    <Typography
                                    variant='small'
                                    color='blue-gray'
                                    className="font-normal">
                                        {Number(ele.salary_after).toFixed(0)}
                                    </Typography>
                                </td>

                                <td className={classes}>
                                    <Typography
                                    variant='small'
                                    color='blue-gray'
                                    className="font-normal">
                                        {ele.effective_from}
                                    </Typography>
                                </td>

                                <td className={classes}>
                                    <Typography
                                    variant='small'
                                    color='blue-gray'
                                    className="font-normal">
                                        {ele.detail}
                                    </Typography>
                                </td>

                                <td className={classes}>
                                    {ele.status === 0 ? (
                                        <div className='text-[12px] text-left align-top'>
                                            <div className='text-red-500 font-semibold'>Cancelled</div>
                                            {ele.cancelled_info && (
                                                <div className='mt-2 space-y-1 text-gray-700'>
                                                    <div>
                                                        <span className='font-semibold'>Cancelled By: </span>
                                                        <span>{ele.cancelled_info.cancelled_by_name ?? '—'}</span>
                                                    </div>
                                                    <div>
                                                        <span className='font-semibold'>Time: </span>
                                                        <span>{formatCancelTime(ele.cancelled_info.unix_timestamp)}</span>
                                                    </div>
                                                    <div>
                                                        <span className='font-semibold'>Detail: </span>
                                                        <span>{ele.cancelled_info.reason ?? '—'}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div
                                            className='font-normal cursor-pointer hover:underline text-gray-700 hover:text-blue-600'
                                            onClick={() => { setIds(ele.id); handleDialogCancel(ele.id) }}
                                        >
                                            Cancel
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )

                    })}
                   
                </tbody>
                <CustomDialog 
                size = 'sm'
                openDialog = {openDialogCancel}
                handleOpen = {handleDialogCancel}
                title = 'Confirm Cancellation'
                compo = {
                    <CancelInc id={ids} loading={loading} />    
                }
                showBtns= {false}
                
        />
            </table>
            
        </div>

      
    </div>
    </>
  )
}

export default SalaryHistory