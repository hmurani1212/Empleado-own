import { Card, CardBody } from '@material-tailwind/react'
import React from 'react'
import { motion } from 'framer-motion'

const CustomCard = (props) => {
    const {image, alt, title, backgroundColor, count, link} = props
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className='relative group cursor-pointer w-full min-w-0'
    >
      <Card className='w-full min-w-0 shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-visible rounded-2xl border border-gray-100'>
          <CardBody className="p-4 flex items-center justify-center">
            <div className='w-full h-[88px] sm:h-[100px] md:h-[110px] flex items-center justify-center overflow-hidden' >
              <img src={image} alt={alt || title} className="object-contain max-h-full max-w-full drop-shadow-sm group-hover:scale-105 transition-transform duration-300"/>
            </div>
          </CardBody>
          
          {/* Badge */}
          {count !== undefined && count !== null && (
            <div 
              className='absolute -top-2 -right-2 px-2.5 py-1 rounded-full text-[11px] text-white font-bold shadow-sm z-10' 
              style={{ backgroundColor: backgroundColor || '#3DA5F4' }}
            >
              {count}
            </div>
          )}
      </Card>
      <div className='mt-2 text-center px-0.5'>
        <span className='text-sm sm:text-[14px] font-semibold text-gray-700 group-hover:text-brand-600 transition-colors leading-tight line-clamp-2'>{title}</span>
      </div>
    </motion.div>
  )
}

export default CustomCard