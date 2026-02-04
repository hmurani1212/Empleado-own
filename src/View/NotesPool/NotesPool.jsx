import React from "react";
import useNotesPoolServices from "../../ViewModel/NotesPoolViewModel/NotesPoolServices";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import PortalDrawer from "../../Components/CustomDrawer/PortalDrawer";
import AddEditNoteBook from "./AddEditNoteBook";
import AddEditNote from "./AddEditNote";
import CustomDialog from "../../Components/CustomDialog/CustomDialog";
import Editor from "./Editor";

const NotesPool = () => {
  const location = useLocation();

  const {
    notesPoolTitles,
    handleNavLinkClick,
    notesState,
    handleNotes,
    notes,
    noteBookTitle,
    notesValue,
    handleNoteBookDrawer,
    handleSubmitNoteBook,
    handleNoteBookInputChange,
    addNoteValue,
    handleChangeNote,
    handleNoteDrawer,
    handleSelectNotebook,
    handleSubmitNote,
    toggleEditorNote,
    mySharednotebookNotes,
    handleBackToNotebooks,
  } = useNotesPoolServices();

  return (
    <>
      <div className="flex flex-col gap-4 py-2 pb-1 px-2 w-full">
        <div className="">
          <span className="text-[20px] text-[#474747] font-semibold font-Urbanist">
            Notes Pool
          </span>
        </div>

        <div className="flex flex-col gap-2 pb-3">
          <div className="flex justify-between items-center gap-5 py-5">
            <div className="flex flex-wrap items-center gap-5">
              {notesPoolTitles.map((ele) => (
                <NavLink
                  key={ele.id}
                  className={`${
                    location.pathname === ele.link
                      ? "text-white"
                      : "hover:text-[#474747]/60 text-[#474747]"
                  } relative rounded-full px-3 py-1.5 text-sm font-medium outline-sky-400 transition focus-visible:outline-2`}
                  style={{
                    WebkitTapHighlightColor: "transparent",
                  }}
                  // to={ele.link}
                  onClick={() => handleNavLinkClick(ele)}
                >
                  {location.pathname === ele.link && (
                    <motion.span
                      layoutId="bubble"
                      className="absolute inset-0 z-10 bg-[#8bc9f8]"
                      style={{ borderRadius: 9999 }}
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                  <span className="relative cursor-pointer text-[14px] z-20">
                    {ele.title}
                  </span>
                </NavLink>
              ))}
            </div>
          </div>

          <div className="">
            <Outlet
              context={{
                notesState,
                handleNotes,
                notes,
                noteBookTitle,
                mySharednotebookNotes,
                handleBackToNotebooks,
              }}
            />
          </div>
        </div>
      </div>
      {(notesValue.show || addNoteValue.show) && (
        <PortalDrawer
          open={notesValue.show || addNoteValue.show}
          title={
            addNoteValue.show
              ? "Add Note"
              : notesValue.show
              ? "Add Notebook"
              : ""
          }
          closeDrawer={
            notesValue.show
              ? handleNoteBookDrawer
              : addNoteValue.show
              ? handleNoteDrawer
              : null
          }
          widthSize={500}
          compo={
            notesValue.show ? (
              <AddEditNoteBook
                notesValue={notesValue}
                handleSubmitNoteBook={handleSubmitNoteBook}
                handleNoteBookInputChange={handleNoteBookInputChange}
              />
            ) : addNoteValue.show ? (
              <AddEditNote
                addNoteValue={addNoteValue}
                handleChangeNote={handleChangeNote}
                handleSelectNotebook={handleSelectNotebook}
                handleSubmitNote={handleSubmitNote}
              />
            ) : null
          }
        />
      )}

      {addNoteValue.showEditNote && (
        <CustomDialog
          openDialog={addNoteValue.showEditNote}
          size="xxl"
          handleOpen={toggleEditorNote}
          title={addNoteValue.note_title}
          footer={false}
          compo={
            <Editor
              addNoteValue={addNoteValue}
              toggleEditorNote={toggleEditorNote}
            />
          }
        />
      )}
    </>
  );
};

export default NotesPool;
