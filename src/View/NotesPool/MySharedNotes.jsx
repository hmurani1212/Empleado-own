import React, { useEffect, useState } from "react";
import { BiCalendar, BiPlus, BiSearch, BiArrowBack } from "react-icons/bi";
import { FaBook } from "react-icons/fa6";
import { FaStar, FaRegStar } from "react-icons/fa";
import { hexToRGBA, titleNameAlpha } from "../../services/appServices";
import { formatDateDM, formatDateDMY } from "../../services/__dateTimeServices";
import useDropdownService from "../../services/__dropDownHoverService";
import useNotesPoolServices from "../../ViewModel/NotesPoolViewModel/NotesPoolServices";
import { MenuItem, Typography } from "@material-tailwind/react";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdMore } from "react-icons/io";
import { mysharenotesMenuList } from "../../services/__notesPoolServices";
import useNoteHandler from "../../ViewModel/NotesPoolViewModel/NoteHandler";
import CustomDialog from "../../Components/CustomDialog/CustomDialog";
import UpdateNoteData from "./UpdateNoteData";
import EditorData from "./EditorData";
import useStore from "../../Store/store";
import { MdEditDocument } from "react-icons/md";

const MySharedNotes = (props) => {
  const { notes: notesFromProps, noteBookTitle, noteBookID, onBack } = props;
  const { getDropdownPosition, triggerRefs } = useDropdownService();
  const { toggleMenuValue, openMenuValue } = useNotesPoolServices();

  const [searchValue, setSearchValue] = useState("");

  const notes = notesFromProps;

  const filteredNotes = (notes || []).filter((note) =>
    note.note_title?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const isLoading = !notes;

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
    <div className="flex flex-col gap-6 py-2 pb-6 pl-2 pr-4">
      {/* Header */}
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
                <p className="text-xs text-gray-500">Managing shared notes</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-100 shadow-sm">
                <span className="text-xs text-gray-500">Total:</span>
                <span className="text-sm font-bold text-gray-800">{filteredNotes?.length || 0}</span>
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

      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-5 w-full">
        {filteredNotes?.length > 0 ? filteredNotes.map((ele, i) => {
            const { bgColor } = titleNameAlpha(ele.note_title);
            const isNoteStarred = isStarred(ele.note_id || ele.id || ele._id || ele.notes_id);
            
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
                            <ul className="flex w-full flex-col p-1.5">
                                {mysharenotesMenuList.map((menuItem) => (
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
          }) : (
            <div className="col-span-full w-full flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <FaBook className="text-gray-300 text-2xl" />
                </div>
                <span className="text-gray-500 text-sm font-medium">
                No notes found.
                </span>
            </div>
          )}
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