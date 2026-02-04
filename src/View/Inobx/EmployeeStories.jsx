import React from "react";
import { IoArrowBack } from "react-icons/io5";
import { convertDateToCustom } from "../../services/__dashboardServcies";

const EmployeeStories = ({ 
  selectedEmployee, 
  selectedEmployeeStories, 
  handleBackToEmployeeList,
  isLoading = false,
  onLoadMore,
  hasMorePages = false,
  isLoadingMore = false,
  onStoryClick,
  selectedStory
}) => {
  if (!selectedEmployee) return null;

  // Debug logging
  // console.log('EmployeeStories - hasMorePages:', hasMorePages);
  // console.log('EmployeeStories - stories count:', selectedEmployeeStories.length);

  return (
    <div className="h-full flex flex-col">
      {/* Header with back arrow and employee info */}
      <div className="flex flex-col p-3 border-b border-customGray-300 bg-white sticky top-0 z-10">
        {/* Back arrow */}
        <div className="flex justify-start mb-3">
          <button
            onClick={handleBackToEmployeeList}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-customGray-100 transition-colors"
          >
            <IoArrowBack size={20} className="text-customBlue" />
          </button>
        </div>
        
        {/* Employee info */}
        <div className="flex items-center gap-3">
          <img
            src={`https://emp-beta.veevotech.com${selectedEmployee.emp_image  ||
            'https://emp-beta.veevotech.com/images/icons/empm.jpg'
            }`}
            alt='{selectedEmployee.emp_name || selectedEmployee.full_name}'
            className="h-12 w-12 object-fill rounded-xl overflow-hidden"
            onError={(e) => {
              e.target.src = "https://emp-beta.veevotech.com/images/icons/empm.jpg";
            }}
          />
          <div>
            <h3 className="text-customBlack-100 font-semibold text-[18px]">
              {selectedEmployee.emp_name || selectedEmployee.full_name || 'Unknown Employee'}
            </h3>
          </div>
        </div>
      </div>

      {/* Stories list */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-customGray-500">Loading employee requests...</div>
          </div>
        ) : selectedEmployeeStories.length === 0 ? (
          <div className="flex items-center justify-center h-full text-customGray-500">
            <p>No requests found for this employee</p>
          </div>
        ) : (
          <div className="p-2">
            {selectedEmployeeStories.map((story, index) => (
              <div
                key={story._id || story.story_id || index}
                className={`flex items-center gap-3 p-4 border-b border-customGray-200 hover:bg-customGray-50 transition-colors cursor-pointer rounded-lg mb-2 ${
                  selectedStory && (selectedStory._id === story._id || selectedStory.story_id === story.story_id) ? 'bg-customBlue/10 border-customBlue/30' : ''
                }`}
                onClick={() => onStoryClick(story)}
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-customBlack-100 font-medium text-[15px]">
                      {story.title}
                    </h4>
                    <span className="text-customGray-500 text-[12px]">
                      {convertDateToCustom(new Date(story.entry_time).getTime() / 1000)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Load More Button - Only show if there are more pages */}
            {hasMorePages && (
              <div className="flex justify-center p-4">
                <button
                  onClick={onLoadMore}
                  disabled={isLoadingMore}
                  className={`px-6 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                    isLoadingMore
                      ? "bg-customGray-200 text-customGray-500 cursor-not-allowed"
                      : "bg-customBlue text-white hover:bg-customBlue/90"
                  }`}
                >
                  {isLoadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeStories; 