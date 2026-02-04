import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const ProfileCompletionIndicator = ({ completionPercentage = 0 }) => {
  const [displayPercentage, setDisplayPercentage] = useState(0)

  // Animate the percentage change
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayPercentage(completionPercentage)
    }, 100)
    return () => clearTimeout(timer)
  }, [completionPercentage])

  // Calculate the water level (0-100% of the glass)
  const waterLevel = Math.min(100, Math.max(0, displayPercentage))

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Profile Completion Glass */}
      <div className="relative w-20 h-20">
        {/* Glass Container */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-300 bg-gray-100 overflow-hidden">
          {/* Water Effect */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-400 to-blue-300 rounded-full"
            initial={{ height: "0%" }}
            animate={{ height: `${waterLevel}%` }}
            transition={{ 
              type: "spring", 
              stiffness: 100, 
              damping: 15,
              duration: 1.5
            }}
            style={{
              background: `linear-gradient(to top, 
                #60a5fa 0%, 
                #3b82f6 50%, 
                #2563eb 100%)`
            }}
          />
          
          {/* Water Ripple Effect */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-2 bg-blue-200 opacity-60"
            animate={{
              y: [0, -2, 0],
              opacity: [0.6, 0.8, 0.6]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              transform: `translateY(${100 - waterLevel}%)`
            }}
          />
        </div>
        
        {/* Percentage Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-700 z-10">
            {Math.round(displayPercentage)}%
          </span>
        </div>
      </div>
      
      {/* Label */}
      {/* <span className="text-xs text-gray-600 font-medium">
        Profile Complete
      </span> */}
    </div>
  )
}

export default ProfileCompletionIndicator
