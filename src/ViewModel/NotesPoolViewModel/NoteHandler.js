import { useRef, useState } from "react";
import notesPoolApi from "../../Model/Data/NotesPool/NotesPool";
import { showToast } from "../../Components/Toaster/Toaster";
import useStore from "../../Store/store";
import { validateInput } from "../../Validation/CustomValidation";
import {
  gettingDepartmentsServices,
  gettingEmployeeNoteBookList,
  gettingEmployesServices,
} from "../../services/__frequentApiServices";
import { NotepadTextDashedIcon } from "lucide-react";

/** Extract plain text from block.data.text (string or rich-text object). */
function getBlockText(block) {
  const raw = block?.data?.text;
  if (raw == null) return '';
  if (typeof raw === 'string') return raw.replace(/<[^>]*>/g, '').trim();
  if (typeof raw === 'object' && raw.blocks) {
    const first = raw.blocks[0];
    return first?.data?.text != null ? String(first.data.text).replace(/<[^>]*>/g, '').trim() : '';
  }
  return String(raw).replace(/<[^>]*>/g, '').trim();
}

/** Returns true if blocks are the default auto-filled content (userID, title, name) so we can treat as empty. */
function isDefaultNoteContent(blocks, noteTitle, creatorName) {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return false;
  const title = (noteTitle || '').trim();
  const name = (creatorName || '').trim();
  const validBlocks = blocks.filter((b) => b != null && typeof b === 'object');
  if (validBlocks.length === 0) return false;
  const allParagraph = validBlocks.every((b) => b.type === 'paragraph' || b.type === 'text');
  if (!allParagraph) return false;
  const texts = validBlocks.map((b) => getBlockText(b));
  const isOnlyDigits = (s) => /^\d+$/.test(s);
  const isDefaultText = (t) => t === '' || t === title || t === name || isOnlyDigits(t);
  return texts.every(isDefaultText);
}

const useNoteHandler = () => {
  const noteDelete = useStore((state) => state.noteDelete);
  const newNote = useStore((state) => state.newNote);
  const updateNote = useStore((state) => state.updateNote);
  const gettingNotes = useStore((state) => state.gettingNotes);
  const noteBookID = useStore((state) => state.noteBookID);

  const [addNoteValue, setAddNoteValue] = useState({
    note_id: null,
    delete: false,
    loading: false,
    notebook_id: "",
    note_title: "",
    show: false,
    update: false,
    showNote: false,
    showEdit: false,
    noteData: {},
    cutNote: false,
    notebookList: [],
    cutNotebook_id: null,
    titleOnlyEdit: false,
  });

  const [shareNoteValue, setShareNoteValue] = useState({
    // notebook_id:'',
    id: "",
    existing_nb_id: "",
    members: [],
    show: false,
    type: 1,
    notebookList: [],
    notebook_id: null,
    shared_notebook_id: null,
    mySharedNotebooks: [],
    branches: [],
    branch_id: null,
    departments: [],
    department_id: null,
    operation_type: "notebook_sharing_operation",
    allowPermission: [],
    shareWith: null,
    loading: false,
    showSubDept: [],
    empDepartment: [],
    empDepartment_id: [],
    empBranches: [],
    empBranches_id: [],
    empsList: [],
    emp_id: [],
    notebook_name: "",
    textToCopy: "",
  });

  const handleConfirmToggleNote = () => {
    setAddNoteValue((prevState) => ({
      ...prevState,
      delete: false,
    }));
  };

  const deleteNoteBook = async () => {
    const apiData = {
      id: addNoteValue.note_id,
      notebook_id: addNoteValue.notebook_id,
      portal: "admin",
    };

    setAddNoteValue((prevState) => ({
      ...prevState,
      loading: true,
    }));
    try {
      const response = await notesPoolApi.deleteNote(apiData);
      const responseData = response.data;
      if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
        noteDelete(addNoteValue.note_id);
        showToast("Note Deleted Successfully", "success");
        handleConfirmToggleNote();
      } else {
        const error = responseData.ERROR_DESCRIPTION;
        showToast(error, "error");
        handleConfirmToggleNote();
      }
    } catch (err) {
      console.error("Delete note error:", err);
      showToast("Failed to delete note", "error");
      handleConfirmToggleNote();
    } finally {
      setAddNoteValue((prevState) => ({
        ...prevState,
        loading: false,
      }));
    }
  };

  function handleAddNote(id) {
    setAddNoteValue((prevState) => ({
      ...prevState,
      notebook_id: id,
      showNoteBook: false,
      update: false,
      show: true,
    }));
  }

  const handleNoteMenuList = (data, menuItem) => {
    switch (menuItem.id) {
      case 1:
        setAddNoteValue((prevState) => ({
          ...prevState,
          note_title: data.note_title,
          note_id: data.id || data._id || data.note_id,
          notebook_id: data.notebook_id,
          showNoteBook: false,
          update: true,
          show: true,
          titleOnlyEdit: true,
        }));
        break;

      case 2:
        getNoteData(data);
        break;
      case 3:
        handleCopy(data);
        break;
      case 4:
        gettingNBList();
        setAddNoteValue((prevState) => ({
          ...prevState,
          note_id: data.id || data._id || data.note_id,
          notebook_id: data.notebook_id,
          cutNote: true,
        }));
        break;
      case 5:
        setAddNoteValue((prevState) => ({
          ...prevState,
          note_id: data.id || data.note_id || data._id,
          notebook_id: data.notebook_id,
          delete: true,
        }));
        break;
      case 6:
        gettingNotebookList();
        setShareNoteValue((prevState) => ({
          ...prevState,
          type: 1,
          id: data.id || data._id || data.note_id,
          show: true,
          note_name: data.note_title,
        }));
        setTimeout(() => {
            fetchMySharedNotebooks();
        }, 100);
        break;
      default:
        break;
    }
  };

  async function gettingNBList() {
    try {
      const data = await gettingEmployeeNoteBookList();
      
      if (data && data.DB_DATA) {
        setAddNoteValue((prevState) => ({
          ...prevState,
          notebookList: data.DB_DATA,
        }));
      } else {
        setAddNoteValue((prevState) => ({
          ...prevState,
          notebookList: [],
        }));
      }
    } catch (error) {
      console.error("Error getting notebook list:", error);
      setAddNoteValue((prevState) => ({
        ...prevState,
        notebookList: [],
      }));
    }
  }

  function handleSelectCutNotebook(select, field) {
    setAddNoteValue((prevState) => ({
      ...prevState,
      [field]: select,
    }));
  }

  function toggleCutNote() {
    setAddNoteValue((prevState) => ({
      ...prevState,
      cutNote: false,
    }));
  }

  async function handlePastSubmit(e) {
    e.preventDefault();
    const apiData = {
      notebook_id: addNoteValue.cutNotebook_id.value,
      note_id: addNoteValue.note_id,
      cut_nb_id: addNoteValue.notebook_id,
    };
    if (addNoteValue.cutNotebook_id === null) {
      showToast("Select Notebook", "error");
      return;
    } else {
      setAddNoteValue((prevState) => ({
        ...prevState,
        loading: true,
      }));
      try {
        const response = await notesPoolApi.pastNote(apiData);
        const responseData = response.data;
        if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
          noteDelete(addNoteValue.note_id);
          showToast(
            `Note Successfully past to ${addNoteValue.cutNotebook_id.label}`,
            "success"
          );
          toggleCutNote();
        }
      } catch (err) {
        console.log(err);
      } finally {
        setAddNoteValue((prevState) => ({
          ...prevState,
          loading: false,
        }));
      }
    }
  }

  const handleCopy = async (noteData) => {
    const apiData = {
      id: noteData.id || noteData._id || noteData.note_id,
    };
    
    try {
      const response = await notesPoolApi.copyNote(apiData);
      const responseData = response.data;
      
      // Check for successful response
      if (response.status === 201 && responseData.STATUS === "SUCCESSFUL") {
        // Extract the copied note data from DB_DATA.note
        const insertedData = responseData.DB_DATA?.note;
        showToast("Note Copied Successfully", "success");
        handleDrawerToggleNote();
        if (insertedData) {
          newNote(insertedData);
        }
      } else {
        const error = responseData.ERROR_DESCRIPTION || responseData.error || responseData.message;
        showToast(error, "error");
      }
    } catch (err) {
      console.error("Copy note error:", err);
      showToast("Failed to copy note", "error");
    }
  };

  function handleDrawerToggleNote() {
    setAddNoteValue((prevState) => ({
      ...prevState,
      show: false,
      titleOnlyEdit: false,
    }));
  }

  const validateNote = () => {
    const { note_title } = addNoteValue;
    const nameValidation = validateInput("Note Title", note_title);
    if (!nameValidation.isValid) {
      return { isValid: false, message: nameValidation.message };
    }
    return { isValid: true, message: "" };
  };

  const handleChangeNote = (e) => {
    const { name, value } = e.target;
    setAddNoteValue((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitNote = async (e) => {
    e.preventDefault();
    const validate = validateNote();
    if (!validate.isValid) {
      showToast(validate.message, "error");
      return;
    }

    const apiData = {
      note_title: addNoteValue.note_title,
      notebook_id: addNoteValue.notebook_id,
      last_updated: Math.floor(Date.now() / 1000),
    };

    console.log("addNoteValue", addNoteValue)
    const updateApiData = {
      note_title: addNoteValue.note_title,
      note_id: addNoteValue.note_id || addNoteValue.id || addNoteValue._id,
      tags: editorValue.tags.map(tag => tag.label || tag.name),
      editor_content: editorValue.editorContent,
    };

    setAddNoteValue((prevState) => ({
      ...prevState,
      loading: true,
    }));
    
    try {
      if (!addNoteValue.update) {
        const response = await notesPoolApi.addNote(apiData);
        const data = response.data;
        if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
          showToast("Note Added Successfully", "success");
          setAddNoteValue((prev) => ({ ...prev, note_title: "", show: false, titleOnlyEdit: false }));
          
          // Refetch notes from database to get the correct data instead of relying on API response
          await gettingNotes({ id: addNoteValue.notebook_id });
        } else {
          const error = data.ERROR_DESCRIPTION;
          showToast(error, "error");
        }
      } else {
        if (addNoteValue.titleOnlyEdit) {
          // Title-only update
          const titleUpdateApiData = {
            note_title: addNoteValue.note_title,
            note_id: addNoteValue.note_id || addNoteValue.id || addNoteValue._id,
            operation: 'update_note_title', // Specify this is a title-only update
          };
          const response = await notesPoolApi.updateNote(titleUpdateApiData);
          const data = response.data;
          if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
            const insertedData = data.DB_DATA || data.INSERTED_DATA;
            if (insertedData) {
              const updatedData = {
                ...insertedData,
                _id: insertedData._id || addNoteValue.note_id,
                id: insertedData.id || addNoteValue.note_id,
                note_id: insertedData.note_id || addNoteValue.note_id,
                last_updated: insertedData.last_updated || insertedData.entry_time || Math.floor(Date.now() / 1000)
              };
              updateNote(updatedData);
            }
            showToast("Note Title Updated Successfully", "success");
            handleDrawerToggleNote();
          } else {
            const error = data.ERROR_DESCRIPTION;
            showToast(error, "error");
            handleDrawerToggleNote();
          }
        } else {
          const response = await notesPoolApi.updateNote(updateApiData);
          const data = response.data;
          if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
            const insertedData = data.DB_DATA || data.INSERTED_DATA;

            if (insertedData) {
              const updatedData = {
                ...insertedData,
                _id: insertedData._id || addNoteValue.note_id,
                id: insertedData.id || addNoteValue.note_id,
                note_id: insertedData.note_id || addNoteValue.note_id,
                editor_content: editorValue.editorContent,
                tags: editorValue.tags,
                last_updated: insertedData.last_updated || insertedData.entry_time || Math.floor(Date.now() / 1000)
              };
              updateNote(updatedData);
            }
            showToast("Note Updated Successfully", "success");
            handleDrawerToggleNote();
          } else {
            const error = data.ERROR_DESCRIPTION;
            showToast(error, "error");
            handleDrawerToggleNote();
          }
        }
      }
    } catch (err) {
      console.error("Update note error:", err);
      showToast("Failed to update note", "error");
      handleDrawerToggleNote();
    } finally {
      setAddNoteValue((prevState) => ({
        ...prevState,
        loading: false,
      }));
    }
  };

  const toggleShowNote = () => {
    setAddNoteValue((prevState) => ({
      ...prevState,
      showNote: false,
    }));
  };

  const [editorData, setEditorData] = useState({});

  const handleNoteHandler = async (data) => {
    const note_id = data.notes_id || data.id || data._id || data.note_id;
    const apiData = { id: note_id };

    try {
      const response = await notesPoolApi.viewNote(apiData);
      const responseData = await response.data;
      if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
        const dbData = responseData.DB_DATA;
        
        
        // Parse the editor_content JSON string if it exists
        let parsedEditorContent = null;
        if (dbData.editor_content) {
          try {
            const contentToParse = dbData.editor_content.editor_content || dbData.editor_content;
            parsedEditorContent = typeof contentToParse === 'string' 
              ? JSON.parse(contentToParse) 
              : contentToParse;
          } catch (error) {
            console.error("Error parsing editor_content:", error);
            parsedEditorContent = null;
          }
        }
        const creatorNameForView = dbData.creator_name || dbData.created_by || dbData.user_name || dbData.author || dbData.creator || "";
        const noteTitleForView = dbData.note_title || dbData.note?.note_title || "";
        const blocks = parsedEditorContent?.blocks || [];
        const useEmptyContent = isDefaultNoteContent(blocks, noteTitleForView, creatorNameForView);
        const emptyContent = { blocks: [], time: Date.now(), version: parsedEditorContent?.version || "2.31.0" };
        const finalEditorContent = useEmptyContent ? emptyContent : (dbData.note?.editor_content || dbData.editor_content);
        const finalParsedContent = useEmptyContent ? emptyContent : parsedEditorContent;
        
        const editorData = {
          ...dbData,
          editor_content: finalEditorContent,
          editor_content_parsed: finalParsedContent,
          entry_time: dbData.entry_time || dbData.note?.entry_time || Math.floor(Date.now() / 1000),
          attachments: dbData.attachments || dbData.attachements || [],
          ...(dbData.note && useEmptyContent
            ? { note: { ...dbData.note, editor_content: emptyContent, editor_content_parsed: emptyContent } }
            : {}),
        };
        
        // Update the note in the store with the new view_count immediately
        // The API response should contain the updated note data with view_count
        // Extract view_count from different possible locations in the response
        const updatedViewCount = dbData.view_count !== undefined 
          ? dbData.view_count 
          : dbData.note?.view_count !== undefined 
          ? dbData.note.view_count 
          : responseData.view_count !== undefined
          ? responseData.view_count
          : (data.view_count || 0) + 1;
        
        // Create updated note data preserving all original fields and updating view_count
        const updatedNoteData = {
          ...data,
          view_count: updatedViewCount,
          _id: note_id,
          id: note_id,
          note_id: note_id,
          // Preserve other fields from original data, but update with API response if available
          note_title: dbData.note_title || dbData.note?.note_title || data.note_title,
          notebook_id: dbData.notebook_id || dbData.note?.notebook_id || data.notebook_id,
          last_updated: dbData.last_updated || dbData.note?.last_updated || data.last_updated,
          entry_time: dbData.entry_time || dbData.note?.entry_time || data.entry_time,
        };
        
        // Always update the note in the store to reflect the new view_count
        updateNote(updatedNoteData);
        
        setEditorData(editorData);
        setAddNoteValue((prevState) => ({
          ...prevState,
          showNote: true,
          note_title: data.note_title,
        }));
      } else {
        setEditorData({});
        const errorData = responseData.ERROR_DESCRIPTION;
        showToast(errorData, "error");
      }
    } catch (err) {
      console.error("View note error:", err);
      showToast("Failed to load note content", "error");
    }
  };

  const [editorValue, setEditorValue] = useState({
    show: false,
    editorContent: {},
    tags: [],
    tag_name: "",
    attachements: [],
    confirm: false,
    loading: false,
    noteData: {},
    noteHeader: {},
    autoSaveTime: "",
  });


  async function getNoteData(data) {
    const apiData = {
      id: data._id || data.note_id || data.id,
    };

    try {
      const response = await notesPoolApi.getNote(apiData);
      const responseData = response.data;
      if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
        const dbData = responseData.DB_DATA;

        // Try to find the note ID in different possible locations
        const noteId = dbData._id || dbData.id || dbData.note_id || 
                       dbData.DB_DATA?._id || dbData.DB_DATA?.id || dbData.DB_DATA?.note_id ||
                       dbData.note?._id || dbData.note?.id || dbData.note?.note_id;
        
        // Parse editor content - handle the nested structure
        let parsedEditorContent = {};
        let rawEditorContent = null;

        // The editor content is nested in dbData.editor_content.editor_content
        if (dbData.editor_content?.editor_content) {
          rawEditorContent = dbData.editor_content.editor_content;
        } else if (dbData.editor_content) {
          rawEditorContent = dbData.editor_content;
        } else if (dbData.notes_content) {
          rawEditorContent = dbData.notes_content;
        } else if (dbData.content) {
          rawEditorContent = dbData.content;
        }

        if (rawEditorContent) {
          if (typeof rawEditorContent === 'string') {
            try {
              parsedEditorContent = JSON.parse(rawEditorContent);
            } catch (e) {
              console.error("Error parsing editor content string:", e);
              parsedEditorContent = {};
            }
          } else if (rawEditorContent.blocks) {
            parsedEditorContent = rawEditorContent;
          } else {
            parsedEditorContent = rawEditorContent;
          }
        }
        const creatorName = dbData.creator_name || dbData.created_by || dbData.user_name || dbData.author || dbData.creator || "";
        const noteTitle = dbData.note_title || "";
        if (parsedEditorContent?.blocks && isDefaultNoteContent(parsedEditorContent.blocks, noteTitle, creatorName)) {
          parsedEditorContent = { ...parsedEditorContent, blocks: [], time: Date.now(), version: parsedEditorContent.version || "2.30.5" };
        }

        // Process tags - they should be directly in dbData.tags
        let processedTags = [];
        let rawTags = dbData.tags; // Tags are directly in dbData.tags

        if (rawTags && Array.isArray(rawTags)) {
          processedTags = rawTags.map(tag => {
            if (typeof tag === 'string') {
              return { label: tag };
            } else if (tag.name) {
              return { label: tag.name };
            } else if (tag.label) {
              return tag;
            } else if (tag.tag_name) {
              return { label: tag.tag_name };
            } else {
              return { label: tag.toString() };
            }
          });
        }
        
        setEditorValue((prevState) => ({
            ...prevState,
            note_id: noteId,
            editorContent: parsedEditorContent,
            editor_content: {
                blocks: parsedEditorContent?.blocks || [],
                time: parsedEditorContent?.time || Math.floor(Date.now() / 1000),
                version: parsedEditorContent?.version || "2.30.5"
            },
            last_updated: dbData.last_updated || dbData.entry_time || Math.floor(Date.now() / 1000),
            tags: processedTags,
            attachments: dbData.attachments || dbData.attachements || [],
            attachements: dbData.attachments || dbData.attachements || [],
            note_title: dbData.note_title || "",
            creator_name: creatorName,
            created_by: creatorName,
            user_name: creatorName,
            author: creatorName,
            noteHeader: {
              note_title: dbData.note_title || "",
              note_id: noteId
            },
            show: true,
        }));

      }
    } catch (err) {
      console.log(err);
    }
  }

  const toggleEditNote = () => {
    setEditorValue((prevState) => ({
      ...prevState,
      show: false,
    }));
  };

  const editorContent = async (data, entry_time, currentTimeInSeconds) => {
    setEditorValue((prevState) => ({
      ...prevState,
      editorContent: { ...data, entry_time },
      autoSaveTime: currentTimeInSeconds,
    }));
    try {
      await notesPoolApi.savedEditorContent(data);
    } catch (err) {}
  };

  const handleAllTagRemove = () => {
    setEditorValue((prevState) => ({
      ...prevState,
      confirm: true,
    }));
  };
  const handleChangeEditor = (e) => {
    const { name, value } = e.target;
    setEditorValue((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter") {
      if (editorValue.tag_name.trim() !== "") {
        e.preventDefault();
        const newTag = {
          label: editorValue.tag_name.trim(),
        };

        setEditorValue((prevState) => ({
          ...prevState,
          tags: [...prevState.tags, newTag],
          tag_name: "",
        }));
      } else {
        showToast("Tag can't be empty", "error");
      }
    }
  };

  const handleRemoveTag = (index) => {
    setEditorValue((prevState) => {
      const updatedTags = prevState.tags.filter((_, i) => i !== index);

      // If a tag was removed, show a toast notification
      if (updatedTags.length !== prevState.tags.length) {
        // showToast(`Tag "${data.label}" removed successfully`, 'success');
      }

      return {
        ...prevState,
        tags: updatedTags,
      };
    });
  };

  const toggleHandleConfirmTag = () => {
    setEditorValue((prevState) => ({
      ...prevState,
      confirm: false,
    }));
  };

  const confirmRemoveAllTags = () => {
    setEditorValue((pervState) => ({
      ...pervState,
      tags: [],
      confirm: false,
    }));
    showToast("All tags has been removed", "success");
  };

  const handleAddNotesData = async (data, toggleEditorNote) => {
    
    // Auto-add pending tag if there's text in tag_name
    let tagsToSave = [...(data.tags || [])];
    if (data.tag_name && data.tag_name.trim() !== '') {
      tagsToSave.push({ label: data.tag_name.trim() });
    }
    
    // Fix: Send tags as array of strings, not objects
    const tagsForDB = tagsToSave.map(tag => 
      String(tag.label || tag.name || tag).trim()
    ).filter(tag => tag.length > 0); // Remove empty tags
    
    // Normalize editor_content to table format: { time (ms), blocks, version } as JSON string
    let editorContentForApi = data.editor_content ?? data.editorContent;
    if (editorContentForApi != null && typeof editorContentForApi === "object") {
      const timeMs = (editorContentForApi.time != null && editorContentForApi.time > 9999999999) ? editorContentForApi.time : Date.now();
      const normalized = {
        time: timeMs,
        blocks: editorContentForApi.blocks ?? [],
        version: editorContentForApi.version ?? "2.31.0",
      };
      editorContentForApi = JSON.stringify(normalized);
    }
    
    // Fix: Use the correct data structure from the UI
    const apiData = {
      operation: "update_note_content",
      note_id: data.note_id || data.noteHeader?.note_id || data.id || data._id,
      // Remove note_title to trigger update_note_content instead of update_note_title
      // note_title: data.note_title || data.noteHeader?.note_title || '',
      notebook_id: data.notebook_id || data.noteHeader?.notebook_id || '',
      notebook_title: data.notebook_title || data.noteHeader?.notebook_title || '',
      editor_content: editorContentForApi,
      tags: tagsForDB, // Send as array of strings
      // Filter out images from attachments payload as they are now inline in editor_content
      attachements: (data.attachements || data.attachments || []).filter(file => {
        const mimeType = file.FILE_MIME || file.type || file.mimeType || file.mime_type || file.file_type;
        return !mimeType?.startsWith('image/');
      }),
    };
    
    console.log("Updating note with data:", apiData);
    
    setEditorValue((prevState) => ({
      ...prevState,
      loading: true,
    }));

    try {
      const response = await notesPoolApi.updateNote(apiData);
      const responseData = await response.data;
      
      if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
        toggleEditorNote();
        showToast("Note Updated Successfully", "success");
      } else {
        const apiError = responseData.ERROR_DESCRIPTION;
        showToast(apiError, "error");
      }
    } catch (err) {
      console.error("API Request Error:", err);
      showToast("Failed to update note", "error");
    } finally {
      setEditorValue((prevState) => ({
        ...prevState,
        loading: false,
      }));
    }
  };

  const [uploadProgress, setUploadProgress] = useState({});

  const fileInputRef = useRef(null);

  const handleDrop = (e, data) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setEditorValue((prevState) => ({
      ...prevState,
      attachements: [...prevState.attachements, ...droppedFiles],
    }));
  };

  const handleFileChange = (e, data) => {
    const selectedFiles = Array.from(e.target.files);
    uploadFiles(selectedFiles, data);
  };
  const handleRemoveFile = async (file, data, index) => {

    // Handle different file object structures
    const noteId = data.noteHeader?.id || data.note_id || data.id || data._id;
    const fileId = file.id || file.ID || file.file_id || file.FILE_ID; // Use the primary key from notes_attachment table
    const fileName = file.FILE_NAME || file.file_name;

    if (!noteId) {
      showToast("Cannot remove file: Note ID is missing", "error");
      return;
    }

    if (!fileId) {
      console.error("File ID is missing for file removal");
      showToast("Cannot remove file: File ID is missing", "error");
      return;
    }

    const apiData = {
      note_id: noteId,
      file_id: fileId,
    };

    try {
      const response = await notesPoolApi.removeAttachements(apiData);
      const responseData = response.data;
      
      if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
        showToast("File removed Successfully", "success");
        setEditorValue((prevState) => ({
          ...prevState,
          attachements: prevState.attachements.filter((_, i) => i !== index),
        }));
      } else {
        const errorMsg = responseData.ERROR_DESCRIPTION || "Failed to remove file";
        console.error("Remove file error:", errorMsg);
        showToast(errorMsg, "error");
      }
    } catch (err) {
      console.error("Remove file error:", err);
      showToast("Failed to remove file", "error");
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAllFileRemove = () => {
    setEditorValue((prevState) => ({
      ...prevState,
      attachements: [],
    }));
  };
  const uploadFiles = async (filesToUpload, data) => {

    const formData = new FormData();
    filesToUpload.forEach((file) => {
      formData.append("file", file); // Append each file individually
    });
    formData.append("note_id", data.note_id); // Add note_id to formData
    formData.append("operation", "upload_attachment");

    try {
      const response = await notesPoolApi.uploadNoteAttachemnt(
        formData,
        (progress) => {
          setUploadProgress((prevProgress) => ({
            ...prevProgress,
            [filesToUpload[0].name]: progress,
          }));
        }
      );
      const responseData = response.data;
      if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
        setEditorValue((prevState) => ({
          ...prevState,
          attachements: [...prevState.attachements, responseData.INSERTED_DATA],
        }));
      } else {
        const errorDescp = responseData.ERROR_DESCRIPTION;
        showToast(errorDescp, "error");
      }
      setUploadProgress({}); // Reset progress after upload completes
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadProgress({}); // Reset progress on error
    }
  };

  const toggleNoteShare = () => {
    setShareNoteValue((prevState) => ({
      ...prevState,
      show: false,
    }));
  };

  const handleChangeShareNote = (e) => {
    const { name, value } = e.target;

    setShareNoteValue((prevState) => {
      let newState = { ...prevState };

      if (name === "type") {
        const typeValue = parseInt(value);
        if (typeValue === 3) {
          getClipboardData();
        }
        newState = {
          ...newState,
          [name]: typeValue,
        };
      } else if (name === "allowPermission") {
        // Toggle permission - add if not present, remove if already present
        const isPresent = prevState.allowPermission.includes(value);
        newState = {
          ...newState,
          [name]: isPresent 
            ? prevState.allowPermission.filter(perm => perm !== value)
            : [...prevState.allowPermission, value],
        };
      } else if (name === "shareWith") {
        newState = {
          ...newState,
          empBranches_id: [],
          empDepartment_id: [],
          [name]: value,
        };
      } else if (name === "empBranches_id") {
        newState = {
          ...newState,
          [name]: [...prevState.empBranches_id, value],
        };
      } else if (name === "empDepartment_id") {
        newState = {
          ...newState,
          [name]: [...prevState.empDepartment_id, value],
        };
      } else if (name === "emp_id") {
        newState = {
          ...newState,
          [name]: [...prevState.emp_id, value],
        };
      } else {
        newState = {
          ...newState,
          [name]: value,
        };
      }

      return newState;
    });
  };

  const gettingNotebookList = async () => {
    try {      
      // Get shared notebooks for the dropdown
      const sharedNotebooksResponse = await notesPoolApi.getMySharedNotebooks();
      const sharedNotebooksData = sharedNotebooksResponse.data;
      
      // Get other data (branches, departments, etc.)
      const response = await notesPoolApi.getNotebooksList();
      const responseData = response.data;
      
      if (sharedNotebooksResponse.status === 200 && sharedNotebooksData.STATUS === "SUCCESSFUL" &&
          response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
        const dbData = responseData.DB_DATA;
        
        // Use shared notebooks if available, otherwise fallback to regular notebooks
        const sharedNotebooks = Array.isArray(sharedNotebooksData.DB_DATA) ? sharedNotebooksData.DB_DATA : [];
        const regularNotebooks = Array.isArray(dbData.shared_notebooks) ? dbData.shared_notebooks : [];
        const finalNotebookList = sharedNotebooks.length > 0 ? sharedNotebooks : regularNotebooks;
        
        setShareNoteValue((prevState) => ({
          ...prevState,
          notebookList: finalNotebookList,
          branches: dbData.branch,
          empBranches: dbData.branch,
          departments: dbData.dept,
          empDepartment: dbData.dept,
        }));
        
      } else {
        setShareNoteValue((prevState) => ({
          ...prevState,
          notebookList: [], // Set empty array if API fails
        }));
      }
    } catch (err) {
      setShareNoteValue((prevState) => ({
        ...prevState,
        notebookList: [], // Set empty array on error
      }));
    }
  };

  const handleSelectShareNote = async (select, field) => {
    
    if (field === "empBranches_id") {
      try {
        const data = await gettingDepartmentsServices(select.value);
        setShareNoteValue((prevState) => ({
          ...prevState,
          [field]: select,
          empDepartment: data,
          empsList: [],
          empDepartment_id: null,
        }));
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    } else if (field === "empDepartment_id") {
      // Don't call API - employees are already available in employeeCheckListValue
      // The EmployeeView component filters employees locally from employeeCheckListValue
      setShareNoteValue((prevState) => ({
        ...prevState,
        [field]: select,
        // empsList will be populated from employeeCheckListValue in the UI component
      }));
    } else {
      setShareNoteValue((prevState) => ({
        ...prevState,
        [field]: select,
      }));
    }
  };

  const [copied, setCopied] = useState(false);

  const handleCopytoClipboard = async (text) => {
    // Validate text exists
    if (!text || text.trim() === '') {
      showToast("No link available to copy", "error");
      return;
    }

    try {
      // Try modern clipboard API first (requires HTTPS or localhost)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        showToast("Link copied to clipboard", "success");
      } else {
        // Fallback to older method for non-HTTPS contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          const successful = document.execCommand('copy');
          if (successful) {
            setCopied(true);
            showToast("Link copied to clipboard", "success");
          } else {
            throw new Error('execCommand failed');
          }
        } catch (err) {
          throw err;
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error('Copy failed:', err);
      setCopied(false);
      showToast("Failed to copy link. Please try selecting and copying manually.", "error");
    }
  };

  const handleCopytoClipboardMouseLeave = () => {
    setCopied(false);
  };

  const getClipboardData = async () => {
    // Ensure we have a valid ID
    if (!shareNoteValue.id) {
      showToast('Note ID is missing', 'error');
      return;
    }
    
    const apiData = {
      _id: shareNoteValue.id,
    };
    console.log('+++++++++++++++++++++++++', apiData, shareNoteValue)
    try {
      const response = await notesPoolApi.getPublicShareLink(apiData);
      const responseData = response.data;
      if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
        // Try multiple possible response structures
        const publicUrl = responseData.DB_DATA?.link?.public_url || 
                         responseData.DB_DATA?.share_link || 
                         responseData.DB_DATA?.public_url ||
                         responseData.DB_DATA?.url ||
                         responseData.link?.public_url ||
                         responseData.share_link ||
                         responseData.public_url;
        
        if (publicUrl) {
          setShareNoteValue((prevState) => ({
            ...prevState,
            textToCopy: publicUrl,
          }));
        } else {
          console.error('Public URL not found in response:', responseData);
          showToast('Public link not found in response', 'error');
        }
      } else {
        showToast(responseData.ERROR_DESCRIPTION || 'Failed to get public link', 'error');
      }
    } catch (err) {
      console.error('Error getting public link:', err);
      showToast('Failed to generate public link', 'error');
    }
  };

  const handleToggleSubDept = (deptId) => {
    setShareNoteValue((prevState) => {
      const isDeptVisible = prevState.showSubDept?.includes(deptId);

      return {
        ...prevState,
        showSubDept: isDeptVisible
          ? prevState.showSubDept.filter((id) => id !== deptId)
          : [...(prevState.showSubDept || []), deptId],
      };
    });
  };

  const shareNoteValidation = () => {
    const { notebook_id, shared_notebook_id, type, note_name, allowPermission, shareWith, empBranches_id, empDepartment_id, emp_id } = shareNoteValue;

    if (type === 1) {
      if (shared_notebook_id === null) {
        showToast("Please select a shared notebook", "error");
        return false;
      }
    } else if (type === 2) {
      if (!note_name || note_name.trim() === '') {
        showToast("Please enter notebook name11", "error");
        return false;
      }
      if (!allowPermission || allowPermission.length === 0) {
        showToast("Please select at least one permission", "error");
        return false;
      }
      if (!shareWith) {
        showToast("Please select who to share with", "error");
        return false;
      }
      
      // Validate based on shareWith selection
      if (shareWith === "branch") {
        if (!empBranches_id || empBranches_id.length === 0) {
          showToast("Please select at least one branch", "error");
          return false;
        }
      } else if (shareWith === "dept") {
        if (!empDepartment_id || empDepartment_id.length === 0) {
          showToast("Please select at least one department", "error");
          return false;
        }
      } else if (shareWith === "employee") {
        if (!empBranches_id || !empDepartment_id) {
          showToast("Please select both branch and department", "error");
          return false;
        }
        if (!emp_id || emp_id.length === 0) {
          showToast("Please select at least one employee", "error");
          return false;
        }
      }
    }
    return true;
  };

  // Function to fetch my shared notebooks
  const fetchMySharedNotebooks = async () => {
    try {
      const response = await notesPoolApi.getMySharedNotebooks();
      const responseData = response.data;
      
      if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
        setShareNoteValue((prevState) => {
          return {
            ...prevState,
            mySharedNotebooks: responseData.DB_DATA.shared_notebooks || [],
          };
        });
      } else {
        console.error("Failed to fetch shared notebooks for notes:", responseData);
      }
    } catch (error) {
      console.error("Error fetching my shared notebooks for notes:", error);
    }
  };

  const handleShareNoteAdd = async () => {
    const { type, id, operation_type, notebook_id, shared_notebook_id } = shareNoteValue;
    const validation = shareNoteValidation();
    if (validation) {
      setShareNoteValue((prevState) => ({
        ...prevState,
        loading: true,
      }));
      try {
        if (type === 1) {
          const apiData = {
            note_id: id,
            shared_notebook_id: shared_notebook_id.value,
          };

          const response = await notesPoolApi.shareNoteToSharedNotebook(apiData);
          const responseData = await response.data;
          if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
            showToast(`Note shared to ${shared_notebook_id.label}`, "success");
            setShareNoteValue((prevState) => ({
              ...prevState,
              show: false,
            }));
          } else {
            const error = responseData.ERROR_DESCRIPTION;
            showToast(error, "error");
            setShareNoteValue((prevState) => ({
              ...prevState,
              show: false,
            }));
          }
        } else {
          // Transform permissions array to object with values of 1
          const permissionsObject = {};
          shareNoteValue.allowPermission.forEach(permission => {
            permissionsObject[permission] = 1;
          });

          const apiDataAdd = {
            note_id: id,
            operation_type: operation_type,
            notebook_type: "new_notebook",
            new_notebook_name: shareNoteValue.notebook_name,
            ...permissionsObject,
            name_dept_branch: shareNoteValue.shareWith,
            branch: shareNoteValue.empBranches_id,
            dept: shareNoteValue.empDepartment_id,
            members: shareNoteValue.emp_id,
          };

          const response = await notesPoolApi.shareNotePoint(apiDataAdd);
          const responseData = await response.data;
          if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
            showToast(`Notebook shared successfully`, "success");
            setShareNoteValue((prevState) => ({
              ...prevState,
              show: false,
            }));
          } else {
            const error = responseData.ERROR_DESCRIPTION;
            showToast(error, "error");
            setShareNoteValue((prevState) => ({
              ...prevState,
              show: false,
            }));
          }
        }
      } catch (err) {
        showToast("Failed to share note", "error");
        setShareNoteValue((prevState) => ({
          ...prevState,
          show: false,
        }));
      } finally {
        setShareNoteValue((prevState) => ({
          ...prevState,
          loading: false,
        }));
      }
    }
  };

  return {
    handleNoteMenuList,
    addNoteValue,
    handleConfirmToggleNote,
    deleteNoteBook,
    handleDrawerToggleNote,
    handleAddNote,
    handleSubmitNote,
    handleChangeNote,
    toggleShowNote,
    handleNoteHandler,
    editorData,
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
    handleAllFileRemove,
    uploadProgress,
    fileInputRef,
    handleDrop,
    handleFileChange,
    handleRemoveFile,
    handleClick,
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
    fetchMySharedNotebooks,
    uploadFiles,
    getNoteData, // Add this line
  };
};

export default useNoteHandler;
