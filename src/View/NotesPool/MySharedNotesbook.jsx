import React, { useEffect } from "react";
import { hexToRGBA, titleNameAlpha } from "../../services/appServices";
import useNotesPoolServices from "../../ViewModel/NotesPoolViewModel/NotesPoolServices";
import { formatDateDMY } from "../../services/__dateTimeServices";
import { BiCalendar, BiSearch } from "react-icons/bi";
import { FaBook } from "react-icons/fa";
import { IoMdMore } from "react-icons/io";
import { useOutletContext } from "react-router";
import MySharedNotes from "./MySharedNotes";
import useSearchServices from "../../ViewModel/NotesPoolViewModel/SearchSerivces";
import { FaShareNodes } from "react-icons/fa6";
import { MenuItem, Typography } from "@material-tailwind/react";
import { mysharenoteBookenuList } from "../../services/__notesPoolServices";
import useDropdownService from "../../services/__dropDownHoverService";
import { motion } from "framer-motion";
import useMyShareNoteHandler from "../../ViewModel/NotesPoolViewModel/myShareNoteHandler";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";

const MySharedNotesBook = () => {
  const {
    mySharednotebooks,
    mySharednotebookCount,
    noteBookID,
    toggleMenuValue,
    openMenuValue,
  } = useNotesPoolServices();

  const isLoading = !mySharednotebooks;

  const { notesState, handleNotes, mySharednotebookNotes, noteBookTitle, handleBackToNotebooks } =
    useOutletContext();
  const { handleChangeMyShareNoteBookSearch, noteBookSearchValue } =
    useSearchServices();
  const { getDropdownPosition, triggerRefs } = useDropdownService();
  const {
    handleMyShareNoteBookMenuList,
    deleteValue,
    toggleConfirmationMySharedNoteBook,
    deleteMyShareNoteBookConfirmation,
  } = useMyShareNoteHandler();

  useEffect(() => {
    console.log("my shared notebooks", mySharednotebooks);
  }, [mySharednotebooks]);

  return (
    <>
      {!notesState?.showNotes ? (
        <div className="flex flex-col gap-6 py-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 p-2 bg-[#8bc9f8] text-white rounded-md">
                <FaBook />
              </span>
              <span className="text-[20px]">My Shared Notesbook</span>
            </div>
            <div className="flex items-center gap-3 text-[#698592] text-[12px]">
              <span>Total Notebooks</span>
              <span>{mySharednotebookCount}</span>
            </div>
          </div>

          {/* Search */}
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
              placeholder="Search Notebook" name='searchBranch' onChange={handleChangeMyShareNoteBookSearch} />
          </div>
        </div>

          {isLoading && (
            <div className="flex justify-center py-10 items-center w-full">
              <span className="text-gray-500">Loading notebooks...</span>
            </div>
          )}

          {/* Shared Notebooks */}
          <div className="grid
              grid-cols-[repeat(auto-fit,minmax(300px,1fr))]
              gap-4
              w-full">
            {Array.isArray(mySharednotebooks) &&
              mySharednotebooks.length > 0 &&
              mySharednotebooks.map((ele, i) => {
                const { bgColor } = titleNameAlpha(ele.notebook_name);
                const rgbaColor = hexToRGBA(bgColor, 0.3);

                return (
                  <div
                    key={ele.id || ele._id}
                    className="flex
                  w-full
                  min-h-[110px]
                  rounded-2xl
                  bg-bgBlue
                  p-3
                  cursor-pointer
                  transition-all
                  hover:shadow-lg
                  hover:scale-[1.01]"
                    onClick={() => handleNotes(ele, false)}
                  >
                    {/* Icon */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shrink-0">
                        <FaBook className="h-5 w-5 text-bgBlue" />
                      </span>
                      <div className="flex flex-col flex-1 w-full">
                        <div className="relative group w-full">
                          <span className="block text-white font-semibold text-sm truncate cursor-default">
                            {ele.notebook_name}
                          </span>
                          <div className="flex items-center gap-2">
                            <FaShareNodes className="text-white text-xs" />
                            {ele.shared_links?.map((element, i) => (
                              <span key={i} className="text-white text-xs">
                                {element.shared_with_name}
                              </span>
                            ))}
                          </div>

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

                    {/* Notebook Info */}

                    {/* Right Actions */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-end">
                        <div
                          ref={(el) => (triggerRefs.current[i] = el)}
                          onMouseEnter={() => toggleMenuValue(i, true)}
                          onMouseLeave={() => toggleMenuValue(i, false)}
                          className="relative"
                        >
                          <motion.div
                            className="text-white cursor-pointer relative hover:text-black"
                            whileHover={{ scale: 1.4 }}
                          >
                            <IoMdMore />
                          </motion.div>

                          {openMenuValue[i] && (
                            <div
                              className={`border border-gray-200 rounded-lg absolute z-[9999] bg-white w-[200px] left-[-170px] shadow-md ${getDropdownPosition(i) === "top"
                                  ? "bottom-full"
                                  : "top-full"
                                }`}
                            >
                              <motion.div
                                initial={{
                                  opacity: 0,
                                  y:
                                    getDropdownPosition(i) === "top" ? -50 : 50,
                                }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{
                                  opacity: 0,
                                  y:
                                    getDropdownPosition(i) === "top" ? -50 : 50,
                                }}
                                transition={{ duration: 0.2 }}
                              >
                                <ul className="flex w-full flex-col gap-1">
                                  {mysharenoteBookenuList.map((menuItem) => (
                                    <MenuItem
                                      className="flex items-center justify-between"
                                      key={menuItem.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMyShareNoteBookMenuList(ele);
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

                      <div className="flex items-center gap-1 mt-2 justify-end">
                        <BiCalendar className="text-white text-xs" />
                        <span className="text-white text-xs">
                          {formatDateDMY(ele.created_at || ele.entry_time)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            {!isLoading && mySharednotebooks.length === 0 && (
              <div className="w-full flex items-center justify-center py-10">
                <span className="text-[#474747] text-[14px] font-medium font-Urbanist">
                  No notebook exist
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <MySharedNotes
          notes={mySharednotebookNotes}
          noteBookTitle={noteBookTitle}
          noteBookID={noteBookID}
          onBack={handleBackToNotebooks}
        />
      )}

      {deleteValue.confirm && (
        <ConfirmationDialog
          openDialog={deleteValue.confirm}
          handleOpen={toggleConfirmationMySharedNoteBook}
          handleConfirm={deleteMyShareNoteBookConfirmation}
          title="Delete Confirmation"
          message="Are you sure you want to delete this Shared Notebook?"
          loading={deleteValue.loading}
        />
      )}
    </>
  );
};

export default MySharedNotesBook;