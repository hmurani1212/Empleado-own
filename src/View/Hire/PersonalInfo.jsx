import React from 'react'

const PersonalInfo = (props) => {

  const {viewPending, postAdd, permAdd, regDate} = props

  console.log('viewPending in PersonalInfo:', viewPending)
  return (
    <>
    <div className='grid grid-cols-3 p-[18px]'>
      <div className='text-[12px] font-semibold'>
        <div className='mt-3'>
          <span>Name</span>
        </div>

        <div className='mt-3'>
          <span>Father Name</span>
        </div>

        <div className='mt-3'>
          <span>Gender</span>
        </div>

        <div className='mt-3'>
          <span>DOB</span>
        </div>

        <div className='mt-3'>
          <span>Phone Number</span>
        </div>

        <div className='mt-3'>
          <span>Email</span>
        </div>

        <div className='mt-3'>
          <span>Postal Address</span>
        </div>

        <div className='mt-3'>
          <span>Permanent Address</span>
        </div>

        <div className='mt-3'>
          <span>Registration Date</span>
        </div>

      </div>

      <div className='col-span-2 text-[12px]'>

      <div className='mt-3'>
          <span>{viewPending && viewPending.candidate && viewPending.candidate.name}</span>
        </div>

        <div className='mt-3'>
          <span>{viewPending && viewPending.candidate && viewPending.candidate.father_name}</span>
        </div>

        <div className='mt-3'>
          <span>{viewPending && viewPending.candidate && viewPending.candidate.gender === 1 ? 'Male' : viewPending.candidate.gender === 0 ? 'Female' : 'Other'}</span>
        </div>

        <div className='mt-3'>
          <span>{viewPending && viewPending.candidate && viewPending.candidate.dob ? new Date(viewPending.candidate.dob).toLocaleDateString() : 'N/A'}</span>
        </div>

        <div className='mt-3'>
          <span>{viewPending && viewPending.candidate && viewPending.candidate.cellnum}</span>
        </div>

        <div className='mt-3'>
          <span>{viewPending && viewPending.candidate && viewPending.candidate.email}</span>
        </div>

        <div className='mt-3'>
          <span>{viewPending && viewPending.candidate && viewPending.candidate.postal_address}</span>
        </div>

        <div className='mt-3'>
          <span>{viewPending && viewPending.candidate && viewPending.candidate.permanent_address}</span>
        </div>

        <div className='mt-3'>
          <span>{viewPending && viewPending.timestamp && viewPending.timestamp ? new Date(viewPending.timestamp * 1000).toLocaleDateString() : 'N/A'}</span>
        </div>
      </div>

    </div>
    </>
  )
}

export default PersonalInfo