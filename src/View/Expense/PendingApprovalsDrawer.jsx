import React, { useState } from 'react';
import { Button, Card, CardBody, Typography, Textarea } from '@material-tailwind/react';
import { FaHashtag, FaUser, FaFileAlt, FaEye, FaEllipsisH, FaArrowLeft } from 'react-icons/fa';
import { PendingApprovalsListSkeleton } from './ExpenseSkeletons';

const PendingApprovalsDrawer = ({ closeDrawer, pendingApprovals = [], pendingApprovalsLoading = false, approveRejectExpense }) => {
  const [showDetailView, setShowDetailView] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [comments, setComments] = useState("Your request is invalid. Therefore refused.");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleViewDetails = (approval) => {
    setSelectedApproval(approval);
    setShowDetailView(true);
  };

  const handleBackToList = () => {
    setShowDetailView(false);
    setSelectedApproval(null);
  };

  const handleApprove = async (approval = null) => {
    const targetApproval = approval || selectedApproval;
    if (!targetApproval || !approveRejectExpense) return;
    
    setIsProcessing(true);
    try {
      const result = await approveRejectExpense(targetApproval._id, 'approved');
      // Close drawer when API returns success
      if (result && result.success) {
        // Close detail view and go back to list if we're in detail view
        if (showDetailView) {
          setShowDetailView(false);
          setSelectedApproval(null);
        }
        // Close the drawer after successful approval
        closeDrawer();
      }
    } catch (error) {
      console.error('Error approving expense:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefuse = async (approval = null) => {
    const targetApproval = approval || selectedApproval;
    if (!targetApproval || !approveRejectExpense) return;
    
    setIsProcessing(true);
    try {
      const result = await approveRejectExpense(targetApproval._id, 'rejected');
      // Close drawer when API returns success
      if (result && result.success) {
        // Close detail view and go back to list if we're in detail view
        if (showDetailView) {
          setShowDetailView(false);
          setSelectedApproval(null);
        }
        // Close the drawer after successful rejection
        closeDrawer();
      }
    } catch (error) {
      console.error('Error rejecting expense:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Show detail view if selected
  if (showDetailView && selectedApproval) {
    return (
      <div className="p-6">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="text"
            className="flex items-center gap-2 cursor-pointer text-blue-600 hover:bg-blue-50 p-2"
            onClick={handleBackToList}
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to List
          </Button>
        </div>

        {/* Header Information - Three Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Employee ID Card */}
          <Card className="bg-gray-50 border border-gray-200 shadow-sm">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaHashtag className="text-blue-600 w-4 h-4" />
                </div>
                <div>
                  <Typography variant="small" color="gray" className="text-xs font-normal">
                    Employee ID
                  </Typography>
                  <Typography variant="paragraph" className="font-semibold text-gray-800">
                    {selectedApproval.emp_id}
                  </Typography>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Employee Name Card */}
          <Card className="bg-gray-50 border border-gray-200 shadow-sm">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaUser className="text-blue-600 w-4 h-4" />
                </div>
                <div>
                  <Typography variant="small" color="gray" className="text-xs font-normal">
                    Employee Name
                  </Typography>
                  <Typography variant="paragraph" className="font-semibold text-gray-800">
                    {selectedApproval.emp_name}
                  </Typography>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Expense Title Card */}
          <Card className="bg-gray-50 border border-gray-200 shadow-sm">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaFileAlt className="text-blue-600 w-4 h-4" />
                </div>
                <div>
                  <Typography variant="small" color="gray" className="text-xs font-normal">
                    Expense Title
                  </Typography>
                  <Typography variant="paragraph" className="font-semibold text-gray-800">
                    {selectedApproval.title}
                  </Typography>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Description Section */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaEllipsisH className="text-blue-600 w-4 h-4" />
            </div>
            <Typography variant="h6" color="blue-gray" className="font-semibold">
              Description
            </Typography>
          </div>
          <Typography variant="paragraph" color="gray" className="text-sm leading-relaxed">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it.
          </Typography>
        </div>

        {/* Comments Section */}
        <div className="mb-8">
          <Typography variant="h6" color="blue-gray" className="font-semibold mb-3">
            Comments (optional)
          </Typography>
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="border-gray-300 focus:border-blue-500"
            placeholder="Enter your comments here..."
            rows={4}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            size="md"
            className="bg-green-500 text-white border-0 shadow-sm cursor-pointer hover:bg-green-600 px-6 py-2 rounded-lg disabled:opacity-50"
            onClick={handleApprove}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Approve'}
          </Button>
          <Button
            size="md"
            className="bg-red-500 text-white border-0 cursor-pointer shadow-sm hover:bg-red-600 px-6 py-2 rounded-lg disabled:opacity-50"
            onClick={handleRefuse}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Refuse'}
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (pendingApprovalsLoading) {
    return (
      <div className="p-4 min-h-[280px]">
        <div className="flex flex-col items-center justify-center gap-3 mb-6">
          <div className="w-9 h-9 border-2 border-bgBlue border-t-transparent rounded-full animate-spin" />
          <Typography variant="small" className="text-gray-500 font-poppins">
            Loading pending approvals…
          </Typography>
        </div>
        <PendingApprovalsListSkeleton rows={3} />
      </div>
    );
  }

  // Show list view by default
  return (
    <div className="pt-4">
      <div className="space-y-4">
        {pendingApprovals.map((approval) => (
          <div key={approval._id} className="">
            <div className="">
              {/* Top Row - Employee Information */}
              <div className="flex justify-between items-start mb-6">
                {/* Employee ID */}

                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-[40px] h-[40px] rounded-[8px] border-[1px] border-bgBlue">
                    <FaHashtag className="text-bgBlue w-[18px] h-[18px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-Urbanist font-medium text-[#474747]">Employee ID</span>
                    <span className="text-[14px] font-Urbanist font-light text-[#474747]">{approval.emp_id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-[40px] h-[40px] rounded-[8px] border-[1px] border-bgBlue">
                    <FaUser className="text-bgBlue w-[18px] h-[18px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-Urbanist font-medium text-[#474747]">Employee Name</span>
                    <span className="text-[14px] font-Urbanist font-light text-[#474747]">{approval.emp_name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-[40px] h-[40px] rounded-[8px] border-[1px] border-bgBlue">
                    <FaFileAlt className="text-bgBlue w-[18px] h-[18px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-Urbanist font-medium text-[#474747]">Expense Title</span>
                    <span className="text-[14px] font-Urbanist font-light text-[#474747]">{approval.title}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Row - Action Buttons */}
              <div className="flex justify-between items-center">
                {/* View Details Button - Commented out for now */}
                {/* <Button
                  size="sm"
                  variant="outlined"
                  className="border-blue-500  text-blue-500 hover:bg-blue-50 flex items-center gap-2 px-4 py-2 rounded-lg"
                  onClick={() => handleViewDetails(approval)}
                >
                  <FaEye className="w-3 h-3" />
                  View Details
                </Button> */}
                
                {/* Approve and Refuse Buttons */}
                <div className="flex gap-2 ml-auto">
                  <Button
                    size="sm"
                    className="bg-[#0ACF97] text-white font-medium cursor-pointer px-4 py-2 rounded-[7px] disabled:opacity-50"
                    onClick={() => handleApprove(approval)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Approve'}
                  </Button>
                  <Button
                    size="sm"
                    className="bg-[#FDA006] text-white font-medium cursor-pointer px-4 py-2 rounded-[7px] disabled:opacity-50"
                    onClick={() => handleRefuse(approval)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Refuse'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="border-b border-dashed border-[#DDDDDD] pt-6"></div>
    </div>
  );
 };
 
 export default PendingApprovalsDrawer;
