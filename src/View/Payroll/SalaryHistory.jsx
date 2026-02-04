import React, { useEffect, useState } from 'react'
import useManageEmpSalary from '../../ViewModel/PayrollViewModel/ManageEmpSalaryServices'
import CustomButton from '../../Components/CustomButton/CustomButton'
import { Textarea, Typography } from '@material-tailwind/react'
import CustomDialog from '../../Components/CustomDialog/CustomDialog'
import CancelInc from './CancelInc'

const SalaryHistory = () => {
    const {historyDataSalary, historyDataDetails, handleDialogCancel, openDialogCancel, loading, handleChangeCancel, cancelIncValues, handleCancelInc} = useManageEmpSalary()
    const headHist = ['Increment', 'Salary', 'Effective From', 'Description', 'Cancel']
    // console.log('historyDataDetails', historyDataDetails)
    useEffect(() => {
        console.log('historyDataSalary', historyDataSalary)
    })
    const [ids, setIds] = useState(null);
  return (
    <>
    <div className='flex flex-col space-y-4'>
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
                                    <Typography
                                    variant='small'
                                    color='blue-gray'
                                    className="font-normal cursor-pointer hover:-translate-y-1 hover:scale-110 hover:text-black-500 duration-300">
                                        {ele.cancelled_by ? (
                                            <div className='text-[12px]'>
                                            <div>
                                                <span className='text-red-500 text-[12px]'>Cancelled</span>
                                            </div>
                                            <div>View Detail</div>
                                            <div>
                                                <span className='font-semibold'>Cancelled by: </span>
                                                <span>{ele.cancelled_by}</span>
                                            </div>
                                            <div>
                                                <span className='font-semibold'>Time: </span>
                                                <span>{ele.time}</span>
                                            </div>
                                            <div>
                                                <span className='font-semibold'>Detail: </span>
                                                <span>{ele.detail}</span>
                                            </div>

                                        </div>) : (

                                        <div  onClick={() => {setIds(ele.id); handleDialogCancel(ele.id)}}>
                                            <span>Cancel</span>
                                        </div>) 
                                        }
                                        
                                    </Typography>
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