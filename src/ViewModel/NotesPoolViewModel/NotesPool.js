import { useState } from "react";
import notesPoolApi from "../../Model/Data/NotesPool/NotesPool"

const notesPoolViewModel = (set, get) => ({
    
    notebooks :null,
    notebooksCopy :[],
    notebookCount:'',
    mySharednotebooks :null,
    mySharednotebooksCopy :[],
    mySharednotebookCount:'',
    mySharednotebookNotes:null,
    mySharednotebookNotesCopy:[],


    sharednotebooks:null,
    sharednotebookCount:'',
    sharedNotebookNotes:null,
    sharedNotebookNotesCopy:[],
    starredNotes:null,
    starredNotesCopy:[],
    noteBookID:null,
    notesPoolMount:false,
    notes:null,
    notesCopy:[],
    noteBookTitle:'',

    handleMountNotesPool:()=>{
        set({notesPoolMount:true})
    },


    gettingNoteBooks:async()=>{
        try {
            const response = await notesPoolApi.getNotebooks()
            const data = response.data
            const notebooks = data.DB_DATA;

            if(response.status === 200 && data.STATUS === "SUCCESSFUL"){
                set({notebooks : data.DB_DATA})
                set({notebooksCopy : data.DB_DATA})
                set({notebookCount: data.total_notebooks})
            
            }
        } catch(err){
            console.log(err)
        }
    },
    gettingMySharedNoteBooks:async()=>{
        try {
            const response = await notesPoolApi.getMySharedNotebooks()
            const data = response.data

            if(response.status === 200 && data.STATUS === "SUCCESSFUL"){
                
                const sharedNotebooksArray = Array.isArray(data.DB_DATA.shared_notebooks) ? data.DB_DATA.shared_notebooks : [];
                
                set({mySharednotebooks : sharedNotebooksArray})
                set({mySharednotebooksCopy : sharedNotebooksArray})
                set({mySharednotebookCount: data.DB_DATA.total_notebooks || data.total_notebooks})
                
            } else {
                console.error("Error fetching shared notebooks");
            }
        } catch(err){
            console.error("Error in gettingMySharedNoteBooks:", err);
        }
    },
    gettingSharedNoteBooks:async()=>{
        try {
            const response = await notesPoolApi.getSharedNotebooks()
            const data = response.data

            if(response.status === 200 && data.STATUS === "SUCCESSFUL"){
                const sharedNotebooksArray = data.DB_DATA?.shared_notebooks || []
                const totalNotebooks = data.DB_DATA?.total_notebooks || 0
                
                set({sharednotebooks : sharedNotebooksArray})
                set({sharednotebookCount: totalNotebooks})
            }
        } catch(err){
            set({sharednotebooks : []})
            set({sharednotebookCount: 0})
        }
    },
    gettingNotes:async(data)=>{
        const apiData = {
            id: data.id || data._id
        }
        try {
            const response = await notesPoolApi.getNotes(apiData)
            const responseData = response.data

            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                set({notes : responseData.DB_DATA.notes})
                set({notesCopy : responseData.DB_DATA.notes})
                set({noteBookTitle : responseData.notebook_name})
                set({noteBookID: data.id || data._id})
            
            }
        } catch(err){
            console.log(err)
        }
    },
    gettingShareNotes:async(data)=>{
        const apiData = {
            id: data.id || data._id
        }
        try {
            const response = await notesPoolApi.getShareNotes(apiData)
            const responseData = response.data

            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                set({mySharednotebookNotes : responseData.DB_DATA.notes})
                set({mySharednotebookNotesCopy : responseData.DB_DATA})
                set({noteBookTitle : responseData.notebook_name})
                set({noteBookID: data.id || data._id})
            
            }
        } catch(err){
            console.log(err)
        }
    },

    gettingSharedNotebookNotes:async(notebookId)=>{
        try {
            const response = await notesPoolApi.getSharedNotebookNotes(notebookId)
            const responseData = response.data

            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                const notesData = responseData.DB_DATA?.notes || responseData.DB_DATA || []
                const notes = Array.isArray(notesData) ? notesData : []
                set({sharedNotebookNotes : notes})
                set({sharedNotebookNotesCopy : notes})
                set({noteBookID: notebookId})
            } else {
                set({sharedNotebookNotes : []})
                set({sharedNotebookNotesCopy : []})
            }
        } catch(err){
            set({sharedNotebookNotes : []})
            set({sharedNotebookNotesCopy : []})
        }
    },
    
    addSharedNote:(data)=>{
        const currentNotes = get().sharedNotebookNotes
        const noteData = {
            ...data,
            last_updated: data.last_updated || data.entry_time || Math.floor(Date.now() / 1000)
        }
        set({sharedNotebookNotes: [noteData, ...currentNotes]})
        set({sharedNotebookNotesCopy: [noteData, ...currentNotes]})
    },
    
    deleteSharedNote:(id)=>{
        const filteredNotes = get().sharedNotebookNotes.filter((ele) => {
            const noteId = ele._id || ele.id || ele.note_id
            return noteId !== id
        })
        set({sharedNotebookNotes: filteredNotes})
        set({sharedNotebookNotesCopy: filteredNotes})
    },

    updateNoteBook:(data)=>{
        set({
            notebooks: get().notebooks?.map((ele) => ele.id === data.id ? data : ele),
            notebooksCopy: get().notebooksCopy?.map((ele) => ele.id === data.id ? data : ele)

        })
        // set({notebookCount: get().notebookCount + 1})
    },
    newNoteBook:(data)=>{
        const normalized = {
            ...data,
            id: data?.id || data?._id || data?.notebook_id,
            notebook_title: data?.notebook_title || data?.name || data?.notebook_name,
            total_notes_inside: data?.total_notes_inside ?? 0,
        }
        const current = Array.isArray(get().notebooks) ? get().notebooks : []
        const currentCopy = Array.isArray(get().notebooksCopy) ? get().notebooksCopy : []
        const updatedCopy = [normalized, ...currentCopy]
        const isFilteredView = current.length !== currentCopy.length
        set({
            notebooks: isFilteredView ? current : updatedCopy,
            notebooksCopy: updatedCopy,
        })
    },
    notebookDelete:(id)=>{
         set({
            notebooks: get().notebooks?.filter((ele) => ele.id !== id),
            notebooksCopy: get().notebooksCopy?.filter((ele) => ele.id !== id),

        })
    },
    /**
     * Adds a new note to the store and updates notebook note count.
     * @param {object} data - The created note data from the API.
     * @param {string|number} [targetNotebookId] - Optional. The notebook this note was added to (use when creating from navbar so that notebook's count updates).
     */
    newNote:(data, targetNotebookId)=>{
        const resolvedId = data?.id || data?._id || data?.note_id;
        const noteNotebookId = data?.notebook_id ?? data?.notebookId ?? targetNotebookId;
        const noteData = {
            ...data,
            id: resolvedId,
            _id: data?._id || resolvedId,
            note_id: data?.note_id || resolvedId,
            notebook_id: noteNotebookId ?? data?.notebook_id,
            last_updated: data?.last_updated || data?.entry_time || Math.floor(Date.now() / 1000)
        };

        const currentNotebookId = get().noteBookID;
        const isViewingThisNotebook = currentNotebookId != null && noteNotebookId != null &&
            (String(currentNotebookId) === String(noteNotebookId) || currentNotebookId === noteNotebookId);

        if (isViewingThisNotebook) {
            const currentNotes = Array.isArray(get().notes) ? get().notes : [];
            const currentNotesCopy = Array.isArray(get().notesCopy) ? get().notesCopy : [];
            set({
                notes: [noteData, ...currentNotes],
                notesCopy: [noteData, ...currentNotesCopy],
            });
        }

        const notebookIdToUpdate = targetNotebookId ?? currentNotebookId;
        if (notebookIdToUpdate && get().notebooks) {
            const currentNotebooks = get().notebooks;
            const updatedNotebooks = currentNotebooks.map(notebook => {
                const nbId = notebook?.id ?? notebook?._id ?? notebook?.notebook_id;
                if (nbId != null && (String(nbId) === String(notebookIdToUpdate) || nbId === notebookIdToUpdate)) {
                    return {
                        ...notebook,
                        total_notes_inside: (notebook.total_notes_inside || 0) + 1
                    };
                }
                return notebook;
            });
            set({
                notebooks: updatedNotebooks,
                notebooksCopy: updatedNotebooks,
            });
        }
    },
    noteDelete:(id)=>{
        const currentNotes = get().notes;
        const currentNotesCopy = get().notesCopy;
        
        const filteredNotes = Array.isArray(currentNotes) ? currentNotes.filter((ele) => {
            const noteId = ele._id || ele.id || ele.note_id;
            return noteId !== id;
        }) : [];
        
        const filteredNotesCopy = Array.isArray(currentNotesCopy) ? currentNotesCopy.filter((ele) => {
            const noteId = ele._id || ele.id || ele.note_id;
            return noteId !== id;
        }) : [];
        
        set({
            notes: filteredNotes,
            notesCopy: filteredNotesCopy,
        })
        
        // Update notebook count if we have a current notebook
        const currentNotebookId = get().noteBookID;
        if (currentNotebookId) {
            const currentNotebooks = get().notebooks;
            const updatedNotebooks = currentNotebooks.map(notebook => {
                if (notebook.id === currentNotebookId) {
                    return {
                        ...notebook,
                        total_notes_inside: Math.max((notebook.total_notes_inside || 1) - 1, 0)
                    };
                }
                return notebook;
            });
            
            set({
                notebooks: updatedNotebooks,
                notebooksCopy: updatedNotebooks,
            });
        }
    },
    updateNote:(data)=>{
        console.log("data", data)
        if (!data) {
            console.error("updateNote: data is undefined or null");
            return;
        }
        
        const currentNotes = get().notes;
        const currentNotesCopy = get().notesCopy;

        console.log("currentNotes", currentNotes)
        
        const updatedNotes = Array.isArray(currentNotes) ? currentNotes.map((ele) => {
            const noteId = ele._id || ele.id || ele.note_id;
            const dataId = data._id || data.id || data.note_id;
            return noteId === dataId ? data : ele;
        }) : [];
        
        const updatedNotesCopy = Array.isArray(currentNotesCopy) ? currentNotesCopy.map((ele) => {
            const noteId = ele._id || ele.id || ele.note_id;
            const dataId = data._id || data.id || data.note_id;
            return noteId === dataId ? data : ele;
        }) : [];
        
        set({
            notes: updatedNotes,
            notesCopy: updatedNotesCopy,
        })
        
    },



    serachingNote:async(data)=>{
        const name = data.name 
        if(name.trim() === ""){
            set({notes:get().notesCopy})
        }else{

            try{
                const response = await notesPoolApi.serachNotes(data)
                const responseData = await response.data 
                if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                    const dbData = responseData.DB_DATA
                    set({notes: dbData})
                }else{
                    set({notes: []})
                }
            }catch (error) {
                console.log(error)
            }
        }
    },
    serachingNoteBook:(data)=>{
        const name = (data?.name || "").trim().toLowerCase()
        if(name === ""){
            set({ notebooks: get().notebooksCopy })
        }else{
            const source = Array.isArray(get().notebooksCopy) ? get().notebooksCopy : []
            const filtered = source.filter((ele) => {
                const title = (ele?.notebook_title || ele?.notebook_name || "").toLowerCase()
                return title.includes(name)
            })
            set({ notebooks: filtered })
        }
    },
    serachingMySharedNoteBook:(data)=>{
        const name = (data?.name || "").trim().toLowerCase()
        if(name === ""){
            set({ mySharednotebooks: get().mySharednotebooksCopy })
        }else{
            const source = Array.isArray(get().mySharednotebooksCopy) ? get().mySharednotebooksCopy : []
            const filtered = source.filter((ele) => {
                const title = (ele?.notebook_name || ele?.notebook_title || "").toLowerCase()
                return title.includes(name)
            })
            set({ mySharednotebooks: filtered })
        }
    },

    searchingSharedNotebookNotes:(searchTerm)=>{
        const source = Array.isArray(get().sharedNotebookNotesCopy) ? get().sharedNotebookNotesCopy : []
        if(searchTerm.trim() === ""){
            set({sharedNotebookNotes: source})
        }else{
            const lowercaseSearch = searchTerm.toLowerCase()
            const filteredNotes = source.filter((note) =>
                note.note_title?.toLowerCase().includes(lowercaseSearch)
            )
            set({sharedNotebookNotes: filteredNotes})
        }
    },

    searchingNotes:(searchTerm)=>{
        const source = Array.isArray(get().notesCopy) ? get().notesCopy : []
        if(searchTerm.trim() === ""){
            set({notes: source})
        }else{
            const lowercaseSearch = searchTerm.toLowerCase()
            const filteredNotes = source.filter((note) =>
                note.note_title?.toLowerCase().includes(lowercaseSearch)
            )
            set({notes: filteredNotes})
        }
    },

    searchingMySharedNotes:(searchTerm)=>{
        const source = Array.isArray(get().mySharednotebookNotesCopy) ? get().mySharednotebookNotesCopy : []
        if(searchTerm.trim() === ""){
            set({mySharednotebookNotes: source})
        }else{
            const lowercaseSearch = searchTerm.toLowerCase()
            const filteredNotes = source.filter((note) =>
                note.note_title?.toLowerCase().includes(lowercaseSearch)
            )
            set({mySharednotebookNotes: filteredNotes})
        }
    },
    
    updateSharedNote:(data)=>{
        const updatedNotes = get().sharedNotebookNotes.map((ele) => {
            const noteId = ele._id || ele.id || ele.note_id
            const dataId = data._id || data.id || data.note_id
            return noteId === dataId ? data : ele
        })
        set({sharedNotebookNotes: updatedNotes})
        set({sharedNotebookNotesCopy: updatedNotes})
    },

    gettingStarredNotes:async()=>{
        try {
            const response = await notesPoolApi.getStarredNotes()
            const responseData = response.data

            if(response.status === 200 && (responseData.STATUS === 'SUCCESSFUL' || responseData.status === 'success')){
                const starredData = responseData.DB_DATA || responseData.data || responseData || []
                set({starredNotes : starredData})
                set({starredNotesCopy : starredData})
            } else {
                set({starredNotes : []})
                set({starredNotesCopy : []})
            }
        } catch(err){
            console.error('Error fetching starred notes:', err)
            set({starredNotes : []})
            set({starredNotesCopy : []})
        }
    },

    myShareNotebookDelete:(id)=>{
        const currentMySharednotebooks = get().mySharednotebooks;
        const currentMySharednotebooksCopy = get().mySharednotebooksCopy;
        
        const filteredMySharednotebooks = Array.isArray(currentMySharednotebooks) ? currentMySharednotebooks.filter((ele) => {
            const notebookId = ele._id || ele.id || ele.notebook_id;
            return notebookId !== id;
        }) : [];
        
        const filteredMySharednotebooksCopy = Array.isArray(currentMySharednotebooksCopy) ? currentMySharednotebooksCopy.filter((ele) => {
            const notebookId = ele._id || ele.id || ele.notebook_id;
            return notebookId !== id;
        }) : [];
        
        set({
            mySharednotebooks: filteredMySharednotebooks,
            mySharednotebooksCopy: filteredMySharednotebooksCopy,
        })
    },

    organizationNotes: [],
    organizationNotesCopy: [],
    isLoadingOrganizationNotes: false,

    gettingOrganizationNotes: async() => {
        set({ isLoadingOrganizationNotes: true })
        try {
            const response = await notesPoolApi.getAllOrganizationNotes()
            const data = response.data

            if(response.status === 200 && data.STATUS === "SUCCESSFUL"){
                set({ 
                    organizationNotes: data.DB_DATA || [],
                    organizationNotesCopy: data.DB_DATA || [],
                    isLoadingOrganizationNotes: false
                })
            } else {
                set({ 
                    organizationNotes: [],
                    organizationNotesCopy: [],
                    isLoadingOrganizationNotes: false
                })
            }
        } catch(err){
            console.error('Error fetching organization notes:', err)
            set({ 
                organizationNotes: [],
                organizationNotesCopy: [],
                isLoadingOrganizationNotes: false
            })
        }
    },

    searchOrganizationNotes: (searchTerm) => {
        const source = Array.isArray(get().organizationNotesCopy) ? get().organizationNotesCopy : []
        if(searchTerm.trim() === ""){
            set({organizationNotes: source})
        } else {
            const lowercaseSearch = searchTerm.toLowerCase()
            const filteredNotes = source.filter((note) =>
                note.note_title?.toLowerCase().includes(lowercaseSearch)
            )
            set({organizationNotes: filteredNotes})
        }
    },
})


export default notesPoolViewModel