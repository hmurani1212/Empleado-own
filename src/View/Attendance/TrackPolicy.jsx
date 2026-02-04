import React from 'react'
import { Typography } from '@material-tailwind/react'

const tableHeader = [
    '#', 'Date', 'Policy'
]

// Format date function
const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = date.toLocaleString('en-US', { month: 'long' })
    const year = date.getFullYear()
    return `${day}, ${month} ${year}`
}

const TrackPolicy = (props) => {
    const { trackPolicyValue } = props
    
    const trackPolicyData = trackPolicyValue?.trackPolicyData || [] 

  return (
    <div>
        <div className='mt-4'>
            {trackPolicyValue?.loading ? (
                <div className='text-center py-8'>
                    <Typography variant="small" color="blue-gray" className="font-normal">
                        Loading...
                    </Typography>
                </div>
            ) : trackPolicyData?.length > 0 ? (
            <table className="w-full min-w-max text-center h-full">
                    <thead className='sticky top-[-9px]'>
                        <tr>
                        {tableHeader?.map((head,i) => (
                            <th
                                key={i}
                                className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                            >
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal leading-none opacity-70 capitalize"
                                >
                                    {head}
                                </Typography>
                            </th>
                        ))}
                        </tr>
                    </thead>
                    <tbody>
                        {trackPolicyData?.map((ele, index) => {
                            const isLast = index === trackPolicyData?.length - 1;
                            const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";
                            const policyName = ele['policy name'] || 'null'
            
                            return (
                                <tr key={index} className='text-[#474747]'>
                                    <td className={classes}>
                                        <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal"
                                        >
                                        {index + 1}
                                        </Typography>
                                    </td>
                                    <td className={classes}>
                                        <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal"
                                        >
                                        {formatDate(ele.date)}
                                        </Typography>
                                    </td>
                                    <td className={classes}>
                                        <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className={`font-normal cursor-pointer ${
                                            policyName === 'null' ? 'text-gray-400' : 
                                            policyName.toLowerCase().includes('holiday') ? 'text-orange-500' : 
                                            'text-blue-500'
                                        }`}
                                        // onClick={() => alert("hello")}
                                        >
                                        {policyName}
                                        </Typography>
                                    </td>
                                
                                </tr>
                            );
                        })}
                    </tbody>
                    
            </table>
            ) : (
            <div className='text-center py-8'>
                <Typography variant="small" color="blue-gray" className="font-normal text-gray-500">
                    No track policy data found.
                </Typography>
            </div>
            )}
      </div>
    </div>
  )
}

export default TrackPolicy

