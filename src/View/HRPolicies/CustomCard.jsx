import React from 'react'

const CustomCard = (props) => {
    const {logo, title, data} = props
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 text-bgBlue rounded-lg flex-shrink-0 mt-0.5">
                {React.cloneElement(logo, { size: 18 })}
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-gray-500 font-poppins mb-1 uppercase tracking-wide">
                    {title}
                </span>
                <span className="text-sm font-semibold text-gray-900 font-poppins break-words leading-tight">
                     {(typeof data === 'object' && data !== null) ? data.pay_month: data || '-'}
                </span>
            </div>
        </div>
    </div>
  )
}

export default CustomCard