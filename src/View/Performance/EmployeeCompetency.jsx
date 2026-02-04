import React, { useEffect } from 'react';
import { Typography, Badge, Progress, Button } from '@material-tailwind/react';
import { FaEye, FaStar, FaUser, FaCheck, FaArrowLeft } from 'react-icons/fa6';
import { useOutletContext, useNavigate } from 'react-router';
import performanceApi from '../../ViewModel/PerformnaceViewModel/Performance';
const EmployeeCompetency = () => {
  // Get data from context
  const { competencyData, profileData, handleOpenRatingModal, handleOpenProgressModal, handleCloseProfile } = useOutletContext() || {};
  const navigate = useNavigate();

  const handleBackToCompetency = () => {
    console.log('EmployeeCompetency: Clearing profile and returning to competency table');
    try {
      // Clear the profile state to return to the main competency table
      if (handleCloseProfile) {
        handleCloseProfile();
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }

  console.log('EmployeeCompetency - competencyData:', competencyData);
  console.log('EmployeeCompetency - profileData:', profileData);
  // const { gettingCompetencyByEmployeeId, employeeCompetencyData } = performanceApi();
  // useEffect(() => {
  //   gettingCompetencyByEmployeeId()
  // }, [])
  // console.log('subComptencyData', employeeCompetencyData)
  const getStatusColor = (status) => {
    switch (status) {
      case '1':
        return 'green';
      case '2':
        return 'yellow';
      case '3':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case '1':
        return 'Completed';
      case '2':
        return 'In Progress';
      case '3':
        return 'Not Started';
      default:
        return 'Unknown';
    }
  };

  const renderStars = (rating, competency) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`text-lg cursor-pointer transition-colors ${i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            } hover:text-yellow-400`}
          onClick={() => handleOpenRatingModal && handleOpenRatingModal(competency)}
          title="Click to rate this competency"
        />
      );
    }
    return stars;
  };

  if (!competencyData || competencyData.length === 0) {
    return (
      <div className="text-center py-8">
        <Typography variant="h6" color="gray" className="font-normal">
          No competencies found for this employee
        </Typography>
      </div>
    );
  };




  return (
    <div className='flex flex-col gap-2 py-2 pb-1 pl-2 pr-4'>
      {/* Back Navigation */}
      <div className="flex items-center mb-2">
        <Button
          variant="text"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors p-2 cursor-pointer"
          onClick={handleBackToCompetency}
        >
          <FaArrowLeft className="text-sm" />
        </Button>
      </div>

      {/* Competency Cards - Matching the image design */}
      <div className="bg-white rounded-lg p-4">
        {competencyData?.map((competency, index) => (
          <div key={index}>
            <div className="flex items-center justify-between py-3">
              {/* Left side - Icon and Competency Name */}
              <div className="flex items-center gap-4">
                {/* Blue icon with user silhouette and checkmark */}
                <div className="relative">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaUser className="text-blue-600 text-lg" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <FaCheck className="text-white text-xs" />
                    </div>
                  </div>
                </div>

                <Typography variant="body1" color="gray" className="font-normal">
                  {competency.name || competency.competency || 'N/A'}
                </Typography>
              </div>

              {/* Right side - Star Rating */}
              <div className="flex items-center gap-1">
                {renderStars(competency.rating || 0, competency)}
              </div>
              {/* Right side - Star Rating */}
              <div className="flex items-center gap-1">
              
              </div>
            </div>

            {/* Dashed separator line (except for last item) */}
            {index < competencyData.length - 1 && (
              <div className="border-b border-dashed border-gray-300"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeCompetency;
