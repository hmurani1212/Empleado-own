import React, { useState, useEffect } from 'react'
import useNotesPoolServices from '../../ViewModel/NotesPoolViewModel/NotesPoolServices';
import { FaBook } from 'react-icons/fa';
import { FaShareNodes } from 'react-icons/fa6';
import { BiCalendar, BiSearch } from 'react-icons/bi';
import { IoMdMore } from 'react-icons/io';
import { hexToRGBA, titleNameAlpha } from '../../services/appServices';
import { formatDateDMY } from '../../services/__dateTimeServices';
import SharedNotebookNotes from './SharedNotebookNotes';
import { MenuItem, Typography } from '@material-tailwind/react';
import useDropdownService from '../../services/__dropDownHoverService';
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { sharedNotebookMenuList } from '../../services/__notesPoolServices';
import useSharedNotebookHandler from '../../ViewModel/NotesPoolViewModel/SharedNotebookHandler';
import CustomDialog from '../../Components/CustomDialog/CustomDialog';
import ShareNoteBook from './ShareNoteBook';

const SharedNotebooks = () => {
  const location = useLocation();
  const { sharednotebooks,sharednotebookCount, toggleMenuValue, openMenuValue } = useNotesPoolServices()
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
  console.log("isLoading", isLoading)

  // Reset selectedNotebook when navigating to Shared Notebooks route
  // This ensures clicking the navbar link resets the view back to the list
  useEffect(() => {
    if (location.pathname === '/notespool/sharednotebooks') {
      // Reset state when navigation state indicates reset (from navbar click)
      if (location.state?.reset) {
        setSelectedNotebook(null);
        setSearchValue(''); // Also reset search when navigating back
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

  console.log("hasSharePermission", )

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
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <span
            className='w-8 h-8 p-2 bg-[#8bc9f8] text-white rounded-md'
          ><FaBook /></span>
          <span className='text-[20px]'>Shared Notesbook</span>
        </div>
        <div className='flex items-center gap-3 text-[#698592] text-[12px]'>
          <span>Total Notebooks</span>
          <span>{Array.isArray(filteredNotebooks) ? filteredNotebooks.length : 0}</span>
        </div>
      </div>
      {/* <div className="relative w-96 h-9">
        <div className="absolute grid w-5 h-5 place-items-center text-blue-gray-500 top-2/4 right-3 -translate-y-2/4">
            <span>
                <BiSearch />
            </span>
        </div>
        <input
          className="peer w-full h-full bg-transparent text-blue-gray-700  outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] !pr-9 border-blue-gray-200 focus:border-[#8bc9f8]"
          placeholder=" " 
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          />
        <label
          className="flex w-full h-full select-none pointer-events-none absolute left-0 !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-[#8bc9f8] before:border-blue-gray-200 peer-focus:before:!border-[#8bc9f8] after:border-blue-gray-200 peer-focus:after:!border-[#8bc9f8]"
        >
          Search NoteBook
        </label>
      </div> */}

      <div className='w-[350px] min-w-[200px]'>
          {/* <label className='text-[12px] text-[#474747] font-Urbanist font-medium px-2'>Search Branch</label> */}
          <div className="relative w-full min-w-[200px] h-[38px] bg-white rounded-[7px] px-3 drop-shadow-md ">
            <div className="absolute grid w-5 h-5 place-items-center text-blue-gray-500 top-2/4 right-3 -translate-y-2/4">
              <span>
                <BiSearch />
              </span>
            </div>
            <input
              className="w-full h-full bg-transparent text-[#474747] border-none outline-none text-[12px] font-Urbanist rounded-[7px]"
              placeholder="Search Notebook" name='searchBranch' value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
          </div>
        </div>

      {isLoading && (
              <div className="flex justify-center py-10 items-center w-full">
                <span className="text-gray-500">
                  Loading notebooks...
                </span>
              </div>
          )}

      <div className='grid
              grid-cols-[repeat(auto-fit,minmax(300px,1fr))]
              gap-4
              w-full'>
        {Array.isArray(filteredNotebooks) && filteredNotebooks.length > 0 && (
          filteredNotebooks.map((ele, i)=>{
            const { firstLetter, bgColor } = titleNameAlpha(ele.notebook_name);
            const rgbaColor = hexToRGBA(bgColor, 0.3);
            return (
              <div 
                key={ele.id || ele._id} 
                className='flex w-full min-h-[110px] rounded-2xl bg-bgBlue p-3 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01]'
                onClick={() => handleNotebookClick(ele)}
              >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shrink-0">
                    <FaBook className="h-5 w-5 text-bgBlue" />
                  </span>
                  <div className="flex flex-col flex-1 w-full">
                    <div className="relative group w-full">
                      <span className="block text-white font-semibold text-sm truncate cursor-default">
                        {ele.notebook_name}
                      </span>

                      {/* TOOLTIP */}
                      <div className=" absolute left-0 top-full z-50 mt-1 hidden max-w-xs rounded-md bg-white px-2 py-1 text-xs text-[#474747] shadow-lg group-hover:block whitespace-normal break-words">
                        {ele.notebook_name}
                      </div>
                    </div>

                    {/* SUBTEXT */}
                    <span className="text-white text-xs">
                      {ele.total_notes_inside || 0} Notes
                    </span>
                  </div>
                </div>
                  <div className='flex-1 flex flex-col justify-between'>
                    <div className='flex justify-end'>
                      {hasSharePermission(ele) && (
                        <div 
                          ref={(el) => (triggerRefs.current[i] = el)}
                          onMouseEnter={() => toggleMenuValue(i, true)} 
                          onMouseLeave={() => toggleMenuValue(i, false)} 
                          className='relative'
                          onClick={(e) => e.stopPropagation()}
                        >
                          <motion.div 
                            className='text-white cursor-pointer relative hover:text-black'
                            whileHover={{scale:1.4}}
                          >
                            <IoMdMore />
                          </motion.div>
                          {openMenuValue[i] && (
                            <div
                              className={`border border-gray-200 rounded-lg absolute z-[9999] bg-white w-[200px] left-[-170px] shadow-md ${
                                getDropdownPosition(i) === 'top' ? 'bottom-full' : 'top-full'
                              }`}
                            >
                              <motion.div
                                initial={{ opacity: 0, y: getDropdownPosition(i) === 'top' ? -50 : 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: getDropdownPosition(i) === 'top' ? -50 : 50 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ul className="flex w-full flex-col gap-1 p-1">
                                  {sharedNotebookMenuList.map((menuItem) => (
                                    <MenuItem 
                                      key={menuItem.id}
                                      className='flex items-center justify-between'
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMenuItemClick(ele, menuItem);
                                      }}
                                    >
                                      <Typography variant="small">{menuItem.name}</Typography>
                                      <span>{menuItem.icon}</span>
                                    </MenuItem>
                                  ))}
                                </ul>
                              </motion.div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className='flex items-center gap-1 mt-2 justify-end'>
                      <span><BiCalendar className="text-white text-xs" /></span>
                      <span className='text-white text-xs'>{formatDateDMY(ele.created_at)}</span>
                    </div>
                  </div>
              </div>  
          )})
        )}
        {!isLoading && filteredNotebooks.length === 0 && (
            <div className="w-full flex items-center justify-center py-10">
              <span className="text-[#474747] text-[14px] font-medium font-Urbanist">
                No notebook exist
              </span>
            </div>
          )}
      </div>

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