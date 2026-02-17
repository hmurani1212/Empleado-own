import { Button, Checkbox, Input, Textarea } from '@material-tailwind/react';
import React, { useEffect, useRef } from 'react';
import useNotice from '../../ViewModel/NoticeViewModel/NoticeServices';
import CustomSelect from '../../Components/CustomSelect/CustomSelect';
import { Loader2 } from 'lucide-react';

const AddNotice = () => {
  const {
    noticesBranches,
    addNoticeValue,
    getBranchesOnly,
    handleAddNoticeBranch,
    employeeOptions,
    addNewNotice,
    filterDepartmentsNotices,
    handleCheckboxChange,
    handleNewNotice,
    handleNoticesSearchEmp,
    showEmployeeName,
    loading,
  } = useNotice();

  const hasFetchedBranches = useRef(false);

  useEffect(() => {
    if (!hasFetchedBranches.current) {
      getBranchesOnly();
      hasFetchedBranches.current = true;
    }
  }, [getBranchesOnly]);

  return (
    <div className="bg-white rounded-2xl">
      <form onSubmit={addNewNotice} className="flex flex-col gap-6 p-4">

        {/* Branch */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">
              Target Branch
            </label>
            <CustomSelect
              placeHolderTitle="Select Branch"
              value={addNoticeValue.branch_id}
              options={noticesBranches?.map((branch) => ({
                value: branch.id,
                label: branch.branch_name,
              }))}
              onChangeHandler={(option) =>
                handleAddNoticeBranch('branch_id', option)
              }
              customStyles={false}
            />
          </div>

          {/* Send to specific employee */}
          <div className="flex items-center">
            <Checkbox
              color="blue"
              label="Send to specific employee only"
              checked={showEmployeeName}
              onChange={handleCheckboxChange}
            />
          </div>
        </div>

        {/* Employee + Department (Conditional) */}
        {showEmployeeName && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">
                Employee
              </label>
              <CustomSelect
                placeHolderTitle="Search Employee by Name or ID"
                name="emp_id"
                value={addNoticeValue.emp_id}
                options={employeeOptions}
                onHandleSelectSearch={handleNoticesSearchEmp}
                onChangeHandler={(option) =>
                  handleAddNoticeBranch('emp_id', option)
                }
                customStyles={false}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">
                Department
              </label>
              <CustomSelect
                placeHolderTitle="Select Department"
                value={addNoticeValue.deptt_id}
                options={filterDepartmentsNotices?.map((dept) => ({
                  value: dept.id,
                  label: dept.name,
                }))}
                onChangeHandler={(option) =>
                  handleAddNoticeBranch('deptt_id', option)
                }
                customStyles={false}
              />
            </div>
          </div>
        )}

        {/* Notice Content */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">
              Title
            </label>
            <Input
              type="text"
              color="blue"
              placeholder="Enter notice title"
              value={addNoticeValue.title}
              name="title"
              onChange={handleNewNotice}
              labelProps={{ className: 'hidden' }}
              className="!border !border-gray-200 bg-white text-gray-900 focus:!border-blue-500 rounded-lg"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">
              Details
            </label>
            <Textarea
              color="blue"
              placeholder="Write the notice content here..."
              name="notice"
              value={addNoticeValue.notice}
              onChange={handleNewNotice}
              labelProps={{ className: 'hidden' }}
              className="!border !border-gray-200 bg-white text-gray-900 focus:!border-blue-500 rounded-lg min-h-[120px]"
            />
          </div>
        </div>

        {/* Notification Options */}
        <div className="flex gap-6 py-2 border-t border-gray-100">
          <Checkbox
            color="blue"
            label="Send SMS"
            name="send_sms_notice"
            checked={addNoticeValue.send_sms_notice}
            onChange={handleNewNotice}
          />
          <Checkbox
            color="blue"
            label="Send Email"
            name="send_email_notice"
            checked={addNoticeValue.send_email_notice}
            onChange={handleNewNotice}
          />
        </div>

        {/* Buttons */}
        <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button
            variant="text"
            color="gray"
            className="capitalize"
          >
            Cancel
          </Button>

          <Button
            color="blue"
            type="submit"
            disabled={loading}
            className="min-w-[120px] flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              'Add Notice'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddNotice;