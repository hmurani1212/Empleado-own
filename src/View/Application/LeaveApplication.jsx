import React from 'react'
import { Button, Input, Popover, PopoverHandler, PopoverContent, Textarea, Select, Option } from '@material-tailwind/react'
import { FaRegCalendar } from "react-icons/fa6";
import { FaRegClock } from "react-icons/fa";
import Calendar from 'react-calendar';

function LeaveApplication(props) {
  const {
    handleLeaveApplication,
    handleChangeLeaveApp,
    leaveAppValue,
    handleLeaveDateChange,
    handleSelectChangeLeaveApp,
    isUploading
  } = props

  // Leave types for dropdown
  const leaveTypes = [
    { id: 1, title: 'Annual Leave' },
    { id: 2, title: 'Sick Leave' },
    { id: 3, title: 'Personal Leave' },
    { id: 4, title: 'Emergency Leave' },
    { id: 5, title: 'Maternity Leave' },
    { id: 6, title: 'Paternity Leave' },
    { id: 7, title: 'Study Leave' },
    { id: 8, title: 'Other' }
  ];

  return (
    <>
      <div className='w-full bg-white p-6 rounded-lg shadow-md'>
        <h3 className='text-lg font-semibold text-gray-800 mb-6'>Leave Application</h3>

        <form onSubmit={handleLeaveApplication} className='flex flex-col gap-6'>

          {/* Leave Type Selection */}
          <div className='w-full'>
            <Select
              label="Leave Type"
              color="blue"
              className='!h-11 !rounded-6'
              value={leaveAppValue.leave_type}
              onChange={(value) => handleSelectChangeLeaveApp('leave_type', value)}
              required
            >
              {leaveTypes.map((type) => (
                <Option key={type.id} value={type.id.toString()}>
                  {type.title}
                </Option>
              ))}
            </Select>
          </div>

          {/* Subject */}
          <div className='w-full'>
            <Input
              color="blue"
              className='!h-11 !rounded-6'
              label="Subject"
              placeholder='Enter leave application subject'
              name='subject'
              value={leaveAppValue.subject}
              onChange={handleChangeLeaveApp}
              required
            />
          </div>

          {/* Leave Description */}
          <div className='w-full'>
            <Textarea
              color="blue"
              label="Leave Description"
              name='description'
              value={leaveAppValue.description}
              onChange={handleChangeLeaveApp}
              placeholder="Please provide details about your leave request..."
              required
            />
          </div>

          {/* Leave Duration */}
          <div className='flex justify-between gap-4'>
            <div className='w-[47%]'>
              <Popover placement="bottom">
                <PopoverHandler>
                  <Input
                    label="Start Date"
                    color='blue'
                    className='!h-11 !rounded-6 cursor-pointer'
                    value={leaveAppValue.start_date ? new Date(leaveAppValue.start_date * 1000).toLocaleDateString() : ''}
                    placeholder="Click to select start date"
                    readOnly
                    required
                  />
                </PopoverHandler>
                <PopoverContent>
                  <Calendar
                    onChange={(selected) => handleLeaveDateChange(selected, 'start_date')}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className='w-[47%]'>
              <Popover placement="bottom">
                <PopoverHandler>
                  <Input
                    label="End Date"
                    color='blue'
                    className='!h-11 !rounded-6 cursor-pointer'
                    value={leaveAppValue.end_date ? new Date(leaveAppValue.end_date * 1000).toLocaleDateString() : ''}
                    placeholder="Click to select end date"
                    readOnly
                    required
                  />
                </PopoverHandler>
                <PopoverContent>
                  <Calendar
                    onChange={(selected) => handleLeaveDateChange(selected, 'end_date')}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Number of Days */}
          <div className='w-full'>
            <Input
              color="blue"
              type='number'
              className='!h-11 !rounded-6'
              label="Number of Days"
              placeholder='Enter number of leave days'
              name='total_days'
              value={leaveAppValue.total_days}
              onChange={handleChangeLeaveApp}
              min="1"
              required
            />
          </div>

          {/* Emergency Contact */}
          <div className='w-full'>
            <Input
              color="blue"
              className='!h-11 !rounded-6'
              label="Emergency Contact Number"
              placeholder='Enter emergency contact number'
              name='emergency_contact'
              value={leaveAppValue.emergency_contact}
              onChange={handleChangeLeaveApp}
              required
            />
          </div>

          {/* Work Handover */}
          <div className='w-full'>
            <Textarea
              color="blue"
              label="Work Handover Details"
              name='work_handover'
              value={leaveAppValue.work_handover}
              onChange={handleChangeLeaveApp}
              placeholder="Please describe how your work will be handled during your absence..."
            />
          </div>

          {/* Supporting Documents */}
          <div className='w-full'>
            <Input
              type='file'
              className='!h-11 !rounded-6'
              label="Supporting Documents (Optional)"
              name='supporting_docs'
              onChange={handleChangeLeaveApp}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <small className="text-gray-500 text-xs mt-1">
              Upload any supporting documents (medical certificates, etc.)
            </small>
          </div>

          {/* Submit Button */}
          <div className='w-full flex justify-end'>
            <Button
              color="blue"
              type="submit"
              disabled={isUploading}
              className="px-8 py-2"
            >
              {isUploading ? 'Submitting...' : 'Submit '}
            </Button>
          </div>

        </form>
      </div>
    </>
  )
}

export default LeaveApplication