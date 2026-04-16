import React, { useState } from 'react';
import { Button, Card, CardBody, Typography } from '@material-tailwind/react';
import { FaHashtag, FaUser, FaFileAlt, FaCalendarAlt } from 'react-icons/fa';
import { formatDateDMY } from '../../services/__dateTimeServices';
import { PendingApprovalsListSkeleton } from './ExpenseSkeletons';

const RejectedExpensesDrawer = ({ closeDrawer, rejectedExpenses = [], rejectedExpensesLoading = false }) => {
  // Format date from API response
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return formatDateDMY(dateString);
    } catch (error) {
      return dateString;
    }
  };

  // Get status color and text
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-amber-50 text-amber-600 border border-amber-100';
      case 'approved':
        return 'bg-green-50 text-green-600 border border-green-100';
      case 'rejected':
        return 'bg-red-50 text-red-600 border border-red-100';
      default:
        return 'bg-gray-50 text-gray-600 border border-gray-100';
    }
  };

  // Show loading state
  if (rejectedExpensesLoading) {
    return (
      <div className="p-4 min-h-[280px]">
        <div className="flex flex-col items-center justify-center gap-3 mb-6">
          <div className="w-9 h-9 border-2 border-bgBlue border-t-transparent rounded-full animate-spin" />
          <Typography variant="small" className="text-gray-500 font-poppins">
            Loading rejected expenses...
          </Typography>
        </div>
        <PendingApprovalsListSkeleton rows={3} />
      </div>
    );
  }

  // Show empty state
  if (!rejectedExpenses || rejectedExpenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
          <FaFileAlt className="w-10 h-10 text-gray-300" />
        </div>
        <Typography variant="h6" color="gray" className="font-medium mb-2">
          No rejected expenses found
        </Typography>
        <Typography variant="small" color="gray" className="text-gray-500">
          There are no rejected expenses to display at the moment.
        </Typography>
      </div>
    );
  }

  return (
    <div className="pt-4">
      <div className="space-y-4">
        {rejectedExpenses.map((expense, index) => (
          <div key={expense._id || index} className="">
            <div className="">
              {/* Top Row - Expense Information */}
              <div className="flex justify-between items-start mb-6">
                {/* Employee Name */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-[40px] h-[40px] rounded-[8px] border-[1px] border-bgBlue">
                    <FaUser className="text-bgBlue w-[18px] h-[18px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-Urbanist font-medium text-[#474747]">Employee Name</span>
                    <span className="text-[14px] font-Urbanist font-light text-[#474747]">{expense.employee_name || 'N/A'}</span>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-[40px] h-[40px] rounded-[8px] border-[1px] border-bgBlue">
                    <FaCalendarAlt className="text-bgBlue w-[18px] h-[18px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-Urbanist font-medium text-[#474747]">Date</span>
                    <span className="text-[14px] font-Urbanist font-light text-[#474747]">{formatDate(expense.date)}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-[40px] h-[40px] rounded-[8px] border-[1px] border-bgBlue">
                    <FaFileAlt className="text-bgBlue w-[18px] h-[18px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-Urbanist font-medium text-[#474747]">Status</span>
                    <span className={`text-[12px] font-Urbanist font-medium px-2 py-1 rounded-full ${getStatusStyle(expense.status)}`}>
                      {expense.status || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="border-b border-dashed border-[#DDDDDD] pt-6"></div>
    </div>
  );
};

export default RejectedExpensesDrawer;
