import React from 'react'

const EducationalInfo = () => {
  const headers = ['Degree', 'Passing Year', 'Marks / GPA', 'Board / University']

  return (
    <div className="p-5">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 pt-4 pb-3 flex items-center gap-2 border-b border-gray-100">
          <span className="w-1 h-4 rounded-full bg-[#3da5f4] inline-block" />
          <h3 className="text-[13px] font-bold text-gray-800 font-Urbanist">Education History</h3>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F8F9FA]">
                {headers.map((h, i) => (
                  <th
                    key={i}
                    className="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide font-Urbanist whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-5 py-10 text-center text-gray-400 text-[12px] font-Urbanist"
                >
                  No education records found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default EducationalInfo
