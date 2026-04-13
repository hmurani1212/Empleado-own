import React from 'react'
import { FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa'
import { IoMdMore } from 'react-icons/io'
import { motion, AnimatePresence } from 'framer-motion'
import { HiOutlineDocumentText } from 'react-icons/hi'
import usePayroll from '../../ViewModel/PayrollViewModel/PayrollServices'
import ConfirmationDialog from '../../Components/ConfirmationDialog/ConfirmationDialog'

function formatSalaryDisplay(amount) {
  if (amount == null || amount === '') return '—'
  const n = Number(String(amount).replace(/,/g, ''))
  if (Number.isFinite(n)) return n.toLocaleString()
  return String(amount)
}

const GridManageSalary = (props) => {
  const {
    openMenuPayroll,
    toggleMenuPayroll,
    salaryTempDialog,
    openDialogDelTemp,
    handleDelete,
    payrollActionMenu,
    handleMenuPayroll,
  } = usePayroll()
  const { allSalaryTemp } = props

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {!allSalaryTemp?.length ? (
          <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-100 bg-gradient-to-b from-slate-50/80 to-white px-6 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-bgBlue ring-1 ring-gray-100">
              <HiOutlineDocumentText className="h-8 w-8" strokeWidth={1.25} />
            </div>
            <p className="font-poppins text-base font-semibold text-slate-700">No salary templates found</p>
            <p className="mt-1 max-w-sm font-poppins text-sm text-slate-500">
              Try another branch or search, or create a new template.
            </p>
          </div>
        ) : (
          allSalaryTemp.map((data, index) => (
            <motion.div
              key={data.id ?? index}
              className={`relative h-full ${openMenuPayroll[index] ? 'z-[80]' : 'z-0'}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: Math.min(index * 0.04, 0.4) }}
            >
              <article className="group flex h-full min-h-[210px] flex-col overflow-visible rounded-2xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:border-gray-200/90 hover:shadow-lg hover:shadow-slate-200/80">
                <div
                  className="h-1 rounded-t-2xl bg-gradient-to-r from-sky-400 via-bgBlue to-indigo-500 opacity-95 group-hover:opacity-100"
                  aria-hidden
                />

                <div className="flex flex-1 flex-col p-3.5 sm:p-4">
                  {/* Top: ID + menu */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-bgBlue ring-1 ring-gray-100 shadow-sm transition-transform group-hover:scale-[1.02]">
                        <HiOutlineDocumentText className="h-5 w-5" strokeWidth={1.75} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-slate-400">
                          Template ID
                        </p>
                        <p className="font-mono text-sm font-semibold text-slate-800">#{data.id}</p>
                      </div>
                    </div>

                    <div
                      onMouseEnter={() => toggleMenuPayroll(index, true)}
                      onMouseLeave={() => toggleMenuPayroll(index, false)}
                      className="relative z-[90] shrink-0"
                    >
                      <button
                        type="button"
                        aria-label="Template actions"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-100 bg-slate-50/90 text-slate-500 transition-colors hover:border-gray-200 hover:bg-white hover:text-bgBlue hover:shadow-sm"
                      >
                        <IoMdMore className="text-xl" />
                      </button>

                      <AnimatePresence>
                        {openMenuPayroll[index] && (
                          <motion.div
                            initial={{ opacity: 0, y: 6, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 6, scale: 0.98 }}
                            transition={{ duration: 0.12 }}
                            className="absolute right-0 top-full z-[100] mt-1.5 w-44 min-w-[11rem] overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-xl shadow-slate-900/10 ring-1 ring-gray-100/80"
                          >
                            <ul className="flex flex-col py-0.5">
                              {payrollActionMenu?.map((menuItem) => (
                                <li key={menuItem.id} className="px-1.5">
                                  <button
                                    type="button"
                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs font-medium transition-colors ${
                                      menuItem.id === 3
                                        ? 'text-rose-600 hover:bg-rose-50'
                                        : 'text-slate-700 hover:bg-blue-50 hover:text-bgBlue'
                                    }`}
                                    onClick={() => handleMenuPayroll(menuItem.id, data)}
                                  >
                                    <span>{menuItem.title}</span>
                                    <span className="shrink-0 opacity-90">{menuItem.icon}</span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Name */}
                  <h3
                    className="mt-3 line-clamp-2 font-poppins text-[15px] font-semibold leading-snug text-slate-900"
                    title={data.name}
                  >
                    {data.name}
                  </h3>

                  {/* Salary highlight */}
                  <div className="mt-3 overflow-hidden rounded-xl bg-gradient-to-br from-bgBlue via-blue-500 to-indigo-600 px-3 py-3 text-white shadow-inner ring-1 ring-white/20">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/75">Base salary</p>
                    <p className="mt-1 font-poppins text-xl font-bold tabular-nums tracking-tight">
                      {formatSalaryDisplay(data.salary_amount)}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="mt-3 flex flex-1 flex-col gap-2 border-t border-gray-100/90 pt-3">
                    <div className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-slate-50/90 text-slate-600">
                        <FaMapMarkerAlt className="text-[11px] text-slate-500" />
                      </span>
                      <span className="min-w-0 flex-1 leading-snug">
                        <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Branch
                        </span>
                        <span className="font-medium text-slate-800">{data.branch_name || '—'}</span>
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-slate-50/90 text-slate-600">
                        <FaCalendarAlt className="text-[11px] text-slate-500" />
                      </span>
                      <span className="min-w-0 flex-1 leading-snug">
                        <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Created
                        </span>
                        <span className="font-medium text-slate-800">{data.creation_time || '—'}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </motion.div>
          ))
        )}
      </div>

      <ConfirmationDialog
        openDialog={openDialogDelTemp}
        handleOpen={salaryTempDialog}
        handleConfirm={handleDelete}
        title="Confirm Delete"
        message="Are you sure to Delete this Salary Template?"
      />
    </>
  )
}

export default GridManageSalary
