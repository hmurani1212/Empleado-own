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
import { motion, AnimatePresence } from "framer-motion";
import useMyShareNoteHandler from "../../ViewModel/NotesPoolViewModel/myShareNoteHandler";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";

import { NotebookSkeleton } from "./NotesPoolSkeletons";

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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-500 rounded-xl shadow-sm">
                <FaBook className="text-xl" />
              </span>
              <div>
                <span className="text-xl font-bold text-gray-800">My Shared Notebooks</span>
                <p className="text-xs text-gray-500">Notebooks you have shared with others</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-100 shadow-sm">
                    <span className="text-xs text-gray-500">Total:</span>
                    <span className="text-sm font-bold text-gray-800">{mySharednotebookCount}</span>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-[250px] h-[40px] bg-white rounded-xl border border-gray-100 shadow-sm transition-all focus-within:shadow-md focus-within:border-blue-100">
                    <div className="absolute grid w-8 h-full place-items-center text-gray-400 right-0">
                    <BiSearch />
                    </div>
                    <input
                    className="w-full h-full bg-transparent text-gray-700 border-none outline-none text-sm font-medium px-4 rounded-xl placeholder:text-gray-400"
                    placeholder="Search Notebook..." 
                    name='searchBranch' 
                    onChange={handleChangeMyShareNoteBookSearch} 
                    />
                </div>
            </div>
          </div>

          {isLoading && <NotebookSkeleton />}

          {/* Shared Notebooks */}
          {!isLoading && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5 w-full">
            {Array.isArray(mySharednotebooks) &&
              mySharednotebooks.length > 0 &&
              mySharednotebooks.map((ele, i) => {
                return (
                  <motion.div
                    key={ele.id || ele._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group relative flex flex-col justify-between w-full min-h-[140px] rounded-2xl bg-white border border-gray-100 p-5 cursor-pointer transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:border-blue-100"
                    onClick={() => handleNotes(ele, false)}
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
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 rounded-md">
                                        <FaShareNodes className="text-blue-400 text-[10px]" />
                                        <span className="text-[10px] text-blue-600 font-medium">Shared with</span>
                                    </div>
                                    <div className="flex -space-x-2 overflow-hidden">
                                        {ele.shared_links?.slice(0, 3).map((element, idx) => (
                                            <div 
                                                key={idx} 
                                                className="flex h-5 w-5 rounded-full ring-2 ring-white bg-gray-200 items-center justify-center text-[8px] font-bold text-gray-600"
                                                title={element.shared_with_name}
                                            >
                                                {element.shared_with_name?.charAt(0).toUpperCase()}
                                            </div>
                                        ))}
                                        {ele.shared_links?.length > 3 && (
                                            <div className="flex h-5 w-5 rounded-full ring-2 ring-white bg-gray-100 items-center justify-center text-[8px] font-bold text-gray-500">
                                                +{ele.shared_links.length - 3}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex justify-end">
                            <div
                            ref={(el) => (triggerRefs.current[i] = el)}
                            onMouseEnter={() => toggleMenuValue(i, true)}
                            onMouseLeave={() => toggleMenuValue(i, false)}
                            className="relative"
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
                                    ${getDropdownPosition(i) === "top" ? "bottom-full mb-2" : "top-full mt-2"}
                                `}
                                >
                                <ul className="flex w-full flex-col p-1.5">
                                    {mysharenoteBookenuList.map((menuItem) => (
                                    <MenuItem
                                        className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                                        key={menuItem.id}
                                        onClick={(e) => {
                                        e.stopPropagation();
                                        handleMyShareNoteBookMenuList(ele);
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

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50 relative z-10">
                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full">
                            <span className="text-xs text-gray-500 font-medium">{ele.total_notes_inside || 0} Notes</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400">
                            <BiCalendar className="text-xs" />
                            <span className="text-[11px] font-medium">
                            {formatDateDMY(ele.created_at || ele.entry_time)}
                            </span>
                        </div>
                    </div>
                  </motion.div>
                );
              })}
          </div>
          )}

            {!isLoading && mySharednotebooks.length === 0 && (
              <div className="flex flex-col justify-center items-center py-20 w-full bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <FaBook className="text-gray-300 text-2xl" />
                </div>
                <span className="text-gray-500 text-sm font-medium">
                  You haven't shared any notebooks yet.
                </span>
              </div>
            )}
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