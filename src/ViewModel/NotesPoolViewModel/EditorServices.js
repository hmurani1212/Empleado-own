import { useRef, useState } from "react"
import notesPoolApi from "../../Model/Data/NotesPool/NotesPool"
import { showToast } from "../../Components/Toaster/Toaster"
import { serializeEditorContentForLegacyBackend } from "../../services/__notesPoolEditorContent"
import {
  extractUploadedAttachmentRows,
  mergeAttachmentListsForUpdate,
  filterAttachmentsForNoteUpdatePayload,
} from "../../services/__notesPoolAttachments"
import { isNotesPoolLooseSuccess } from "../../services/__notesPoolApi"

const useEditorService = ()=>{

    const [editorValue, setEditorValue] = useState({
        editorContent:{},
        tags:[],
        tag_name:'',
        attachements:[],
        confirm:false,
        loading:false,
        autoSave:null
        
    })


    const editorContent = async (data, entry_time, currentTimeInSeconds) => {
        setEditorValue((prevState) => ({
            ...prevState,
            editorContent: { ...data, entry_time },
            autoSaveTime: currentTimeInSeconds,
        }));
        try {
            await notesPoolApi.savedEditorContent(data);
        } catch (err) {
            console.error('Error saving editor content:', err);
        }
    }
    

    function handleChangeEditor(e){
        const {name, value} = e.target
        setEditorValue((prevState)=>({
            ...prevState,
            [name]: value
        }))
    }


    const handleAddTag = (e) => {
        if (e.key === 'Enter') {
            if (editorValue.tag_name.trim() !== '') {
                e.preventDefault();
                const newTag = { 
                    label: editorValue.tag_name.trim()
                };

                setEditorValue((prevState) => ({
                    ...prevState,
                    tags: [...prevState.tags, newTag],
                    tag_name: ''
                }));
            } else {
                showToast("Tag can't be empty", 'error');
            }
        }
    };

    const handleRemoveTag = (data) => {
        setEditorValue((prevState) => {
            const updatedTags = prevState.tags.filter((ele) => ele !== data);

            // If a tag was removed, show a toast notification
            if (updatedTags.length !== prevState.tags.length) {
                showToast(`Tag removed successfully`, 'success');
            }

            return {
                ...prevState,
                tags: updatedTags
            };
        });
    }


    const handleAllTagRemove = ()=>{
        setEditorValue((prevState)=>({
            ...prevState,
            confirm: true
        }))
    }

    const toggleHandleConfirmTag = ()=>{
        setEditorValue((prevState)=>({
            ...prevState,
            confirm: false
        }))
    }

    const confirmRemoveAllTags = ()=>{
        setEditorValue((pervState)=>({
            ...pervState, 
            tags:[],
            confirm:false,
        }))
        showToast('All tags has been removed', 'success')
    }


    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);
    // const [uploadProgress, setUploadProgress] = useState(null);
    const [uploadProgress, setUploadProgress] = useState({});


    const resolveNoteIdForUpload = (data) =>
        data?.note_id ?? data?.noteHeader?.note_id ?? data?.noteHeader?.id ?? data?.id ?? data?._id;

    const handleDrop = (e, data) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files || []);
        if (!droppedFiles.length) return;
        void uploadFiles(droppedFiles, data);
    };

    const handleFileChange = async (e, data) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (!selectedFiles.length) return null;
        return uploadFiles(selectedFiles, data);
    };

    const handleRemoveFile = async (file, data, index) => {
        // EditorFileUpload: remove pending local file — onClick passes only index (number)
        if (typeof file === "number") {
            const idx = file;
            setFiles((prev) => prev.filter((_, i) => i !== idx));
            return;
        }

        const fileId = file?.id || file?.ID || file?.file_id || file?.FILE_ID;
        if (!fileId && (file instanceof File || (typeof file?.name === "string" && !file?.REC_ID && !file?.rec_id))) {
            setEditorValue((prevState) => ({
                ...prevState,
                attachements: (prevState.attachements || []).filter((_, i) => i !== index),
            }));
            return;
        }

        const noteId = data?.noteHeader?.note_id ?? data?.noteHeader?.id ?? data?.note_id ?? data?.id ?? data?._id;
        const fileName = file.FILE_NAME || file.file_name;

        if (!noteId) {
            console.error("Note ID is missing for file removal");
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
    const handleAllFileRemove = ()=>{
        setFiles([])
    }



    const uploadFiles = async (filesToUpload, data) => {
        if (!filesToUpload?.length) return null;

        const noteId = resolveNoteIdForUpload(data);
        if (!noteId) {
            showToast("Cannot upload attachment: note ID is missing", "error");
            return null;
        }

        const formData = new FormData();
        filesToUpload.forEach((file) => {
            formData.append("file", file);
        });
        formData.append("note_id", noteId);
        formData.append("operation", "upload_attachment");

        try {
            const response = await notesPoolApi.uploadNoteAttachemnt(formData, (progress) => {
                setUploadProgress((prevProgress) => ({
                    ...prevProgress,
                    [filesToUpload[0].name]: progress,
                }));
            });
            const responseData = response.data;
            if (isNotesPoolLooseSuccess(response.status, responseData)) {
                const newItems = extractUploadedAttachmentRows(responseData);
                let merged = null;
                setEditorValue((prevState) => {
                    const prev = prevState.attachements || [];
                    merged = [...prev, ...newItems];
                    return { ...prevState, attachements: merged };
                });
                setFiles([]);
                setUploadProgress({});
                return merged;
            }
            const errorDescp = responseData?.ERROR_DESCRIPTION;
            showToast(errorDescp || "Upload failed", "error");
            setUploadProgress({});
            return null;
        } catch (error) {
            console.error("Upload failed:", error);
            showToast("Failed to upload attachment", "error");
            setUploadProgress({});
            return null;
        }
    };




    const handleAddNotesData = async(data, toggleEditorNote)=>{
        
        // Auto-add pending tag if there's text in tag_name
        let tagsToSave = [...(editorValue.tags || [])];
        if (editorValue.tag_name && editorValue.tag_name.trim() !== '') {
            tagsToSave.push({ label: editorValue.tag_name.trim() });
        }
        
        // Fix: Send tags as array of strings, not objects
        const tagsForDB = tagsToSave.map(tag => 
            String(tag.label || tag.name || tag).trim()
        ).filter(tag => tag.length > 0); // Remove empty tags

        // Prefer payload from caller (e.g. Editor.save()) over React state — state can lag behind the editor.
        let editorContentData =
            data?.editor_content ??
            data?.editorContent ??
            editorValue.editorContent?.editor_content ??
            editorValue.editorContent;
        if (typeof editorContentData === 'string') {
            try {
                editorContentData = JSON.parse(editorContentData);
            } catch (e) {
                console.error('Error parsing editor content:', e);
            }
        }
        const editorContentPayload = serializeEditorContentForLegacyBackend(
            editorContentData ?? { blocks: [], time: Date.now(), version: '2.31.0' }
        );
        
        // Fix: Use the correct data structure from the UI
        console.log("data from", data)
        const apiData = {
            operation: "update_note_content",
            note_id: data.note_id || data.noteHeader?.note_id || data.noteHeader?.id || data.id || data._id,
            notebook_id: data.notebook_id || data.noteHeader?.notebook_id || '',
            notebook_title: data.notebook_title || data.noteHeader?.notebook_title || '',
            editor_content: editorContentPayload,
            tags: tagsForDB, // Send as array of strings
            attachements: filterAttachmentsForNoteUpdatePayload(
                mergeAttachmentListsForUpdate(
                    data.attachements || data.attachments,
                    editorValue.attachements
                )
            )
        };
        
        setEditorValue((prevState)=>({
            ...prevState, 
            loading:true
        }))

        try{
            const response = await notesPoolApi.updateNote(apiData)
            const responseData = await response.data 
            
            if (isNotesPoolLooseSuccess(response.status, responseData)) {
                toggleEditorNote()
                showToast('Note Updated Successfully', 'success')
            } else {
                const apiError = responseData?.ERROR_DESCRIPTION || 'Failed to update note'
                showToast(apiError, 'error')
            }
        }catch(err){
            console.error('Error updating note:', err)
            showToast('Failed to update note', 'error')
        }finally{
            setEditorValue((prevState)=>({
                ...prevState, 
                loading:false
            }))
        }
    }



    const settingEditorData = (data) => {
        setEditorValue((prevState) => ({
            ...prevState,
            note_id: data.note_id || data._id || data.id,
            editorContent: data.editorContent || data.editor_content || {},
            tags: data.tags || [],
            attachements: data.attachements || data.attachments || [],
            note_title: data.note_title || "",
            last_updated: data.last_updated || null
        }));
    }




    return { editorContent, editorValue, handleChangeEditor, handleAddTag,handleRemoveTag, handleAllTagRemove,
        confirmRemoveAllTags,toggleHandleConfirmTag,
        files,handleDrop,handleFileChange,handleRemoveFile,handleClick,handleAllFileRemove,fileInputRef,
        uploadProgress,
        handleAddNotesData,
        settingEditorData

    }
}

export default useEditorService