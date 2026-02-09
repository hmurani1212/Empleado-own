import React from 'react'
import { Alert } from "@material-tailwind/react";

function LeaveEncash({ handleLeaveEncashment, handleChangeLeaveEncash, leaveEncashValue }) {
  return (
    <div className='w-full'>
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 font-poppins">Leave Encashment Application</h3>
      <p className="text-sm sm:text-base text-gray-600 mb-4 font-poppins">
        Fill out the form below to submit your leave encashment request.
      </p>

      <form onSubmit={handleLeaveEncashment} className="space-y-4 sm:space-y-6">
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 font-poppins">Subject *</label>
          <input
            type="text"
            name="subject"
            value={leaveEncashValue.subject}
            onChange={handleChangeLeaveEncash}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            placeholder="Enter subject"
            required
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 font-poppins">Description *</label>
          <textarea
            name="application_body"
            value={leaveEncashValue.application_body}
            onChange={handleChangeLeaveEncash}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            rows="4"
            placeholder="Enter description"
            required
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 font-poppins">Leave Days to Encash *</label>
          <input
            type="number"
            name="leaves_count"
            value={leaveEncashValue.leaves_count}
            onChange={handleChangeLeaveEncash}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            placeholder="Enter number of days"
            min="1"
            required
          />
        </div>

        <div className='flex justify-end pt-4'>
          <button
            type="submit"
            className="bg-bgBlue text-white px-6 py-2.5 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 font-medium text-sm font-poppins"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  )
}

export default LeaveEncash