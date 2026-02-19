import { Typography, Badge, Button } from "@material-tailwind/react";
import React, { useEffect } from "react";
import { FaThumbsUp, FaThumbsDown, FaTrophy } from "react-icons/fa";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import useFeedbackServices from "../../ViewModel/PerformnaceViewModel/feedbackServices";
import CustomButton from "../../Components/CustomButton/CustomButton";

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
    employees,
    selectedEmployee,
    handleEmployeeSelect,
    feedbackText,
    setFeedbackText,
    selectedThumb,
    handleThumbSelect,
    handleSubmitFeedback,
    handleCancelFeedback,
    isSubmitting,
  } = useFeedbackServices();

  // console.log('selectedEmployee selectedEmployee', selectedEmployee)

  const tableHeader = [
    "Emp ID",
    "Employee Name",
    "Thumbs Up",
    "Thumbs Down",
    "Awards",
    "Total Feedback",
  ];

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

      {/* Employee Selection and Buttons */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <label className="text-[#474747] text-[12px] px-2 font-medium font-Urbanist">
            Select Employee
          </label>
          <CustomSelect
            placeHolderTitle="Select Employee"
            cStyle={true}
            value={selectedEmployee}
            options={employees}
            onChangeHandler={handleEmployeeSelect}
            isDisabled={isSubmitting}
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
        <div className="bg-white rounded-[10px] drop-shadow-md p-2">
          <div className="h-[calc(100vh-100px)] overflow-auto customScroll">
            <table className="w-full text-center">
              <thead className="sticky top-[0px] z-20 bg-[#F8F9FA] rounded-[8px]">
                <tr>
                  {tableHeader?.map((head, i) => (
                    <th key={i} className="bg-[#F8F9FA] p-4">
                      <Typography
                        // variant="small"
                        // color="blue-gray"
                        className="font-medium leading-none text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                      >
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {feedbackData?.map((feedback, i) => {
                  const isLast = i === feedbackData?.length - 1;
                  const classes = isLast
                    ? "p-4"
                    : "p-4 border-b border-[#F2F2F9]";

                  return (
                    <tr key={i}>
                      <td className={classes}>
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                        >
                          {feedback.emp_id}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                        >
                          {feedback.employee_name}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                        >
                          {feedback.thumbs_up}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                        >
                          {feedback.thumbs_down}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                        >
                          {feedback.award}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                        >
                          {feedback.total_feedback}
                        </Typography>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {feedbackData?.length === 0 && (
              <div className="text-center py-8">
                <Typography variant="h6" color="gray" className="font-normal">
                  No feedback found
                </Typography>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;