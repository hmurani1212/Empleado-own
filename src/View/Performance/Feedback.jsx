import { Typography, Badge, Button, IconButton } from "@material-tailwind/react";
import React, { useLayoutEffect, useState } from "react";
import { BiSearch } from "react-icons/bi";
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
    feedbackPaginationData,
    goToNextFeedbackPage,
    goToPreviousFeedbackPage,
    goToFeedbackPage,
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

  useLayoutEffect(() => {
    gettingFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount: load feedback table once
  }, []);

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
          isDisabled={isSubmitting}
          menuLoading={performanceLoading}
          menuLoadingLabel="Loading performances..."
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
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${selectedThumb === "1"
                ? "bg-green-800 scale-110 shadow-lg"
                : "bg-green-400 hover:bg-green-500"
              }`}
          >
            <FaThumbsUp className="text-white text-xl" />
          </button>
          <button
            onClick={() => handleThumbSelect("0")}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${selectedThumb === "0"
                ? "bg-red-800 scale-110 shadow-lg"
                : "bg-red-400 hover:bg-red-500"
              }`}
          >
            <FaThumbsDown className="text-white text-xl" />
          </button>
          <button
            onClick={() => handleThumbSelect("2")}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${selectedThumb === "2"
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
            isDisabled={isSubmitting || !selectedPerformance}
            menuLoading={Boolean(selectedPerformance) && employeesLoading}
            menuLoadingLabel="Loading employees..."
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
          className="cursor-pointer"
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
        <>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4">
          <div className="relative w-full sm:max-w-md sm:ml-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <BiSearch className="text-gray-400 text-lg" />
            </div>
            <input
              type="text"
              placeholder="Search feedback by employee..."
              value={feedbackValue.searchText}
              onChange={(e) => handleSearchFeedback(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 text-gray-700"
            />
            {feedbackLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
              </div>
            )}
          </div>
        </div>
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
                      <td className="px-4 py-4">
                        <div className="h-4 bg-gray-100 rounded w-full max-w-[160px] mx-auto" />
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
                        <td className="px-4 py-4 text-left max-w-[320px]">
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
                                <Typography className="text-sm font-normal text-gray-600 font-poppins break-words whitespace-pre-wrap">
                                  {firstComment}
                                </Typography>
                              );
                            }
                            return (
                              <span className="inline-flex flex-wrap items-baseline gap-1 text-sm font-normal text-gray-600 font-poppins">
                                <span className="break-words whitespace-pre-wrap">{firstComment}</span>
                                <button
                                  type="button"
                                  onClick={() => openCommentsModal(feedback)}
                                  className="text-brand-600 hover:text-brand-700 font-medium shrink-0 focus:outline-none cursor-pointer"
                                  title="View all comments"
                                >
                                  More?
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

          {/* Pagination */}
          {!feedbackLoading && feedbackData && feedbackData.length > 0 && feedbackPaginationData && feedbackPaginationData.totalPages > 1 && (
            <div className="w-full flex justify-center items-center gap-2 mt-6 mb-2">
              <button
                title="Previous Page"
                disabled={feedbackPaginationData.currentPage <= 1}
                className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                  feedbackPaginationData.currentPage > 1
                    ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                    : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                }`}
                onClick={goToPreviousFeedbackPage}
              >
                ‹
              </button>
              <div className="flex items-center gap-1.5">
                {(() => {
                  const currentPage = feedbackPaginationData.currentPage;
                  const totalPages = feedbackPaginationData.totalPages;
                  const renderPageButton = (page) => (
                    <button
                      key={page}
                      onClick={() => goToFeedbackPage(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
                        page === currentPage
                          ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                          : 'bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  );
                  if (totalPages <= 7) {
                    return Array.from({ length: totalPages }, (_, i) => i + 1).map(renderPageButton);
                  }
                  const pages = [];
                  pages.push(renderPageButton(1));
                  if (currentPage > 3) {
                    pages.push(<span key="start-ellipsis" className="text-gray-400 px-1">...</span>);
                  }
                  const startPage = Math.max(2, currentPage - 1);
                  const endPage = Math.min(totalPages - 1, currentPage + 1);
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(renderPageButton(i));
                  }
                  if (currentPage < totalPages - 2) {
                    pages.push(<span key="end-ellipsis" className="text-gray-400 px-1">...</span>);
                  }
                  pages.push(renderPageButton(totalPages));
                  return pages;
                })()}
              </div>
              <button
                title="Next Page"
                disabled={feedbackPaginationData.currentPage >= feedbackPaginationData.totalPages}
                className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                  feedbackPaginationData.currentPage < feedbackPaginationData.totalPages
                    ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                    : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                }`}
                onClick={goToNextFeedbackPage}
              >
                ›
              </button>
            </div>
          )}
        </div>
        </>
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