import React from 'react'

const InfoRow = ({ label, value }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-b-0">
    <span className="text-[12px] font-semibold text-[#3da5f4] font-Urbanist min-w-[150px] flex-shrink-0">
      {label}
    </span>
    <span className="text-[12px] text-gray-700 font-Urbanist break-words">
      {value || <span className="text-gray-400 italic">N/A</span>}
    </span>
  </div>
)

const PersonalInfo = ({ viewPending }) => {
  const c = viewPending?.candidate || {}

  const getGender = (g) => {
    if (g === 1) return 'Male'
    if (g === 0) return 'Female'
    return 'Other'
  }

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : null

  const formatTimestampDate = (ts) =>
    ts
      ? new Date(ts * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : null

  const rows = [
    { label: 'Full Name',          value: c.name },
    { label: 'Father Name',        value: c.father_name },
    { label: 'Gender',             value: getGender(c.gender) },
    { label: 'Date of Birth',      value: formatDate(c.dob) },
    { label: 'Phone Number',       value: c.cellnum },
    { label: 'Email',              value: c.email },
    { label: 'Postal Address',     value: c.postal_address },
    { label: 'Permanent Address',  value: c.permanent_address },
    { label: 'Registration Date',  value: formatTimestampDate(viewPending?.timestamp) },
  ]

  if (!c.name && !c.email) {
    return (
      <div className="p-5 text-center text-gray-400 text-[13px] font-Urbanist py-10">
        No personal information available
      </div>
    )
  }

  return (
    <div className="p-5">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-[13px] font-bold text-gray-800 font-Urbanist mb-4 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#3da5f4] inline-block" />
          Personal Details
        </h3>
        <div>
          {rows.map(({ label, value }) => (
            <InfoRow key={label} label={label} value={value} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default PersonalInfo
