import React, { useEffect } from "react";
import { BiCalendar, BiSearch } from "react-icons/bi";
import { FaBook } from "react-icons/fa6";
import { IoMdMore } from "react-icons/io";
import { useOutletContext } from "react-router";
import { motion } from "framer-motion";
import { MenuItem, Typography } from "@material-tailwind/react";

import useNotesPoolServices from "../../ViewModel/NotesPoolViewModel/NotesPoolServices";
import useDropdownService from "../../services/__dropDownHoverService";
import useNoteBookHandler from "../../ViewModel/NotesPoolViewModel/NoteBookHandler";
import useSearchServices from "../../ViewModel/NotesPoolViewModel/SearchSerivces";

import { formatDateDMY } from "../../services/__dateTimeServices";
import { hexToRGBA, titleNameAlpha } from "../../services/appServices";
import { notbookMenuList } from "../../services/__notesPoolServices";

import Notes from "./Notes";
import AddEditNoteBook from "./AddEditNoteBook";
import PortalDrawer from "../../Components/CustomDrawer/PortalDrawer";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";
import CustomDialog from "../../Components/CustomDialog/CustomDialog";
import ShareNoteBook from "./ShareNoteBook";

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 p-2 bg-[#8bc9f8] text-white rounded-md">
              <FaBook />
            </span>
            <span className="text-[20px] font-medium">My Notebooks</span>
          </div>

          <div className="flex items-center gap-3 text-[#698592] text-[12px]">
            <span>Total Notebooks</span>
            <span>{notebooks?.length ?? 0}</span>
          </div>
        </div>

        {/* SEARCH */}
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
              placeholder="Search Notebook" name='searchBranch' onChange={handleChangeNoteBookSearch} />
          </div>
        </div>

        {/* LOADING */}
        {isLoading && (
          <div className="flex justify-center items-center py-10 w-full">
            <span className="text-gray-500">Loading notebooks...</span>
          </div>
        )}

        {!isLoading && notebooks?.length > 0 && (
          <div
            className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4 w-full"
          >
            {notebooks.map((ele, index) => (
              <div
                key={ele.id}
                onClick={() => handleNotes(ele)}
                className="flex w-full min-h-[110px] rounded-2xl bg-bgBlue p-3 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01]">
                {/* LEFT */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shrink-0">
                    <FaBook className="h-5 w-5 text-bgBlue" />
                  </span>
                  <div className="flex flex-col flex-1 w-full">
                    <div className="relative group w-full">
                      <span className="block text-white font-semibold text-sm truncate cursor-default">
                        {ele.notebook_title}
                      </span>
                      <span className="block text-white font-semibold text-xs truncate cursor-default">
                        {ele.creator_name}
                      </span>

                      {/* TOOLTIP */}
                      <div className=" absolute left-0 top-full z-50 mt-1 hidden max-w-xs rounded-md bg-white px-2 py-1 text-xs text-[#474747] shadow-lg group-hover:block whitespace-normal break-words">
                        {ele.notebook_title}
                      </div>
                    </div>

                    {/* SUBTEXT */}
                    <span className="text-white text-xs">
                      {ele.total_notes_inside || 0} Notes
                    </span>
                  </div>
                </div>


                {/* RIGHT */}
                <div className="flex flex-col justify-between items-end ml-2 shrink-0">
                  {/* MENU */}
                  <div
                    ref={(el) => (triggerRefs.current[index] = el)}
                    onMouseEnter={() => toggleMenuValue(index, true)}
                    onMouseLeave={() => toggleMenuValue(index, false)}
                    className="relative"
                  >
                    <motion.div
                      className="text-white cursor-pointer"
                      whileHover={{ scale: 1.3 }}
                    >
                      <IoMdMore />
                    </motion.div>

                    {openMenuValue[index] && (
                      <div
                        className={`
                          absolute z-[9999] w-48 rounded-lg border bg-white shadow-md left-[-170px]
                          ${getDropdownPosition(index) === "top"
                            ? "bottom-full"
                            : "top-full"
                          }
                        `}
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ul className="flex flex-col gap-1 p-1">
                            {notbookMenuList.map((menuItem) => (
                              <MenuItem
                                key={menuItem.id}
                                className="flex items-center justify-between"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMenuList(ele, menuItem);
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

                  {/* DATE */}
                  <div className="flex items-center gap-1 mt-2">
                    <BiCalendar className="text-white text-xs" />
                    <span className="text-white text-xs">
                      {formatDateDMY(ele.entry_time)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EMPTY STATE */}
      {!isLoading && notebooks?.length === 0 && (
        <div className="flex justify-center items-center py-10 w-full">
          <span className="text-[#474747] text-sm font-medium">
            No notebook exists
          </span>
        </div>
      )}

      {/* DRAWERS & DIALOGS (UNCHANGED LOGIC) */}
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