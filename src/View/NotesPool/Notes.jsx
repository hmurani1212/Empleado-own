import React, { useEffect } from "react";
import { BiCalendar, BiPlus, BiSearch } from "react-icons/bi";
import { FaBook } from "react-icons/fa6";
import { FaStar, FaRegStar } from "react-icons/fa";
import { hexToRGBA, titleNameAlpha } from "../../services/appServices";
import { IoMdMore } from "react-icons/io";
import { formatDateDM, formatDateDMY } from "../../services/__dateTimeServices";
import useNotesPoolServices from "../../ViewModel/NotesPoolViewModel/NotesPoolServices";
import { MenuItem, Typography } from "@material-tailwind/react";
import { notMenuList } from "../../services/__notesPoolServices";
import useDropdownService from "../../services/__dropDownHoverService";
import { motion } from "framer-motion";
import useNoteHandler from "../../ViewModel/NotesPoolViewModel/NoteHandler";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";
import PortalDrawer from "../../Components/CustomDrawer/PortalDrawer";
import AddEditNote from "./AddEditNote";
import CustomDialog from "../../Components/CustomDialog/CustomDialog";
import EditorData from "./EditorData";
import UpdateNoteData from "./UpdateNoteData";
import useSearchServices from "../../ViewModel/NotesPoolViewModel/SearchSerivces";
import CutNote from "./CutNote";
import ShareNote from "./ShareNote";
import useStore from '../../Store/store';
import { MdEditDocument } from "react-icons/md";
import { BiArrowBack } from "react-icons/bi";

const Notes = (props) => {
  const { notes: notesFromProps, noteBookTitle, noteBookID, onBack } = props;
  const { toggleMenuValue, openMenuValue } = useNotesPoolServices();

  // Get notes directly from store to ensure real-time updates
  const notesFromStore = useStore((state) => state.notes);
  const notes = notesFromStore || notesFromProps;

  const { getDropdownPosition, triggerRefs } = useDropdownService();

  // Global starred notes state
  const { starredNotes, handleStarClick, isStarred, initializeStarredNotes, starStateVersion, isStarredNotesInitialized } = useStore();
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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
  }, [notes]);

  return (
    <div className="flex flex-col gap-6 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors flex items-center justify-center"
              title="Back to notebooks"
            >
              <BiArrowBack className="text-xl text-[#474747]" />
            </button>
          )}
          <span className="w-8 h-8 p-2 bg-[#8bc9f8] text-white rounded-md">
            <FaBook />
          </span>
          <span className="text-[20px]">{noteBookTitle}</span>
        </div>
        <div className="flex items-center gap-3 text-[#698592] text-[12px]">
          <span>Total Notes</span>
          <span>{notes?.length}</span>
        </div>
      </div>
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
              placeholder="Search Notes" name='searchBranch' onChange={handleChangeNoteSearch} />
          </div>
        </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-4 w-full">
        <div
          className="border-dashed border-2 border-gray-500 rounded-[10px] flex flex-col items-center justify-center w-full justify-self-start max-w-[190px] h-[190px] cursor-pointer bg-white"
          onClick={() => handleAddNote(noteBookID)}
        >
          <div className="flex flex-col items-center justify-center bg-bgBlue rounded-full w-[50px] h-[50px]">
            <span className="text-[30px] text-white">
              <BiPlus />
            </span>
          </div>
          <span className="font-medium font-Urbanist text-[12px] text-[#474747]">Create New Note</span>
        </div>
        {notes?.length > 0
          ? notes.map((ele, i) => {
            const { bgColor } = titleNameAlpha(ele.note_title);
            const rgbaColor = hexToRGBA(bgColor, 0.3); // 50% opacity
            return (
              <div
                key={i}
                className="border-[1px] border-[#3DA5F4] rounded-[10px] flex flex-col justify-between w-full justify-self-start max-w-[190px] h-[190px] cursor-pointer bg-white p-2"
                onClick={() => handleNoteHandler(ele)}>
                <div className="flex justify-end items-end gap-2 w-full">
                  {/* Star Icon */}
                  <motion.div
                    className="cursor-pointer"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleStarClick(ele, e)}
                  >
                    {(() => {
                      const noteId = ele.note_id || ele.id;
                      const isNoteStarred = isStarred(noteId);
                      return isNoteStarred ? (
                        <FaStar className="text-yellow-500 text-lg" />
                      ) : (
                        <FaRegStar className="text-gray-400 text-lg hover:text-yellow-500" />
                      );
                    })()}
                  </motion.div>

                  {/* More Menu */}
                  <div
                    ref={(el) => (triggerRefs.current[i] = el)}
                    onMouseEnter={() => toggleMenuValue(i, true)}
                    onMouseLeave={() => toggleMenuValue(i, false)}
                    className="relative"
                  >
                    <motion.div
                      className="text-[#698592] cursor-pointer relative hover:text-black"
                      whileHover={{ scale: 1.4 }}
                    >
                      <IoMdMore />
                    </motion.div>
                    {openMenuValue[i] && (
                      <div
                        className={`border border-gray-200 rounded-lg absolute z-50 bg-white w-[200px] left-[-120px] shadow-md ${getDropdownPosition(i) === "top"
                            ? "bottom-full"
                            : "top-full"
                          }`}
                      >
                        <motion.div
                          initial={{
                            opacity: 0,
                            y: getDropdownPosition(i) === "top" ? -50 : 50,
                          }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{
                            opacity: 0,
                            y: getDropdownPosition(i) === "top" ? -50 : 50,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <ul className="flex w-full flex-col gap-1">
                            {notMenuList.map((menuItem) => (
                              <MenuItem
                                className="flex items-center justify-between"
                                key={menuItem.id}
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent the event from bubbling up
                                  handleNoteMenuList(ele, menuItem);
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
                        {ele.note_title}
                      </span>
                      <div className="absolute hidden group-hover:block text-center bg-black text-white text-xs px-2 py-1 rounded mt-1 z-50 whitespace-normal break-words max-w-xs">
                        {ele.note_title}
                      </div>
                    </div>
                    <span className="text-[10px] font-normal font-Urbanist text-[#616161]">Last Update {formatDateDMY(ele.last_updated)}</span>
                    <span className="text-[10px] font-normal font-Urbanist text-bgBlue">views ({ele?.view_count || 0})</span>
                  </div>

                  <div className="flex items-center justify-end w-full gap-1">
                    <BiCalendar className="text-bgBlue text-[10px]" />
                    <span className="text-[10px] font-normal font-Urbanist text-[#616161]">{formatDateDMY(ele.entry_time)}</span>
                  </div>
                </div>
              </div>
            );
          })
          : null}
      </div>

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