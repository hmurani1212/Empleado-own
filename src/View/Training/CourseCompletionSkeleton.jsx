import React from 'react'

const CourseCompletionSkeleton = () => {
  return (
    <>
        {[1, 2, 3, 4, 5].map((row) => (
            <tr key={row} className="animate-pulse border-b border-gray-50 last:border-b-0">
                <td className="p-4"><div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div></td>
                <td className="p-4"><div className="h-6 bg-gray-200 rounded-full w-20 mx-auto"></div></td>
                <td className="p-4"><div className="h-6 bg-gray-200 rounded-full w-16 mx-auto"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-200 rounded w-12 mx-auto"></div></td>
                <td className="p-4"><div className="h-8 bg-gray-200 rounded w-16 mx-auto"></div></td>
            </tr>
        ))}
    </>
  )
}

export default CourseCompletionSkeleton
