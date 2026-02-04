import { Typography } from '@material-tailwind/react'
import React from 'react'

const EducationalInfo = () => {
    const eduData = ['Degree', 'Passing Year', 'Marks/GPA', 'Board/University']
  return (
    <>
    <div className='p-[18px]'>
        <table className="w-full min-w-max text-left h-full">
            <thead className='sticky top-[-9px] z-20'>
                <tr>
                    {eduData?.map((head, i) => (
                        <th
                         key={i}
                         className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                        >
                            <Typography
                                variant='small'
                                color='blue-gray'
                                className="font-normal leading-none opacity-70 capitalize"
                            >
                                {head}
                            </Typography>
                            
                        </th>
                    ))}

                </tr>

            </thead>
        </table>

    </div>

    </>
  )
}

export default EducationalInfo