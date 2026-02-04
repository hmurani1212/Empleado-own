import React from "react";
import { hexToRGBA, titleNameAlpha } from "../../services/appServices";

const InboxList = (props) => {
  const {
    data,
    activeInbox,
    inboxViewValue,
    handleEmployeeClick,
    isEmployeeDetailView,
    handleBackToEmployeeList
  } = props;
  
  // Add safety check for emp_name
  const employeeName = data?.emp_name || data?.full_name || 'Unknown Employee';
  const { bgColor } = titleNameAlpha(employeeName);
  const rgbaColor = hexToRGBA(bgColor, 0.3);

  const handleClick = () => {
    if (isEmployeeDetailView) {
      // If we're in detail view, this click should go back to employee list
      handleBackToEmployeeList();
    } else {
      // If we're in employee list view, this click should show employee details
      handleEmployeeClick(data);
    }
  };

  return (
    <div
      className={`flex items-center gap-2 px-2 py-6 cursor-pointer border-b border-b-customGray-300 
                ${
                  data.id === activeInbox
                    ? "bg-customGray-200 border-r-2 !border-r-customBlue"
                    : "bg-white"
                } 
                ${
                  inboxViewValue.showApplications
                    ? "border-r border-r-customGray-300"
                    : ""
                }`}
      onClick={handleClick}
    >
      <div className="">
        <img
          src={`https://emp-beta.veevotech.com${data.emp_image}`}
          alt={`image-${data.id}`}
          className="h-10 w-10 object-fill rounded-xl overflow-hidden transition-transform duration-300 ease-in-out"
          // onError={(e) => {
          //   e.target.src = "https://emp-beta.veevotech.com/images/icons/empm.jpg";
          // }}
        />
      </div>

      {inboxViewValue.showApplications ? (
        <div className="w-full h-full">
          <span
            className={`${
              !inboxViewValue.showSideMenu
                ? "h-10 w-10 rounded-lg flex items-center justify-center"
                : ""
            } text-nowrap text-ellipsis transition-transform duration-300 ease-in-out`}
            style={{
              color: !inboxViewValue.showSideMenu ? bgColor : "",
              border: !inboxViewValue.showSideMenu ? bgColor : "",
              backgroundColor: !inboxViewValue.showSideMenu ? rgbaColor : "",
            }}
          >
            {inboxViewValue.showSideMenu ? data.title : data.title[0]}
          </span>
        </div>
      ) : (
        <div className="flex justify-between items-center text-customBlack-100 text-[14px] w-full">
          <span className="transition-transform duration-300 ease-in-out flex-1">
            {employeeName}
          </span>
          <span className="text-end ml-2">{data.stories || 1}</span>
        </div>
      )}
    </div>
  );
};

export default InboxList;
