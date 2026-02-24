import React, { useEffect } from "react";
// import { RxCross2 } from "react-icons/rx";
import { Typography } from "@material-tailwind/react";
// import { BiSolidXCircle } from "react-icons/bi";
import { FaTimes, FaUser, FaUserCheck, FaCalendar, FaFileAlt, FaUserEdit, FaFile, FaEdit } from "react-icons/fa";
import { formatTimestamp } from "../Branches/utils";
import useEmployees from "../../ViewModel/EmployeeViewModel/EmployeeServices";

function ApplicationLeave({ applicationData, onClose, applicationType }) {
  const typeStr = applicationType ? String(applicationType).toUpperCase().trim() : '';
  const isLeaveApplication = typeStr === 'LEAVE_REQUEST' || Number(applicationData?.form_id) === 7;
  const { orgLogo, getOrgLogo } = useEmployees();
  const data = [
    "Approval Index",
    "Approval Type",
    "Approve By",
    "Status",
    "Last Update Date",
  ];

  const emptyDisplay = (v) => (v != null && String(v).trim() !== "" ? String(v).trim() : "--");
  /** Normalize line endings and collapse multiple newlines to one — used only for Application Detail to remove blank lines (\r\n\r\n etc.) */
  const collapseNewlinesApplicationDetail = (s) => {
    if (s == null) return "";
    const normalized = String(s).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    return normalized.replace(/\n{2,}/g, "\n").trim();
  };

  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    if (!timestamp) return "--";
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  function formatUnixToDate(unixTimestamp) {
    if (!unixTimestamp) return "--";
    // check if timestamp is in seconds, convert to ms
    if (unixTimestamp.toString().length === 10) {
      unixTimestamp = unixTimestamp * 1000;
    }

    const date = new Date(unixTimestamp);

    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();

    return `${day} ${month}, ${year}`;
  }

  const converToSnakeCase = (str) => {
    if (!str) return "--";
    const snakeCase = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    return snakeCase;
  };

  const getLeaveTypeDisplay = (app) => {
    if (Array.isArray(app?.leave_types) && app.leave_types.length > 0) {
      const titles = app.leave_types.map((lt) => lt?.title || lt?.leave_type).filter(Boolean);
      return titles.length ? titles.join(", ") : emptyDisplay(app?.form_data?.leave_type ?? app?.leave_type);
    }
    return emptyDisplay(app?.form_data?.leave_type ?? app?.leave_type);
  };

  useEffect(() => {
    console.log("applicationData", applicationData);
  }, []);

  // Fetch org logo so it is available on print
  useEffect(() => {
    getOrgLogo();
  }, [getOrgLogo]);

  // Show loading or error state if no data
  if (!applicationData) {
    return (
      <div className="p-4 text-center text-gray-500">
        No application data available
      </div>
    );
  };

  const handlePrint = () => {
    const el = document.getElementById('print-application-content');
    if (!el) return;

    const win = window.open('', '_blank');
    if (!win) return;

    win.document.documentElement.innerHTML = `
    <html>
      <head>
        <title>Leave Application</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

          @page { size: A4; margin: 12mm 15mm; }
          @media print {
            html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
            body * { visibility: hidden; }
            #print-application-content, #print-application-content * { visibility: visible; }
            #print-application-content { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; }
            .print-page { page-break-after: avoid !important; }
          }

          .print-page {
            max-width: 700px;
            margin: 0 auto;
            padding: 12px 24px 24px;
            background: #ffffff;
          }

          .print-header {
            position: relative;
            text-align: center;
            margin-bottom: 16px;
            padding-top: 4px;
            padding-bottom: 10px;
            border-bottom: 3px solid #3b82f6;
          }
          .print-header-logo {
            position: absolute;
            top: 0;
            right: 0;
          }
          .print-logo {
            display: block;
            max-height: 44px;
            max-width: 130px;
            object-fit: contain;
          }
          .print-logo[data-hidden="true"] { display: none !important; }
          .print-header h1 {
            font-size: 20px;
            font-weight: 700;
            color: #111827;
            letter-spacing: -0.02em;
            margin-bottom: 2px;
          }
          .print-header p {
            font-size: 11px;
            color: #6b7280;
            font-weight: 500;
          }

          .print-section {
            margin-bottom: 14px;
            page-break-inside: avoid;
          }
          .print-section-title {
            font-size: 12px;
            font-weight: 700;
            color: #374151;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            margin-bottom: 6px;
            padding-bottom: 4px;
            border-bottom: 1px solid #e5e7eb;
          }
          .print-card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 12px 14px;
          }
          .print-card-body {
            font-size: 14px;
            line-height: 1.6;
            color: #1f2937;
            white-space: pre-wrap;
            word-wrap: break-word;
          }

          .emp-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px 32px;
          }
          .emp-item {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          .emp-item label {
            font-size: 11px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.03em;
          }
          .emp-item span {
            font-size: 14px;
            font-weight: 500;
            color: #111827;
          }

          .date-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          .date-flex {
            display: flex;
            flex-wrap: wrap;
            gap: 12px 24px;
          }
          .date-flex .date-item {
            flex: 1;
            min-width: 100px;
          }
          .date-item label {
            display: block;
            font-size: 11px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.03em;
            margin-bottom: 6px;
          }
          .date-item .date-value {
            display: block;
            padding: 10px 14px;
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            font-size: 14px;
            color: #1f2937;
          }

          .note-card {
            background: #fffbeb;
            border: 1px solid #fde68a;
            border-radius: 10px;
            padding: 16px 20px;
          }
          .note-card .print-card-body {
            font-size: 13px;
            color: #92400e;
            line-height: 1.65;
          }

          .signature-row {
            margin-top: 20px;
            padding-top: 14px;
            border-top: 1px dashed #d1d5db;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            gap: 24px;
          }
          .signature-block {
            flex: 1;
            max-width: 200px;
          }
          .signature-line {
            height: 1px;
            border-bottom: 2px solid #9ca3af;
            margin-bottom: 8px;
            min-height: 36px;
          }
          .signature-block span {
            font-size: 10px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.06em;
          }
          .signature-block:last-child { text-align: right; }
          .signature-block:last-child .signature-line { margin-left: auto; }
        </style>
        <script>
          window.onbeforeprint = function() { };
          window.addEventListener('load', function() {
            var img = document.querySelector('.print-logo');
            if (img && (img.naturalWidth === 0 || img.complete === false)) {
              img.style.display = 'none';
            }
          });
          document.addEventListener('DOMContentLoaded', function() {
            var img = document.querySelector('.print-logo');
            if (img) {
              img.onerror = function() { this.style.display = 'none'; };
            }
          });
        </script>
      </head>
      <body>
        ${el.outerHTML}
      </body>
    </html>
  `;

    win.document.title = ' ';
    win.focus();
    // Open print dialog after content is in the new tab
    setTimeout(() => {
      win.print();
    }, 300);
  };


  const empPhone = applicationData?.emp_phone ?? applicationData?.form_data?.emp_phone ?? applicationData?.employee_details?.emp_phone;
  const defaultNoteContent = (empPhone != null && String(empPhone).trim() !== '') ? `During in my absence I can be contacted (If very Urgent).\n\nTelephone#: ${String(empPhone).trim()}` : `During in my absence I can be contacted (If very Urgent).\n\nTelephone#: 03439902848`;

  return (
    <>
      <div id="print-application-content" className="hidden">
        <div className="print-page">
          <header className="print-header">
            <div className="print-header-logo">
              {orgLogo?.logo ? (
                <img
                  className="print-logo"
                  src={orgLogo.logo}
                  alt=""
                  onError={(e) => {
                    e.target.setAttribute('data-hidden', 'true');
                  }}
                />
              ) : null}
            </div>
            <h1>Leave Application</h1>
            <p>Official leave request document</p>
          </header>

          <section className="print-section">
            <h2 className="print-section-title">Employee Information</h2>
            <div className="print-card">
              <div className="emp-grid">
                <div className="emp-item">
                  <label>Employee Name</label>
                  <span>{emptyDisplay(applicationData?.name || applicationData?.emp_name)}</span>
                  <span>{applicationData?.emp_name || ""}</span>
                </div>
                <div className="emp-item">
                  <label>Employee ID</label>
                  <span>{emptyDisplay(applicationData?.form_data?.emp_id ?? applicationData?.emp_id)}</span>
                </div>
                <div className="emp-item">
                  <label>Employee Oneid</label>
                  <span>{emptyDisplay(applicationData?.one_id)}</span>
                </div>
                <div className="emp-item">
                  <label>Branch</label>
                  <span>{emptyDisplay(applicationData?.employee_details?.branch_name?.branch_name ?? applicationData?.branch_name)}</span>
                </div>
                <div className="emp-item">
                  <label>Department</label>
                  <span>{emptyDisplay(applicationData?.employee_details?.department?.name ?? applicationData?.department_name)}</span>
                </div>
                <div className="emp-item">
                  <label>Designation</label>
                  <span>{emptyDisplay(applicationData?.employee_details?.designation_name ?? applicationData?.designation_name)}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="print-section">
            <h2 className="print-section-title">Subject</h2>
            <div className="print-card">
              <div className="print-card-body">{emptyDisplay(applicationData?.form_data?.subject ?? applicationData?.subject)}</div>
            </div>
          </section>

          <section className="print-section">
            <h2 className="print-section-title">Application Detail</h2>
            <div className="print-card">
              <div className="print-card-body">{emptyDisplay(collapseNewlinesApplicationDetail(applicationData?.Application_detail ?? applicationData?.application_detail ?? applicationData?.form_data?.application_detail ?? applicationData?.app_body ?? applicationData?.form_data?.app_body))}</div>
              <div className="print-card-body">{applicationData?.app_body || applicationData?.form_data?.app_body || applicationData?.Application_detail || applicationData?.application_detail || ""}</div>
            </div>
          </section>

          <section className="print-section">
            <h2 className="print-section-title">Leave Period</h2>
            <div className="date-flex">
              <div className="date-item">
                <label>From</label>
                <span className="date-value">{emptyDisplay(applicationData?.form_data?.leave_app_start_date ?? applicationData?.leave_app_start_date)}</span>
              </div>
              <div className="date-item">
                <label>Upto</label>
                <span className="date-value">{emptyDisplay(applicationData?.form_data?.leave_app_end_date ?? applicationData?.leave_app_end_date)}</span>
              </div>
              <div className="date-item">
                <label>Leave Type</label>
                <span className="date-value">{getLeaveTypeDisplay(applicationData)}</span>
              </div>
            </div>
          </section>

          <section className="print-section">
            <h2 className="print-section-title">Note</h2>
            <div className="note-card">
              <div className="print-card-body">{applicationData?.form_data?.note || defaultNoteContent}</div>
            </div>
          </section>

          <div className="signature-row">
            <div className="signature-block">
              <div className="signature-line"></div>
              <span>Employee Signature</span>
            </div>
            <div className="signature-block">
              <div className="signature-line"></div>
              <span>Approval Authority</span>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white h-full flex flex-col">
        {/* Application Info Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-[#3DA5F4] font-semibold text-lg">Application Info</h2>
          <div className="flex items-center gap-2">
            {isLeaveApplication && (
              <button className="bg-bgBlue text-white px-4 text-xs py-2 font-medium rounded-md hover:drop-shadow-md" onClick={() => handlePrint()}>Print</button>
            )}
            <button
              onClick={onClose}
              className="w-6 h-6 flex justify-center items-center rounded-full border-2 border-blue-500 hover:bg-blue-50 transition-colors"
              title="Close"
              aria-label="Close"
            >
              <FaTimes className="text-blue-500" size={14} />
            </button>
          </div>
        </div>

        {/* Application Info Content */}
        <div className="px-6 py-5">
          <div className="flex flex-col gap-0">
            {/* Row 1: From, To, Emp ID */}
            <div className="grid grid-cols-3 gap-4 py-4 border-b border-dashed border-gray-300">
              {/* From */}
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FaUser className="text-[#3DA5F4] text-lg" />
                </div>
                <div className="flex flex-col items-start justify-start gap-1">
                  <span className="text-gray-600 font-normal text-sm">From:</span>
                  <span className="text-gray-800 font-Urbanist font-semibold text-sm">{emptyDisplay(applicationData?.name || applicationData?.emp_name)}</span>
                  <span className="text-gray-800 font-Urbanist font-semibold text-sm">{applicationData?.emp_name || ""}</span>
                </div>
              </div>

              {/* To */}
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FaUserCheck className="text-[#3DA5F4] text-lg" />
                </div>
                <div className="flex flex-col items-start justify-start gap-1">
                  <span className="text-gray-600 font-normal text-sm">To:</span>
                  <span className="text-gray-800 font-Urbanist font-semibold text-sm">Approval Flow</span>
                </div>
                <div className="flex-1">

                </div>
              </div>

              {/* Emp ID */}
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FaUser className="text-[#3DA5F4] text-lg" />
                </div>
                <div className="flex flex-col items-start justify-start gap-1">
                  <span className="text-gray-600 font-normal text-sm">Emp ID:</span>
                  <span className="text-gray-800 font-Urbanist font-semibold text-sm">{emptyDisplay(applicationData?.form_data?.emp_id ?? applicationData?.emp_id)}</span>
                </div>
                <div className="flex-1">

                </div>
              </div>
            </div>

            {/* Row 2: Dated, Subject, File */}
            <div className="grid grid-cols-3 gap-4 py-4 border-b border-dashed border-gray-300">
              {/* Dated */}
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FaCalendar className="text-[#3DA5F4] text-lg" />
                </div>
                <div className="flex flex-col items-start justify-start gap-1">
                  <span className="text-gray-600 font-normal text-sm">Dated:</span>
                  <span className="text-gray-800 font-Urbanist font-semibold text-sm">{formatUnixToDate(applicationData?.entry_time) || "--"}</span>
                </div>
                <div className="flex-1">

                </div>
              </div>

              {/* Subject */}
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FaFileAlt className="text-[#3DA5F4] text-lg" />
                </div>
                <div className="flex flex-col items-start justify-start gap-1">
                  <span className="text-gray-600 font-normal text-sm">Subject:</span>
                  <span className="text-gray-800 font-Urbanist font-semibold text-sm">{emptyDisplay(applicationData?.form_data?.subject ?? applicationData?.subject)}</span>
                </div>
                <div className="flex-1">

                </div>
              </div>

              {/* File */}
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FaFile className="text-[#3DA5F4] text-lg" />
                </div>
                <div className="flex flex-col items-start justify-start gap-1 min-w-0 flex-1">
                  <span className="text-gray-600 font-normal text-sm">File:</span>
                  {(() => {
                    const rawUrls = applicationData?.form_data?.file_url != null
                      ? (Array.isArray(applicationData.form_data.file_url)
                          ? applicationData.form_data.file_url.filter(Boolean)
                          : [applicationData.form_data.file_url])
                      : applicationData?.form_data?.file
                        ? (Array.isArray(applicationData.form_data.file) ? applicationData.form_data.file.filter(Boolean) : [applicationData.form_data.file])
                        : [];
                    const validUrls = rawUrls
                      .map(url => typeof url === 'string' ? url.trim() : (url?.url || url?.href || String(url)))
                      .filter(href => href && href.startsWith('http'));
                    if (validUrls.length === 0) {
                      return (
                        <span className="text-gray-500 font-Urbanist text-sm">No file attached</span>
                      );
                    }
                    return (
                      <div className="flex flex-col gap-1">
                        {validUrls.map((href, idx) => {
                          const label = validUrls.length > 1 ? `File ${idx + 1}` : 'View file';
                          return (
                            <a
                              key={idx}
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#3DA5F4] font-Urbanist font-semibold text-sm hover:underline break-all text-left"
                            >
                              {label}
                            </a>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
                <div className="flex-1 min-w-0" />
              </div>
            </div>

            {/* Row 3: Emp OneID, Application Detail (spanning 2 columns) */}
            <div className="grid grid-cols-3 gap-4 py-4">
              {/* Emp OneID */}
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FaUserEdit className="text-[#3DA5F4] text-lg" />
                </div>
                <div className="flex flex-col items-start justify-start gap-1">
                  <span className="text-gray-600 font-normal text-sm">Emp OneID:</span>
                  <span className="text-gray-800 font-Urbanist font-semibold text-sm">{emptyDisplay(applicationData?.one_id ?? applicationData?.form_data?.one_id)}</span>
                </div>
                <div className="flex-1">

                </div>
              </div>

              {/* Application Detail - spans 2 columns */}
              <div className="flex items-start gap-4 col-span-2">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FaEdit className="text-[#3DA5F4] text-lg" />
                </div>
                <div className="flex flex-col items-start justify-start gap-1">
                  <span className="text-gray-600 font-normal text-sm">Application Detail:</span>
                  <span className="text-gray-800 font-Urbanist font-semibold text-sm leading-relaxed whitespace-pre-wrap">{emptyDisplay(collapseNewlinesApplicationDetail(applicationData?.Application_detail ?? applicationData?.application_detail ?? applicationData?.form_data?.application_detail ?? applicationData?.app_body ?? applicationData?.form_data?.app_body))}</span>
                  <span className="text-gray-800 font-Urbanist font-semibold text-sm leading-relaxed">{applicationData?.app_body || applicationData?.form_data?.app_body || applicationData?.Application_detail || applicationData?.application_detail || ""}</span>
                </div>
                <div className="flex-1">

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Approval List Section */}
        <div className="px-6 py-4 border-t border-gray-200">
          <h3 className="text-[#3DA5F4] font-semibold text-lg mb-4">Approval List</h3>
          <div className="bg-white rounded-[10px] drop-shadow-md p-2 w-full overflow-x-auto">
            <table className="w-[100%] min-w-max text-center">
              <thead className="sticky top-[-9px] bg-[#F8F9FA] rounded-[8px]">
                <tr>
                  {data?.map((head, i) => (
                    <th
                      key={i}
                      className="py-4 px-2"
                    >
                      <Typography
                        variant="small"
                        color="#292929"
                        className="font-medium leading-none opacity-80 font-Urbanist capitalize"
                      >
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {applicationData?.approvel_flow &&
                  applicationData?.approvel_by?.length > 0 ? (
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 border-b border-gray-200">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        1
                      </Typography>
                    </td>

                    <td className="p-4 border-b border-gray-200">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {converToSnakeCase(applicationData.approvel_flow) ||
                          "--"}
                      </Typography>
                    </td>

                    <td className="p-4 border-b border-gray-200">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {converToSnakeCase(applicationData.approvel_by) || "--"}
                      </Typography>
                    </td>

                    <td className="p-4 border-b border-gray-200">
                      <span
                        className={`px-4 py-1 text-xs rounded-[7px] w-[110px] font-medium inline-flex items-center justify-center ${applicationData.type_base_info === "PENDING" || applicationData.type_base_info === "Pending"
                            ? "bg-[#FFF1D9] text-[#FDA006]"
                            : applicationData.type_base_info === "APPROVED" || applicationData.type_base_info === "Approved"
                              ? "bg-[#DBFFF5] text-[#0ACF97]"
                              : "bg-[#FFF0F4] text-[#FF4979]"
                          }`}
                      >
                        {converToSnakeCase(applicationData.type_base_info) ||
                          "--"}
                      </span>
                    </td>

                    <td className="p-4 border-b border-gray-200">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {formatUnixToDate(applicationData?.update_time)}
                      </Typography>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-4"
                    >
                      <div className="flex flex-col items-center justify-center gap-2 text-center">
                        <span className="text-[#292929] font-medium text-[16px]">
                          No Approval Found!
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default ApplicationLeave;
