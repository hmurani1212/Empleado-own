import React, { useEffect, useState } from 'react'
import { FaBook, FaStar, FaRegStar } from 'react-icons/fa'
import { BiCalendar, BiSearch, BiArrowBack, BiPlus } from 'react-icons/bi'
import { IoMdMore } from 'react-icons/io'
import { hexToRGBA, titleNameAlpha } from '../../services/appServices'
import { formatDateDMY, formatDateDM } from '../../services/__dateTimeServices'
import { motion, AnimatePresence } from 'framer-motion'
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
import { sharednotesMenuList, isSharingPermissionGranted } from '../../services/__notesPoolServices'
import useDropdownService from '../../services/__dropDownHoverService'
import notesPoolApi from '../../Model/Data/NotesPool/NotesPool'
import { showToast } from '../../Components/Toaster/Toaster'

import { NoteSkeleton, NoteViewSkeleton } from "./NotesPoolSkeletons";

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
  const [preservedPermissions, setPreservedPermissions] = useState(null)

  const { starredNotes, handleStarClick, isStarred, initializeStarredNotes, isStarredNotesInitialized } = useStore()

  const { 
    editorData,
    addNoteValue: noteHandlerAddNoteValue,
    handleNoteHandler, 
    toggleShowNote,
    editorValue, 
    toggleEditNote,
    handleAddNotesData,
    getNoteData,
    handleNoteMenuList
  } = useNoteHandler()

  const { gettingSharedNotebookNotes, sharedNotebookNotes, searchingSharedNotebookNotes, toggleMenuValue, openMenuValue } = useNotesPoolServices()

  const { getDropdownPosition, triggerRefs } = useDropdownService()

  useEffect(() => {
    if (notebook?.shared_links?.[0]?.permissions) {
      setPreservedPermissions(notebook.shared_links[0].permissions)
    }
  }, [notebook?._id])

  useEffect(() => {
    if (notebook && notebook._id) {
      setLoading(true)
      gettingSharedNotebookNotes(notebook._id).finally(() => setLoading(false))
    }
  }, [notebook])

  useEffect(() => {
    if (!isStarredNotesInitialized) {
      initializeStarredNotes()
    }
  }, [isStarredNotesInitialized, initializeStarredNotes])

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

  const hasNotesAdditionPermission = () =>
    preservedPermissions ? isSharingPermissionGranted(preservedPermissions.allow_notes_addition) : false

  /** Note-level Edit menu: requires allow_edit, not merely allow_view. */
  const hasEditSharedNotePermission = () =>
    preservedPermissions ? isSharingPermissionGranted(preservedPermissions.allow_edit) : false

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
        gettingSharedNotebookNotes(notebook._id || notebook.id);
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

  const filteredNotes = Array.isArray(sharedNotebookNotes) ? sharedNotebookNotes : []

  return (
    <div className='flex flex-col gap-6 py-2 pb-6 pl-2 pr-4'>
      {/* Header with back button */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div className='flex items-center gap-3'>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className='p-2.5 hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-center text-gray-500 hover:text-gray-800'
              title="Back to notebooks"
            >
              <BiArrowBack className='text-xl' />
            </button>
          )}
          <div className="flex items-center gap-3">
            <span className='w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-500 rounded-xl shadow-sm'>
                <FaBook className='text-lg' />
            </span>
            <div>
                <span className='text-xl font-bold text-gray-800' title={notebook?.notebook_name ? String(notebook.notebook_name) : undefined}>{notebook?.notebook_name}</span>
                <p className="text-xs text-gray-500">Shared Notebook</p>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-4'>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-100 shadow-sm">
                <span className="text-xs text-gray-500">Total:</span>
                <span className="text-sm font-bold text-gray-800">{sharedNotebookNotes?.length || 0}</span>
             </div>

            {/* Search */}
            <div className="relative w-full md:w-[250px] h-[40px] bg-white rounded-xl border border-gray-100 shadow-sm transition-all focus-within:shadow-md focus-within:border-blue-100">
                <div className="absolute grid w-8 h-full place-items-center text-gray-400 right-0">
                <BiSearch />
                </div>
                <input
                className="w-full h-full bg-transparent text-gray-700 border-none outline-none text-sm font-medium px-4 rounded-xl placeholder:text-gray-400"
                placeholder="Search Notes..." 
                name='searchBranch' 
                value={searchValue} 
                onChange={(e) => setSearchValue(e.target.value)} 
                />
            </div>
        </div>
      </div>

      <div className="grid w-full gap-5 grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
        {loading ? (
          <NoteSkeleton />
        ) : (
          <>
            {/* Add Note Card (if permitted) */}
            {hasNotesAdditionPermission() && (
                <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex flex-col items-center justify-center w-full h-[220px] rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/30 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 group"
                    onClick={handleAddNoteClick}
                >
                    <div className="flex items-center justify-center w-14 h-14 bg-white rounded-full shadow-sm text-blue-500 mb-3 group-hover:scale-110 transition-transform duration-300 group-hover:text-blue-600">
                        <BiPlus className="text-3xl" />
                    </div>
                    <span className="font-semibold text-sm text-gray-600 group-hover:text-blue-600 transition-colors">Create New Note</span>
                </motion.div>
            )}
            
            {/* Notes List */}
            {filteredNotes?.length > 0 && filteredNotes?.map((note, index) => {
            if (!note) return null;
            
            const noteId = note.note_id || note.id || note._id
            const isNoteStarred = isStarred(noteId)
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                title={note.note_title ? String(note.note_title) : undefined}
                className="relative flex flex-col justify-between w-full h-[220px] rounded-2xl bg-white border border-gray-100 p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-blue-100 group overflow-hidden"
                onClick={() => handleNoteClick(note)}
              >
                {/* Decorative top bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="flex justify-between items-start w-full relative">
                   {/* Icon Placeholder */}
                   <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors duration-300">
                      <MdEditDocument className="text-xl" />
                   </div>

                   <div className="flex items-center gap-1">
                      {/* Star Icon */}
                      <motion.div
                        className="p-1.5 rounded-full hover:bg-gray-50 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleStarClickWrapper(note, e)}
                      >
                        {isNoteStarred ? (
                            <FaStar className="text-yellow-400 text-base" />
                        ) : (
                            <FaRegStar className="text-gray-300 text-base hover:text-yellow-400 transition-colors" />
                        )}
                      </motion.div>

                      {/* More Menu */}
                      {hasEditSharedNotePermission() && (
                        <div
                        ref={(el) => (triggerRefs.current[index] = el)}
                        onMouseEnter={() => toggleMenuValue(index, true)}
                        onMouseLeave={() => toggleMenuValue(index, false)}
                        className="relative z-50"
                        onClick={(e) => e.stopPropagation()}
                        >
                        <div className="p-1.5 rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
                            <IoMdMore className="text-lg" />
                        </div>
                        
                        <AnimatePresence>
                        {openMenuValue[index] && (
                            <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className={`
                                absolute z-20 w-48 rounded-xl border border-gray-100 bg-white shadow-xl right-0
                                ${getDropdownPosition(index) === "top" ? "bottom-full mb-0" : "top-full mt-0"}
                            `}
                            >
                            <ul className="flex flex-col p-1.5">
                                {Array.isArray(sharednotesMenuList) && sharednotesMenuList.map((menuItem) => (
                                <MenuItem
                                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                                    key={menuItem.id}
                                    onClick={(e) => {
                                    e.stopPropagation();
                                    handleNoteMenuList(note, menuItem);
                                    }}
                                >
                                    <Typography variant="small" className="font-medium text-xs">
                                    {menuItem.name}
                                    </Typography>
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

                <div className="flex flex-col gap-2 mt-4 relative z-10 flex-1">
                    <h3 className="font-bold text-gray-800 text-lg leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {note.note_title}
                    </h3>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto relative z-10">
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <BiCalendar className="text-xs" />
                        <span className="text-[11px] font-medium">{formatDateDMY(note.last_updated)}</span>
                    </div>
                    {note?.view_count > 0 && (
                        <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">
                            {note.view_count} views
                        </span>
                    )}
                </div>
              </motion.div>
            );
          })}
          </>
        )}
        
        {/* Empty State */}
        {!loading && filteredNotes.length === 0 && !hasNotesAdditionPermission() && (
          <div className="col-span-full w-full flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <FaBook className="text-gray-300 text-2xl" />
            </div>
            <span className="text-gray-500 text-sm font-medium">
              No notes found in this shared notebook.
            </span>
          </div>
        )}
      </div>

      {/* Note View Dialog */}
      {showNoteDialog && selectedNote && (
        <CustomDialog
          openDialog={showNoteDialog}
          size="xxl"
          handleOpen={() => {
            setShowNoteDialog(false);
            toggleShowNote();
          }}
          title={selectedNote.note_title}
          footer={false}
          compo={
            noteHandlerAddNoteValue.viewNoteLoading ? (
              <NoteViewSkeleton />
            ) : (
              <EditorData editorData={editorData} />
            )
          }
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