import axiosInstance from "../../base"
import { NotesPoolinstancemodeule, NotesPoolFileInstance } from "../../base"

const notesPoolApi = {
    getNotebooks: function (){
        return NotesPoolinstancemodeule.request({
            method: 'GET',
            url: `/api/v1/notebooks/get/notebook`
        })
    },

    getMySharedNotebooks: function (){
        return NotesPoolinstancemodeule.request({
            method: 'GET',
            url: `/api/v1/shared_and_fav/get/notebook`,
            params: {
                operation: 'get_my_shared_notebooks',
            }
        })
    },
    getSharedNotebooks: function (){
        return NotesPoolinstancemodeule.request({
            method: 'GET',
            url: `/api/v1/shared_and_fav/get/shared_with_me`,
            // params: {
            //     operation: 'get_shared_notebooks',
            // }
        })
    },
    getNotes: function (data){
        return NotesPoolinstancemodeule.request({
            method: 'GET',
            url: `/api/v1/notebooks/get/view_notebook?notebook_id=${data.id}`,
            data: {
                operation: 'get_notes',
                ...data,
            }
        })
    },
    getShareNotes: function (data){
        return NotesPoolinstancemodeule.request({
            method: 'GET',
            url: `/api/v1/notebooks/get/view_shared_notebook?shared_notebook_id=${data.id}`,
            data: {
                operation: 'get_shared_notes',
                ...data,
            }
        })
    },
    getSharedNotebookNotes: function (notebookId){
        return NotesPoolinstancemodeule.request({
            method: 'GET',
            url: `/api/v1/notebooks/get/view_shared_notebook?shared_notebook_id=${notebookId}`,
            params: {
                operation: 'get_shared_notes',
            }
        })
    },
    updateNoteBook: function (data){
        return NotesPoolinstancemodeule.request({
            method: 'POST',
            url: `/api/v1/notebooks/${data.notebook_id}`,
            data: {
                operation: 'update_notebook',
                ...data,
            }
        })
    },
    addNoteBook: function (data){
        return NotesPoolinstancemodeule.request({
            method: 'POST',
            url: `/api/v1/notebooks`,
            data: {
                ...data,
            }
        })
    },
    deleteSpecificNoteBook: function (data){
        return NotesPoolinstancemodeule.request({
            method: 'DELETE',
            url: `/api/v1/notebooks/delete/notebook?notebook_id=${data.id}`,
            data: {
                operation: 'deleteNotebook',
                ...data,
            }
        })
    },
    addNote: function (data){
        return NotesPoolinstancemodeule.request({
            method: 'POST',
            url: `/api/v1/notes?notebook_id=${data.notebook_id}`,
            data: {
                operation: 'submit_note_title',
                ...data,
            }
        })
    },
    updateNote: function (data){
        console.log("data", data)
        return NotesPoolinstancemodeule.request({
            method: 'POST',
            url: `/api/v1/notes?note_id=${data.note_id}`,
            data: {
                operation: 'update_note_title',
                ...data,
            }
        })
    },
    deleteNote: function (data){
        return NotesPoolinstancemodeule.request({
            method: 'DELETE',
            url: `/api/v1/notebooks/delete/note?note_id=${data.id}`,
            data: {
                operation: 'deleteNote',
                ...data,
            }
        })
    },
    savedEditorContent: function (data){
        return NotesPoolinstancemodeule.request({
            method: 'POST',
            url: `/api/v1/notes?note_id=${data.note_id}`,
            data: {
                operation: 'save_editor_content',
                ...data,
            }
        })
    },
    viewNote: function (data){
        return NotesPoolinstancemodeule.request({
            method: 'GET',
            url: `/api/v1/notebooks/get/view_note?note_id=${data.id}`,
            data: {
                operation: 'viewNote',
                ...data,
            }
        })
    },
    uploadNoteAttachemnt : function(data,onUploadProgress){
        return NotesPoolFileInstance.request({
            method: 'POST',            
            url:`/api/v1/notes?note_id=${data.note_id}`,
            data:data,
            onUploadProgress: (progressEvent) => {
                if (onUploadProgress) {
                    const total = progressEvent.total;
                    const loaded = progressEvent.loaded;
                    const percentage = Math.floor((loaded / total) * 100);
                    onUploadProgress(percentage); // Update progress
                }
            },
        })
    },

    noteAdditionalData: function(data){
        return NotesPoolinstancemodeule.request({
            method: 'POST',
            url:`/api/v1/notes?note_id=${data.note_id}`,
            
            data:{
                'operation' : 'submit_note',
                ...data
            }
        })
    },
    getNote: function(data){
        const noteId = data?.id ?? data?.note_id ?? data?._id;
        return NotesPoolinstancemodeule.request({
            method: 'GET',
            url: `/api/v1/notebooks/get/view_note?note_id=${noteId}`,
            data: {
                operation: 'edit_note',
                id: noteId
            }
        })
    },
    removeAttachements: function(data){
        return NotesPoolinstancemodeule.request({
            method: 'DELETE',
            url:`/api/v1/notes/${data.note_id}/attachments/${data.file_id}`,
        })
    },
    serachNotes: function(data){
        return axiosInstance.request({
            method: 'POST',
            url:`/notes_pool/web_operations/get_data_ops/get_data.php`,
            data:{
                'operation' : 'search_note',
                ...data
            }
        })
    },
    serachNoteBook: function(data){
        return axiosInstance.request({
            method: 'POST',
            url:`/notes_pool/web_operations/get_data_ops/get_data.php`,
            data:{
                'operation' : 'search_notebook',
                ...data
            }
        })
    },
    serachMySharedNoteBook: function(data){
        return axiosInstance.request({
            method: 'POST',
            url:`/notes_pool/web_operations/get_data_ops/get_data.php`,
            data:{
                'operation' : 'search_myshared_notebook',
                ...data
            }
        })
    },
    deleteMySharedNoteBook: function(data){
        return NotesPoolinstancemodeule.request({
            method: 'DELETE',
            url:`/api/v1/shared_and_fav/delete/notebook?shared_notebook_id=${data.id}`,
            data:{
                'operation' : 'deleteMySharedNotebook',
                ...data
            }
        })
    },
    getNotebooksList: function(){
        return NotesPoolinstancemodeule.request({
            method: 'GET',
            url:`/api/v1/shared_and_fav/get/notebook`,
        })
    },
    shareNoteBookPoint: function(data){
        console.log("data", data)
        return NotesPoolinstancemodeule.request({
            method: 'POST',
            url:`/api/v1/shared_and_fav/share/notebook?notebook_id=${data.notebook_id}`,
            data:{
                'operation' : 'notebook_share',
                ...data
            }
        })
    },
    shareNotePoint: function(data){
        return NotesPoolinstancemodeule.request({
            method: 'POST',
            url:`/api/v1/shared_and_fav/share/note?note_id=${data.note_id}`,
            data:{
                'operation' : 'note_share',
                ...data
            }
        })
    },
    pastNote: function(data){
        return NotesPoolinstancemodeule.request({
            method: 'POST',
            url:`/api/v1/notes/manage/${data.note_id}?action=move&target_notebook_id=${data.notebook_id}`,
            data:{
                'operation' : 'Past_note',
                ...data
            }
        })
    },    
    copyNote: function(data){
        return NotesPoolinstancemodeule.request({
            method: 'POST',
            url:`/api/v1/notes/manage/${data.id}?action=copy`,
            data:{
                'operation' : 'Copy_note',
                ...data
            }
        })
    },    
    getAllNoteBook: function(){
        return NotesPoolinstancemodeule.request({
            method: 'GET',
            url: `/api/v1/notebooks/get/notebook`,
        })
    }, 
    gettingClipBoardData: function(data){
        return axiosInstance.request({
            method: 'GET',
            url:`/notes_pool/web_operations/get_data_ops/get_data.php`,
            params:{
                'operation' : 'public_share',
                ...data
            }
        })
    },
    
    getPublicShareLink: function(data){
        return NotesPoolinstancemodeule.request({
            method: 'GET',
            url: `/api/v1/notes/public_url/${data._id}`,
        })
    }, 
    
    // Star/Favorite functionality
    toggleNoteStar: function(data){
        return NotesPoolinstancemodeule.request({
            method: 'POST',
            url: `api/v1/shared_and_fav/share/favourite?note_id=${data.note_id || data._id}`,
            data: {
                operation: 'toggle_note_star',
                is_starred: data.is_starred,
                ...data
            }
        })
    },
    
    // Remove star/favorite functionality
    removeNoteStar: function(data){
        return NotesPoolinstancemodeule.request({
            method: 'DELETE',
            url: `/api/v1/shared_and_fav/delete/favourite?fav_note_id=${data.note_id}`,
            data: {
                operation: 'remove_note_star',
                ...data
            }
        })
    },
    
    getStarredNotes: function(){
        return NotesPoolinstancemodeule.request({
            method: 'GET',
            url: `/api/v1/shared_and_fav/get/favourite`,
            params: {
                operation: 'get_starred_notes'
            }
        })
    },

    // Share notebook to already shared notebook
    shareNotebookToSharedNotebook: function(data){
        return NotesPoolinstancemodeule.request({
            method: 'POST',
            url: `/api/v1/shared_and_fav/share/share_to_notebook?notebook_id=${data.notebook_id}&shared_notebook_id=${data.shared_notebook_id}`,
            data: {
                operation: 'share_notebook_to_shared_notebook',
                notebook_id: data.notebook_id,
                shared_notebook_id: data.shared_notebook_id
            }
        })
    },

    // Share note to already shared notebook
    shareNoteToSharedNotebook: function(data){
        return NotesPoolinstancemodeule.request({
            method: 'POST',
            url: `/api/v1/shared_and_fav/share/share_to_notebook?note_id=${data.note_id}&shared_notebook_id=${data.shared_notebook_id}`,
            data: {
                operation: 'share_note_to_shared_notebook',
                note_id: data.note_id,
                shared_notebook_id: data.shared_notebook_id
            }
        })
    },

    // AI Enhancement
    enhanceWithAI: function(data){
        return NotesPoolinstancemodeule.request({
            method: 'POST',
            url: 'http://172.18.0.34:8754/api/v1/enhance_notes',
            data: data,
            withCredentials: true
        })
    },

    // Get all organization notes
    getAllOrganizationNotes: function(){
        return NotesPoolinstancemodeule.request({
            method: 'GET',
            url: `/api/v1/notes/organization/all`
        })
    }

    
}

export default notesPoolApi