import { Button, Checkbox, Input, Textarea } from '@material-tailwind/react';
import React, { useEffect, useRef, useState } from 'react';
import useNotice from '../../ViewModel/NoticeViewModel/NoticeServices';
import CustomSelect from '../../Components/CustomSelect/CustomSelect';
import { Loader2 } from 'lucide-react';
import { getContentByLabel } from '../../services/getContentService';
import { showToast } from '../../Components/Toaster/Toaster';
import PortalDrawer from '../../Components/CustomDrawer/PortalDrawer';
import { FaInfoCircle } from 'react-icons/fa';

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

  const [contentDrawerOpen, setContentDrawerOpen] = useState(false);
  const [contentData, setContentData] = useState(null);
  const [contentLang, setContentLang] = useState('ENGLISH');
  const [contentLoading, setContentLoading] = useState(false);

  const openContentDrawer = async (contentLabel) => {
    setContentDrawerOpen(true);
    setContentLang('ENGLISH');
    setContentLoading(true);
    setContentData(null);
    try {
      const res = await getContentByLabel(contentLabel);
      if (res?.STATUS === 'SUCCESSFUL' && res?.DATA?.[0]?.contents?.length) {
        setContentData(res.DATA[0]);
      } else {
        showToast('Content not available', 'error');
        setContentDrawerOpen(false);
      }
    } catch (err) {
      showToast('Failed to load content', 'error');
      setContentDrawerOpen(false);
    } finally {
      setContentLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetchedBranches.current) {
      getBranchesOnly();
      hasFetchedBranches.current = true;
    }
  }, [getBranchesOnly]);

  return (
    <div className="bg-white rounded-2xl">
      <form onSubmit={addNewNotice} className="flex flex-col gap-6 p-4">

        {/* Branch and Department */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Select Branch
              </label>
              <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer('BRANCH_NOTICES_EMP')} />
            </div>
            <CustomSelect
              placeHolderTitle="Select Branch"
              value={addNoticeValue.branch_id}
              options={noticesBranches?.map((branch) => ({
                value: branch.id === '0' ? 0 : branch.id,
                label: branch.branch_name,
              }))}
              onChangeHandler={(option) =>
                handleAddNoticeBranch('branch_id', option)
              }
              customStyles={false}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
<label className="text-sm font-semibold text-gray-700">
              Select Department
              </label>
              <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer('DEPARTMENT_NOTICES_EMP')} />
            </div>
            <CustomSelect
              placeHolderTitle={addNoticeValue.branch_id ? "Select Department" : "Select branch first"}
              value={addNoticeValue.deptt_id}
              options={(filterDepartmentsNotices || []).map((dept) => ({
                value: dept.id === '0' ? 0 : dept.id,
                label: dept.name,
              }))}
              onChangeHandler={(option) =>
                handleAddNoticeBranch('deptt_id', option)
              }
              customStyles={false}
              disabled={!addNoticeValue.branch_id}
            />
          </div>
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

        {/* Employee (when Send to specific employee only) */}
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
          </div>
        )}

        {/* Notice Content */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Title
              </label>
              <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer('NOTICETITLE_NOTICES_EMP')} />
            </div>
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
            <div className="flex items-center gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Details
              </label>
              <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer('NOTICEDETAIL_NOTICES_EMP')} />
            </div>
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

      <PortalDrawer
        open={contentDrawerOpen}
        closeDrawer={() => setContentDrawerOpen(false)}
        direction="right"
        widthSize="45vw"
        title={
          contentData?.contents?.find((c) => c.lang === contentLang)?.main_heading ?? ''
        }
        compo={
          <div className="flex flex-col gap-4">
            {contentLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-[#3DA5F4] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : contentData?.contents?.length ? (
              <>
                <div
                  className="text-gray-800 text-sm font-Urbanist leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html:
                      contentData.contents.find((c) => c.lang === contentLang)?.content ??
                      contentData.contents.find((c) => c.lang === 'ENGLISH')?.content ??
                      '',
                  }}
                />
                <div className="flex gap-2 mt-4 border-t border-gray-200 pt-4">
                  <Button
                    size="sm"
                    className={`flex-1 font-Urbanist text-[12px] ${
                      contentLang === 'ENGLISH' ? 'bg-[#3DA5F4] text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                    onClick={() => setContentLang('ENGLISH')}
                  >
                    ENGLISH
                  </Button>
                  <Button
                    size="sm"
                    className={`flex-1 font-Urbanist text-[12px] ${
                      contentLang === 'URDU' ? 'bg-[#3DA5F4] text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                    onClick={() => setContentLang('URDU')}
                  >
                    URDU
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        }
      />
    </div>
  );
};

export default AddNotice;