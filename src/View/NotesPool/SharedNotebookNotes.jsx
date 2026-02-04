import React, { useEffect, useState } from 'react'
import { FaBook, FaStar, FaRegStar } from 'react-icons/fa'
import { BiCalendar, BiSearch, BiArrowBack, BiPlus } from 'react-icons/bi'
import { IoMdMore } from 'react-icons/io'
import { hexToRGBA, titleNameAlpha } from '../../services/appServices'
import { formatDateDMY, formatDateDM } from '../../services/__dateTimeServices'
import { motion } from 'framer-motion'
import { MenuItem, Typography } from '@material-tailwind/react'
import useStore from '../../Store/store'
import CustomDialog from '../../Components/CustomDialog/CustomDialog'
import EditorData from './EditorData'
import useNoteHandler from '../../ViewModel/NotesPoolViewModel/NoteHandler'
import useNotesPoolServices from '../../ViewModel/NotesPoolViewModel/NotesPoolServices'
import { MdEditDocument } from 'react-icons/md'
import AddEditNote from './AddEditNote'
import PortalDrawer from '../../Components/CustomDrawer/PortalDrawer'
import Editor from './Editor'
import { sharednotesMenuList } from '../../services/__notesPoolServices'
import useDropdownService from '../../services/__dropDownHoverService'
import notesPoolApi from '../../Model/Data/NotesPool/NotesPool'
import { showToast } from '../../Components/Toaster/Toaster'

const SharedNotebookNotes = ({ notebook, onBack }) => {
  const [selectedNote, setSelectedNote] = useState(null)
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAddNoteDrawer, setShowAddNoteDrawer] = useState(false)
  const [addNoteValue, setAddNoteValue] = useState({
    note_title: '',
    notebook_id: notebook?._id || notebook?.id,
    loading: false,
  })
  // CRITICAL: Store shared_links on mount to preserve permissions even after API updates notebook data
  const [preservedPermissions, setPreservedPermissions] = useState(null)

  // Get starred notes functionality from store
  const { starredNotes, handleStarClick, isStarred, initializeStarredNotes, isStarredNotesInitialized } = useStore()

  // Get note handler for viewing and editing notes
  const { 
    editorData, 
    handleNoteHandler, 
    editorValue, 
    toggleEditNote,
    handleAddNotesData,
    getNoteData,
    handleNoteMenuList
  } = useNoteHandler()

  // Get shared notebook notes from store
  const { gettingSharedNotebookNotes, sharedNotebookNotes, searchingSharedNotebookNotes, toggleMenuValue, openMenuValue } = useNotesPoolServices()

  // Dropdown service for positioning
  const { getDropdownPosition, triggerRefs } = useDropdownService()

  // CRITICAL: Preserve permissions from shared_links on mount
  useEffect(() => {
    if (notebook?.shared_links?.[0]?.permissions) {
      setPreservedPermissions(notebook.shared_links[0].permissions)
    }
  }, [notebook?._id])

  // Fetch notes for the shared notebook
  useEffect(() => {
    if (notebook && notebook._id) {
      setLoading(true)
      gettingSharedNotebookNotes(notebook._id).finally(() => setLoading(false))
    }
  }, [notebook])

  // Initialize starred notes
  useEffect(() => {
    if (!isStarredNotesInitialized) {
      initializeStarredNotes()
    }
  }, [isStarredNotesInitialized, initializeStarredNotes])

  // Handle search
  useEffect(() => {
    searchingSharedNotebookNotes(searchValue)
  }, [searchValue])

  const handleNoteClick = (note) => {
    setSelectedNote(note)
    setShowNoteDialog(true)
    handleNoteHandler(note)
  }



  const handleStarClickWrapper = (note, e) => {
    handleStarClick(note, e)
  }

  // Check if notebook has notes_addition permission
  const hasNotesAdditionPermission = () => {
    if (!preservedPermissions) return false;
    return preservedPermissions?.allow_notes_addition === 1 || 
           preservedPermissions?.allow_notes_addition === '1' || 
           preservedPermissions?.allow_notes_addition === true;
  }

  // Check if notebook has write permission (using allow_view as write permission)
  const hasWritePermission = () => {
    if (!preservedPermissions) return false;
    return preservedPermissions?.allow_view === 1 || 
           preservedPermissions?.allow_view === '1' || 
           preservedPermissions?.allow_view === true;
  }

  const handleAddNoteClick = () => {
    setShowAddNoteDrawer(true);
    setAddNoteValue({
      note_title: '',
      notebook_id: notebook?._id || notebook?.id,
      loading: false,
    });
  }

  const handleCloseAddNote = () => {
    setShowAddNoteDrawer(false);
    setAddNoteValue({
      note_title: '',
      notebook_id: notebook?._id || notebook?.id,
      loading: false,
    });
  }

  const handleNoteInputChange = (e) => {
    const { name, value } = e.target;
    setAddNoteValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const handleSubmitNote = async (e) => {
    e.preventDefault();
    if (!addNoteValue.note_title.trim()) {
      showToast('Please enter note title', 'error');
      return;
    }

    setAddNoteValue((prev) => ({ ...prev, loading: true }));

    try {
      const apiData = {
        note_title: addNoteValue.note_title,
        notebook_id: addNoteValue.notebook_id,
      };

      const response = await notesPoolApi.addNote(apiData);
      const data = response.data;

      if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
        const insertedData = data.DB_DATA;
        showToast('Note Added Successfully', 'success');
        handleCloseAddNote();
        // Refresh notes list
        gettingSharedNotebookNotes(notebook._id || notebook.id);
        // Open the newly created note in editor
        setSelectedNote(insertedData);
        getNoteData(insertedData);
      } else {
        const error = data.ERROR_DESCRIPTION;
        showToast(error, 'error');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      showToast('Failed to add note', 'error');
    } finally {
      setAddNoteValue((prev) => ({ ...prev, loading: false }));
    }
  }


  // Notes are already filtered by the store's search function - SAFE CHECK
  const filteredNotes = Array.isArray(sharedNotebookNotes) ? sharedNotebookNotes : []

  return (
    <div className='flex flex-col gap-6 py-2 pb-1 pl-2 pr-4'>
      {/* Header with back button */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className='p-2 hover:bg-gray-100 rounded-md transition-colors flex items-center justify-center'
              title="Back to notebooks"
            >
              <BiArrowBack className='text-xl text-[#474747]' />
            </button>
          )}
          <span className='w-8 h-8 p-2 bg-[#8bc9f8] text-white rounded-md'>
            <FaBook />
          </span>
          <div>
            <span className='text-[20px]'>{notebook?.notebook_name}</span>
          </div>
        </div>
        <div className='flex items-center gap-3 text-[#698592] text-[12px]'>
          <span>Total Notes</span>
          <span>{sharedNotebookNotes?.length || 0}</span>
        </div>
      </div>

      {/* Search */}

      {/* <div className="relative w-96 h-9">
        <div className="absolute grid w-5 h-5 place-items-center text-blue-gray-500 top-2/4 right-3 -translate-y-2/4">
          <span>
            <BiSearch />
          </span>
        </div>
        <input
          className="peer w-full h-full bg-transparent text-blue-gray-700 outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] !pr-9 border-blue-gray-200 focus:border-[#8bc9f8]"
          placeholder=" "
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <label className="flex w-full h-full select-none pointer-events-none absolute left-0 !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-[#8bc9f8] before:border-blue-gray-200 peer-focus:before:!border-[#8bc9f8] after:border-blue-gray-200 peer-focus:after:!border-[#8bc9f8]">
          Search Notes
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
              placeholder="Search Notes" name='searchBranch' value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
          </div>
        </div>

      <div className="grid w-full gap-4 grid-cols-[repeat(auto-fill,minmax(190px,1fr))]">
        {loading ? (
          <div className='col-span-full text-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto'></div>
            <p className='mt-2 text-gray-500'>Loading notes...</p>
          </div>
        ) : (
          <>
            
            {/* Notes List */}
            {filteredNotes?.length > 0
          ? filteredNotes?.map((note, index) => {
            // SAFE CHECK: Skip if note is null/undefined
            if (!note) return null;
            
            const { bgColor } = titleNameAlpha(note.note_title || 'Untitled')
            const rgbaColor = hexToRGBA(bgColor, 0.3)
            const noteId = note.note_id || note.id || note._id
            const isNoteStarred = isStarred(noteId)
            return (
              <div
                key={index}
                className="border-[1px] border-[#3DA5F4] rounded-[10px] flex flex-col justify-between w-full justify-self-start max-w-[190px] h-[190px] cursor-pointer bg-white p-2"
                onClick={() => handleNoteClick(note)}>
                <div className="flex justify-end items-end gap-2 w-full">
                  {/* Star Icon */}
                  <motion.div
                    className="cursor-pointer"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleStarClickWrapper(note, e)}
                  >
                    {(() => {
                      return isNoteStarred ? (
                        <FaStar className="text-yellow-500 text-lg" />
                      ) : (
                        <FaRegStar className="text-gray-400 text-lg hover:text-yellow-500" />
                      );
                    })()}
                  </motion.div>

                  {/* More Menu - Only show if user has write permission */}
                  {hasWritePermission() && (
                    <div
                      ref={(el) => (triggerRefs.current[index] = el)}
                      onMouseEnter={() => toggleMenuValue(index, true)}
                      onMouseLeave={() => toggleMenuValue(index, false)}
                      className="relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <motion.div
                        className="text-[#698592] cursor-pointer relative hover:text-black"
                        whileHover={{ scale: 1.4 }}
                      >
                        <IoMdMore />
                      </motion.div>
                      {openMenuValue[index] && (
                        <div
                          className={`border border-gray-200 rounded-lg absolute z-50 bg-white w-[200px] left-[-170px] shadow-md ${getDropdownPosition(index) === "top"
                            ? "bottom-full"
                            : "top-full"
                            }`}
                        >
                          <motion.div
                            initial={{
                              opacity: 0,
                              y: getDropdownPosition(index) === "top" ? -50 : 50,
                            }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{
                              opacity: 0,
                              y: getDropdownPosition(index) === "top" ? -50 : 50,
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            <ul className="flex w-full flex-col gap-1 p-1">
                              {Array.isArray(sharednotesMenuList) && sharednotesMenuList.map((menuItem) => (
                                <MenuItem
                                  className="flex items-center justify-between"
                                  key={menuItem.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNoteMenuList(note, menuItem);
                                  }}
                                >
                                  <Typography variant="small">
                                    {menuItem.name}
                                  </Typography>
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

                <div className="space-y-4">
                  <div className="flex flex-col space-y-1 items-center justify-center">
                    <div className="flex items-center justify-center bg-bgBlue rounded-full w-[50px] h-[50px]">
                      <MdEditDocument className="text-white w-[21px] h-[21px]" />
                    </div>
                    {/* TITLE + TOOLTIP */}
                    <div className="relative group w-full text-center">
                      <span
                        className="block text-sm font-medium truncate"
                      >
                        {note.note_title}
                      </span>
                      <div className="absolute hidden group-hover:block text-center bg-black text-white text-xs px-2 py-1 rounded mt-1 z-50 whitespace-normal break-words max-w-xs">
                        {note.note_title}
                      </div>
                    </div>
                    <span className="text-[10px] font-normal font-Urbanist text-[#616161]">Last Update {formatDateDMY(note.last_updated)}</span>
                    <span className="text-[10px] font-normal font-Urbanist text-bgBlue">views ({note?.view_count || 0})</span>
                  </div>

                  <div className="flex items-center justify-end w-full gap-1">
                    <BiCalendar className="text-bgBlue text-[10px]" />
                    <span className="text-[10px] font-normal font-Urbanist text-[#616161]">{formatDateDMY(note.entry_time)}</span>
                  </div>
                </div>
              </div>
            );
          })
          : null}
          </>
        )}
        
        {/* Empty State */}
        {!loading && filteredNotes.length === 0 && (
          <div className="col-span-full w-full flex items-center justify-center py-10">
            <span className="text-[#474747] text-[14px] font-medium font-Urbanist">
              No notes exist
            </span>
          </div>
        )}
      </div>

      {/* Note View Dialog */}
      {showNoteDialog && selectedNote && (
        <CustomDialog
          openDialog={showNoteDialog}
          size="xxl"
          handleOpen={() => setShowNoteDialog(false)}
          title={selectedNote.note_title}
          footer={false}
          compo={<EditorData editorData={editorData} />}
        />
      )}

      {/* Add Note Drawer */}
      {showAddNoteDrawer && (
        <PortalDrawer
          open={showAddNoteDrawer}
          title="Add Note"
          closeDrawer={handleCloseAddNote}
          widthSize={500}
          compo={
            <AddEditNote
              addNoteValue={addNoteValue}
              handleChangeNote={handleNoteInputChange}
              handleSelectNotebook={() => {}}
              handleSubmitNote={handleSubmitNote}
            />
          }
        />
      )}

      {/* Edit Note Dialog */}
      {editorValue.show && (
        <CustomDialog
          openDialog={editorValue.show}
          size="xxl"
          handleOpen={() => {
            toggleEditNote();
          }}
          title={editorValue.noteHeader?.note_title || selectedNote?.note_title || 'Edit Note'}
          footer={false}
          compo={
            <Editor
              addNoteValue={editorValue}
              toggleEditorNote={() => {
                toggleEditNote();
                // Refresh notes list after editing
                gettingSharedNotebookNotes(notebook._id || notebook.id);
              }}
            />
          }
        />
      )}
    </div>
  )
}

export default SharedNotebookNotes