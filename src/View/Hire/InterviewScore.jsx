import React from 'react'
import { BsClipboardData } from 'react-icons/bs'

const InterviewScore = () => {
  return (
    <div className="p-5">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-[13px] font-bold text-gray-800 font-Urbanist mb-4 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#3da5f4] inline-block" />
          Interview Score
        </h3>

        <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-3">
          <BsClipboardData className="text-[36px] text-gray-300" />
          <p className="text-[12px] font-Urbanist">
            No interview score available for this application
          </p>
        </div>
      </div>
    </div>
  )
}

export default InterviewScore
