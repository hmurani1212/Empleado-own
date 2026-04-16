import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiChevronDown, FiChevronUp, FiExternalLink } from 'react-icons/fi'

const statusConfig = {
  Rejected:    { cls: 'bg-red-50 text-red-600 border border-red-200' },
  Shortlisted: { cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  Interview:   { cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
  Accepted:    { cls: 'bg-green-50 text-green-700 border border-green-200' },
  Pending:     { cls: 'bg-gray-100 text-gray-600 border border-gray-200' },
  Starred:     { cls: 'bg-purple-50 text-purple-700 border border-purple-200' },
}

const InfoRow = ({ label, children }) => (
  <div className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-b-0">
    <span className="text-[11px] font-semibold text-[#3da5f4] font-Urbanist min-w-[90px] flex-shrink-0">
      {label}
    </span>
    <span className="text-[11px] text-gray-700 font-Urbanist">{children}</span>
  </div>
)

const ApplyHistory = ({ viewPending }) => {
  const navigate = useNavigate()
  const [openIndex, setOpenIndex] = useState(null)

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i)

  const handleApplicationClick = (item) => {
    const vacancyId = viewPending?.vacancy?.id
    const appId = item.application_id || viewPending?.answers?.[0]?.app_id

    const routeMap = {
      Rejected:    `/hire/vacancies_list/all_applicants/${vacancyId}/rejected`,
      Shortlisted: `/hire/vacancies_list/all_applicants/${vacancyId}/shortlisted`,
      Interview:   `/hire/vacancies_list/all_applicants/${vacancyId}/interviewed`,
      Accepted:    `/hire/vacancies_list/all_applicants/${vacancyId}/accepted`,
      Pending:     `/hire/vacancies_list/all_applicants/${vacancyId}/applicant`,
      Starred:     `/hire/vacancies_list/all_applicants/${vacancyId}/starred/view_detail/${appId}`,
    }

    navigate(routeMap[item.status] ?? '/')
  }

  const history = viewPending?.app_history ?? []

  return (
    <div className="p-5">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-[13px] font-bold text-gray-800 font-Urbanist mb-4 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#3da5f4] inline-block" />
          Application History
        </h3>

        {history.length > 0 ? (
          <div className="space-y-2">
            {history.map((item, index) => {
              const isOpen = openIndex === index
              const statusInfo = statusConfig[item.status] ?? {
                cls: 'bg-gray-100 text-gray-500 border border-gray-200',
              }

              return (
                <div
                  key={index}
                  className="rounded-xl border border-gray-100 overflow-hidden transition-shadow hover:shadow-sm"
                >
                  {/* Accordion Header */}
                  <button
                    onClick={() => toggle(index)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-[#F8F9FA] hover:bg-[#EFF8FF] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[12px] font-semibold text-gray-800 font-Urbanist truncate">
                        {item.vacancy_name}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold font-Urbanist capitalize flex-shrink-0 ${statusInfo.cls}`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <span className="text-gray-400 flex-shrink-0 ml-2">
                      {isOpen ? (
                        <FiChevronUp size={15} />
                      ) : (
                        <FiChevronDown size={15} />
                      )}
                    </span>
                  </button>

                  {/* Accordion Body */}
                  {isOpen && (
                    <div className="px-5 py-4 bg-white border-t border-gray-50">
                      <div>
                        <InfoRow label="Post">{item.vacancy_name}</InfoRow>
                        <InfoRow label="Date">{item.post_date}</InfoRow>
                        <InfoRow label="Status">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold font-Urbanist capitalize ${statusInfo.cls}`}
                          >
                            {item.status}
                          </span>
                        </InfoRow>
                        <InfoRow label="Application">
                          <button
                            onClick={() => handleApplicationClick(item)}
                            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#3da5f4] hover:text-[#2a8fd4] underline underline-offset-2 transition-colors cursor-pointer font-Urbanist"
                          >
                            <FiExternalLink size={12} />
                            Open Application
                          </button>
                        </InfoRow>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 text-[12px] font-Urbanist">
            No application history available
          </div>
        )}
      </div>
    </div>
  )
}

export default ApplyHistory
