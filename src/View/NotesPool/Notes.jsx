import React, { useEffect } from "react";
import { BiCalendar, BiPlus, BiSearch, BiArrowBack } from "react-icons/bi";
import { FaBook, FaStar, FaRegStar } from "react-icons/fa6";
import { IoMdMore } from "react-icons/io";
import { MdEditDocument } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { MenuItem, Typography } from "@material-tailwind/react";

import useNotesPoolServices from "../../ViewModel/NotesPoolViewModel/NotesPoolServices";
import useDropdownService from "../../services/__dropDownHoverService";
import useNoteHandler from "../../ViewModel/NotesPoolViewModel/NoteHandler";
import useSearchServices from "../../ViewModel/NotesPoolViewModel/SearchSerivces";
import useStore from '../../Store/store';

import { formatDateDMY } from "../../services/__dateTimeServices";
import { notMenuList } from "../../services/__notesPoolServices";
import { titleNameAlpha, hexToRGBA } from "../../services/appServices";

import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";
import PortalDrawer from "../../Components/CustomDrawer/PortalDrawer";
import AddEditNote from "./AddEditNote";
import CustomDialog from "../../Components/CustomDialog/CustomDialog";
import EditorData from "./EditorData";
import UpdateNoteData from "./UpdateNoteData";
import CutNote from "./CutNote";
import ShareNote from "./ShareNote";

const Notes = (props) => {
  const { notes: notesFromProps, noteBookTitle, noteBookID, onBack } = props;
  const { toggleMenuValue, openMenuValue } = useNotesPoolServices();

  // Get notes directly from store to ensure real-time updates
  const notesFromStore = useStore((state) => state.notes);
  const notes = notesFromStore || notesFromProps;

  const { getDropdownPosition, triggerRefs } = useDropdownService();

  // Global starred notes state
  const { starredNotes, handleStarClick, isStarred, initializeStarredNotes, isStarredNotesInitialized } = useStore();
  const {
    handleNoteMenuList,
    addNoteValue,
    handleConfirmToggleNote,
    deleteNoteBook,
    handleDrawerToggleNote,
    handleAddNote,
    handleSubmitNote,
    handleChangeNote,
    handleNoteHandler,
    toggleShowNote,
    editorData,
    editorValue,
    toggleEditNote,
    editorContent,
    handleAllTagRemove,
    handleAddTag,
    handleChangeEditor,
    handleRemoveTag,
    toggleHandleConfirmTag,
    confirmRemoveAllTags,
    handleAddNotesData,
    handleDrop,
    handleFileChange,
    handleRemoveFile,
    handleClick,
    handleAllFileRemove,
    fileInputRef,
    uploadProgress,
    toggleCutNote,
    handleSelectCutNotebook,
    handlePastSubmit,
    shareNoteValue,
    toggleNoteShare,
    handleChangeShareNote,
    handleSelectShareNote,
    handleCopytoClipboard,
    handleCopytoClipboardMouseLeave,
    copied,
    handleToggleSubDept,
    handleShareNoteAdd,
    uploadFiles,
  } = useNoteHandler();

  const { noteSearchValue, handleChangeNoteSearch } = useSearchServices();

  // Initialize starred notes on component mount
  useEffect(() => {
    if (!isStarredNotesInitialized) {
      initializeStarredNotes();
    }
  }, [isStarredNotesInitialized, initializeStarredNotes]);

  return (
    <div className="flex flex-col gap-6 py-2 pb-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-center text-gray-500 hover:text-gray-800"
              title="Back to notebooks"
            >
              <BiArrowBack className="text-xl" />
            </button>
          )}
          <div className="flex items-center gap-3">
             <span className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-500 rounded-xl shadow-sm">
                <FaBook className="text-lg" />
             </span>
             <div>
                <span className="text-xl font-bold text-gray-800">{noteBookTitle}</span>
                <p className="text-xs text-gray-500">View and manage notes</p>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-100 shadow-sm">
                <span className="text-xs text-gray-500">Total:</span>
                <span className="text-sm font-bold text-gray-800">{notes?.length || 0}</span>
             </div>

            {/* SEARCH */}
            <div className="relative w-full md:w-[250px] h-[40px] bg-white rounded-xl border border-gray-100 shadow-sm transition-all focus-within:shadow-md focus-within:border-blue-100">
                <div className="absolute grid w-8 h-full place-items-center text-gray-400 right-0">
                <BiSearch />
                </div>
                <input
                className="w-full h-full bg-transparent text-gray-700 border-none outline-none text-sm font-medium px-4 rounded-xl placeholder:text-gray-400"
                placeholder="Search Notes..." 
                name='searchBranch' 
                onChange={handleChangeNoteSearch} 
                />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-5 w-full">
        {/* ADD NOTE CARD */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="flex flex-col items-center justify-center w-full h-[220px] rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/30 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 group"
          onClick={() => handleAddNote(noteBookID)}
        >
          <div className="flex items-center justify-center w-14 h-14 bg-white rounded-full shadow-sm text-blue-500 mb-3 group-hover:scale-110 transition-transform duration-300 group-hover:text-blue-600">
            <BiPlus className="text-3xl" />
          </div>
          <span className="font-semibold text-sm text-gray-600 group-hover:text-blue-600 transition-colors">Create New Note</span>
        </motion.div>

        {/* NOTES LIST */}
        {notes?.length > 0 && notes.map((ele, i) => {
            const { bgColor } = titleNameAlpha(ele.note_title);
            const isNoteStarred = isStarred(ele.note_id || ele.id);
            
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative flex flex-col justify-between w-full h-[220px] rounded-2xl bg-white border border-gray-100 p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-blue-100 group overflow-hidden"
                onClick={() => handleNoteHandler(ele)}
              > 
                {/* Decorative top bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="flex justify-between items-start w-full relative z-10">
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
                        onClick={(e) => handleStarClick(ele, e)}
                      >
                        {isNoteStarred ? (
                            <FaStar className="text-yellow-400 text-base" />
                        ) : (
                            <FaRegStar className="text-gray-300 text-base hover:text-yellow-400 transition-colors" />
                        )}
                      </motion.div>

                      {/* Menu */}
                      <div
                        ref={(el) => (triggerRefs.current[i] = el)}
                        onMouseEnter={() => toggleMenuValue(i, true)}
                        onMouseLeave={() => toggleMenuValue(i, false)}
                        className="relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-1.5 rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
                          <IoMdMore className="text-lg" />
                        </div>
                        
                        <AnimatePresence>
                        {openMenuValue[i] && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className={`
                                absolute z-50 w-48 rounded-xl border border-gray-100 bg-white shadow-xl right-0
                                ${getDropdownPosition(i) === "top" ? "bottom-full mb-2" : "top-full mt-2"}
                            `}
                          >
                            <ul className="flex flex-col p-1.5">
                                {notMenuList.map((menuItem) => (
                                <MenuItem
                                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                                    key={menuItem.id}
                                    onClick={(e) => {
                                    e.stopPropagation();
                                    handleNoteMenuList(ele, menuItem);
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
                   </div>
                </div>

                <div className="flex flex-col gap-2 mt-4 relative z-10 flex-1">
                    <h3 className="font-bold text-gray-800 text-lg leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {ele.note_title}
                    </h3>
                    {/* Optional: Add a short preview of content here if available */}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto relative z-10">
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <BiCalendar className="text-xs" />
                        <span className="text-[11px] font-medium">{formatDateDMY(ele.last_updated)}</span>
                    </div>
                    {ele?.view_count > 0 && (
                        <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">
                            {ele.view_count} views
                        </span>
                    )}
                </div>
              </motion.div>
            );
          })}
      </div>

      {/* DRAWERS & DIALOGS */}
      {(addNoteValue.show || addNoteValue.cutNote) && (
        <PortalDrawer
          open={addNoteValue.show || addNoteValue.cutNote}
          compo={
            addNoteValue.show ? (
              <AddEditNote
                addNoteValue={addNoteValue}
                handleSubmitNote={handleSubmitNote}
                handleChangeNote={handleChangeNote}
              />
            ) : addNoteValue.cutNote ? (
              <CutNote
                addNoteValue={addNoteValue}
                handleSelectCutNotebook={handleSelectCutNotebook}
                handlePastSubmit={handlePastSubmit}
              />
            ) : null
          }
          title={
            addNoteValue.show
              ? addNoteValue.titleOnlyEdit
                ? "Edit Note Title"
                : addNoteValue.update
                  ? "Edit Note"
                  : "Create Note"
              : addNoteValue.cutNote
                ? "Paste Note"
                : null
          }
          closeDrawer={
            addNoteValue.show
              ? handleDrawerToggleNote
              : addNoteValue.cutNote
                ? toggleCutNote
                : null
          }
          widthSize={500}
        />
      )}
      {addNoteValue.delete && (
        <ConfirmationDialog
          openDialog={addNoteValue.delete}
          handleOpen={handleConfirmToggleNote}
          title="Delete Confirmation"
          message="Are you share you want to delete Note ?"
          handleConfirm={deleteNoteBook}
          loading={addNoteValue.loading}
        />
      )}
      {addNoteValue.showNote && (
        <CustomDialog
          openDialog={addNoteValue.showNote}
          size="xxl"
          handleOpen={toggleShowNote}
          title={addNoteValue.note_title}
          footer={false}
          compo={<EditorData editorData={editorData} />}
        />
      )}
      {editorValue.show && (
        <CustomDialog
          openDialog={editorValue.show}
          size="xxl"
          handleOpen={toggleEditNote}
          title={editorValue.noteHeader.note_title}
          footer={false}
          compo={
            <UpdateNoteData
              addNoteValue={editorValue}
              toggleEditNote={toggleEditNote}
              editorContent={editorContent}
              handleAllTagRemove={handleAllTagRemove}
              handleAddTag={handleAddTag}
              handleChangeEditor={handleChangeEditor}
              handleRemoveTag={handleRemoveTag}
              toggleHandleConfirmTag={toggleHandleConfirmTag}
              confirmRemoveAllTags={confirmRemoveAllTags}
              handleAddNotesData={handleAddNotesData}
              files={addNoteValue.attachements}
              handleDrop={handleDrop}
              handleFileChange={handleFileChange}
              handleRemoveFile={handleRemoveFile}
              handleClick={handleClick}
              handleAllFileRemove={handleAllFileRemove}
              fileInputRef={fileInputRef}
              uploadProgress={uploadProgress}
              uploadFiles={uploadFiles}
            />
          }
        />
      )}

      {shareNoteValue.show && (
        <CustomDialog
          openDialog={shareNoteValue.show}
          title="Share Notebook"
          handleOpen={toggleNoteShare}
          footer={false}
          outsidePress={false}
          compo={
            <ShareNote
              handleChangeShareNote={handleChangeShareNote}
              shareNoteValue={shareNoteValue}
              handleSelectShareNote={handleSelectShareNote}
              handleCopytoClipboard={handleCopytoClipboard}
              handleCopytoClipboardMouseLeave={handleCopytoClipboardMouseLeave}
              copied={copied}
              handleShareNoteAdd={handleShareNoteAdd}
              handleToggleSubDept={handleToggleSubDept}
              mySharedNotebooks={shareNoteValue.mySharedNotebooks}
            />
          }
          size="xl"
        />
      )}
    </div>
  );
};

export default Notes;