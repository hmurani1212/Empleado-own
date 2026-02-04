import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const VideoTutorial = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const videoData = [
    {
      id: 1,
      title: "Empleado - Quick Introduction to the HR",
      url: "https://youtu.be/7l4H4CsJoSs",
      embedUrl: "https://www.youtube.com/embed/7l4H4CsJoSs"
    },
    {
      id: 2,
      title: "Empleado - Register an Employee",
      url: "https://youtu.be/CugBvcVri1U",
      embedUrl: "https://www.youtube.com/embed/CugBvcVri1U"
    },
    {
      id: 3,
      title: "Empleado - HR Policies",
      url: "https://youtu.be/PPdPVFrCb9s",
      embedUrl: "https://www.youtube.com/embed/PPdPVFrCb9s"
    },
    {
      id: 4,
      title: "Empleado - Attendance Management",
      url: "https://youtu.be/DaKME3Hl8eA",
      embedUrl: "https://www.youtube.com/embed/DaKME3Hl8eA"
    },
    {
      id: 5,
      title: "Empleado - Employee Profiling",
      url: "https://youtu.be/KKHsJ3-h97k",
      embedUrl: "https://www.youtube.com/embed/KKHsJ3-h97k"
    },
    {
      id: 6,
      title: "Empleado - Payroll Management",
      url: "https://youtu.be/5iQBXYti288",
      embedUrl: "https://www.youtube.com/embed/5iQBXYti288"
    }
  ];

  const nextVideo = () => {
    setCurrentVideoIndex((prevIndex) => 
      prevIndex === videoData.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevVideo = () => {
    setCurrentVideoIndex((prevIndex) => 
      prevIndex === 0 ? videoData.length - 1 : prevIndex - 1
    );
  };

  const goToVideo = (index) => {
    setCurrentVideoIndex(index);
  };

  const currentVideo = videoData[currentVideoIndex];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Video Content */}
      <div className="flex-1 p-4">
        <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden" style={{ height: '500px' }}>
          <iframe
            src={currentVideo.embedUrl}
            title={currentVideo.title}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>

          {/* Navigation Arrows */}
          <button
            onClick={prevVideo}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-3 shadow-lg transition-all duration-200"
          >
            <FaChevronLeft className="text-[#3DA5F4]" size={20} />
          </button>

          <button
            onClick={nextVideo}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-3 shadow-lg transition-all duration-200"
          >
            <FaChevronRight className="text-[#3DA5F4]" size={20} />
          </button>
        </div>

        {/* Video Title */}
        <div className="mt-4 text-center">
          <h3 className="text-lg font-medium text-gray-800">
            {currentVideo.title}
          </h3>
        </div>

        {/* Indicator Dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {videoData.map((_, index) => (
            <button
              key={index}
              onClick={() => goToVideo(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentVideoIndex
                  ? 'bg-[#3DA5F4] scale-110'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Video Counter */}
        <div className="text-center mt-4 text-sm text-gray-500">
          {currentVideoIndex + 1} of {videoData.length}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
        <a
          href={currentVideo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-[#3DA5F4] text-white rounded-lg hover:bg-[#2B8CE6] transition-colors"
        >
          <span>Watch on YouTube</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </a>
      </div>
    </div>
  );
};

export default VideoTutorial;
