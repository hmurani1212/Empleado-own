import { Typography, Spinner } from '@material-tailwind/react'
import React from 'react'
import { FaRegCircle } from "react-icons/fa";
import useStore from '../../Store/store';

const MonthLateComers = () => {
    // Read directly from store instead of props - component will update reactively when data arrives
    const allLateComers = useStore((state) => state.allLateComers)
    const loading = useStore((state) => state.loading)
    const lateComersdata = ['Employee ID', 'Name', 'Late Coming Days', 'Bucket Used Minutes', 'Late Time']

    // console.log('allLateComers222222222222222', allLateComers)
  return (
    <>
    <div className='text-[12px] flex flex-col gap-3'>
        <div className='flex flex-col gap-3'>
            <div>
                <span className='text-red-500 '>Note: </span>
                <span>The data is updated randomly every 4 hours!</span>
            </div>

            <div >
                <div className='flex gap-2 items-center'> 
                    <div><FaRegCircle /></div>
                    <span>Currently, the late minutes bucket is in use.</span>
                </div>
                <div className='flex gap-2 items-center'>
                    <div><FaRegCircle className='bg-[#FFCBCB] text-[#f2b8a4] rounded-[10px]'/></div>
                    <span>The bucket is fully consumed, and the late minutes have started.</span>
                </div>
            </div>
        </div>

        {loading ? (
            <div className="flex justify-center items-center py-8">
                <Spinner className="h-8 w-8" />
            </div>
        ) : (
            <table className="w-full">
                <thead>
                    <tr>
                        {lateComersdata?.map((head, i) => (
                            <th
                            key = {i}
                            className="border-b border-blue-gray-100 bg-blue-gray-50 p-4 text-center"
                            >
                                <Typography
                                 variant='small'
                                 color='blue-gray'
                                 className="font-normal leading-none opacity-70 capitalize text-center"
                                >
                                    {head}
                                </Typography>
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {allLateComers && allLateComers.length > 0 ? (
                        allLateComers.map((ele, index) => {
                            const isLast = index ===  allLateComers.length - 1
                            const classes = isLast ? "p-3 text-center" : "p-3 border-b border-blue-gray-50 text-center"

                            return(
                                <tr key={index} style={{background: ele.late_coming_seconds === null || ele.late_coming_seconds === 0 ? '' : '#f9e4dd', color: ele.late_coming_seconds === null || ele.late_coming_seconds === 0 ? '' : '#d7514f'}}>
                                    <td className={classes}>
                                        <Typography
                                        variant='small'
                                        color='blue-gray'
                                        className="font-normal text-center"
                                        >
                                            {ele.emp_id}
                                        </Typography>
                                    </td>

                                    <td className={classes}>
                                        <Typography
                                        variant='small'
                                        color='blue-gray'
                                        className="font-normal text-center"
                                        >
                                            {ele.name}
                                        </Typography>
                                    </td>

                                    <td className={classes}>
                                        <Typography
                                        variant='small'
                                        color='blue-gray'
                                        className="font-normal text-center"
                                        >
                                            {ele.total_late_coming_days}
                                        </Typography>
                                    </td>

                                    <td className={classes}>
                                        <Typography
                                        variant='small'
                                        color='blue-gray'
                                        className="font-normal text-center"
                                        >
                                            {ele.total_adjusted_late_min}
                                        </Typography>
                                    </td>
                                    <td className={classes}>
                                        <Typography
                                        variant='small'
                                        color='blue-gray'
                                        className="font-normal text-center"
                                        >
                                            {ele.late_coming_in_words || '0'}
                                        </Typography>
                                    </td>

                                </tr>
                            )

                        })
                    ) : (
                        <tr>
                            <td colSpan={lateComersdata.length} className="p-3 text-center">
                                <Typography
                                    variant='small'
                                    color='blue-gray'
                                    className="font-normal text-center"
                                >
                                    No data found
                                </Typography>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        )}
    </div>
    </>
  )
}

export default MonthLateComers