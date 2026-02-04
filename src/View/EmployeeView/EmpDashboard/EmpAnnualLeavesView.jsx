import { Typography } from '@material-tailwind/react'
import React from 'react'

const EmpAnnualLeavesView = (props) => {
    const { data } = props

    const tableHeaderData = [
        "Leave", "Total", "Availed", "Carry Forward", "From", "To", "Expiry"
    ]
    // console.log('data', data)
  return (
    <table className="w-full min-w-max text-left">
        <thead className='sticky top-[-9px]'>
            <tr>
            {tableHeaderData?.map((head,i) => (
                <th
                    key={i}
                    className="border-b border-t border-gray-300 bg-blue-gray-50 p-4 text-center"
                >
                    <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal leading-none opacity-70 capitalize"
                    >
                        {/* {head} */}
                        {head}
                    </Typography>
                </th>
            ))}
            </tr>
        </thead>
        <tbody>
            {data?.length > 0 ? (
                data?.map((ele, index) => {
                    const isLast = index === data.length - 1;
                    const classes = isLast ? "p-2 text-center" : "p-2 border-b border-blue-gray-50 text-center";
                    return(
                    <tr key={ele.id}>
                        <td className={classes}>
                            <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                            >
                                {ele?.Leave}
                            </Typography>
                        </td>
                        
                        <td className={classes}>
                            <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                            >
                                {ele?.Total}
                            </Typography>
                        </td>
                        
                        <td className={classes}>
                            <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                            >
                                {ele?.Availed}
                            </Typography>
                        </td>
                        <td className={classes}>
                            <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                            >
                                {ele?.Carry_Forward}
                            </Typography>
                        </td>
                        <td className={classes}>
                            <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                            >
                                {ele?.From}
                            </Typography>
                        </td>
                        <td className={classes}>
                            <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                            >
                                {ele?.To}
                            </Typography>
                        </td>
                        <td className={classes}>
                            <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                            >
                                {ele?.Expiry}
                            </Typography>
                        </td>
                    </tr>
                    )
                })
            ) : (
            <tr>
                <td colSpan={data.length} className="p-2 text-center">
                    No record found
                </td>
            </tr>
            ) 
        }
        </tbody>
            
    </table>
  )
}

export default EmpAnnualLeavesView