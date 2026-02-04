import React from 'react'
import useEmpDashboard from '../../../ViewModel/EmpViewModel/EmpDashboardViewModel/EmpDashboardServices'
import dutiesImg from '../../../assets/employee_side_images/Study-Task-Completion1.gif';

const tasksData = [
    {id:1, title:'Daily', color:'#3FACFF'},
    {id:2, title:'Weekly', color:'#0ACF97'},
    {id:3, title:'Monthly', color:'#FF4979'},
    {id:4, title:'Yearly', color:'#FDA006'},
]

const EmpDuties = () => {
  const { empDashboardData } = useEmpDashboard()
  
  // Get duties data from dashboard - adjust path based on actual API response structure
  const duties = empDashboardData?.duties || empDashboardData?.repetitive_duties || []
  const hasDuties = duties && duties.length > 0

  // Map frequency to color
  const getFrequencyColor = (frequency) => {
    const freq = frequency?.toLowerCase()
    if (freq === 'daily') return '#3DA5F4'
    if (freq === 'weekly') return '#6DD2BC'
    if (freq === 'monthly') return '#AD9FF2'
    if (freq === 'yearly') return '#E3A972'
    return '#3FACFF' // default
  }

  // Map frequency to title
  const getFrequencyTitle = (frequency) => {
    const freq = frequency?.toLowerCase()
    if (freq === 'daily') return 'Daily'
    if (freq === 'weekly') return 'Weekly'
    if (freq === 'monthly') return 'Monthly'
    if (freq === 'yearly') return 'Yearly'
    return 'Daily' // default
  }

  return (
    <div className='bg-white rounded-[10px] drop-shadow-md w-full'>
      <div className='flex items-center justify-between py-2'>
        {/* Left Side: Circular Buttons - arranged horizontally */}
        <div className='flex items-center flex-wrap justify-between lg:px-16 md:px-8 px-4 w-2/3 lg:gap-0 md:gap-0 gap-2'>
          {tasksData.map((ele) => (
            <div
              key={ele.id}
              className='w-28 aspect-square rounded-full border-[7px] flex items-center justify-center bg-white'
              style={{ borderColor: ele.color }}
            >
              <span className='text-[#292929] text-[14px] font-semibold'>{ele.title}</span>
            </div>
          ))}
        </div>

        {/* Right Side: Duties Content */}
        <div className='w-1/3 flex items-center justify-center'>
          {!hasDuties ? (
            // No duties assigned - show detailed illustration matching the image
            <div className='flex flex-col items-center justify-center w-full'>
                <img src={dutiesImg} alt='duties' className='w-48' />
                <span className='text-[#3DA5F4] text-[15px] font-medium'>No duties <span className='text-[#292929]'>assigned yet!</span></span>
            </div>
          ) : (
            // Show assigned duties
            <div className='flex flex-col gap-5 w-full'>
              {duties.map((duty, index) => {
                const frequencyColor = getFrequencyColor(duty.repetition_unit || duty.frequency)
                const frequencyTitle = getFrequencyTitle(duty.repetition_unit || duty.frequency)
                
                return (
                  <div key={duty.id || index} className='flex items-start gap-3'>
                    {/* Colored square icon */}
                    <div 
                      className='w-3 h-3 rounded-sm flex-shrink-0 mt-1.5'
                      style={{ backgroundColor: frequencyColor }}
                    />
                    {/* Duty content */}
                    <div className='flex flex-col gap-0.5 flex-1'>
                      <span 
                        className='text-[14px] font-semibold'
                        style={{ color: frequencyColor }}
                      >
                        {frequencyTitle}
                      </span>
                      <span className='text-[#212529] text-[13px] leading-relaxed'>
                        {duty.title || duty.duty_title || duty.description || duty.detail || 'No description'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmpDuties