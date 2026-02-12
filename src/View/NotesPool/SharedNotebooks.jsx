import React, { useState, useEffect } from 'react'
import useNotesPoolServices from '../../ViewModel/NotesPoolViewModel/NotesPoolServices';
import { FaBook } from 'react-icons/fa';
import { BiCalendar, BiSearch } from 'react-icons/bi';
import { IoMdMore } from 'react-icons/io';
import { hexToRGBA, titleNameAlpha } from '../../services/appServices';
import { formatDateDMY } from '../../services/__dateTimeServices';
import SharedNotebookNotes from './SharedNotebookNotes';
import { MenuItem, Typography } from '@material-tailwind/react';
import useDropdownService from '../../services/__dropDownHoverService';
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { sharedNotebookMenuList } from '../../services/__notesPoolServices';
import useSharedNotebookHandler from '../../ViewModel/NotesPoolViewModel/SharedNotebookHandler';
import CustomDialog from '../../Components/CustomDialog/CustomDialog';
import ShareNoteBook from './ShareNoteBook';

import { NotebookSkeleton } from './NotesPoolSkeletons';

const SharedNotebooks = () => {
  const location = useLocation();
  const { sharednotebooks, sharednotebookCount, toggleMenuValue, openMenuValue } = useNotesPoolServices()
  const [selectedNotebook, setSelectedNotebook] = useState(null)
  const [searchValue, setSearchValue] = useState('')
  const { getDropdownPosition, triggerRefs } = useDropdownService()

  const {
    shareNotebookValue,
    handleShareMenuClick,
    toggleShareDialog,
    handleChangeShareNotebook,
    handleSelectShareNote,
    handleToggleSubDept,
    handleShareNotebookAdd,
    handleCopytoClipboard,
    handleCopytoClipboardMouseLeave,
    copied,
    mySharedNotebooks,
  } = useSharedNotebookHandler();

  const isLoading = !sharednotebooks;

  // Reset selectedNotebook when navigating to Shared Notebooks route
  useEffect(() => {
    if (location.pathname === '/notespool/sharednotebooks') {
      if (location.state?.reset) {
        setSelectedNotebook(null);
        setSearchValue('');
      }
    }
  }, [location.pathname, location.state]);

  const handleNotebookClick = (notebook) => {
    setSelectedNotebook(notebook)
  }

  const handleBackToList = () => {
    setSelectedNotebook(null)
  }

  const handleMenuItemClick = (notebook, menuItem) => {
    switch (menuItem.id) {
      case 1: // Share
        handleShareMenuClick(notebook);
        break;
      default:
        break;
    }
  }

  // Check if notebook has sharing permission
  const hasSharePermission = (notebook) => {
    const permissions = notebook?.shared_links?.[0]?.permissions;
    return permissions?.allow_sharing === 1 || permissions?.allow_sharing === '1' || permissions?.allow_sharing === true;
  }

  const filteredNotebooks = sharednotebooks?.filter(notebook => 
    notebook.notebook_name?.toLowerCase().includes(searchValue.toLowerCase())
  ) || []

  // If a notebook is selected, show the notes view
  if (selectedNotebook) {
    return (
      <SharedNotebookNotes 
        notebook={selectedNotebook} 
        onBack={handleBackToList}
      />
    )
  }

  return (
    <div className='flex flex-col gap-6 py-2'>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <span className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-500 rounded-xl shadow-sm">
              <FaBook className="text-xl" />
            </span>
            <div>
               <span className="text-xl font-bold text-gray-800">Shared Notebooks</span>
               <p className="text-xs text-gray-500">Notebooks shared with you</p>
            </div>
        </div>

        <div className='flex items-center gap-4'>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-100 shadow-sm">
                <span className="text-xs text-gray-500">Total:</span>
                <span className="text-sm font-bold text-gray-800">{Array.isArray(filteredNotebooks) ? filteredNotebooks.length : 0}</span>
             </div>

            {/* SEARCH */}
            <div className="relative w-full md:w-[250px] h-[40px] bg-white rounded-xl border border-gray-100 shadow-sm transition-all focus-within:shadow-md focus-within:border-blue-100">
                <div className="absolute grid w-8 h-full place-items-center text-gray-400 right-0">
                <BiSearch />
                </div>
                <input
                className="w-full h-full bg-transparent text-gray-700 border-none outline-none text-sm font-medium px-4 rounded-xl placeholder:text-gray-400"
                placeholder="Search Notebooks..." 
                name='searchBranch' 
                value={searchValue} 
                onChange={(e) => setSearchValue(e.target.value)} 
                />
            </div>
        </div>
      </div>

      {isLoading && <NotebookSkeleton />}

      {!isLoading && (
      <div className='grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5 w-full'>
        {Array.isArray(filteredNotebooks) && filteredNotebooks.length > 0 && (
          filteredNotebooks.map((ele, i)=>{
            return (
              <motion.div 
                key={ele.id || ele._id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative flex flex-col justify-between w-full min-h-[140px] rounded-2xl bg-white border border-gray-100 p-5 cursor-pointer transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:border-blue-100"
                onClick={() => handleNotebookClick(ele)}
              >
                  {/* Decorative Gradient */}
                  <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50/50 to-transparent rounded-bl-full -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  </div>

                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm group-hover:scale-105 transition-transform duration-300">
                            <FaBook className="text-lg" />
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-gray-800 font-bold text-base line-clamp-1 group-hover:text-blue-600 transition-colors">
                                {ele.notebook_name}
                            </h3>
                            <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-blue-400 transition-colors"></span>
                                {ele.total_notes_inside || 0} Notes
                            </p>
                        </div>
                    </div>

                    <div className='flex justify-end'>
                      {hasSharePermission(ele) && (
                        <div 
                          ref={(el) => (triggerRefs.current[i] = el)}
                          onMouseEnter={() => toggleMenuValue(i, true)} 
                          onMouseLeave={() => toggleMenuValue(i, false)} 
                          className='relative'
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
                            <IoMdMore className="text-lg" />
                          </div>
                          
                          <AnimatePresence>
                          {openMenuValue[i] && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className={`
                                    absolute z-[9999] w-48 rounded-xl border border-gray-100 bg-white shadow-xl right-0
                                    ${getDropdownPosition(i) === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}
                                `}
                            >
                                <ul className="flex w-full flex-col p-1.5">
                                  {sharedNotebookMenuList.map((menuItem) => (
                                    <MenuItem 
                                      key={menuItem.id}
                                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMenuItemClick(ele, menuItem);
                                      }}
                                    >
                                      <Typography variant="small" className="font-medium text-xs">{menuItem.name}</Typography>
                                      <span className="text-gray-400 text-sm">{menuItem.icon}</span>
                                    </MenuItem>
                                  ))}
                                </ul>
                            </motion.div>
                          )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50 relative z-10">
                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full">
                       <span className="text-xs text-gray-500 font-medium">Shared</span>
                    </div>
                    <div className='flex items-center gap-1.5 text-gray-400'>
                      <BiCalendar className="text-xs" />
                      <span className='text-[11px] font-medium'>{formatDateDMY(ele.created_at)}</span>
                    </div>
                  </div>
              </motion.div>  
          )})
        )}
      </div>
      )}

      {!isLoading && filteredNotebooks.length === 0 && (
        <div className="flex flex-col justify-center items-center py-20 w-full bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <FaBook className="text-gray-300 text-2xl" />
            </div>
            <span className="text-gray-500 text-sm font-medium">
              No shared notebooks found.
            </span>
        </div>
      )}

      {/* Share Notebook Dialog */}
      {shareNotebookValue.show && (
        <CustomDialog
          openDialog={shareNotebookValue.show}
          title="Share Notebook"
          handleOpen={toggleShareDialog}
          footer={false}
          outsidePress={false}
          size="lg"
          compo={
            <ShareNoteBook
              handleChangeShareNotebook={handleChangeShareNotebook}
              shareNotebookValue={shareNotebookValue}
              handleSelectShareNote={handleSelectShareNote}
              handleShareNotebookAdd={handleShareNotebookAdd}
              handleToggleSubDept={handleToggleSubDept}
              mySharedNotebooks={mySharedNotebooks}
              handleCopytoClipboard={handleCopytoClipboard}
              handleCopytoClipboardMouseLeave={handleCopytoClipboardMouseLeave}
              copied={copied}
            />
          }
        />
      )}
    </div>
  )
}

export default SharedNotebooks