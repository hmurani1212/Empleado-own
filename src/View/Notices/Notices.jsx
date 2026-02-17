import React from 'react';
import useNotice from '../../ViewModel/NoticeViewModel/NoticeServices';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Notices = () => {
  const { noticeTitles } = useNotice();
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavLinkClick = (e, link) => {
    e.preventDefault();
    navigate(link);
  };

  return (
    <div className="min-h-screen font-poppins">
      <div className="mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Notices Board
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and view organizational announcements
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 shadow-sm border border-gray-100 inline-flex flex-wrap gap-1">
          {noticeTitles.map((ele) => (
            <NavLink
              key={ele.id}
              to={ele.link}
              onClick={(e) => handleNavLinkClick(e, ele.link)}
              className={`
                relative px-4 py-2 rounded-xl text-sm font-medium 
                transition-all duration-300 ease-out z-10
                ${
                  location.pathname === ele.link
                    ? "text-white shadow-md shadow-blue-500/20"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }
              `}
            >
              {location.pathname === ele.link && (
                <motion.span
                  layoutId="activeTab"
                  className="absolute inset-0 bg-bgBlue rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {ele.title}
            </NavLink>
          ))}
        </div>

        {/* Page Content */}
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
};

export default Notices;