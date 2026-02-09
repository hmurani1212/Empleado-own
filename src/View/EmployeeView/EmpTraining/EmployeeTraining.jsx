import React, { useEffect, useState } from 'react'
import { Card, CardBody, Typography, Button, Input } from '@material-tailwind/react'
import { BiSearch } from 'react-icons/bi'
import { FaBook, FaPlayCircle, FaCheckCircle, FaFileAlt } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import useEmpTrainingService from '../../../ViewModel/EmpViewModel/EmpTrainingViewModel/EmpTrainingServices'
import { motion } from 'framer-motion'

const EmployeeTraining = () => {
  const navigate = useNavigate()
  const { 
    employeeTrainingCourses, 
    loading, 
    getEmployeeTrainingCourses
  } = useEmpTrainingService()

  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCourses, setFilteredCourses] = useState([])

  useEffect(() => {
    getEmployeeTrainingCourses()
  }, [])

  useEffect(() => {
    if (employeeTrainingCourses && employeeTrainingCourses.length > 0) {
      if (searchTerm.trim() === '') {
        setFilteredCourses(employeeTrainingCourses)
      } else {
        const filtered = employeeTrainingCourses.filter(course =>
          course.course_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setFilteredCourses(filtered)
      }
    } else {
      setFilteredCourses([])
    }
  }, [employeeTrainingCourses, searchTerm])

  const handleViewCourse = (courseIndex) => {
    navigate(`/EmployeeTraining/course/${courseIndex}`)
  }

  const handleTakeAssessment = (course) => {
    navigate('/EmployeeTraining/assessment', {
      state: { 
        course_id: course.course_id,
        course_name: course.course_name 
      }
    })
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  return (
    <div className='min-h-screen bg-gray-50/50 p-6 font-poppins'>
      <div className='max-w-7xl mx-auto space-y-6'>
        
        {/* Header Section */}
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>My Training</h1>
            <p className='text-sm text-gray-500 mt-1'>Access your assigned courses and track your progress</p>
          </div>
          
          <div className="relative w-full md:w-72">
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          </div>
        </div>

        {loading ? (
          <div className='flex justify-center items-center py-20'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto mb-4'></div>
              <Typography variant='small' color='gray' className="font-medium">
                Loading courses...
              </Typography>
            </div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center'>
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBook className='text-4xl text-gray-300' />
            </div>
            <Typography variant='h6' color='blue-gray' className='mb-2 font-semibold'>
              {searchTerm ? 'No courses found' : 'No courses assigned'}
            </Typography>
            <Typography variant='small' color='gray' className='max-w-xs mx-auto'>
              {searchTerm 
                ? 'Try adjusting your search terms to find what you looking for' 
                : 'You currently do not have any training courses assigned to you.'}
            </Typography>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredCourses.map((course, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className='group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all duration-300 h-full flex flex-col overflow-hidden relative'>
                  {/* Decorative top bar */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
                  
                  <div className='p-6 flex-1 flex flex-col'>
                    <div className='flex items-start justify-between mb-4'>
                      <div className='flex-1 pr-4'>
                        <Typography className='text-lg font-bold text-gray-800 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors'>
                          {course.course_name}
                        </Typography>
                      </div>
                      <div className='w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors'>
                        <FaBook className='text-lg text-blue-500' />
                      </div>
                    </div>

                    <div className='flex items-center gap-2 mb-6'>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 text-xs font-medium text-gray-600 border border-gray-100">
                        <FaFileAlt className='text-gray-400' />
                        {course.resources?.length || 0} Resources
                      </div>
                      {/* You can add more badges here like "In Progress" or "Completed" if available in data */}
                    </div>

                    <div className='mt-auto pt-4 border-t border-gray-100'>
                      <Button
                        fullWidth
                        className='flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white shadow-none hover:shadow-md transition-all duration-300 normal-case font-medium rounded-xl py-2.5'
                        onClick={() => handleViewCourse(index)}
                      >
                        <FaPlayCircle className="text-sm" />
                        View Course
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EmployeeTraining
