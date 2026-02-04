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
    <div className='p-6'>
      <div className='mb-6'>
        <Typography variant='h4' color='blue-gray' className='mb-2'>
          My Training Courses
        </Typography>
        <Typography variant='small' color='gray' className='font-normal'>
          Access your assigned training courses and learning materials
        </Typography>
      </div>

      <Card className='mb-6'>
        <CardBody>
          <div className='flex items-center gap-4'>
            <div className='flex-1'>
              <Input
                label='Search Courses'
                icon={<BiSearch />}
                value={searchTerm}
                onChange={handleSearchChange}
                color='blue'
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {loading ? (
        <div className='flex justify-center items-center py-20'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
            <Typography variant='small' color='gray'>
              Loading courses...
            </Typography>
          </div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <Card>
          <CardBody className='text-center py-20'>
            <FaBook className='text-6xl text-gray-300 mx-auto mb-4' />
            <Typography variant='h5' color='blue-gray' className='mb-2'>
              {searchTerm ? 'No courses found' : 'No courses assigned'}
            </Typography>
            <Typography variant='small' color='gray'>
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'You don\'t have any training courses assigned yet'}
            </Typography>
          </CardBody>
        </Card>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredCourses.map((course, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className='hover:shadow-xl transition-shadow duration-300 h-full'>
                <CardBody className='flex flex-col h-full'>
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex-1'>
                      <Typography variant='h6' color='blue-gray' className='mb-2 line-clamp-2'>
                        {course.course_name}
                      </Typography>
                    </div>
                    <div className='ml-2'>
                      <FaBook className='text-2xl text-blue-500' />
                    </div>
                  </div>

                  <div className='flex-1 mb-4'>
                    <div className='flex items-center gap-2 mb-3'>
                      <FaFileAlt className='text-gray-500' />
                      <Typography variant='small' color='gray'>
                        {course.resources?.length || 0} Resources
                      </Typography>
                    </div>
                  </div>

                  <div className='mt-auto space-y-2'>
                    <Button
                      size='sm'
                      color='blue'
                      className='w-full flex items-center justify-center gap-2'
                      onClick={() => handleViewCourse(index)}
                    >
                      <FaPlayCircle />
                      View Course
                    </Button>
                    {/* {course.completed_date && course.completed_date !== 0 && !course.is_assessment && (
                      <Button
                        size='sm'
                        color='green'
                        className='w-full flex items-center justify-center gap-2'
                        onClick={() => handleTakeAssessment(course)}
                      >
                        <FaCheckCircle />
                        Take Assessment
                      </Button>
                    )} */}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default EmployeeTraining
