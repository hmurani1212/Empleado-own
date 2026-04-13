import React, { useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import useShiftManagement from "../../ViewModel/ShiftManagementViewModel/ShiftManagementServices";
import ShiftCards from "./ShiftCards";
import TeamCards from "./TeamCards";
import TeamMemberCard from "./TeamMemberCard";
import CustomDialog from "../../Components/CustomDialog/CustomDialog";
import RotatorSetting from "./RotatorSetting";
import noResult from "../../assets/employee_side_images/no record found.gif";
import {
  PlannerSidebarSkeleton,
  PlannerMainShiftsSkeleton,
  PlannerMainTeamsSkeleton,
  PlannerMainMembersSkeleton,
} from "./ShiftPlannersSkeletons";

const PlannerSidebar = ({
  widthClass,
  loadingPlannersList,
  allShiftData,
  selectedShift,
  handlePlannerSwitch,
  handleCreateNewShift,
}) => (
  <div
    className={`flex flex-col ${widthClass} w-full bg-[#F8F9FA] rounded-[10px] h-[500px]`}
  >
    {loadingPlannersList ? (
      <PlannerSidebarSkeleton />
    ) : (
      <>
        <div className="flex justify-between items-center bg-white drop-shadow-sm rounded-tl-[10px] px-4 py-2 h-[50spx]">
          <span className="text-[14px] font-medium font-Urbanist text-[#474747]">
            All Planners
          </span>

          <button
            className="cursor-pointer flex items-center gap-2 hover:underline text-[#474747] font-Urbanist text-[12px] font-normal"
            onClick={handleCreateNewShift}
          >
            Add new Planner
            <div className="bg-bgBlue rounded-xl p-2">
              <FaPlus className="text-[16px] text-white" />
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 pl-2 py-2 flex-1 min-h-0 overflow-y-auto">
          {allShiftData?.map((ele, i) => (
            <div
              className={`relative py-1  hover:bg-gray-100 rounded-tl-full rounded-bl-full ${
                selectedShift?.id === ele.id
                  ? "bg-white rounded-tl-full rounded-bl-full"
                  : ""
              }`}
              onClick={() => handlePlannerSwitch(ele)}
              key={i}
            >
              <div className="shadow-none cursor-pointer rounded-[5px] w-full">
                <div className="py-2 px-6 text-[14px] font-Urbanist font-medium text-[#616161]">
                  {ele.name || ele.planner_name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    )}
  </div>
);

const ShiftPlanners = () => {
  const {
    allShiftData,
    allRotatorStatus,
    gettingAllShift,
    loadingPlannersList,
    loadingPlannerShifts,
    loadingShiftTeams,
    loadingShiftTeamMembers,
    getAllBranchesShift,
    teamMember,
    handleCreateNewShift,
    handleRotator,
    mountShift,
    handleAddMember,
    selectedShift,
    handleCardClick,
    handleBackToGrid,
    shiftPlannersData,
    handleShiftCard,
    newShift,
    allShiftTeams,
    handleTeamCard,
    allTeamMembers,
    handleAddTeam,
    handleNewShift,
    handleDialogRotator,
    openDialogRotator,
    allRotatorClock,
    clearAllPlannerData,
    resetNestedStates,
  } = useShiftManagement();

  useEffect(() => {
    if (!mountShift) {
      gettingAllShift();
      getAllBranchesShift();
    }
  }, []);

  // Wrapper function to reset nested states when switching planners
  const handlePlannerSwitch = (planner) => {
    // Check if switching to a different planner
    const currentPlannerId = selectedShift?.id || selectedShift?.planner_id;
    const newPlannerId = planner.id || planner.planner_id;
    const isDifferentPlanner =
      selectedShift && currentPlannerId !== newPlannerId;

    // Reset nested states and clear all old data when switching planners
    if (isDifferentPlanner || !selectedShift) {
      // Clear all planner-related data (shifts, teams, team members)
      clearAllPlannerData();

      // Reset all nested states (teamMember and newShift) to ensure teams section doesn't appear
      resetNestedStates();
    }

    // Set the new planner and fetch its shifts
    handleCardClick(planner);
  };

  return (
    <div className="flex flex-col py-2 gap-4 lg:px-2 md:px-2 px-0">
      <div className="text-[20px] font-Urbanist font-semibold text-[#474747]">
        Shift Management
      </div>
      <div className="flex flex-col">
        <div className="bg-white rounded-lg drop-shadow-md space-y-4 rounded-[10px] h-full">
          {teamMember ? (
            <div>
              <div className="flex lg:flex-nowrap flex-wrap w-full">
                {/* Left panel */}
                <PlannerSidebar
                  widthClass="lg:w-1/3"
                  loadingPlannersList={loadingPlannersList}
                  allShiftData={allShiftData}
                  selectedShift={selectedShift}
                  handlePlannerSwitch={handlePlannerSwitch}
                  handleCreateNewShift={handleCreateNewShift}
                />

                {/* Right panel */}
                <div className="w-full flex flex-col h-[500px] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-white shadow-sm rounded-tr-[10px] h-[48px]">
                    <div>
                      <span className="text-[14px] font-medium font-Urbanist text-bgBlue">
                        {selectedShift.name || selectedShift.planner_name}
                      </span>
                    </div>
                    <div className="flex justify-end gap-3">
                      {/* <CustomButton onClick={handleBackToGrid} title="Back to Planner" /> */}
                      <button
                        onClick={handleBackToGrid}
                        className="text-[12px] flex items-center justify-center text-white font-medium hover:drop-shadow-md font-Urbanist bg-bgBlue rounded-[8px] px-4 py-2 cursor-pointer"
                      >
                        Back to Planner
                      </button>
                      <button
                        onClick={() => handleRotator(selectedShift)}
                        className="text-[12px] flex items-center justify-center text-white font-medium hover:drop-shadow-md font-Urbanist bg-bgBlue rounded-[8px] px-4 py-2 cursor-pointer"
                      >
                        Rotator Setting
                      </button>
                      {/* <CustomButton
                    onClick={() => handleNewShift(selectedShift)}
                    title="Create New Shift"
                  /> */}
                      {/* <CustomButton
                    onClick={() => handleRotator(selectedShift)}
                    title="Rotator Setting"
                  /> */}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-4 overflow-y-auto pr-2">
                    {/* <div className='flex justify-end gap-3'>
                <CustomButton onClick={handleBackToGrid} title='Back to Teams'/>
                <CustomButton onClick={() => handleAddMember(teamMember)} title='Add Member'/>
                <CustomButton onClick={() => handleRotator(selectedShift)} title='Rotator Setting'/>   
              </div> */}

                    <div className="p-4">
                      <div className="">
                        <div className="flex gap-6">
                          {loadingShiftTeams ? (
                            <PlannerMainTeamsSkeleton />
                          ) : allShiftTeams.length > 0 ? (
                            <TeamCards
                              display={"flex flex-col gap-4"}
                              allShiftTeams={allShiftTeams}
                              handleTeamCard={handleTeamCard}
                            />
                          ) : (
                            <div>No team defined</div>
                          )}

                          <div className="flex gap-4">
                            <div
                              onClick={() => handleAddMember(teamMember)}
                              className="flex flex-col items-center justify-center bg-[#EFF8FF] border border-dashed border-bgBlue rounded-[10px] p-4 cursor-pointer w-auto min-w-[140px] max-w-[180px] h-[75px] space-y-2"
                            >
                              <button className="text-[12px] flex items-center justify-center text-white font-medium hover:drop-shadow-md font-Urbanist bg-bgBlue rounded-full p-2 cursor-pointer">
                                <FaPlus className="text-[16px] text-white" />
                              </button>
                              <span className="text-[11px] font-medium font-Urbanist text-[#474747] hover:underline text-center">
                                Add new member
                              </span>
                            </div>
                            <div className="flex-1">
                              {loadingShiftTeamMembers ? (
                                <PlannerMainMembersSkeleton />
                              ) : allTeamMembers.length > 0 ? (
                                <TeamMemberCard
                                  display={"flex flex-wrap gap-4"}
                                  allTeamMembers={allTeamMembers}
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center py-20">
                                  <img
                                    src={noResult}
                                    alt="no result"
                                    className="w-80"
                                  />
                                  <span className="text-[#474747] font-medium font-Urbanist text-[16px] mt-4">
                                    No Employees Found
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex p-4 space-x-4">
                    {/* <div className="flex flex-col gap-4">
                  {allShiftData.length > 0 ? (
                    <TeamCards
                      display="flex flex-col gap-4"
                      shiftPlannersData={shiftPlannersData}
                      handleShiftCard={handleShiftCard}
                    />
                  ) : (
                    <p>No shift defined yet</p>
                  )}
                </div> */}

                    {/* <div className='flex gap-4'>
                      {allShiftTeams.length > 0 ? (
                      <TeamCards
                      display = {'flex grid grid-cols-3 gap-4'} 
                      allShiftTeams = {allShiftTeams}
                      handleTeamCard = {handleTeamCard}
                      />
                    ) : (
                    <div>No team defined</div>
                    )}
                  </div>  */}
                  </div>
                </div>
              </div>
            </div>
          ) : newShift ? (
            <div>
              <div className="flex lg:flex-nowrap flex-wrap gap-4 w-full">
                {/* Left panel */}
                <PlannerSidebar
                  widthClass="lg:w-1/3"
                  loadingPlannersList={loadingPlannersList}
                  allShiftData={allShiftData}
                  selectedShift={selectedShift}
                  handlePlannerSwitch={handlePlannerSwitch}
                  handleCreateNewShift={handleCreateNewShift}
                />

                {/* Right panel */}
                <div className="w-full flex flex-col max-h-[500px] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-white shadow-sm h-[48px]">
                    <div>
                      <span className="text-[14px] font-medium font-Urbanist text-bgBlue">
                        {selectedShift.name || selectedShift.planner_name}
                      </span>
                    </div>
                    <div className="flex justify-end gap-3">
                      {/* <CustomButton onClick={handleBackToGrid} title="Back to Planner" /> */}
                      <button
                        onClick={() => handleNewShift(selectedShift)}
                        className="text-[12px] flex items-center justify-center text-white font-medium hover:drop-shadow-md font-Urbanist bg-bgBlue rounded-[8px] px-4 py-2 cursor-pointer"
                      >
                        Create New Shift
                      </button>
                      <button
                        onClick={() => handleRotator(selectedShift)}
                        className="text-[12px] flex items-center justify-center text-white font-medium hover:drop-shadow-md font-Urbanist bg-bgBlue rounded-[8px] px-4 py-2 cursor-pointer"
                      >
                        Rotator Setting
                      </button>
                      {/* <CustomButton
                    onClick={() => handleNewShift(selectedShift)}
                    title="Create New Shift"
                  /> */}
                      {/* <CustomButton
                    onClick={() => handleRotator(selectedShift)}
                    title="Rotator Setting"
                  /> */}
                    </div>
                  </div>

                  <div className="flex overflow-y-auto p-4 space-x-4">
                    <div className="flex flex-col gap-4">
                      {loadingPlannerShifts ? (
                        <PlannerMainShiftsSkeleton />
                      ) : shiftPlannersData.length > 0 ? (
                        <ShiftCards
                          display="flex flex-col gap-4"
                          shiftPlannersData={shiftPlannersData}
                          handleShiftCard={handleShiftCard}
                        />
                      ) : (
                        <p>No shift defined yet</p>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <div
                        onClick={() => handleAddTeam(newShift)}
                        className="flex flex-col items-center justify-center bg-[#EFF8FF] border border-dashed border-bgBlue rounded-[10px] p-3 h-[120px] cursor-pointer w-auto min-w-[140px] max-w-[180px] space-y-2"
                      >
                        <button className="text-[12px] flex items-center justify-center text-white font-medium hover:drop-shadow-md font-Urbanist bg-bgBlue rounded-full p-2 cursor-pointer">
                          <FaPlus className="text-[16px] text-white" />
                        </button>
                        <span className="text-[11px] font-medium font-Urbanist text-[#474747] hover:underline text-center">
                          Create New Team
                        </span>
                      </div>
                      <div className="flex-1">
                        {loadingShiftTeams ? (
                          <PlannerMainTeamsSkeleton />
                        ) : allShiftTeams.length > 0 ? (
                          <TeamCards
                            display={"flex flex-wrap gap-4"}
                            allShiftTeams={allShiftTeams}
                            handleTeamCard={handleTeamCard}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center py-20">
                            <img
                              src={noResult}
                              alt="no result"
                              className="w-80"
                            />
                            <span className="text-[#474747] font-medium font-Urbanist text-[16px] mt-4">
                              No Teams Found
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-4">
                {/* <div className='flex justify-end gap-3'>
                  <CustomButton onClick={handleBackToGrid} title='Back to Shifts'/>
                  <CustomButton onClick={() => handleAddTeam(newShift)} title='Add Team'/>
                  <CustomButton onClick={() =>handleRotator(selectedShift)} title='Rotator Setting'/>   
                </div> */}

                <div>
                  <div className="flex gap-6">
                    {/* {shiftPlannersData?.length > 0 ? (
                    <ShiftCards
                      display = {'flex flex-col gap-4'}
                      shiftPlannersData={shiftPlannersData} 
                      handleShiftCard={handleShiftCard}
                    />) : (
                    <p>No shift defined yet</p>
                  )} */}
                  </div>
                </div>
              </div>
            </div>
          ) : selectedShift ? (
            <div className="flex lg:flex-nowrap flex-wrap gap-4">
              {/* Left panel */}
              <PlannerSidebar
                widthClass="lg:w-1/3"
                loadingPlannersList={loadingPlannersList}
                allShiftData={allShiftData}
                selectedShift={selectedShift}
                handlePlannerSwitch={handlePlannerSwitch}
                handleCreateNewShift={handleCreateNewShift}
              />

              {/* Right panel */}
              <div className="w-full h-[500px] flex flex-col overflow-hidden">
                {/* Header – fixed */}
                <div className="flex items-center justify-between px-4 py-2 bg-white shadow-sm h-[48px]">
                  <span className="text-[14px] font-medium font-Urbanist text-bgBlue">
                    {selectedShift.name || selectedShift.planner_name}
                  </span>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleNewShift(selectedShift)}
                      className="text-[12px] text-white bg-bgBlue px-4 py-2 rounded-[8px]"
                    >
                      Create New Shift
                    </button>
                    <button
                      onClick={() => handleRotator(selectedShift)}
                      className="text-[12px] text-white bg-bgBlue px-4 py-2 rounded-[8px]"
                    >
                      Rotator Setting
                    </button>
                  </div>
                </div>

                {/* Content – scrolls ONLY if needed */}
                <div className="flex-1 overflow-y-auto p-4">
                  {loadingPlannerShifts ? (
                    <PlannerMainShiftsSkeleton />
                  ) : shiftPlannersData.length > 0 ? (
                    <ShiftCards
                      display="flex flex-col gap-4"
                      shiftPlannersData={shiftPlannersData}
                      handleShiftCard={handleShiftCard}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <img src={noResult} alt="no result" className="w-80" />
                      <span className="mt-4 text-[16px] font-Urbanist text-[#474747]">
                        No Shifts Found
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex lg:flex-nowrap flex-wrap gap-4">
              {/* Left panel */}
              <PlannerSidebar
                widthClass="lg:w-1/4"
                loadingPlannersList={loadingPlannersList}
                allShiftData={allShiftData}
                selectedShift={selectedShift}
                handlePlannerSwitch={handlePlannerSwitch}
                handleCreateNewShift={handleCreateNewShift}
              />

              {/* Right panel - No Planner Selected */}
              <div className="flex-1 bg-white rounded-[10px] flex items-center justify-center">
                <div className="flex flex-col items-center justify-center py-20">
                  <img src={noResult} alt="no result" className="w-80" />
                  <span className="text-[#474747] font-medium font-Urbanist text-[16px] mt-4">
                    No Planner is Selected
                  </span>
                </div>
              </div>
            </div>
          )}

          <CustomDialog
            openDialog={openDialogRotator}
            handleOpen={handleDialogRotator}
            showBtns={false}
            title="Rotator Settings"
            size="lg"
            compo={
              <RotatorSetting
                allRotatorStatus={allRotatorStatus}
                allRotatorClock={allRotatorClock}
              />
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ShiftPlanners;