import React from 'react'
import { Alert } from "@material-tailwind/react";

function LeaveEncash({ handleLeaveEncashment, handleChangeLeaveEncash, leaveEncashValue }) {
  return (
    <>
      <div className=''>
        {/* <Alert className='bg-[#d4edda] text-[#155724]'>
          Leave Encashment Application Form
        </Alert> */}
      </div>

      {/* Leave Encashment Form */}
      <div className="p-4 sm:p-6 bg-white rounded-xl sm:rounded-lg shadow-md">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Leave Encashment Application</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4">
          Fill out the form below to submit your leave encashment request.
        </p>

        <form onSubmit={handleLeaveEncashment} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Subject *</label>
            <input
              type="text"
              name="subject"
              value={leaveEncashValue.subject}
              onChange={handleChangeLeaveEncash}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter subject"
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              name="application_body"
              value={leaveEncashValue.application_body}
              onChange={handleChangeLeaveEncash}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Enter description"
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Leave Days to Encash *</label>
            <input
              type="number"
              name="leaves_count"
              value={leaveEncashValue.leaves_count}
              onChange={handleChangeLeaveEncash}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter number of days"
              min="1"
              required
            />
          </div>

          <div className='flex justify-end pt-4'>
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default LeaveEncash