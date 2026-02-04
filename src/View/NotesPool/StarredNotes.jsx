import React, { useEffect, useState } from "react";
import { BiCalendar } from "react-icons/bi";
import { FaBook, FaStar } from "react-icons/fa6";
import { hexToRGBA, titleNameAlpha } from "../../services/appServices";
import { formatDateDM, formatDateDMY } from "../../services/__dateTimeServices";
import { motion } from "framer-motion";
import useStore from "../../Store/store";
import CustomDialog from "../../Components/CustomDialog/CustomDialog";
import UpdateNoteData from "./UpdateNoteData";
import useNotesPoolServices from "../../ViewModel/NotesPoolViewModel/NotesPoolServices";
import useNoteHandler from "../../ViewModel/NotesPoolViewModel/NoteHandler";
import EditorData from "./EditorData";
import { MdEditDocument } from "react-icons/md";

const StarredNotes = () => {
  const [loading, setLoading] = useState(true);

  // Services and store
  const { gettingStarredNotes, starredNotes } = useNotesPoolServices();
  const { removeFromFavorites } = useStore();
  const {
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
    uploadFiles,
    addNoteValue,
  } = useNoteHandler();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await gettingStarredNotes();
      setLoading(false);
    };
    fetchData();
  }, []);

  // Handle star toggle (remove from favorites)
  const handleStarToggle = async (note, e) => {
    await removeFromFavorites(note, e);

    // Refresh the list after a short delay to ensure consistency
    setTimeout(() => {
      gettingStarredNotes();
    }, 500);
  };

  // Filter valid notes
  const validStarredNotes = Array.isArray(starredNotes)
    ? starredNotes.filter((ele) => ele.notes_id || ele.note_id || ele.id)
    : [];

  return (
      <div className="flex flex-col gap-6 py-2 pb-1 pl-2 pr-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 p-2 bg-[#8bc9f8] text-white rounded-md">
              <FaStar />
            </span>
            <span className="text-[20px]">Starred Notes</span>
          </div>
          <div className="flex items-center gap-3 text-[#698592] text-[12px]">
            <span>Total Starred Notes</span>
            <span>{validStarredNotes.length}</span>
          </div>
        </div>

        <div className="grid w-full gap-4 grid-cols-[repeat(auto-fill,minmax(190px,1fr))]">
        {loading ? (
          <div className='col-span-full text-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto'></div>
            <p className='mt-2 text-gray-500'>Loading notes...</p>
          </div>
        ) : validStarredNotes?.length > 0
          ? validStarredNotes.map((ele, i) => {
            const noteTitle =
            ele.note?.note_title ||
            ele.note_title ||
            ele.title ||
            ele.notes_title ||
            ele.name ||
            "Untitled Note";
          const lastUpdated =
            ele.note?.last_updated ||
            ele.last_updated ||
            ele.entry_time ||
            ele.created_at ||
            ele.date_created;
          const { bgColor } = titleNameAlpha(noteTitle);
          const rgbaColor = hexToRGBA(bgColor, 0.3);
            return (
              <div
                key={i}
                className="border-[1px] border-[#3DA5F4] rounded-[10px] flex flex-col justify-between w-full justify-self-start max-w-[190px] h-[190px] cursor-pointer bg-white p-2"
                onClick={() => {
                  // Ensure the note object has the correct structure for handleNoteHandler
                  const noteForHandler = {
                    id: ele.note_id || ele.id || ele._id || ele.notes_id,
                    note_id: ele.note_id || ele.id || ele._id || ele.notes_id,
                    _id: ele._id || ele.note_id || ele.id || ele.notes_id,
                    note_title: noteTitle,
                    ...ele,
                  };
                  handleNoteHandler(noteForHandler);
                }}>
                <div className="flex justify-end items-end gap-2 w-full">
                  {/* Star Icon */}
                  <motion.div
                          className="cursor-pointer"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleStarToggle(ele, e)}
                        >
                          <FaStar className="text-yellow-500 text-lg" />
                        </motion.div>

                  {/* More Menu */}
                  {/* <div
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
                  </div> */}
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
                        {noteTitle}
                      </span>
                      <div className="absolute hidden group-hover:block text-center bg-black text-white text-xs px-2 py-1 rounded mt-1 z-50 whitespace-normal break-words max-w-xs">
                        {noteTitle}
                      </div>
                    </div>
                    <span className="text-[10px] font-normal font-Urbanist text-[#616161]">Last Update {formatDateDMY(lastUpdated)}</span>
                    <span className="text-[10px] font-normal font-Urbanist text-bgBlue">views ({ele?.view_count || 0})</span>
                  </div>

                  <div className="flex items-center justify-end w-full gap-1">
                    <BiCalendar className="text-bgBlue text-[10px]" />
                    <span className="text-[10px] font-normal font-Urbanist text-[#616161]">{formatDateDMY(
                            ele.note?.entry_time ||
                              ele.entry_time ||
                              ele.created_at ||
                              ele.date_created
                          )}</span>
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

      {/* Note viewing dialog */}
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

      {/* Note editing dialog */}
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
    </div>
  );
};

export default StarredNotes;