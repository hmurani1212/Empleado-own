import React from 'react'
import { Button, Input, Popover, PopoverHandler, PopoverContent, Textarea } from '@material-tailwind/react'
import { FaRegClock } from "react-icons/fa";
import Calendar from 'react-calendar';

function TaApplication(props) {
  const {
    handleTaDaApplication,
    handleChangeTaDaApp,
    taDaAppValue,
    handleTaDaDateChange,
    handleTaDaFileUpload,
    taDaUploadedFiles,
    isUploading
  } = props
  return (
    <>
      <div className='w-full bg-white p-4 sm:p-6 rounded-xl sm:rounded-lg shadow-md'>
        <h3 className='text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6'>Travel & Daily Allowance Application</h3>

        <form onSubmit={handleTaDaApplication} className='flex flex-col gap-4 sm:gap-6'>
          <div className='w-full'>
            <Input
              className='!h-11 !rounded-6'
              color='blue'
              label="City / Cities Visited"
              name="visit_locations"
              value={taDaAppValue.visit_locations}
              onChange={handleChangeTaDaApp}
              required
            />
          </div>

          <div className='w-full'>
            <Textarea
              color="blue"
              label="Purpose Of Visit"
              name="visit_purpose"
              value={taDaAppValue.visit_purpose}
              onChange={handleChangeTaDaApp}
              required
            />
          </div>

          <div className='flex flex-col sm:flex-row justify-between gap-4'>
            <div className='w-full sm:w-[47%]'>
              <Popover placement="bottom">
                <PopoverHandler>
                  <Input
                    label="Leaving Date"
                    color='blue'
                    value={taDaAppValue.leaving_date ? new Date(taDaAppValue.leaving_date * 1000).toLocaleDateString() : ''}
                    readOnly
                    required
                  />
                </PopoverHandler>
                <PopoverContent>
                  <Calendar
                    onChange={(selected) => handleTaDaDateChange(selected, 'leaving_date')}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className='w-full sm:w-[47%]'>
              <Input
                type='time'
                className='!h-11 !rounded-6'
                label="Leaving Time"
                placeholder='--:-- --'
                name="leaving_time"
                value={taDaAppValue.leaving_time}
                onChange={handleChangeTaDaApp}
                required
              />
            </div>
          </div>

          <div className='flex flex-col sm:flex-row justify-between gap-4'>
            <div className='w-full sm:w-[47%]'>
              <Popover placement="bottom">
                <PopoverHandler>
                  <Input
                    label="Return Date"
                    color='blue'
                    value={taDaAppValue.return_date ? new Date(taDaAppValue.return_date * 1000).toLocaleDateString() : ''}
                    readOnly
                    required
                  />
                </PopoverHandler>
                <PopoverContent>
                  <Calendar
                    onChange={(selected) => handleTaDaDateChange(selected, 'return_date')}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className='w-full sm:w-[47%]'>
              <Input
                type='time'
                className='!h-11 !rounded-6'
                label="Return Time"
                placeholder='--:-- --'
                name="return_time"
                value={taDaAppValue.return_time}
                onChange={handleChangeTaDaApp}
                required
              />
            </div>
          </div>

          <div className='flex flex-col sm:flex-row justify-between gap-4'>
            <div className='w-full sm:w-[47%]'>
              <Input
                className='!h-11 !rounded-6'
                type='number'
                label="Fuel Expenses"
                placeholder='0.00'
                name="fuel_expense"
                value={taDaAppValue.fuel_expense}
                onChange={handleChangeTaDaApp}
                step="0.01"
              />
            </div>
            <div className='w-full sm:w-[47%]'>
              <Input
                className='!h-11 !rounded-6'
                type='file'
                label="Fuel Voucher"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    await handleTaDaFileUpload(file, 'fuel_voucher');
                  }
                }}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              {taDaUploadedFiles.fuel_voucher && (
                <small className="text-green-600 text-xs mt-1 block">✓ Fuel voucher uploaded</small>
              )}
            </div>
          </div>

          <div className='flex flex-col sm:flex-row justify-between gap-4'>
            <div className='w-full sm:w-[47%]'>
              <Input
                className='!h-11 !rounded-6'
                type='number'
                label="Toll Tax"
                placeholder='0.00'
                name="toll_tax"
                value={taDaAppValue.toll_tax}
                onChange={handleChangeTaDaApp}
                step="0.01"
              />
            </div>
            <div className='w-full sm:w-[47%]'>
              <Input
                className='!h-11 !rounded-6'
                type='file'
                label="Toll Voucher"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    await handleTaDaFileUpload(file, 'toll_voucher');
                  }
                }}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              {taDaUploadedFiles.toll_voucher && (
                <small className="text-green-600 text-xs mt-1 block">✓ Toll voucher uploaded</small>
              )}
            </div>
          </div>

          <div className='flex flex-col sm:flex-row justify-between gap-4'>
            <div className='w-full sm:w-[47%]'>
              <Input
                className='!h-11 !rounded-6'
                type='number'
                label="Miscellaneous"
                placeholder='0.00'
                name="misc"
                value={taDaAppValue.misc}
                onChange={handleChangeTaDaApp}
                step="0.01"
              />
            </div>
            <div className='w-full sm:w-[47%]'>
              <Input
                className='!h-11 !rounded-6'
                type='file'
                label="Misc Voucher"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    await handleTaDaFileUpload(file, 'misc_voucher');
                  }
                }}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              {taDaUploadedFiles.misc_voucher && (
                <small className="text-green-600 text-xs mt-1 block">✓ Misc voucher uploaded</small>
              )}
            </div>
          </div>

          <div className='w-full'>
            <Input
              className='!h-11 !rounded-6'
              type='number'
              label="Hotel Charges"
              placeholder='0.00'
              name="hotel_charges"
              value={taDaAppValue.hotel_charges}
              onChange={handleChangeTaDaApp}
              step="0.01"
            />
          </div>

          <div className='border-t pt-4 sm:pt-6'>
            <h4 className='text-xs sm:text-sm font-semibold text-gray-700 mb-3 sm:mb-4'>Daily Allowance (if any)</h4>
            <div className='flex flex-col sm:flex-row justify-between gap-4'>
              <div className='w-full sm:w-[47%]'>
                <Input
                  className='!h-11 !rounded-6'
                  type='number'
                  label="Allowance Rate"
                  placeholder='0.00'
                  name="DA_rate"
                  value={taDaAppValue.DA_rate}
                  onChange={handleChangeTaDaApp}
                  step="0.01"
                />
              </div>
              <div className='w-full sm:w-[47%]'>
                <Input
                  className='!h-11 !rounded-6'
                  type='number'
                  label="DA Claimed Days"
                  placeholder='0'
                  name="DA_claimed_days"
                  value={taDaAppValue.DA_claimed_days}
                  onChange={handleChangeTaDaApp}
                />
              </div>
            </div>
          </div>

          <div className='flex justify-end pt-4'>
            <Button
              color="blue"
              type="submit"
              disabled={isUploading}
              className='px-6 py-2 rounded-lg capitalize font-medium text-sm'
              size="lg"
            >
              {isUploading ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}

export default TaApplication