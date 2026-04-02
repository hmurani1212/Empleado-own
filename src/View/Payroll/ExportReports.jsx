import React, { useState } from "react";
import {
  FaFileInvoiceDollar,
  FaGift,
  FaShieldAlt,
  FaCross,
  // FaChartLine, // Overtime Report (disabled)
  FaChartBar,
  FaArrowUp,
  // FaCalendarAlt, // Availed Leaves Report (disabled)
  // FaFileAlt, // Leave Balance Sheet (disabled)
} from "react-icons/fa";
import ReportForm from "./ReportForm";
import IncrementReportForm from "./IncrementReportForm";
import IncentiveDeductionReportForm from "./IncentiveDeductionReportForm";
// import AvailedLeavesReportForm from "./AvailedLeavesReportForm";
// import LeaveBalanceSheetForm from "./LeaveBalanceSheetForm";
import useStore from "../../Store/store";

const ExportReports = () => {
  const [activeReport, setActiveReport] = useState(null);

  // Get global drawer functions from store
  const openDrawer = useStore((state) => state.openDrawer);
  const settingDrawerTitle = useStore((state) => state.settingDrawerTitle);
  const settingDrawerSize = useStore((state) => state.settingDrawerSize);
  const settingComponent = useStore((state) => state.settingComponent);

  const reportCards = [
    {
      id: 1,
      title: "Income Tax",
      icon: FaFileInvoiceDollar,
      iconColor: "text-[#0ACF97]",
      bgColor: "bg-[#0ACF97]",
      // hoverColor: 'hover:bg-green-100'
    },
    {
      id: 2,
      title: "EOBI",
      icon: FaGift,
      iconColor: "text-bgBlue",
      bgColor: "bg-bgBlue",
      // hoverColor: 'hover:bg-purple-100'
    },
    {
      id: 3,
      title: "Social Security",
      icon: FaShieldAlt,
      iconColor: "text-[#FF4979]",
      bgColor: "bg-[#FF4979]",
      // hoverColor: 'hover:bg-red-100'
    },
    {
      id: 4,
      title: "Medical Allowance",
      icon: FaCross,
      iconColor: "text-[#FDA006]",
      bgColor: "bg-[#FDA006]",
      // hoverColor: 'hover:bg-yellow-100'
    },
    // --- Disabled: Overtime Report (not needed) ---
    // {
    //   id: 5,
    //   title: "Overtime Report",
    //   icon: FaChartLine,
    //   iconColor: "text-[#ED61BC]",
    //   bgColor: "bg-[#ED61BC]",
    // },
    {
      id: 6,
      title: "Increment Report",
      icon: FaChartBar,
      iconColor: "text-[#56B6C2]",
      bgColor: "bg-[#56B6C2]",
      // hoverColor: 'hover:bg-blue-100'
    },
    {
      id: 7,
      title: "Incentive & Deduction Report",
      icon: FaArrowUp,
      iconColor: "text-[#6889D4]",
      bgColor: "bg-[#6889D4]",
      // hoverColor: 'hover:bg-[#6889D2s]'
    },
    // --- Disabled: Availed Leaves Report (not needed) ---
    // {
    //   id: 8,
    //   title: "Availed Leaves Report",
    //   icon: FaCalendarAlt,
    //   iconColor: "text-[#98C379]",
    //   bgColor: "bg-[#98C379]",
    // },
    // --- Disabled: Leave Balance Sheet (not needed) ---
    // {
    //   id: 9,
    //   title: "Leave Balance Sheet",
    //   icon: FaFileAlt,
    //   iconColor: "text-[#C69121]",
    //   bgColor: "bg-[#C69121]",
    // },
  ];

  const handleReportClick = (report) => {
    console.log("Report clicked:", report.title);

    // Handle Increment Report with global drawer
    if (report.id === 6) {
      // Increment Report has id: 6
      openDrawer();
      settingDrawerTitle("Export Increments Reports");
      settingDrawerSize(700);
      settingComponent(<IncrementReportForm />);
    }
    // Handle Incentive & Deduction Report with global drawer
    else if (report.id === 7) {
      // Incentive & Deduction Report has id: 7
      openDrawer();
      settingDrawerTitle("Export Incentive and Deduction Reports");
      settingDrawerSize(700);
      settingComponent(<IncentiveDeductionReportForm />);
    }
    // --- Disabled: Availed Leaves Report ---
    // else if (report.id === 8) {
    //   openDrawer();
    //   settingDrawerTitle("Export Availed Leaves Report");
    //   settingDrawerSize(700);
    //   settingComponent(<AvailedLeavesReportForm />);
    // }
    // --- Disabled: Leave Balance Sheet ---
    // else if (report.id === 9) {
    //   openDrawer();
    //   settingDrawerTitle("Export Leave Balance Sheet");
    //   settingDrawerSize(700);
    //   settingComponent(<LeaveBalanceSheetForm />);
    // }
    else {
      // Handle other reports with inline form
      setActiveReport(report.title);
    }
  };

  const handleCloseReport = () => {
    setActiveReport(null);
  };

  return (
    <div className="lg:px-2 md:px-2 px-0">
      {/* <div className='mb-6'>
        <h2 className='text-2xl font-bold text-gray-800 mb-2'>Export Reports</h2>
        <p className='text-gray-600'>Select a report to generate and export</p>
      </div> */}

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 justify-start">
        {reportCards.map((report) => {
          const IconComponent = report.icon;
          return (
            <div
              key={report.id}
              onClick={() => handleReportClick(report)}
              className={`
                ${report.bgColor} 
                // ${report.hoverColor}
                rounded-[15px] 
                px-4 py-9
                min-h-[92px]
                cursor-pointer 
                transition-all 
                duration-200 
                ease-in-out 
                transform 
                hover:scale-102 
                drop-shadow-sm
                flex
                items-center 
                space-x-4
                group
              `}
            >
              {/* Icon */}
              <div
                className={`
                ${report.iconColor}
                transition-transform 
                duration-200 
                group-hover:scale-105
                p-2 aspect-square h-[45px] w-[45px] flex items-center justify-center bg-white rounded-full
              `}
              >
                <IconComponent className="text-[25px]" />
              </div>

              <div className="flex flex-col">
                {/* Title */}
                <h3
                  className={` 
                  font-medium 
                  font-Poppins
                  text-sm 
                  leading-tight
                  transition-colors 
                  duration-200
                  text-white
                `}
                >
                  {report.title}
                </h3>

                {/* Hover Effect Indicator */}
                <div
                  className={`
                  w-8 
                  h-1 
                  bg-white
                  rounded-full 
                  opacity-0 
                  group-hover:opacity-100 
                  transition-opacity 
                  duration-200
                `}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Form */}
      {activeReport && (
        <ReportForm reportType={activeReport} onClose={handleCloseReport} />
      )}

      {/* Footer */}
      {/* <div className='mt-8 flex justify-center items-center py-4'>
        <div className='flex items-center gap-2 text-sm text-gray-500'>
          <span>Powered by</span>
          <span className='font-semibold text-blue-600'>Veevo Tech</span>
        </div>
      </div> */}
    </div>
  );
};

export default ExportReports;