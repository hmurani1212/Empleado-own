import { useReducer, useState } from "react";
import useStore from "../../Store/store";
import { useNavigate } from "react-router";
import { showToast } from "../../Components/Toaster/Toaster";
import { validateInput } from "../../Validation/CustomValidation";
import notesPoolApi from "../../Model/Data/NotesPool/NotesPool";

const useNotesPoolServices = () => {
  const notebookCount = useStore((state) => state.notebookCount);
  const notebooks = useStore((state) => state.notebooks);
  const notebooksCopy = useStore((state) => state.notebooksCopy);
  const gettingNoteBooks = useStore((state) => state.gettingNoteBooks);
  const notesPoolMount = useStore((state) => state.notesPoolMount);
  const gettingMySharedNoteBooks = useStore(
    (state) => state.gettingMySharedNoteBooks
  );
  const mySharednotebookCount = useStore(
    (state) => state.mySharednotebookCount
  );
  const mySharednotebooks = useStore((state) => state.mySharednotebooks);

  const gettingSharedNoteBooks = useStore(
    (state) => state.gettingSharedNoteBooks
  );
  const sharednotebooks = useStore((state) => state.sharednotebooks);
  const sharednotebookCount = useStore((state) => state.sharednotebookCount);
  const gettingSharedNotebookNotes = useStore(
    (state) => state.gettingSharedNotebookNotes
  );
  const sharedNotebookNotes = useStore((state) => state.sharedNotebookNotes);
  const searchingSharedNotebookNotes = useStore(
    (state) => state.searchingSharedNotebookNotes
  );
  const gettingStarredNotes = useStore((state) => state.gettingStarredNotes);
  const starredNotes = useStore((state) => state.starredNotes);

  const gettingNotes = useStore((state) => state.gettingNotes);
  const gettingShareNotes = useStore((state) => state.gettingShareNotes);
  const notebookNotesLoading = useStore((state) => state.notebookNotesLoading);
  const notes = useStore((state) => state.notes);
  const mySharednotebookNotes = useStore(
    (state) => state.mySharednotebookNotes
  );
  const noteBookTitle = useStore((state) => state.noteBookTitle);
  const noteBookID = useStore((state) => state.noteBookID);

  const newNoteBook = useStore((state) => state.newNoteBook);
  const newNote = useStore((state) => state.newNote);


  const notesPoolTitles = [
    { id: 1, title: "Create Notebook", link: "" },
    { id: 2, title: "Create Note", link: "" },
    { id: 3, title: "My Notesbook", link: "/notespool" },
    {
      id: 4,
      title: "My Shared Notebooks",
      link: "/notespool/mysharednotebooks",
    },
    { id: 5, title: "Shared Notebooks", link: "/notespool/sharednotebooks" },
    { id: 6, title: "Starred Notes", link: "/notespool/starrednotes" },
  ];

  const createInitialState = {
    showView: 0,
    showNotes: false,
  };

  const [notesValue, setNotesValue] = useState({
    id: "",
    name: "",
    show: false,
    loading: false,
    update: false,
  });

  const [addNoteValue, setAddNoteValue] = useState({
    show: false,
    note_id: "",
    notebook_id: null,
    note_title: "",
    loading: false,
    update: false,
    showNoteBook: true,
    notebooks: [],
    showEditNote: false,
    showNote: false,
  });

  const handleNoteBookDrawer = () => {
    setNotesValue((prevState) => ({
      ...prevState,
      show: false,
    }));
  };

  const navigate = useNavigate();

  const createReducer = (state, action) => {
    switch (action.type) {
      case 1:
        setNotesValue((prevState) => ({
          ...prevState,
          id: "",
          name: "",
          update: false,
          show: true,
        }));

        return { ...state, showView: action.payload };
      case 2:
        getNoteBooks();

        return { ...state, showView: action.payload };
      case 3:
        navigate(action.value);
        return { ...state, showNotes: false };
      case 4:
        gettingMySharedNoteBooks();
        navigate(action.value);
        return { ...state, showNotes: false };
      case 5:
        gettingSharedNoteBooks();
        // Add state to force component reset when navigating to same route
        navigate(action.value, { state: { reset: true, timestamp: Date.now() } });
        return { ...state, showNotes: false };
      case 6:
        navigate(action.value);
        return { ...state, showNotes: false };

      case "SHOW_NOTES":
        gettingNotes(action.payload);
        return { ...state, showNotes: !state.showNotes };

      case "SHOW_SHARE_NOTES":
        gettingShareNotes(action.payload);
        return { ...state, showNotes: !state.showNotes };

      case "BACK_TO_NOTEBOOKS":
        return { ...state, showNotes: false };

      default:
        break;
    }
  };

  const [notesState, dispatch] = useReducer(createReducer, createInitialState);

  const handleNavLinkClick = (data) => {
    dispatch({ type: data.id, payload: data.id, value: data.link });
  };

  const handleNotes = (data, notes = true) => {
    if (notes) {
      dispatch({ type: "SHOW_NOTES", payload: data });
    } else {
      dispatch({ type: "SHOW_SHARE_NOTES", payload: data });
    }
  };

  const handleBackToNotebooks = () => {
    useStore.setState({ notebookNotesLoading: false });
    dispatch({ type: "BACK_TO_NOTEBOOKS" });
  };

  const [openMenuValue, setOpenMenuValue] = useState({});
  const toggleMenuValue = (index, isOpen) => {
    setOpenMenuValue((prevOpenMenu) => ({
      ...prevOpenMenu,
      [index]: isOpen,
    }));
  };

  const handleNoteBookInputChange = (e) => {
    const { name, value } = e.target;
    setNotesValue((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateNoteBook = () => {
    const { name } = notesValue;
    const nameValidation = validateInput("Notebook Title", name);
    if (!nameValidation.isValid) {
      return { isValid: false, message: nameValidation.message };
    }
    return { isValid: true, message: "" };
  };

  const handleSubmitNoteBook = async (e) => {
    e.preventDefault();
    const validation = validateNoteBook();
    if (!validation.isValid) {
      showToast(validation.message, "error");
      return;
    }
    setNotesValue((prevState) => ({
      ...prevState,
      loading: true,
    }));
    try {
      const apiData = { portal: "admin", notebook_title: notesValue.name };
      const response = await notesPoolApi.addNoteBook(apiData);
      const responseData = response.data;

      if (response.status === 201 && responseData.STATUS === "SUCCESSFUL") {
        // Reset form fields before closing drawer
        setNotesValue((prevState) => ({
          ...prevState,
          name: "",
          id: "",
          update: false,
          show: false,
        }));
        // Update global store immediately
        newNoteBook(responseData.DB_DATA);
        // Prime the Add Note drawer with this notebook selected
        const created = responseData.DB_DATA || {};
        const createdId = created?.id || created?._id || created?.notebook_id;
        const createdTitle = created?.notebook_title || created?.notebook_name || created?.name;
        setAddNoteValue((prevState) => ({
          ...prevState,
          notebooks: [created, ...(Array.isArray(prevState.notebooks) ? prevState.notebooks : [])],
          notebook_id: createdId ? { value: createdId, label: createdTitle } : prevState.notebook_id,
        }));
        showToast("Notebook Added Successfully", "success");
      } else {
        const error = responseData.ERROR_DESCRIPTION;
        showToast(error, "error");
      }
    } catch (err) {
    } finally {
      setNotesValue((prevState) => ({
        ...prevState,
        loading: false,
      }));
    }
  };

  const handleChangeNote = (e) => {
    const { name, value } = e.target;
    setAddNoteValue((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleNoteDrawer = () => {
    setAddNoteValue((prevState) => ({
      ...prevState,
      show: false,
    }));
  };

  async function getNoteBooks() {
    try {
      const response = await notesPoolApi.getNotebooks();
      const data = response.data;

      if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
        // Merge API notebooks with store notebooksCopy to include recently created ones
        const apiList = Array.isArray(data.DB_DATA) ? data.DB_DATA : [];
        const storeList = Array.isArray(notebooksCopy) ? notebooksCopy : [];
        const byId = new Map();
        const pushUnique = (arr) => {
          arr.forEach((n) => {
            const id = n?.id || n?._id || n?.notebook_id;
            if (!byId.has(id)) byId.set(id, n);
          });
        };
        pushUnique(storeList);
        pushUnique(apiList);
        const merged = Array.from(byId.values());
        const defaultNb = merged[0];
        setAddNoteValue((prevState) => ({
          ...prevState,
          notebooks: merged,
          note_title: "",
          notebook_id: prevState.notebook_id || (defaultNb ? { value: (defaultNb.id || defaultNb._id || defaultNb.notebook_id), label: (defaultNb.notebook_title || defaultNb.notebook_name || defaultNb.name) } : null),
          update: false,
          show: true,
        }));
      }
    } catch (err) {
      console.log(err);
    }
  }

  const handleSelectNotebook = (selected, field) => {
    setAddNoteValue((prevState) => ({
      ...prevState,
      [field]: selected,
    }));
  };

  const validateNote = () => {
    const { note_title, notebook_id } = addNoteValue;
    if (notebook_id === null) {
      return { isValid: false, message: "Select Notebook" };
    }
    const nameValidation = validateInput("Note Title", note_title);
    if (!nameValidation.isValid) {
      return { isValid: false, message: nameValidation.message };
    }
    return { isValid: true, message: "" };
  };

  const handleSubmitNote = async (e) => {
    e.preventDefault();
    const validate = validateNote();
    if (!validate.isValid) {
      showToast(validate.message, "error");
      return;
    }
    const selected = addNoteValue.notebook_id;
    const resolvedNotebookId = selected?.value ?? selected?.id ?? selected?._id ?? selected?.notebook_id ?? null;
    if (!resolvedNotebookId) {
      showToast("Select Notebook", "error");
      return;
    }
    const apiData = {
      note_title: addNoteValue.note_title,
      notebook_id: resolvedNotebookId,
    };

    setAddNoteValue((prevState) => ({
      ...prevState,
      loading: true,
    }));
    try {
      const response = await notesPoolApi.addNote(apiData);
      const data = response.data;
      if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
        const insertedData = data.DB_DATA;
        const rawInserted = Array.isArray(insertedData) ? insertedData[0] : insertedData;

        showToast("Note Added Successfully", "success");
        handleNoteDrawer();
        const notePayload = {
          ...(rawInserted || insertedData),
          notebook_id: resolvedNotebookId,
          editor_content: { blocks: [], time: Date.now(), version: '2.31.0' },
          editorContent: { blocks: [], time: Date.now(), version: '2.31.0' },
        };
        newNote(notePayload, resolvedNotebookId);
        setAddNoteValue((prevState) => ({
          ...prevState,
          note_title: "",
          showEditNote: false,
        }));
      } else {
        const error = data.ERROR_DESCRIPTION;
        showToast(error, "error");
      }
    } catch (err) {
      showToast("Failed to create note", "error");
    } finally {
      setAddNoteValue((prevState) => ({
        ...prevState,
        loading: false,
      }));
    }
  };

  const toggleEditorNote = () => {
    setAddNoteValue((prevState) => ({
      ...prevState,
      showEditNote: false,
    }));
  };

  return {
    notesPoolTitles,
    handleNavLinkClick,
    notesState,
    notebooks,
    notebookCount,
    gettingNoteBooks,
    notesPoolMount,
    mySharednotebooks,
    mySharednotebookCount,
    sharednotebooks,
    sharednotebookCount,
    gettingSharedNotebookNotes,
    sharedNotebookNotes,
    searchingSharedNotebookNotes,
    handleNotes,
    notes,
    notebookNotesLoading,
    noteBookTitle,
    toggleMenuValue,
    openMenuValue,
    notesValue,
    handleSubmitNoteBook,
    handleNoteBookInputChange,
    handleNoteBookDrawer,
    handleChangeNote,
    addNoteValue,
    handleNoteDrawer,
    handleSelectNotebook,
    handleSubmitNote,
    noteBookID,
    toggleEditorNote,
    mySharednotebookNotes,
    gettingStarredNotes,
    starredNotes,
    handleBackToNotebooks,
  };
};

export default useNotesPoolServices;
