import { Button, Typography , Input} from '@material-tailwind/react'
import React, { useState, useMemo, useEffect } from 'react'
import { TbFileExport } from 'react-icons/tb'
import { IoSearch   } from 'react-icons/io5'
import { IoIosSend   } from 'react-icons/io'
import { CiClock2 } from 'react-icons/ci'
import { FaUser, FaBuilding, FaCalendarAlt, FaClock, FaUserTie } from 'react-icons/fa'
import * as XLSX from 'xlsx';
import { showToast } from '../../Components/Toaster/Toaster'

const DashboardCountData = (props) => {
    const { data , exportData, sendSms, loading, title} = props

    useEffect(() => {
      console.log('DashboardCountData - data:', data);
      console.log('DashboardCountData - exportData:', exportData);
      console.log('DashboardCountData - title:', title);
    }, [data, exportData, title])
    
    // Local state for search term
    const [searchTerm, setSearchTerm] = useState('')

    // Check if this is today's attendance data
    const isTodayAttendance = title === "Today's Attendence";
    
    // Check if this is late comers data
    const isLateComers = title === "Today's Late Comers" || title === "Late Comers Last 7 days";
    
    // Format date from timestamp
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        try {
            const date = new Date(timestamp * 1000);
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        } catch (e) {
            return timestamp;
        }
    };
    
    // Format time from timestamp
    const formatTime = (timestamp) => {
        if (!timestamp) return 'N/A';
        try {
            const date = new Date(timestamp * 1000);
            return date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
        } catch (e) {
            return timestamp;
        }
    };
    
    // Format late minutes with color coding
    const formatLateMinutes = (minutes) => {
        if (minutes === null || minutes === undefined) return 'N/A';
        const mins = Number(minutes);
        if (isNaN(mins)) return minutes;
        if (mins <= 5) return { text: `${mins} min`, color: 'text-green-600', bg: 'bg-green-50' };
        if (mins <= 15) return { text: `${mins} min`, color: 'text-yellow-600', bg: 'bg-yellow-50' };
        return { text: `${mins} min`, color: 'text-red-600', bg: 'bg-red-50' };
    };
    
    // Get field display value with formatting
    const getFormattedValue = (key, value) => {
        if (value === null || value === undefined) return 'N/A';
        
        const keyLower = key.toLowerCase();
        
        // Date fields
        if (keyLower.includes('date') && typeof value === 'number') {
            return formatDate(value);
        }
        
        // Time fields
        if ((keyLower.includes('time') || keyLower.includes('in_time') || keyLower.includes('out_time')) && typeof value === 'number') {
            return formatTime(value);
        }
        
        // Late minutes
        if (keyLower.includes('late') && keyLower.includes('min')) {
            return formatLateMinutes(value);
        }
        
        return String(value);
    };
    
    // Get icon for field
    const getFieldIcon = (key) => {
        const keyLower = key.toLowerCase();
        if (keyLower.includes('name') || keyLower.includes('employee')) return <FaUser className="text-[14px] text-[#3da5f4]" />;
        if (keyLower.includes('department') || keyLower.includes('branch')) return <FaBuilding className="text-[14px] text-[#3da5f4]" />;
        if (keyLower.includes('date')) return <FaCalendarAlt className="text-[14px] text-[#3da5f4]" />;
        if (keyLower.includes('time') || keyLower.includes('late')) return <FaClock className="text-[14px] text-[#3da5f4]" />;
        return null;
    };

    // Filter data based on search term (frontend search)
    const filteredData = useMemo(() => {
        if (!data || !Array.isArray(data) || searchTerm.trim() === '') {
            return data || []
        }

        const searchLower = searchTerm.toLowerCase().trim()

        return data.filter((ele) => {
            if (isTodayAttendance) {
                // Search in Today's Attendance fields
                const name = (ele.name || '').toLowerCase()
                const department = (ele.department || '').toLowerCase()
                const designation = (ele.designation || '').toLowerCase()
                const inTime = (ele.in_time || '').toLowerCase()
                const outTime = (ele.out_time || '').toLowerCase()
                const statusField = (ele.status || '').toLowerCase()
                
                return name.includes(searchLower) ||
                       department.includes(searchLower) ||
                       designation.includes(searchLower) ||
                       inTime.includes(searchLower) ||
                       outTime.includes(searchLower) ||
                       statusField.includes(searchLower)
            } else {
                // Search in Late Comers fields - search across all object values
                return Object.values(ele).some(value => {
                    if (value === null || value === undefined) return false
                    return String(value).toLowerCase().includes(searchLower)
                })
            }
        })
    }, [data, searchTerm, isTodayAttendance])

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value)
    }

    const handleExport = () => {
      // Use filteredData if available, otherwise use data
      const exportDataToUse = filteredData && filteredData.length > 0 ? filteredData : (data || []);
      
      if (!exportDataToUse || exportDataToUse.length === 0) {
        showToast('No data available to export', 'error');
        return;
      }

      const work_sheet = XLSX.utils.json_to_sheet(exportDataToUse);

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, work_sheet, "Data");

      const excel_buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });

      const blob = new Blob([excel_buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `export_${date}.xlsx`;
      link.style.display = 'none';
      
      // Append to body before clicking
      document.body.appendChild(link);
      link.click();

      // Remove after a short delay to ensure download starts
      setTimeout(() => {
        if (link.parentNode) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(url);
      }, 100);
    }

  return (
    <div className='flex flex-col gap-4 w-full min-h-0 flex-1'>
      
      <div className='flex items-center justify-between gap-3 flex-wrap shrink-0 pb-3 border-b border-slate-100'>
        <div className='flex-1 min-w-[160px] max-w-[280px] mt-4'>
          <Input 
            className='' 
            label={isLateComers ? "Search Late Comers" : "Search Employee"} 
            icon={<IoSearch />} 
            name='searchEmployee' 
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        {filteredData && filteredData.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-white to-slate-50/80 rounded-xl border border-slate-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)]">
            {isLateComers ? (
              <CiClock2 className="text-[#3da5f4] text-[16px]" />
            ) : (
              <FaUser className="text-[#3da5f4] text-[16px]" />
            )}
            <span className="text-slate-700 font-semibold text-[12px]">
              {filteredData.length} {filteredData.length === 1 ? 'Record' : 'Records'}
            </span>
          </div>
        )}
          {/* <div>
        {sendSms && 
          <Button
            className="flex items-center gap-3 px-4 border border-[#3DA5F4] py-2 text-[#3DA5F4] rounded-full-full bg-[#C3D8E8] hover:shadow-[#C3D8E8]/20 focus:shadow-[#C3D8E8]/20 active:shadow-[#C3D8E8]/10"

          >
            <IoIosSend className='text-[16px]'/>
            Send SMS
          </Button>
          }
            </div> */}
      </div>
      <div className='relative flex-1 min-h-[200px] overflow-y-auto overflow-x-hidden customDrwerScroll text-[12px] rounded-2xl border border-slate-100 bg-gradient-to-b from-white/80 to-slate-50/40 shadow-[0_1px_3px_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,0.8)]'>
        {loading ? (
          <div className='flex justify-center items-center h-full'>
            <span className='text-[#3da5f4]'>Loading {isTodayAttendance ? 'attendance' : 'late comers'} data...</span>
          </div>
        ) : filteredData && filteredData.length > 0 ? (
          <div className="w-full">
            {/* Summary Section for Late Comers */}
            {isLateComers && (
              <div className="mb-4 p-4  from-white  rounded-2xl ">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CiClock2 className="text-[#3da5f4] text-[20px]" />
                    <Typography variant="small" className="text-[#474747] font-semibold">
                      Total {isLateComers ? 'Late Comers' : 'Records'}: {filteredData.length}
                    </Typography>
                  </div>
                  {isLateComers && (
                    <div className="flex items-center gap-4 text-[11px]">
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-green-100 border border-green-200"></span>
                        <span className="text-gray-600">0-5 min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-yellow-100 border border-yellow-200"></span>
                        <span className="text-gray-600">6-15 min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-red-100 border border-red-200"></span>
                        <span className="text-gray-600">15+ min</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Summary Section for Today's Attendance */}
            {isTodayAttendance && (() => {
              const todayPresent = filteredData.filter(ele => 
                ele.in_time && ele.in_time !== "Absent" && ele.in_time !== "Off"
              ).length;
              
              return (
                <div className="mb-4 p-4 bg-gradient-to-br from-white to-slate-50/90 rounded-2xl border-b shadow-[0_1px_2px_rgba(0,0,0,0.03),inset_0_1px_0_0_rgba(255,255,255,0.9)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#3da5f4]"></span>
                      <Typography variant="small" className="text-[#474747] font-semibold">
                        Today Present: {todayPresent}
                      </Typography>
                    </div>
                    <div className="flex items-center gap-4 text-[11px]">
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200"></span>
                        <span className="text-gray-600">Present</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-red-100 border border-red-200"></span>
                        <span className="text-gray-600">Absent</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-yellow-100 border border-yellow-200"></span>
                        <span className="text-gray-600">Off</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
            {isTodayAttendance ? (
              /* Today's Attendance - Card List Layout */
              <div className="space-y-2.5 p-1">
                {filteredData.map((ele, index) => {
                  const rowKey = ele.id || ele.emp_id || `row-${index}`;
                  const isAbsent = ele.in_time === "Absent";
                  const isOff = ele.in_time === "Off";
                  const initials = (ele.name || '??').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                  const statusConfig = isAbsent 
                    ? { label: 'Absent', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' }
                    : isOff 
                    ? { label: 'Off', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' }
                    : { label: 'Present', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' };
                  const avatarBg = isAbsent ? 'bg-red-100' : isOff ? 'bg-amber-100' : 'bg-blue-100';
                  const avatarText = isAbsent ? 'text-red-700' : isOff ? 'text-amber-700' : 'text-blue-600';

                  return (
                    <div
                      key={rowKey}
                      className={`group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 hover:shadow-md ${
                        isAbsent ? 'bg-red-50/60 border-red-100 hover:border-red-200' 
                        : isOff ? 'bg-amber-50/40 border-amber-100 hover:border-amber-200' 
                        : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarBg} ${avatarText}`}>
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-800 truncate">{ele.name || '--'}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-500 truncate">{ele.department || '--'}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] text-slate-500 truncate">{ele.designation || '--'}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                          {statusConfig.label}
                        </span>
                        {(() => {
                          const pairs = [
                            { in: ele.in_time, out: ele.out_time },
                            { in: ele.in_time_2, out: ele.out_time_2 },
                            { in: ele.in_time_3, out: ele.out_time_3 },
                          ]
                            .filter(
                              (p) => (p.in != null && String(p.in).trim() !== '') || (p.out != null && String(p.out).trim() !== '')
                            )
                            .slice(0, 3);
                          return (
                            <div className="text-[11px] text-slate-600 flex flex-col items-end gap-0.5">
                              {pairs.map((p, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <span className="font-medium text-blue-600">{p.in ?? '--'}</span>
                                  <span className="text-slate-400">→</span>
                                  <span className="font-medium">{p.out ?? '--'}</span>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <table className="w-full text-sm border-collapse rounded-xl overflow-hidden" style={{ tableLayout: 'auto', minWidth: '100%' }}>
          <thead className="sticky top-0 z-20">
            <tr className="bg-gradient-to-b from-slate-50 to-slate-100/80 border-b border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08),inset_0_1px_0_0_rgba(255,255,255,0.9)]">
              {(
                // Late Comers Headers (dynamic) - use first item from filteredData or original data to get headers
                (() => {
                  const headerSource = filteredData.length > 0 ? filteredData[0] : (data && data.length > 0 ? data[0] : {})
                  // Filter out 'id' and 'in_time' fields, and get the desired columns in order
                  const headers = Object.keys(headerSource).filter(key => key !== 'id' && key.toLowerCase() !== 'in_time');
                  
                  // Define header order: name, father name, department, designation, date, late_minutes
                  const headerOrder = ['name', 'father_name', 'fathername', 'department', 'designation', 'date', 'late_minutes', 'late_minute'];
                  
                  // Helper function to find matching field
                  const findMatchingField = (orderKey) => {
                    return headers.find(h => {
                      const hLower = h.toLowerCase();
                      if (orderKey === 'name') {
                        return hLower === 'name' || hLower === 'employee_name' || hLower === 'emp_name';
                      }
                      if (orderKey === 'father_name' || orderKey === 'fathername') {
                        return hLower.includes('father');
                      }
                      if (orderKey === 'department') {
                        return hLower === 'department' || hLower.includes('dept');
                      }
                      if (orderKey === 'designation') {
                        return hLower === 'designation' || hLower.includes('design');
                      }
                      if (orderKey === 'date') {
                        return hLower === 'date' || hLower.includes('date');
                      }
                      if (orderKey === 'late_minutes' || orderKey === 'late_minute') {
                        return hLower.includes('late') && (hLower.includes('min') || hLower.includes('minute'));
                      }
                      return hLower.includes(orderKey);
                    });
                  };
                  
                  // Build ordered headers array
                  const orderedHeaders = [];
                  headerOrder.forEach(orderKey => {
                    const matchingField = findMatchingField(orderKey);
                    if (matchingField && !orderedHeaders.includes(matchingField)) {
                      orderedHeaders.push(matchingField);
                    }
                  });
                  
                  // Add any remaining headers that weren't in the order
                  headers.forEach(h => {
                    if (!orderedHeaders.includes(h)) {
                      orderedHeaders.push(h);
                    }
                  });
                  
                  return orderedHeaders.map((head) => {
                    const icon = getFieldIcon(head);
                    return (
                      <th key={head} className="border-b border-r border-slate-100/80 bg-transparent px-3 py-3 text-center align-middle">
                        <div className="flex items-center justify-center gap-2">
                          {icon}
                          <Typography variant="small" color="blue-gray" className="font-semibold text-[13px] text-[#474747] capitalize break-words whitespace-normal">
                            {head?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Typography>
                        </div>
                      </th>
                    );
                  });
                })()
              )}
            </tr>
          </thead>
          <tbody className=''>
            {filteredData.map((ele, index) => {
              const isLast = index === filteredData.length - 1;
              const borderClass = "border-b border-slate-50/80";
              const classes = `${borderClass} text-[12px]`;
              // Use a unique key - prefer id if available, otherwise use index
              const rowKey = ele.id || ele.emp_id || `row-${index}`;
              
              // Determine row styling based on in_time
              const isAbsent = ele.in_time === "Absent";
              const isOff = ele.in_time === "Off";
              const rowBgClass = isAbsent ? 'bg-red-50/60 hover:bg-red-50/80' : isOff ? 'bg-amber-50/40 hover:bg-amber-50/60' : 'bg-white/90 hover:bg-slate-50/50';
              // Text colors: all fields use normal weight
              const nameTextColor = isAbsent ? 'text-red-800' : 'text-[#474747]';
              const normalTextColor = isAbsent ? 'text-red-800' : 'text-gray-700';
              // In Time color: Present = blue, Off = yellow, Absent = dark red
              const inTimeTextColor = isAbsent ? 'text-red-800' : (isOff ? 'text-yellow-600' : 'text-[#3da5f4]');
              // Out Time color: same as normal text
              const outTimeTextColor = isAbsent ? 'text-red-800' : 'text-[#3da5f4]';
   
              return (
                <tr 
                  key={rowKey} 
                  className={`${rowBgClass} transition-colors duration-150`}
                >
                  {(() => {
                      const headerSource = filteredData.length > 0 ? filteredData[0] : (data && data.length > 0 ? data[0] : {})
                      // Filter out 'id' and 'in_time' fields
                      const headers = Object.keys(headerSource).filter(key => key !== 'id' && key.toLowerCase() !== 'in_time');
                      
                      // Define header order: name, father name, department, designation, date, late_minutes
                      const headerOrder = ['name', 'father_name', 'fathername', 'department', 'designation', 'date', 'late_minutes', 'late_minute'];
                      
                      // Helper function to find matching field
                      const findMatchingField = (orderKey) => {
                        return headers.find(h => {
                          const hLower = h.toLowerCase();
                          if (orderKey === 'name') {
                            return hLower === 'name' || hLower === 'employee_name' || hLower === 'emp_name';
                          }
                          if (orderKey === 'father_name' || orderKey === 'fathername') {
                            return hLower.includes('father');
                          }
                          if (orderKey === 'department') {
                            return hLower === 'department' || hLower.includes('dept');
                          }
                          if (orderKey === 'designation') {
                            return hLower === 'designation' || hLower.includes('design');
                          }
                          if (orderKey === 'date') {
                            return hLower === 'date' || hLower.includes('date');
                          }
                          if (orderKey === 'late_minutes' || orderKey === 'late_minute') {
                            return hLower.includes('late') && (hLower.includes('min') || hLower.includes('minute'));
                          }
                          return hLower.includes(orderKey);
                        });
                      };
                      
                      // Build ordered headers array
                      const orderedHeaders = [];
                      headerOrder.forEach(orderKey => {
                        const matchingField = findMatchingField(orderKey);
                        if (matchingField && !orderedHeaders.includes(matchingField)) {
                          orderedHeaders.push(matchingField);
                        }
                      });
                      
                      // Add any remaining headers that weren't in the order
                      headers.forEach(h => {
                        if (!orderedHeaders.includes(h)) {
                          orderedHeaders.push(h);
                        }
                      });
                      
                      return orderedHeaders.map((key) => {
                        const formattedValue = getFormattedValue(key, ele[key]);
                        const isLateMinutes = key.toLowerCase().includes('late') && key.toLowerCase().includes('min');
                        const lateMinutesStyle = isLateMinutes && typeof formattedValue === 'object' ? formattedValue : null;
                        const displayValue = typeof formattedValue === 'object' ? formattedValue.text : formattedValue;
                        
                        return (
                          <td key={key} className={`${classes} px-3 py-2.5 align-middle text-center`}>
                            {isLateMinutes && lateMinutesStyle ? (
                              <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[12px] font-medium ${lateMinutesStyle.bg} ${lateMinutesStyle.color} whitespace-nowrap`}>
                                <CiClock2 className="mr-1" />
                                {lateMinutesStyle.text}
                              </span>
                            ) : (
                              <Typography 
                                variant="small" 
                                className={`font-normal break-words whitespace-normal text-center ${
                                  key.toLowerCase().includes('name') ? 'text-[#474747]' : 
                                  key.toLowerCase().includes('date') || key.toLowerCase().includes('time') ? 'text-[#3da5f4]' : 
                                  'text-gray-700'
                                }`}
                                title={String(displayValue)}
                              >
                                {displayValue}
                              </Typography>
                            )}
                          </td>
                        );
                      });
                    })()}
                </tr>
              );
            })}
          </tbody>
          </table>
            )}
          </div>
        ) : (
          <div className='flex justify-center items-center h-full'>
            <span className='text-[#9B9B9B]'>
              {searchTerm.trim() !== '' 
                ? `No ${isTodayAttendance ? 'attendance' : 'late comers'} data found matching "${searchTerm}"`
                : `No ${isTodayAttendance ? 'attendance' : 'late comers'} data available`
              }
            </span>
          </div>
        )}
      </div>
      {exportData && (
        <div className='flex justify-end items-center'>
          <Button 
            className="flex items-center gap-3 px-4 border border-[#0ACF97] py-2 text-[#0ACF97] rounded-full bg-[#EDFFF0] hover:shadow-[#EDFFF0]/20 focus:shadow-[#EDFFF0]/20 active:shadow-[#EDFFF0]/10"
            onClick={handleExport}
          >
            <TbFileExport className='text-[16px]'/>
            Export
          </Button>
        </div>
      )}
    </div>
  )
}

export default DashboardCountData