import React, { useEffect, useState } from "react";
import { BiCalendar, BiPlus, BiSearch } from "react-icons/bi";
import { FaBook } from "react-icons/fa6";
import { FaStar, FaRegStar } from "react-icons/fa";
import { hexToRGBA, titleNameAlpha } from "../../services/appServices";
import { formatDateDM, formatDateDMY } from "../../services/__dateTimeServices";
import useDropdownService from "../../services/__dropDownHoverService";
import useNotesPoolServices from "../../ViewModel/NotesPoolViewModel/NotesPoolServices";
import { MenuItem, Typography } from "@material-tailwind/react";
import { motion } from "framer-motion";
import { IoMdMore } from "react-icons/io";
import { mysharenotesMenuList } from "../../services/__notesPoolServices";
import useNoteHandler from "../../ViewModel/NotesPoolViewModel/NoteHandler";
import CustomDialog from "../../Components/CustomDialog/CustomDialog";
import UpdateNoteData from "./UpdateNoteData";
import EditorData from "./EditorData";
import useStore from "../../Store/store";
import { MdEditDocument } from "react-icons/md";
import { BiArrowBack } from "react-icons/bi";

const MySharedNotes = (props) => {
  const { notes: notesFromProps, noteBookTitle, noteBookID, onBack } = props;
  const { getDropdownPosition, triggerRefs } = useDropdownService();
  const { toggleMenuValue, openMenuValue } = useNotesPoolServices();

  // Local state for search
  const [searchValue, setSearchValue] = useState("");

  // Get notes directly from props since this is how shared notebook notes are passed
  const notes = notesFromProps || [];

  // Filter notes based on search
  const filteredNotes = notes.filter((note) =>
    note.note_title?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const isLoading = !notes;
  console.log("isLoading", isLoading);

  // Global starred notes state
  const {
    starredNotes,
    handleStarClick,
    isStarred,
    initializeStarredNotes,
    starStateVersion,
    isStarredNotesInitialized,
  } = useStore();
  const {
    handleNoteMenuList,
    toggleEditNote,
    editorValue,
    editorContent,
    handleAllTagRemove,
    handleAddTag,
    handleChangeEditor,
    handleRemoveTag,
    toggleHandleConfirmTag,
    confirmRemoveAllTags,
    handleAddNotesData,
    addNoteValue,
    handleDrop,
    handleFileChange,
    handleRemoveFile,
    handleClick,
    handleAllFileRemove,
    fileInputRef,
    uploadProgress,
    handleNoteHandler,
    toggleShowNote,
    editorData,
  } = useNoteHandler();

  useEffect(() => {
    if (!isStarredNotesInitialized) {
      initializeStarredNotes();
    }
  }, [isStarredNotesInitialized, initializeStarredNotes]);

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
          <span>{filteredNotes?.length}</span>
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
          placeholder=""
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

      <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-4 w-full">
        {filteredNotes?.length > 0
          ? filteredNotes.map((ele, i) => {
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
                      const noteId = ele.note_id || ele.id || ele._id || ele.notes_id;
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
                            {mysharenotesMenuList.map((menuItem) => (
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
          : (<div className="w-full flex items-center justify-center py-10">
            <span className="text-[#474747] text-[14px] font-medium font-Urbanist">
              No notebook exist
            </span>
          </div>)}
      </div>

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
            />
          }
        />
      )}
    </div>
  )
}
export default MySharedNotes;