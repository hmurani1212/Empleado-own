import React from 'react';
import { Typography, Button } from '@material-tailwind/react';
import { FaStar, FaUser, FaCheck, FaArrowLeft, FaClipboardList } from 'react-icons/fa6';
import { useOutletContext } from 'react-router';
import { motion } from 'framer-motion';
import useStore from '../../Store/store';
import { CompetencyCardsSkeleton } from './PerformanceSkeletons';

const EmployeeCompetency = () => {
  // Get data from context
  const { competencyData, handleOpenRatingModal, handleCloseProfile } = useOutletContext() || {};
  const subCompetencyLoading = useStore((state) => state.subCompetencyLoading);

  const handleBackToCompetency = () => {
    try {
      if (handleCloseProfile) {
        handleCloseProfile();
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }

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

  if (subCompetencyLoading) {
    return <CompetencyCardsSkeleton />;
  }

  if (!competencyData || competencyData.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-3">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
          <FaClipboardList className="text-3xl text-gray-300" />
        </div>
        <Typography variant="h6" color="gray" className="font-medium font-poppins">
          No competencies found for this employee
        </Typography>
      </div>
    );
  };

  return (
    <div className='flex flex-col gap-6'>
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="text"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 normal-case font-medium p-2"
          onClick={handleBackToCompetency}
        >
          <FaArrowLeft className="text-sm" /> Back to List
        </Button>
      </div>

      {/* Competency Cards */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 font-poppins mb-6">Competency Ratings</h3>
          
          <div className="flex flex-col gap-0">
            {competencyData?.map((competency, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`py-4 ${index < competencyData.length - 1 ? 'border-b border-dashed border-gray-200' : ''}`}
              >
                <div className="flex items-center justify-between">
                  {/* Left side - Icon and Competency Name */}
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                        <FaUser className="text-blue-500 text-lg" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                        <FaCheck className="text-white text-[10px]" />
                      </div>
                    </div>

                    <div>
                      <Typography className="font-semibold text-gray-900 font-poppins text-sm">
                        {competency.name || competency.competency || 'N/A'}
                      </Typography>
                      <p className="text-xs text-gray-500 mt-0.5">Competency Assessment</p>
                    </div>
                  </div>

                  {/* Right side - Star Rating */}
                  <div className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    {renderStars(competency.rating || 0, competency)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCompetency;