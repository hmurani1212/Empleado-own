import React, { useEffect } from "react";
import { BiCalendar, BiSearch } from "react-icons/bi";
import { FaBook } from "react-icons/fa6";
import { IoMdMore } from "react-icons/io";
import { useOutletContext } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { MenuItem, Typography } from "@material-tailwind/react";

import useNotesPoolServices from "../../ViewModel/NotesPoolViewModel/NotesPoolServices";
import useDropdownService from "../../services/__dropDownHoverService";
import useNoteBookHandler from "../../ViewModel/NotesPoolViewModel/NoteBookHandler";
import useSearchServices from "../../ViewModel/NotesPoolViewModel/SearchSerivces";

import { formatDateDMY } from "../../services/__dateTimeServices";
import { notbookMenuList } from "../../services/__notesPoolServices";

import Notes from "./Notes";
import AddEditNoteBook from "./AddEditNoteBook";
import PortalDrawer from "../../Components/CustomDrawer/PortalDrawer";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";
import CustomDialog from "../../Components/CustomDialog/CustomDialog";
import ShareNoteBook from "./ShareNoteBook";

import { NotebookSkeleton } from "./NotesPoolSkeletons";

const Notesbook = () => {
  const { notesState, handleNotes, notes, noteBookTitle, handleBackToNotebooks } = useOutletContext();

  const {
    notebooks,
    gettingNoteBooks,
    notesPoolMount,
    toggleMenuValue,
    openMenuValue,
    noteBookID,
  } = useNotesPoolServices();

  const { getDropdownPosition, triggerRefs } = useDropdownService();

  const {
    handleMenuList,
    notesValue,
    handleDrawerToggle,
    handleSubmitNoteBook,
    handleNoteBookInputChange,
    handleConfirmToggle,
    deleteNoteBook,
    shareNotebookValue,
    toggleNoteBookShare,
    handleChangeShareNotebook,
    handleSelectShareNote,
    handleShareNotebookAdd,
    handleToggleSubDept,
  } = useNoteBookHandler();

  const { handleChangeNoteBookSearch, noteBookSearchValue } =
    useSearchServices();

  const isLoading = !notebooks;

  useEffect(() => {
    if (!notesPoolMount) {
      gettingNoteBooks();
    }
  }, []);

  if (notesState?.showNotes) {
    return (
      <Notes
        notes={notes}
        noteBookTitle={noteBookTitle}
        noteBookID={noteBookID}
        onBack={handleBackToNotebooks}
      />
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6 py-2 pb-1 w-full">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-500 rounded-xl shadow-sm">
              <FaBook className="text-xl" />
            </span>
            <div>
               <span className="text-xl font-bold text-gray-800">My Notebooks</span>
               <p className="text-xs text-gray-500">Manage your personal notebooks</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-100 shadow-sm">
                <span className="text-xs text-gray-500">Total:</span>
                <span className="text-sm font-bold text-gray-800">{notebooks?.length ?? 0}</span>
             </div>
             
             {/* SEARCH */}
            <div className="relative w-full md:w-[250px] h-[40px] bg-white rounded-xl border border-gray-100 shadow-sm transition-all focus-within:shadow-md focus-within:border-blue-100">
                <div className="absolute grid w-8 h-full place-items-center text-gray-400 right-0">
                <BiSearch />
                </div>
                <input
                className="w-full h-full bg-transparent text-gray-700 border-none outline-none text-sm font-medium px-4 rounded-xl placeholder:text-gray-400"
                placeholder="Search Notebooks..." 
                name="name"
                value={noteBookSearchValue.name}
                onChange={handleChangeNoteBookSearch} 
                />
            </div>
          </div>
        </div>

        {/* LOADING */}
        {isLoading && <NotebookSkeleton />}

        {!isLoading && notebooks?.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5 w-full"
          >
            {notebooks.map((ele, index) => (
              <motion.div
                key={ele.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleNotes(ele)}
                className="group relative flex flex-col justify-between w-full min-h-[140px] rounded-2xl bg-white border border-gray-100 p-5 cursor-pointer transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:border-blue-100"
              >
                {/* Decorative Gradient Background (Subtle) */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50/50 to-transparent rounded-bl-full -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                </div>

                <div className="flex items-start justify-between relative">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm group-hover:scale-105 transition-transform duration-300">
                         <FaBook className="text-lg" />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-gray-800 font-bold text-base line-clamp-1 group-hover:text-blue-600 transition-colors">
                            {ele.notebook_title}
                        </h3>
                        <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
                           <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-blue-400 transition-colors"></span>
                           {ele.creator_name}
                        </p>
                      </div>
                   </div>

                   {/* MENU */}
                   <div
                    ref={(el) => (triggerRefs.current[index] = el)}
                    onMouseEnter={() => toggleMenuValue(index, true)}
                    onMouseLeave={() => toggleMenuValue(index, false)}
                    className="relative z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
                      <IoMdMore className="text-lg" />
                    </div>

                    <AnimatePresence>
                    {openMenuValue[index] && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className={`
                          absolute z-20 w-48 rounded-xl border border-gray-100 shadow-xl right-0 bg-white
                          ${getDropdownPosition(index) === "top" ? "bottom-full mb-0" : "top-full mt-0"}
                        `}
                      >
                        <ul className="flex flex-col p-1.5">
                          {notbookMenuList.map((menuItem) => (
                            <MenuItem
                              key={menuItem.id}
                              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMenuList(ele, menuItem);
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

                {/* Footer Info */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50 relative z-10">
                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full">
                       <span className="text-xs text-gray-500 font-medium">{ele.total_notes_inside || 0} Notes</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                       <BiCalendar className="text-xs" />
                       <span className="text-[11px] font-medium">{formatDateDMY(ele.entry_time)}</span>
                    </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && notebooks?.length === 0 && (
          <div className="flex flex-col justify-center items-center py-20 w-full bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <FaBook className="text-gray-300 text-2xl" />
            </div>
            <span className="text-gray-500 text-sm font-medium">
              No notebooks found. Create one to get started!
            </span>
          </div>
        )}
      </div>

      {/* DRAWERS & DIALOGS */}
      {notesValue.show && (
        <PortalDrawer
          open={notesValue.show}
          title="Edit Notebook"
          closeDrawer={handleDrawerToggle}
          widthSize={500}
          compo={
            <AddEditNoteBook
              notesValue={notesValue}
              handleSubmitNoteBook={handleSubmitNoteBook}
              handleNoteBookInputChange={handleNoteBookInputChange}
            />
          }
        />
      )}

      {notesValue.deleteConfirmation && (
        <ConfirmationDialog
          openDialog={notesValue.deleteConfirmation}
          handleOpen={handleConfirmToggle}
          handleConfirm={deleteNoteBook}
          loading={notesValue.loading}
          title="Delete Notebook"
          message="Are you sure you want to delete this notebook?"
        />
      )}

      {shareNotebookValue.show && (
        <CustomDialog
          openDialog={shareNotebookValue.show}
          title="Share Notebook"
          handleOpen={toggleNoteBookShare}
          footer={false}
          outsidePress={false}
          size="lg"
          // Keep scroll so submit button stays reachable; allow select menu to overflow horizontally
          bodyClassName="!overflow-x-visible !pb-12"
          compo={
            <ShareNoteBook
              handleChangeShareNotebook={handleChangeShareNotebook}
              shareNotebookValue={shareNotebookValue}
              handleSelectShareNote={handleSelectShareNote}
              handleShareNotebookAdd={handleShareNotebookAdd}
              handleToggleSubDept={handleToggleSubDept}
              mySharedNotebooks={shareNotebookValue.mySharedNotebooks}
            />
          }
        />
      )}
    </>
  );
};

export default Notesbook;