import axiosInstance from "../../base"
import { NotesPoolinstancemodeule, NotesPoolFileInstance } from "../../base"

/**
 * Upload uses FormData; `data.note_id` is undefined on FormData instances.
 * Read note_id from FormData.get('note_id') for the query string.
 * @param {FormData|{ note_id?: unknown }} data
 */
function resolveNoteIdForUploadUrl(data) {
    if (data && typeof data.get === "function") {
        const v = data.get("note_id");
        if (v != null && String(v) !== "") return String(v);
    }
    if (data && data.note_id != null && String(data.note_id) !== "") {
        return String(data.note_id);
    }
    return "";
}

const notesPoolApi = {
    /** @param {{ name?: string }} [params] - optional `name` for server-side search */
    getNotebooks: function (params = {}){
        const query = {}
        if (params.name != null && String(params.name).trim() !== '') {
            query.name = String(params.name).trim()
        }
        return NotesPoolinstancemodeule.request({
            method: 'GET',
            url: `/api/v1/notebooks/get/notebook`,
            params: Object.keys(query).length ? query : undefined
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
        const payload = data && typeof data === "object" ? data : {};
        const noteId = payload.note_id;
        console.log("updateNote", payload);
        return NotesPoolinstancemodeule.request({
            method: 'POST',
            url: `/api/v1/notes?note_id=${noteId ?? ""}`,
            data: {
                operation: 'update_note_title',
                ...payload,
            },
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
        const noteId = resolveNoteIdForUploadUrl(data);
        return NotesPoolFileInstance.request({
            method: 'POST',            
            url:`/api/v1/notes?note_id=${encodeURIComponent(noteId)}`,
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

    /**
     * Single-call update that includes attachments (multipart/form-data).
     * Backend must accept operation=update_note_content with file[] fields.
     *
     * @param {FormData} formData
     * @param {(percent: number) => void} [onUploadProgress]
     */
    updateNoteContentWithAttachments: function (formData, onUploadProgress) {
        const noteId = resolveNoteIdForUploadUrl(formData);
        return NotesPoolFileInstance.request({
            method: "POST",
            url: `/api/v1/notes?note_id=${encodeURIComponent(noteId)}`,
            data: formData,
            onUploadProgress: (progressEvent) => {
                if (onUploadProgress) {
                    const total = progressEvent.total;
                    const loaded = progressEvent.loaded;
                    const percentage = total ? Math.floor((loaded / total) * 100) : 0;
                    onUploadProgress(percentage);
                }
            },
        });
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
    },

    /** Fetch a shared notebook's full data (notes + metadata) for client-side download. */
    downloadSharedNotebook: function(sharedNotebookId){
        return NotesPoolinstancemodeule.request({
            method: 'GET',
            url: `/api/v1/notebooks/get/view_shared_notebook?shared_notebook_id=${sharedNotebookId}`,
            params: { operation: 'get_shared_notes' }
        })
    },

}

export default notesPoolApi