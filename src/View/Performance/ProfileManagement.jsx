import React from 'react';
import { FaUser } from 'react-icons/fa';
import { Typography } from '@material-tailwind/react';

const ProfileManagement = ({ profileData, onClose }) => {

  console.log('profileData', profileData)
  if (!profileData) return null;

  return (
    <div className="rounded-[10px] bg-white drop-shadow-sm">
      {/* Top Header */}
      <div className="mb-6 p-6">
        <div className="mb-4">
          <Typography className="font-medium text-[16px] font-Urbanist">
            Performance Management
          </Typography>
        </div>
        
        {/* Profile Info and Metrics in Same Line */}
        <div className="flex justify-between items-center">
          {/* Profile Info */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
              {profileData.dp ? (
                <img 
                  src={profileData.dp} 
                  alt={profileData.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUser className="text-gray-600 text-xl" />
              )}
            </div>
            <div>
              <Typography className="font-medium text-[14px] font-Urbanist">
                {profileData.name}
              </Typography>
              <Typography variant="small" color="gray" className="font-normal">
                {profileData.designationObj?.title || 'No Designation'}
              </Typography>
            </div>
          </div>
          
          {/* Performance Metrics */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-green-500 text-xl mb-1">👍</div>
              <Typography variant="small" color="gray" className="font-normal">
                4
              </Typography>
            </div>
            <div className="text-center">
              <div className="text-red-500 text-xl mb-1">👎</div>
              <Typography variant="small" color="gray" className="font-normal">
                3
              </Typography>
            </div>
            <div className="text-center">
              <div className="text-yellow-500 text-xl mb-1">🏆</div>
              <Typography variant="small" color="gray" className="font-normal">
                5
              </Typography>
            </div>
            {onClose && (
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-xl ml-4"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileManagement;
