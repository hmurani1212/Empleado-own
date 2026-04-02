import React, { useState } from "react";
import useNotesPoolServices from "../../ViewModel/NotesPoolViewModel/NotesPoolServices";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import PortalDrawer from "../../Components/CustomDrawer/PortalDrawer";
import AddEditNoteBook from "./AddEditNoteBook";
import AddEditNote from "./AddEditNote";
import CustomDialog from "../../Components/CustomDialog/CustomDialog";
import Editor from "./Editor";
import { getContentByLabel } from "../../services/getContentService";
import { showToast } from "../../Components/Toaster/Toaster";
import { FaInfoCircle } from "react-icons/fa";
import { Button } from "@material-tailwind/react";

const NotesPool = () => {
  const location = useLocation();

  const [contentDrawerOpen, setContentDrawerOpen] = useState(false);
  const [contentData, setContentData] = useState(null);
  const [contentLang, setContentLang] = useState("ENGLISH");
  const [contentLoading, setContentLoading] = useState(false);

  const openContentDrawer = async (contentLabel) => {
    setContentDrawerOpen(true);
    setContentLang("ENGLISH");
    setContentLoading(true);
    setContentData(null);
    try {
      const res = await getContentByLabel(contentLabel);
      if (res?.STATUS === "SUCCESSFUL" && res?.DATA?.[0]?.contents?.length) {
        setContentData(res.DATA[0]);
      } else {
        showToast("Content not available", "error");
        setContentDrawerOpen(false);
      }
    } catch (err) {
      showToast("Failed to load content", "error");
      setContentDrawerOpen(false);
    } finally {
      setContentLoading(false);
    }
  };

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
    notebookNotesLoading,
    handleBackToNotebooks,
  } = useNotesPoolServices();

  return (
    <>
      <div className="flex flex-col gap-4 py-2 pb-1 px-2 w-full">
        <div className="flex items-center gap-2">
          <span className="text-[20px] text-[#474747] font-semibold font-Urbanist">
            Notes Pool
          </span>
          <FaInfoCircle className="text-gray-400 text-base cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("NOTES_POOL")} />
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
    notebookNotesLoading,
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

      <PortalDrawer
        open={contentDrawerOpen}
        closeDrawer={() => setContentDrawerOpen(false)}
        direction="right"
        widthSize="45vw"
        title={contentData?.contents?.find((c) => c.lang === contentLang)?.main_heading ?? ""}
        compo={
          <div className="flex flex-col gap-4">
            {contentLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-[#3DA5F4] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : contentData?.contents?.length ? (
              <>
                <div
                  className="text-gray-800 text-sm font-Urbanist leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html:
                      contentData.contents.find((c) => c.lang === contentLang)?.content ??
                      contentData.contents.find((c) => c.lang === "ENGLISH")?.content ??
                      "",
                  }}
                />
                <div className="flex gap-2 mt-4 border-t border-gray-200 pt-4">
                  <Button
                    size="sm"
                    className={`flex-1 font-Urbanist text-[12px] ${contentLang === "ENGLISH" ? "bg-[#3DA5F4] text-white" : "bg-gray-200 text-gray-700"}`}
                    onClick={() => setContentLang("ENGLISH")}
                  >
                    ENGLISH
                  </Button>
                  <Button
                    size="sm"
                    className={`flex-1 font-Urbanist text-[12px] ${contentLang === "URDU" ? "bg-[#3DA5F4] text-white" : "bg-gray-200 text-gray-700"}`}
                    onClick={() => setContentLang("URDU")}
                  >
                    URDU
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        }
      />
    </>
  );
};

export default NotesPool;
