import React from 'react'

const statusConfig = {
  0: { label: 'Rejected',    cls: 'bg-red-50 text-red-600 border border-red-200' },
  1: { label: 'Shortlisted', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  2: { label: 'Interviewed', cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
  3: { label: 'Accepted',    cls: 'bg-green-50 text-green-700 border border-green-200' },
  4: { label: 'Pending',     cls: 'bg-gray-100 text-gray-600 border border-gray-200' },
  5: { label: 'Starred',     cls: 'bg-purple-50 text-purple-700 border border-purple-200' },
}

const ApplicationReview = ({ viewPending }) => {
  const reviews = viewPending?.reviews ?? []

  return (
    <div className="p-5">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-[13px] font-bold text-gray-800 font-Urbanist mb-4 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#3da5f4] inline-block" />
          Reviews
        </h3>

        {reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((ele, i) => {
              const statusInfo =
                statusConfig[ele.app_status] ?? {
                  label: String(ele.app_status ?? 'Unknown'),
                  cls: 'bg-gray-100 text-gray-500 border border-gray-200',
                }
              return (
                <div
                  key={i}
                  className="flex gap-3 p-4 bg-[#FAFBFC] rounded-xl border border-gray-100 hover:border-[#3da5f4]/20 transition-colors"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {ele.dp ? (
                      <img
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-[#3da5f4]/20"
                        src={ele.dp}
                        alt={ele.name}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3da5f4] to-[#8bc9f8] text-white flex items-center justify-center font-bold text-[14px]">
                        {ele.name?.charAt(0)?.toUpperCase() || 'R'}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="text-[13px] font-semibold text-[#3da5f4] font-Urbanist">
                        {ele.name}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold font-Urbanist capitalize ${statusInfo.cls}`}
                      >
                        {statusInfo.label}
                      </span>
                      <span className="text-[11px] text-gray-400 font-Urbanist ml-auto whitespace-nowrap">
                        {ele.timestamp}
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-600 font-Urbanist leading-relaxed">
                      {ele.comment || (
                        <span className="text-gray-400 italic">No comment provided</span>
                      )}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 text-[12px] font-Urbanist">
            No reviews available for this application
          </div>
        )}
      </div>
    </div>
  )
}

export default ApplicationReview
