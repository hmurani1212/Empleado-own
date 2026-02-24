import React, { useRef, useState, useEffect } from 'react'
import { AiOutlineLogin } from 'react-icons/ai'
import { BiImage, BiSolidBriefcaseAlt2 } from 'react-icons/bi'
import { FaUserCheck } from 'react-icons/fa6'
import { HiClock } from 'react-icons/hi2'
import EmpLazinees from './EmpLazinees'
import EmpDuties from './EmpDuties'
import EmpDashboardAttendance from './EmpDashboardAttendance'
import useEmpDashboard from '../../../ViewModel/EmpViewModel/EmpDashboardViewModel/EmpDashboardServices'
import { secondsIntoHrs } from '../../../services/__dateTimeServices'

import { CiLocationOn } from "react-icons/ci";
import { AiOutlineMail } from "react-icons/ai";
import { IoMdCloudUpload } from "react-icons/io";
import { PiPhoneLight } from "react-icons/pi";
import { CiUser } from "react-icons/ci";
import { SiAwsorganizations } from "react-icons/si";
import { PiOfficeChairLight } from "react-icons/pi";
import { IoEyeSharp } from "react-icons/io5";
import { GrFormClose } from "react-icons/gr";
import { MdDone, MdUpload } from "react-icons/md";
import { GrPowerReset } from "react-icons/gr";
import defaultUserAvatar from '../../../constants/avatar';

const EmpDashboard = () => {

  const { empDashboardData, handlePolicyView } = useEmpDashboard();
  const [showTooltip, setShowTooltip] = useState(false);
  const [showTooltipTwo, setShowTooltipTwo] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showCloseTooltip, setShowCloseTooltip] = useState(false);
  const [showReselectTooltip, setShowReselectTooltip] = useState(false);
  const [showDoneTooltip, setShowDoneTooltip] = useState(false);
  const [showUploadTooltip, setShowUploadTooltip] = useState(false);
  const [showResetTooltip, setShowResetTooltip] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null); // Store photo URL
  const [isPreviewMode, setIsPreviewMode] = useState(false); // Track if in preview mode
  const [isCropMode, setIsCropMode] = useState(false); // Track if in crop mode

  const [crop, setCrop] = useState({ x: 50, y: 50, width: 200, height: 200 }); // Initial crop values with default size
  const [originalPhoto, setOriginalPhoto] = useState(null); // Store original file
  const [isCropped, setIsCropped] = useState(false); // Track if image has been cropped
  const [isResizing, setIsResizing] = useState(false); // Track if resizing crop box (for UI)
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const cropBoxRef = useRef(null);
  const resizeStartRef = useRef({ x: 0, y: 0, crop: { x: 0, y: 0, width: 0, height: 0 } });
  const isResizingRef = useRef(false); // Ref to track resizing state for event handlers
  const resizeHandleRef = useRef(null); // Ref to track current resize handle

  // Helper function to calculate displayed image dimensions and position
  const getImageDimensions = () => {
    if (!imageRef.current || !containerRef.current) return null;

    const img = imageRef.current;
    const container = containerRef.current;

    if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) return null;

    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    const imgAspectRatio = img.naturalWidth / img.naturalHeight;
    const containerAspectRatio = containerWidth / containerHeight;

    let displayedWidth, displayedHeight, offsetX, offsetY;

    if (imgAspectRatio > containerAspectRatio) {
      // Image is wider - fits to width
      displayedWidth = containerWidth;
      displayedHeight = containerWidth / imgAspectRatio;
      offsetX = 0;
      offsetY = (containerHeight - displayedHeight) / 2;
    } else {
      // Image is taller - fits to height
      displayedWidth = containerHeight * imgAspectRatio;
      displayedHeight = containerHeight;
      offsetX = (containerWidth - displayedWidth) / 2;
      offsetY = 0;
    }

    return { displayedWidth, displayedHeight, offsetX, offsetY };
  };

  // Resizable crop box handlers
  const startResize = (e, handle) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    isResizingRef.current = true;
    resizeHandleRef.current = handle;
    const rect = containerRef.current.getBoundingClientRect();
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      crop: { ...crop },
      containerRect: rect
    };
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
  };

  const handleResize = (e) => {
    if (!isResizingRef.current || !containerRef.current) return;

    e.preventDefault();
    e.stopPropagation();

    const imageDims = getImageDimensions();
    if (!imageDims) return;

    // Calculate delta based on mouse movement
    const deltaX = e.clientX - resizeStartRef.current.x;
    const deltaY = e.clientY - resizeStartRef.current.y;
    const startCrop = resizeStartRef.current.crop;
    const currentHandle = resizeHandleRef.current;

    let newCrop = { ...startCrop };
    const minSize = 50; // Minimum crop size

    // Allow resizing in all directions
    switch (currentHandle) {
      case 'n': // North - resize from top (height only)
        newCrop.height = Math.max(minSize, startCrop.height - deltaY);
        newCrop.y = startCrop.y + (startCrop.height - newCrop.height);
        break;
      case 's': // South - resize from bottom (height only)
        newCrop.height = Math.max(minSize, startCrop.height + deltaY);
        break;
      case 'e': // East - resize from right (width only)
        newCrop.width = Math.max(minSize, startCrop.width + deltaX);
        break;
      case 'w': // West - resize from left (width only)
        newCrop.width = Math.max(minSize, startCrop.width - deltaX);
        newCrop.x = startCrop.x + (startCrop.width - newCrop.width);
        break;
      case 'nw': // North-west - resize from top-left (both width and height)
        newCrop.width = Math.max(minSize, startCrop.width - deltaX);
        newCrop.height = Math.max(minSize, startCrop.height - deltaY);
        newCrop.x = startCrop.x + (startCrop.width - newCrop.width);
        newCrop.y = startCrop.y + (startCrop.height - newCrop.height);
        break;
      case 'ne': // North-east - resize from top-right (both width and height)
        newCrop.width = Math.max(minSize, startCrop.width + deltaX);
        newCrop.height = Math.max(minSize, startCrop.height - deltaY);
        newCrop.y = startCrop.y + (startCrop.height - newCrop.height);
        break;
      case 'sw': // South-west - resize from bottom-left (both width and height)
        newCrop.width = Math.max(minSize, startCrop.width - deltaX);
        newCrop.height = Math.max(minSize, startCrop.height + deltaY);
        newCrop.x = startCrop.x + (startCrop.width - newCrop.width);
        break;
      case 'se': // South-east - resize from bottom-right (both width and height)
        newCrop.width = Math.max(minSize, startCrop.width + deltaX);
        newCrop.height = Math.max(minSize, startCrop.height + deltaY);
        break;
      default:
        break;
    }

    // Keep crop within image bounds
    if (newCrop.x < imageDims.offsetX) {
      newCrop.width += (newCrop.x - imageDims.offsetX);
      newCrop.x = imageDims.offsetX;
    }
    if (newCrop.y < imageDims.offsetY) {
      newCrop.height += (newCrop.y - imageDims.offsetY);
      newCrop.y = imageDims.offsetY;
    }
    if (newCrop.x + newCrop.width > imageDims.offsetX + imageDims.displayedWidth) {
      newCrop.width = (imageDims.offsetX + imageDims.displayedWidth) - newCrop.x;
    }
    if (newCrop.y + newCrop.height > imageDims.offsetY + imageDims.displayedHeight) {
      newCrop.height = (imageDims.offsetY + imageDims.displayedHeight) - newCrop.y;
    }

    // Ensure minimum size after bounds check
    if (newCrop.width < minSize) {
      if (currentHandle === 'w' || currentHandle === 'nw' || currentHandle === 'sw') {
        newCrop.x = newCrop.x + newCrop.width - minSize;
      }
      newCrop.width = minSize;
    }
    if (newCrop.height < minSize) {
      if (currentHandle === 'n' || currentHandle === 'nw' || currentHandle === 'ne') {
        newCrop.y = newCrop.y + newCrop.height - minSize;
      }
      newCrop.height = minSize;
    }

    setCrop(newCrop);
  };

  const stopResize = () => {
    setIsResizing(false);
    isResizingRef.current = false;
    resizeHandleRef.current = null;
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
  };

  // Move crop box
  const startMove = (e) => {
    if (isResizingRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      crop: { ...crop }
    };
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', stopMove);
  };

  const handleMove = (e) => {
    e.preventDefault();
    const imageDims = getImageDimensions();
    if (!imageDims) return;

    const deltaX = e.clientX - resizeStartRef.current.x;
    const deltaY = e.clientY - resizeStartRef.current.y;
    const startCrop = resizeStartRef.current.crop;

    // Allow movement in both X and Y directions
    let newX = startCrop.x + deltaX;
    let newY = startCrop.y + deltaY;

    // Keep within image bounds
    newX = Math.max(imageDims.offsetX, Math.min(newX, imageDims.offsetX + imageDims.displayedWidth - startCrop.width));
    newY = Math.max(imageDims.offsetY, Math.min(newY, imageDims.offsetY + imageDims.displayedHeight - startCrop.height));

    setCrop({
      ...startCrop,
      x: newX,
      y: newY
    });
  };

  const stopMove = () => {
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('mouseup', stopMove);
  };

  const getCroppedImage = (cropToUse = null) => {
    if (!canvasRef.current || !imageRef.current || !originalPhoto) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    const container = containerRef.current;

    // Use provided crop or current state crop
    const currentCrop = cropToUse || crop;

    if (!img.complete || currentCrop.width <= 0 || currentCrop.height <= 0) {
     /// console.log('Image not ready or invalid crop:', { complete: img.complete, crop: currentCrop });
      return;
    }

    // Get actual displayed image dimensions (accounting for object-contain)
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    // Calculate the actual displayed image size (with object-contain)
    const imgAspectRatio = img.naturalWidth / img.naturalHeight;
    const containerAspectRatio = containerWidth / containerHeight;

    let displayedWidth, displayedHeight, offsetX, offsetY;

    if (imgAspectRatio > containerAspectRatio) {
      // Image is wider - fits to width
      displayedWidth = containerWidth;
      displayedHeight = containerWidth / imgAspectRatio;
      offsetX = 0;
      offsetY = (containerHeight - displayedHeight) / 2;
    } else {
      // Image is taller - fits to height
      displayedWidth = containerHeight * imgAspectRatio;
      displayedHeight = containerHeight;
      offsetX = (containerWidth - displayedWidth) / 2;
      offsetY = 0;
    }

    // Calculate scale factor from displayed to natural size
    const scaleX = img.naturalWidth / displayedWidth;
    const scaleY = img.naturalHeight / displayedHeight;

    // Adjust crop coordinates to account for image offset
    const adjustedCropX = currentCrop.x - offsetX;
    const adjustedCropY = currentCrop.y - offsetY;

    // Calculate actual crop coordinates on the original image
    const actualX = Math.max(0, adjustedCropX * scaleX);
    const actualY = Math.max(0, adjustedCropY * scaleY);
    const actualWidth = Math.min(currentCrop.width * scaleX, img.naturalWidth - actualX);
    const actualHeight = Math.min(currentCrop.height * scaleY, img.naturalHeight - actualY);

    // Ensure valid crop dimensions
    if (actualWidth <= 0 || actualHeight <= 0 || actualX >= img.naturalWidth || actualY >= img.naturalHeight) {
      console.log('Invalid crop coordinates:', { actualX, actualY, actualWidth, actualHeight });
      return;
    }

    // Set canvas size to match the cropped image size
    canvas.width = actualWidth;
    canvas.height = actualHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the cropped part of the image onto the canvas
    ctx.drawImage(
      img,
      actualX,
      actualY,
      actualWidth,
      actualHeight,
      0,
      0,
      actualWidth,
      actualHeight
    );

    // Get the cropped image as a blob and update immediately
    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], originalPhoto.name || 'cropped-image.jpg', {
          type: originalPhoto.type || 'image/jpeg'
        });
        // Create new URL for cropped image
        const newUrl = URL.createObjectURL(croppedFile);
        // Revoke old URL if exists
        if (photoUrl) {
          URL.revokeObjectURL(photoUrl);
        }
        // Update photo and URL to show cropped version immediately
        setPhoto(croppedFile);
        setPhotoUrl(newUrl);
        // Mark as cropped and exit crop mode
        setIsCropped(true);
        setIsCropMode(false);
        setCrop({ x: 0, y: 0, width: 0, height: 0 });
      } else {
        console.error('Failed to create blob from canvas');
      }
    }, originalPhoto.type || 'image/jpeg', 0.95);
  };
  // console.log('what did you mean by sections', empDashboardData)

  const pInfo = empDashboardData?.section1;
  ///console.log('what is the data', pInfo)
  const dutyInfo = empDashboardData?.section2

  const attendanceDetail = empDashboardData?.attendance_detail
  const attendanceData = empDashboardData?.attendance
  const leaveBalance = empDashboardData?.leave_balance

  const today = new Date();

  function getDuration(from, to) {
    if (!from || !to) return '';
  
    let years = to.getFullYear() - from.getFullYear();
    let months = to.getMonth() - from.getMonth();
    let days = to.getDate() - from.getDate();
  
    if (days < 0) {
      months--;
      const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0);
      days += prevMonth.getDate();
    }
  
    if (months < 0) {
      years--;
      months += 12;
    }
  
    return `${years} year${years !== 1 ? 's' : ''} ${months} month${
      months !== 1 ? 's' : ''
    } ${days} day${days !== 1 ? 's' : ''}`;
  }

  const workingFrom = pInfo?.working_from
  ? (() => {
      const [day, month, year] = pInfo.working_from.split("/").map(Number);
      return new Date(year, month - 1, day);
    })()
  : null;
  const workingSince = workingFrom ? getDuration(workingFrom, today) : '';

  // Check if data is loading
  // const isLoading = !empDashboardData || !pInfo;

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Revoke old URL if exists
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
      const newUrl = URL.createObjectURL(file);
      setOriginalPhoto(file);
      setPhoto(file);
      setPhotoUrl(newUrl);
      setIsCropped(false); // Reset cropped state
      setIsCropMode(true); // Set crop mode
      setIsPreviewMode(false); // Not preview mode
      // Initialize crop box - smaller default size that can be adjusted
      setTimeout(() => {
        const imageDims = getImageDimensions();
        if (imageDims) {
          const defaultWidth = imageDims.displayedWidth * 0.7;
          const defaultHeight = imageDims.displayedHeight * 0.6;
          setCrop({
            x: imageDims.offsetX + (imageDims.displayedWidth - defaultWidth) / 2,
            y: imageDims.offsetY + (imageDims.displayedHeight - defaultHeight) / 2,
            width: defaultWidth,
            height: defaultHeight
          });
        }
      }, 100);
    }
  };

  // Cleanup URL on unmount
  useEffect(() => {
    return () => {
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [photoUrl]);

  const InfoItem = ({ icon, label, value, extra, showTooltip, setShowTooltip }) => {
    return (
      <div
        className="relative flex items-start gap-3 min-w-0"
        onMouseEnter={() => extra && setShowTooltip?.(true)}
        onMouseLeave={() => extra && setShowTooltip?.(false)}
      >
        {/* Icon */}
        <div className="w-[32px] h-[32px] shrink-0 bg-bgBlue rounded-full flex items-center justify-center text-white">
          {icon}
        </div>
  
        {/* Text */}
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] text-[#292929] font-normal">
            {label}
          </span>
  
          <span className="text-[13px] font-medium text-[#292929] truncate">
            {value}
          </span>
        </div>
  
        {/* Tooltip */}
        {extra && showTooltip && (
          <div className="absolute top-full left-8 z-50 rounded-md bg-white px-3 py-1 text-[11px] text-[#474747] shadow-lg p-4 drop-shadow-[0_0_10px_rgba(0,0,0,0.1)] py-2">
            {extra}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex flex-col gap-4 p-2`}>
      <div className={`relative z-10 flex flex-wrap lg:flex-nowrap rounded-[10px] bg-white drop-shadow-md min-h-0`}>
        <div
          className='relative flex items-center justify-center h-[210px] w-[170px] shrink-0 self-stretch overflow-hidden rounded-tl-lg rounded-bl-lg transition-all duration-300'
          onMouseEnter={() => setShowCamera(true)}
          onMouseLeave={() => setShowCamera(false)}
        >
          <img
            className='w-full h-[170px] object-cover rounded-tl-lg rounded-bl-lg transition-transform duration-300 ease-in-out'
            src={pInfo?.dp || defaultUserAvatar}
            alt='profile'
          />
          {showCamera && (
            <div className="flex items-center justify-betweeen">
              <div className='absolute top-0 right-0 w-full h-full flex items-end justify-between bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300 px-2'>
                <IoEyeSharp
                  className='text-[25px] text-white hover:text-bgBlue cursor-pointer transition-transform duration-300 ease-in-out '
                  onClick={() => {
                    setIsPreviewMode(true);
                    setPhoto('preview');
                  }}
                />
                <IoMdCloudUpload
                  className='text-[25px] text-white hover:text-bgBlue cursor-pointer transition-transform duration-300 ease-in-out'
                  onClick={() => {
                    setIsCropMode(true);
                    document.getElementById('photo-input').click();
                  }}
                />
              </div>
            </div>
          )}
          <input type="file" accept="image/*" className='hidden' id='photo-input' onChange={handlePhotoChange} />
        </div>

        <div className='flex flex-col gap-4 px-4 w-full py-2'>
          <div className='space-y-4'>
            <div className='flex items-center space-x-4 text-[25px] text-[#212529] font-medium font-Urbanist'>
              <span>{pInfo?.name || "--"}</span>
            </div>
            <div className="px-4 py-4 space-y-4">

              {/* TOP ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* {console.log('this is pinfo', pInfo)} */}

                <InfoItem
                  icon={<SiAwsorganizations />}
                  label="Department & Designation"
                  value={`${pInfo?.department || "--"} (${pInfo?.designation_name || "--"})`}
                />

                <InfoItem
                  icon={<AiOutlineMail />}
                  label="Email"
                  value={pInfo?.email || "--"}
                />

                <InfoItem
                  icon={<PiPhoneLight />}
                  label="Contact No"
                  value={pInfo?.contact || pInfo?.phone || "--"}
                />

              </div>

              <div className="h-px bg-[#DDDDDD]" />

              {/* BOTTOM ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                <InfoItem
                  icon={<CiUser />}
                  label="Employee ID"
                  value={pInfo?.emp_id || "--"}
                />

                <InfoItem
                  icon={<CiLocationOn />}
                  label="Address"
                  value={pInfo?.branch || pInfo?.permanent_address || "--"}
                />

                <InfoItem
                  icon={<PiOfficeChairLight />}
                  label="Working Since"
                  value={pInfo?.working_from || "--"}
                  extra={`Experience: ${workingSince}`}
                  showTooltip={showTooltipTwo}
                  setShowTooltip={setShowTooltipTwo}
                />

              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='relative z-0 grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-3'>
        <div className='flex items-center gap-4 bg-bgBlue rounded-[15px] px-4 py-4 drop-shadow-md'>
          <div>
            <span className='bg-white h-9 w-9 rounded-full text-[25px] text-[#3DA5F4] flex items-center justify-center'>
              <FaUserCheck className='text-[19px] font-bold' />
            </span>
          </div>
          <div className='flex flex-col text-white font-poppins'>
            <span className='text-[13px]'>Current Status</span>
            <span className='text-[13px] font-semibold'>{dutyInfo?.working_status}</span>
          </div>
        </div>
        <div className='flex items-center gap-4 bg-bgBlue rounded-[15px] px-4 py-6 drop-shadow-md'>
          <div>
            <span className='bg-white h-9 w-9 rounded-full text-[25px] text-[#3DA5F4] flex items-center justify-center'>
              <AiOutlineLogin className='text-[19px] font-bold' />
            </span>
          </div>
          <div className='flex flex-col text-white font-poppins'>
            <span className="text-[13px]">{dutyInfo?.working_status === "Absent" ? "Login" : dutyInfo?.is_even_or_odd === "Odd" ? "Login" : "Logout"} Time</span>
            <span className='text-[13px] font-semibold'>{dutyInfo?.login_time}</span>
          </div>
        </div>
        <div className='flex items-center gap-4 bg-bgBlue rounded-[15px] px-4 py-6 drop-shadow-md'>
          <div>
            <span className='bg-white h-9 w-9 rounded-full text-[25px] text-[#3DA5F4] flex items-center justify-center'>
              <BiSolidBriefcaseAlt2 className='text-[19px] font-bold' />
            </span>
          </div>
          <div className='flex items-center justify-between w-full'>
            <div className='flex flex-col text-white font-poppins'>
              <span className='text-[13px]'>Working Policy</span>
              <span className='text-[13px] font-semibold'>{dutyInfo?.duty_timings}</span>
            </div>
            <IoEyeSharp className='text-[25px] font-bold bg-white text-[#3DA5F4] rounded-full p-1 cursor-pointer hover:bg-gray-100 hover:text-[#3DA5F4]' onClick={() => handlePolicyView()} />
          </div>
        </div>
        <div className='flex items-center gap-4 bg-bgBlue rounded-[15px] px-4 py-6 relative drop-shadow-md'>
          <div>
            <span className='bg-white h-9 w-9 rounded-full text-[25px] text-[#3DA5F4] flex items-center justify-center'>
              <HiClock className='text-[19px] font-bold' />
            </span>
          </div>
          <div className='flex flex-col text-white font-poppins' onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
            <span className='text-[13px]'>Earned Hours / Expected</span>
            <span className='text-[13px] font-semibold' >{secondsIntoHrs(attendanceDetail?.earned)} / {secondsIntoHrs(attendanceDetail?.total)}</span>
          </div>
          {showTooltip && (
            <div className='absolute flex flex-col items-center justify-center gap-2 bottom-[-50px] right-0 w-1/2 drop-shadow-md bg-white border border-gray-300 rounded-lg p-2 z-50'>
              <span className='text-[13px]'>Overtime</span>
              <span className='text-[13px] text-gray-500'>{secondsIntoHrs(attendanceDetail?.overtime_seconds)}</span>
            </div>
          )}
        </div>
      </div>
      <EmpLazinees />
      <EmpDuties />
      <EmpDashboardAttendance
        attendanceData={attendanceData}
        leaveBalance={leaveBalance}
      />

      {(photo || isPreviewMode) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-2/5 relative text-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between bg-bgBlue text-white rounded-tl-lg rounded-tr-lg px-4 py-2">
              <span className="text-[14px] font-medium text-white font-poppins">{isPreviewMode ? 'Preview Photo' : isCropMode ? 'Edit Photo' : 'Edit Photo'}</span>
              <div className="relative">
                <GrFormClose
                  className="cursor-pointer text-white hover:text-gray-100 transition-transform duration-300 ease-in-out text-[23px]"
                  onClick={() => {
                    setPhoto(null);
                    setIsPreviewMode(false);
                    setIsCropMode(false);
                  }}
                  onMouseEnter={() => setShowCloseTooltip(true)}
                  onMouseLeave={() => setShowCloseTooltip(false)}
                />
                {showCloseTooltip && (
                  <div className="absolute top-full right-0 mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
                    Close
                  </div>
                )}
              </div>
            </div>

            {/* Image Preview */}
            <div
              ref={containerRef}
              className={`relative w-full h-[300px] overflow-hidden ${isCropped ? 'flex items-center justify-center bg-white' : ' bg-white'}`}
              style={{ position: 'relative' }}
            >
              <img
                ref={imageRef}
                src={isPreviewMode ? (pInfo?.dp || defaultUserAvatar) : (photoUrl || (photo && photo !== 'preview' ? URL.createObjectURL(photo) : ''))}
                alt="profile"
                className={isCropped ? 'max-w-full max-h-full object-contain' : 'w-full h-full object-contain'}
                onLoad={() => {
                  if (isCropMode && !isCropped) {
                    const imageDims = getImageDimensions();
                    if (imageDims) {
                      // Start with a smaller default size that can be adjusted
                      const defaultWidth = imageDims.displayedWidth * 0.7;
                      const defaultHeight = imageDims.displayedHeight * 0.6;
                      setCrop({
                        x: imageDims.offsetX + (imageDims.displayedWidth - defaultWidth) / 2,
                        y: imageDims.offsetY + (imageDims.displayedHeight - defaultHeight) / 2,
                        width: defaultWidth,
                        height: defaultHeight
                      });
                    }
                  }
                }}
              />
              {/* Resizable Crop Box - only show in crop mode when not cropped */}
              {isCropMode && !isCropped && crop.width > 0 && crop.height > 0 && (
                <>
                  {/* Dark overlay outside crop area */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'rgba(241, 241, 241, 0.78)',
                      clipPath: `polygon(
                          0% 0%, 
                          0% 100%, 
                          ${crop.x}px 100%, 
                          ${crop.x}px ${crop.y}px, 
                          ${crop.x + crop.width}px ${crop.y}px, 
                          ${crop.x + crop.width}px ${crop.y + crop.height}px, 
                          ${crop.x}px ${crop.y + crop.height}px, 
                          ${crop.x}px 100%, 
                          100% 100%, 
                          100% 0%
                        )`,
                      pointerEvents: 'none',
                    }}
                  />
                  {/* Crop box */}
                  <div
                    ref={cropBoxRef}
                    className="border border-gray-500"
                    style={{
                      position: 'absolute',
                      top: crop.y,
                      left: crop.x,
                      width: crop.width,
                      height: crop.height,
                      backgroundColor: 'rgba(107, 114, 128, 0.1)',
                      cursor: isResizing ? 'nwse-resize' : 'move',
                      boxSizing: 'border-box',
                      pointerEvents: 'auto',
                    }}
                    onMouseDown={(e) => {
                      // Only start move if not clicking on a resize handle
                      if (!e.target.closest('[data-resize-handle]')) {
                        startMove(e);
                      }
                    }}
                  >
                    {/* Resize handles - all 8 handles (4 edges + 4 corners) */}
                    {['n', 's', 'e', 'w'].map((handle) => (
                      <div
                        key={handle}
                        data-resize-handle
                        className="bg-gray-500 border-2 border-white"
                        style={{
                          position: 'absolute',
                          cursor: handle === 'n' || handle === 's' ? 'ns-resize' : 'ew-resize',
                          zIndex: 10,
                          pointerEvents: 'auto',
                          ...(handle === 'n' ? { top: '-6px', left: '0px', width: '1px', height: '1px' } :
                            handle === 's' ? { bottom: '-6px', left: '0px', width: '1px', height: '1px' } :
                              handle === 'e' ? { top: '0px', right: '-6px', width: '1px', height: '1px' } :
                                { top: '0px', left: '-6px', width: '12px', height: '1px' })
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          startResize(e, handle);
                        }}
                      />
                    ))}
                    {/* Corner handles */}
                    {['nw', 'ne', 'sw', 'se'].map((handle) => (
                      <div
                        key={handle}
                        data-resize-handle
                        className="bg-gray-500 border-2 border-white rounded-full"
                        style={{
                          position: 'absolute',
                          width: '14px',
                          height: '14px',
                          cursor: handle === 'nw' || handle === 'se' ? 'nwse-resize' : 'nesw-resize',
                          zIndex: 10,
                          pointerEvents: 'auto',
                          ...(handle === 'nw' ? { top: '-7px', left: '-7px' } :
                            handle === 'ne' ? { top: '-7px', right: '-7px' } :
                              handle === 'sw' ? { bottom: '-7px', left: '-7px' } :
                                { bottom: '-7px', right: '-7px' })
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          startResize(e, handle);
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 flex justify-between">
              {isPreviewMode ? null : (
                <>
                  <div className="relative px-2">
                    <button
                      onClick={() => {
                        // Revoke current URL
                        if (photoUrl) {
                          URL.revokeObjectURL(photoUrl);
                        }
                        // Reset everything and trigger file input for reselection
                        setPhoto(null);
                        setOriginalPhoto(null);
                        setPhotoUrl(null);
                        const imageDims = getImageDimensions();
                        if (imageDims) {
                          const defaultWidth = imageDims.displayedWidth * 0.7;
                          const defaultHeight = imageDims.displayedHeight * 0.6;
                          setCrop({
                            x: imageDims.offsetX + (imageDims.displayedWidth - defaultWidth) / 2,
                            y: imageDims.offsetY + (imageDims.displayedHeight - defaultHeight) / 2,
                            width: defaultWidth,
                            height: defaultHeight
                          });
                        } else {
                          setCrop({ x: 0, y: 50, width: 200, height: 200 });
                        }
                        setIsCropped(false);
                        setIsCropMode(false);
                        // Reset file input to allow selecting the same file again
                        const fileInput = document.getElementById('photo-input');
                        if (fileInput) {
                          fileInput.value = '';
                          // Trigger file input to select a new image
                          fileInput.click();
                        }
                      }}
                      className="px-2 py-1 bg-bgBlue text-white rounded hover:bg-gray-500"
                      onMouseEnter={() => setShowReselectTooltip(true)}
                      onMouseLeave={() => setShowReselectTooltip(false)}
                    >
                      <BiImage className="text-white text-[18px] font-bold" />
                    </button>
                    {showReselectTooltip && (
                      <div className="absolute top-full left-0 mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
                        Re select image
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 px-2">
                    {isCropMode && !isCropped && (
                      <div className="relative">
                        <button
                          onClick={() => {
                            if (crop.width > 10 && crop.height > 10) {
                              getCroppedImage(crop);
                            }
                          }}
                          className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          onMouseEnter={() => setShowDoneTooltip(true)}
                          onMouseLeave={() => setShowDoneTooltip(false)}
                        >
                          <MdDone className="text-white text-[18px] font-bold" />
                        </button>
                        {showDoneTooltip && (
                          <div className="absolute top-full right-0 mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
                            Done
                          </div>
                        )}
                      </div>
                    )}
                    {!isCropMode && (
                      <div className="relative px-0">
                        <button
                          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          onMouseEnter={() => setShowUploadTooltip(true)}
                          onMouseLeave={() => setShowUploadTooltip(false)}
                        >
                          <MdUpload className="text-white text-[18px] font-bold" />
                        </button>
                        {showUploadTooltip && (
                          <div className="absolute top-full right-0 mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
                            Upload
                          </div>
                        )}
                      </div>
                    )}
                    {isCropped && originalPhoto && (
                      <div className="relative px-0">
                        <button
                          onClick={() => {
                            // Revoke current cropped image URL
                            if (photoUrl) {
                              URL.revokeObjectURL(photoUrl);
                            }
                            // Restore original photo
                            const originalUrl = URL.createObjectURL(originalPhoto);
                            setPhoto(originalPhoto);
                            setPhotoUrl(originalUrl);
                            setIsCropped(false);
                            setIsCropMode(true);
                            // Reset crop box
                            setTimeout(() => {
                              const imageDims = getImageDimensions();
                              if (imageDims) {
                                const defaultWidth = imageDims.displayedWidth * 0.7;
                                const defaultHeight = imageDims.displayedHeight * 0.6;
                                setCrop({
                                  x: imageDims.offsetX + (imageDims.displayedWidth - defaultWidth) / 2,
                                  y: imageDims.offsetY + (imageDims.displayedHeight - defaultHeight) / 2,
                                  width: defaultWidth,
                                  height: defaultHeight
                                });
                              }
                            }, 100);
                          }}
                          className="px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                          onMouseEnter={() => setShowResetTooltip(true)}
                          onMouseLeave={() => setShowResetTooltip(false)}
                        >
                          <GrPowerReset className="text-white text-[18px] font-bold" />
                        </button>
                        {showResetTooltip && (
                          <div className="absolute top-full right-0 mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
                            Reset
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Canvas for cropping */}
          <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        </div>
      )}
    </div>
  )
}

export default EmpDashboard