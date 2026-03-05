import { Typography, Badge, Button, IconButton } from "@material-tailwind/react";
import React, { useEffect, useState } from "react";
import { FaThumbsUp, FaThumbsDown, FaTrophy } from "react-icons/fa";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import useFeedbackServices from "../../ViewModel/PerformnaceViewModel/feedbackServices";
import CustomButton from "../../Components/CustomButton/CustomButton";
import { motion } from "framer-motion";

const Feedback = () => {
  const {
    feedbackValue,
    feedbackData,
    gettingFeedback,
    handleSearchFeedback,
    getFeedbackIcon,
    getFeedbackColor,
    showQuickFeedback,
    toggleQuickFeedback,
    performanceList,
    selectedPerformance,
    handlePerformanceSelect,
    performanceLoading,
    employees,
    employeesLoading,
    selectedEmployee,
    handleEmployeeSelect,
    feedbackText,
    setFeedbackText,
    selectedThumb,
    handleThumbSelect,
    handleSubmitFeedback,
    handleCancelFeedback,
    isSubmitting,
    feedbackLoading,
  } = useFeedbackServices();

  // console.log('selectedEmployee selectedEmployee', selectedEmployee)

  const tableHeader = [
    "Emp ID",
    "Employee Name",
    "Thumbs Up",
    "Thumbs Down",
    "Awards",
    "Total Feedback",
    "Comment",
  ];

  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [selectedFeedbackForComments, setSelectedFeedbackForComments] = useState(null);

  const openCommentsModal = (feedback) => {
    if (!feedback?.comment?.length) return;
    setSelectedFeedbackForComments(feedback);
    setCommentsModalOpen(true);
  };

  const closeCommentsModal = () => {
    setCommentsModalOpen(false);
    setSelectedFeedbackForComments(null);
  };

  useEffect(() => {
    gettingFeedback();
  }, [gettingFeedback]);

  const renderQuickFeedbackForm = () => (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <div className="mb-6">
        <Typography className="text-[16px] text-[#474747] font-medium font-Urbanists">
          To provide feedback, click on the preferred award.
        </Typography>
      </div>

      {/* Select Performance - populates employees when selected */}
      <div className="mb-6">
        <label className="text-[#474747] text-[12px] px-2 font-medium font-Urbanist block mb-2">
          Select Performance
        </label>
        <CustomSelect
          placeHolderTitle={performanceLoading ? "Loading..." : "Select Performance"}
          cStyle={true}
          value={selectedPerformance}
          options={performanceList}
          onChangeHandler={handlePerformanceSelect}
          isDisabled={isSubmitting || performanceLoading}
        />
      </div>

      {/* Awards Section */}
      <div className="mb-6 ">
        <Typography className="mb-4 text-[14px] text-[#474747] font-medium font-Urbanists">
          Awards
        </Typography>
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => handleThumbSelect("1")}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
              selectedThumb === "1"
                ? "bg-green-800 scale-110 shadow-lg"
                : "bg-green-400 hover:bg-green-500"
            }`}
          >
            <FaThumbsUp className="text-white text-xl" />
          </button>
          <button
            onClick={() => handleThumbSelect("0")}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
              selectedThumb === "0"
                ? "bg-red-800 scale-110 shadow-lg"
                : "bg-red-400 hover:bg-red-500"
            }`}
          >
            <FaThumbsDown className="text-white text-xl" />
          </button>
          <button
            onClick={() => handleThumbSelect("2")}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
              selectedThumb === "2"
                ? "bg-orange-800 scale-110 shadow-lg"
                : "bg-orange-400 hover:bg-orange-500"
            }`}
          >
            <FaTrophy className="text-white text-xl" />
          </button>
        </div>
      </div>

      {/* Feedback Text Input */}
      <div className="mb-6">
        <textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="Enter text for feedback..."
          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none resize-none"
          disabled={isSubmitting}
        />
      </div>

      {/* Employee Selection - populated when a performance is selected */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <label className="text-[#474747] text-[12px] px-2 font-medium font-Urbanist">
            Select Employee
          </label>
          <CustomSelect
            placeHolderTitle={
              !selectedPerformance
                ? "Select performance first"
                : employeesLoading
                ? "Loading employees..."
                : "Select Employee"
            }
            cStyle={true}
            value={selectedEmployee}
            options={employees}
            onChangeHandler={handleEmployeeSelect}
            isDisabled={isSubmitting || !selectedPerformance || employeesLoading}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <CustomButton
          variant="filled"
          color="blue"
          onClick={handleSubmitFeedback}
          disabled={isSubmitting}
          className="flex items-center gap-2"
          title={isSubmitting ? "Submitting..." : "Submit"}
        >
          {/* {isSubmitting ? "Submitting..." : "Submit"} */}
        </CustomButton>
        <Button
          variant="outlined"
          color="gray"
          onClick={handleCancelFeedback}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 py-2 pb-1">
      <div className="flex items-end justify-end">
        <CustomButton
          variant="filled"
          color="blue"
          onClick={toggleQuickFeedback}
          className="bg-[#8bc9f8]"
          title="Quick Feedback"
        >
          {/* Quick Feedback */}
        </CustomButton>
      </div>

      {showQuickFeedback ? (
        renderQuickFeedbackForm()
      ) : (
        <div className="bg-white rounded-xl shadow-card p-1 border border-gray-100 overflow-hidden">
          <div className="relative w-full min-h-[calc(100vh-200px)] overflow-auto scrollbarHidden">
            <table className="min-w-full table-fixed text-center border-collapse">
              <colgroup>
                <col span="7" />
              </colgroup>
              <thead className="sticky top-0 z-20 bg-gray-50 shadow-sm">
                <tr>
                  {tableHeader?.map((head, i) => (
                    <th key={i} className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider font-poppins first:rounded-tl-lg last:rounded-tr-lg">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {feedbackLoading &&
                  [...Array(6)].map((_, rowIndex) => (
                    <tr key={rowIndex} className="animate-pulse border-b border-gray-100">
                      <td className="px-4 py-4">
                        <div className="h-4 bg-gray-100 rounded w-full max-w-[60px] mx-auto" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 bg-gray-100 rounded w-full max-w-[120px] mx-auto" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 bg-gray-100 rounded w-full max-w-[60px] mx-auto" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 bg-gray-100 rounded w-full max-w-[60px] mx-auto" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 bg-gray-100 rounded w-full max-w-[60px] mx-auto" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 bg-gray-100 rounded w-full max-w-[120px] mx-auto" />
                      </td>
                    </tr>
                  ))}
                {!feedbackLoading && feedbackData && feedbackData.length > 0 && (
                  feedbackData.map((feedback, i) => {
                    return (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-brand-50/30 transition-colors duration-200 group"
                      >
                        <td className="px-4 py-4">
                          <Typography className="text-sm font-normal text-gray-600 font-poppins">
                            {feedback.emp_id || "-"}
                          </Typography>
                        </td>
                        <td className="px-4 py-4">
                          <Typography className="text-sm font-semibold text-gray-800 font-poppins group-hover:text-brand-600 transition-colors">
                            {feedback.employee_name || "-"}
                          </Typography>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <FaThumbsUp className="text-green-500 text-base shrink-0" />
                            <Typography className="text-sm font-normal text-gray-600 font-poppins">
                              {feedback.thumbs_up ?? 0}
                            </Typography>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <FaThumbsDown className="text-red-500 text-base shrink-0" />
                            <Typography className="text-sm font-normal text-gray-600 font-poppins">
                              {feedback.thumbs_down ?? 0}
                            </Typography>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <FaTrophy className="text-amber-500 text-base shrink-0" />
                            <Typography className="text-sm font-normal text-gray-600 font-poppins">
                              {feedback.award ?? 0}
                            </Typography>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Typography className="text-sm font-normal text-gray-600 font-poppins">
                            {feedback.total_feedback || 0}
                          </Typography>
                        </td>
                        <td className="px-4 py-4 text-left max-w-[200px]">
                          {(() => {
                            const commentList = feedback.comment;
                            if (!Array.isArray(commentList) || commentList.length === 0) {
                              return (
                                <Typography className="text-sm font-normal text-gray-400 font-poppins">
                                  -
                                </Typography>
                              );
                            }
                            const firstComment = commentList[0] || "";
                            if (commentList.length === 1) {
                              return (
                                <Typography className="text-sm font-normal text-gray-600 font-poppins truncate" title={firstComment}>
                                  {firstComment}
                                </Typography>
                              );
                            }
                            return (
                              <span className="inline-flex items-center gap-1 text-sm font-normal text-gray-600 font-poppins">
                                <span className="truncate max-w-[140px]" title={firstComment}>{firstComment}</span>
                                <button
                                  type="button"
                                  onClick={() => openCommentsModal(feedback)}
                                  className="text-brand-600 hover:text-brand-700 font-medium shrink-0 focus:outline-none cursor-pointer"
                                  title="View all comments"
                                >
                                  ...
                                </button>
                              </span>
                            );
                          })()}
                        </td>
                      </motion.tr>
                    );
                  })
                )}

                {!feedbackLoading && feedbackData && feedbackData.length === 0 && (
                  <tr>
                    <td colSpan={tableHeader.length} className="p-10 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        <Typography className="font-medium">No feedback found</Typography>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Comments Modal - styled like Rate Competency modal */}
      {commentsModalOpen && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-xs flex items-center justify-center z-50"
          onClick={closeCommentsModal}
        >
          <div
            className="bg-white shadow-xl w-[480px] max-h-[80vh] rounded-lg overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Typography variant="h6" color="blue-gray" className="font-semibold">
                Comments
              </Typography>
              <IconButton
                variant="text"
                color="blue-gray"
                onClick={closeCommentsModal}
                className="hover:bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </IconButton>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {selectedFeedbackForComments && (
                <>
                  <div className="mb-4">
                    <Typography variant="small" color="blue-gray" className="font-medium mb-2">
                      {selectedFeedbackForComments.employee_name || "Employee"}
                    </Typography>
                  </div>
                  <div className="flex flex-col gap-3">
                    {Array.isArray(selectedFeedbackForComments.comment) &&
                      selectedFeedbackForComments.comment.map((text, idx) => (
                        <div
                          key={idx}
                          className="text-sm text-gray-700 font-poppins p-3 bg-gray-50 rounded-lg border border-gray-100"
                        >
                          {text}
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-3 justify-end p-4 border-t border-gray-200">
              <Button variant="outlined" color="gray" onClick={closeCommentsModal} className="px-4">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;