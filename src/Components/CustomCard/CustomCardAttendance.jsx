import { Card, CardBody } from "@material-tailwind/react";
import React from "react";
import { motion } from "framer-motion";

const CustomCardAttendance = (props) => {
  const { title, icon, onClick, color } = props;
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="h-full"
    >
      <Card
        className="cursor-pointer w-full h-full min-h-[160px] flex flex-col justify-center bg-white shadow-card hover:shadow-card-hover border border-gray-100 rounded-2xl overflow-hidden relative group"
        onClick={onClick}
      >
        {/* Decorative background elements */}
        <div 
          className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.08] -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundColor: color }}
        />
        <div 
            className="absolute bottom-0 left-0 w-20 h-20 rounded-full opacity-[0.05] -ml-8 -mb-8"
            style={{ backgroundColor: color }}
        />
        
        <CardBody className="p-6 flex flex-col items-center justify-center gap-4 text-center z-10 h-full">
          <div 
            className="flex justify-center items-center h-14 w-14 rounded-2xl shadow-sm transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
            style={{ 
                backgroundColor: color,
                boxShadow: `0 8px 16px -4px ${color}50` 
            }}
          >
            <span className="text-[28px] drop-shadow-sm">{icon}</span>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <span
              className="font-bold font-Urbanist text-[16px] text-gray-700 leading-tight block group-hover:text-gray-900 transition-colors"
            >
              {title}
            </span>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default CustomCardAttendance;