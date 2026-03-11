import React, { useState } from 'react';
import { Button } from '@material-tailwind/react';
import { formatTimestampToDate } from '../../services/__dateTimeServices';
import {
  BiCalendar,
  BiChevronUp,
  BiChevronDown,
  BiUserCircle,
} from 'react-icons/bi';
import {
  FaFlag,
  FaCircleCheck,
  FaChartLine,
  FaStar,
  FaPen,
} from 'react-icons/fa6';
import { LiaTasksSolid } from 'react-icons/lia';

const ViewGoal = ({ goalData, onClose, onEdit, onUpdate }) => {
  const [employeeInfoOpen, setEmployeeInfoOpen] = useState(true);
  const [datesTimelineOpen, setDatesTimelineOpen] = useState(true);

  const getStatusText = (status) => {
    switch (String(status)) {
      case '0':
        return 'Not Started';
      case '1':
        return 'In Progress';
      case '2':
        return 'Completed';
      default:
        return status || 'Unknown';
    }
  };

  const getPriorityLabel = () => {
    const p = goalData.priority;
    if (!p) return 'N/A';
    if (typeof p === 'object') return p.label || p.value || p.name || 'N/A';
    return String(p);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    try {
      return formatTimestampToDate(dateString);
    } catch {
      return dateString;
    }
  };

  const rating = goalData.rating !== undefined && goalData.rating !== null
    ? Number(goalData.rating)
    : 0;
  const progress = goalData.progress ?? 0;
  const employeeLabel = goalData.selectedEmp?.[0]?.label || 'N/A';
  const employeeValue = goalData.selectedEmp?.[0]?.value ?? '';
  const reviewCycleLabel = goalData.pID?.label || goalData.pID?.name || (goalData.pID?.value ?? 'N/A');
  const goalId = goalData.goal_id || goalData.id || '';

  // Initials for avatar (e.g. "Sara Saleem" -> "SS")
  const getInitials = (label) => {
    if (!label || typeof label !== 'string') return '?';
    const parts = label.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return label.slice(0, 2).toUpperCase();
  };

  return (
    <div className="bg-gray-50/80 min-h-full rounded-lg p-4 sm:p-6 space-y-5">
      {/* Header: View Goal title + Edit Goal button */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">View Goal</h1>
        <div className="flex items-center gap-2">
          {onUpdate && (
            <Button
              variant="outlined"
              size="sm"
              onClick={onUpdate}
              className="normal-case text-gray-700 border-gray-300 bg-white hover:bg-gray-50 rounded-lg px-4 py-2 flex items-center gap-2"
            >
              <FaPen className="w-3.5 h-3.5" />
              Update Goal
            </Button>
          )}
          <Button
            variant="outlined"
            size="sm"
            onClick={onEdit}
            className="normal-case text-gray-700 border-gray-300 bg-white hover:bg-gray-50 rounded-lg px-4 py-2 flex items-center gap-2"
          >
            <FaPen className="w-3.5 h-3.5" />
            Edit Goal
          </Button>
        </div>
      </div>

      {/* Main goal card: Goal Name, Priority, Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <p className="text-base font-semibold text-gray-900 mb-4">
          Goal Name: <span className="font-bold">{goalData.goal_name || 'N/A'}</span>
          {goalId && <span className="font-normal text-gray-500"> ({goalId})</span>}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <FaFlag className="w-4 h-4 text-red-500" />
            <span className="text-sm text-gray-600">Priority:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
              {getPriorityLabel()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FaCircleCheck className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">Status:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {getStatusText(goalData.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Two-column cards: Employee Info | Dates & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Employee Info card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            type="button"
            onClick={() => setEmployeeInfoOpen((o) => !o)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50/50 transition-colors"
          >
            <span className="font-semibold text-gray-900">Employee Info</span>
            {employeeInfoOpen ? (
              <BiChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <BiChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {employeeInfoOpen && (
            <div className="px-4 pb-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
                  {getInitials(employeeLabel)}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Assigned Employee</p>
                  <p className="font-semibold text-gray-900">
                    {employeeLabel}
                    {employeeValue && <span className="font-normal text-gray-500"> ({employeeValue})</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BiCalendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-gray-600">Start Date:</span>
                <span className="text-gray-900">{formatDate(goalData.start_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaChartLine className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-600 flex-shrink-0">Progress:</span>
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{progress}%</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <LiaTasksSolid className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-gray-600">Review Cycle:</span>
                <span className="font-medium text-gray-900">{reviewCycleLabel}</span>
              </div>
            </div>
          )}
        </div>

        {/* Dates & Timeline card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            type="button"
            onClick={() => setDatesTimelineOpen((o) => !o)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50/50 transition-colors"
          >
            <span className="font-semibold text-gray-900">Dates & Timeline</span>
            {datesTimelineOpen ? (
              <BiChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <BiChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {datesTimelineOpen && (
            <div className="px-4 pb-4 space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <BiCalendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-gray-600">Created At:</span>
                <span className="text-gray-900">{goalData.createdAt ? formatDate(goalData.createdAt) : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BiCalendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-gray-600">Start Date:</span>
                <span className="text-gray-900">{formatDate(goalData.start_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BiCalendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-gray-600">End Date:</span>
                <span className="text-gray-900">{formatDate(goalData.end_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaStar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-600 flex-shrink-0">Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      aria-hidden
                    >
                      ★
                    </span>
                  ))}
                  <span className="text-sm text-gray-500 ml-1">({rating}/5)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <p className="font-semibold text-gray-900 mb-2">Description:</p>
        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
          {goalData.description || 'No description provided.'}
        </p>
      </div>
    </div>
  );
};

export default ViewGoal;
