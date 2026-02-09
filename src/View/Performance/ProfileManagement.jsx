import React from 'react';
import { FaUser } from 'react-icons/fa';
import { Typography } from '@material-tailwind/react';
import { motion } from 'framer-motion';

const ProfileManagement = ({ profileData, onClose }) => {

  console.log('profileData', profileData)
  if (!profileData) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-10 -mt-10 blur-2xl opacity-50 pointer-events-none"></div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
        
        {/* Profile Info */}
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-md shrink-0">
            {profileData.dp ? (
              <img 
                src={profileData.dp} 
                alt={profileData.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <FaUser className="text-gray-400 text-2xl" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 font-poppins">
              {profileData.name}
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              {profileData.designationObj?.title || 'No Designation'}
            </p>
            <div className="flex items-center gap-2 mt-1">
               <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium border border-blue-100">
                 {profileData.emp_id || 'ID: N/A'}
               </span>
            </div>
          </div>
        </div>
        
        {/* Performance Metrics */}
        <div className="flex items-center gap-8 bg-gray-50/50 px-6 py-3 rounded-xl border border-gray-100">
          <div className="text-center">
            <div className="text-xl mb-1">👍</div>
            <Typography className="text-xs font-semibold text-gray-600 font-poppins">
              4 Good
            </Typography>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div className="text-center">
            <div className="text-xl mb-1">👎</div>
            <Typography className="text-xs font-semibold text-gray-600 font-poppins">
              3 Bad
            </Typography>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div className="text-center">
            <div className="text-xl mb-1">🏆</div>
            <Typography className="text-xs font-semibold text-gray-600 font-poppins">
              5 Awards
            </Typography>
          </div>
        </div>

        {/* Close Button */}
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-0 right-0 md:relative md:top-auto md:right-auto p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileManagement;