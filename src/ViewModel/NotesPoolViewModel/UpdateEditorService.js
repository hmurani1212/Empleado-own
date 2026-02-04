import { useRef, useState } from "react"
import notesPoolApi from "../../Model/Data/NotesPool/NotesPool"
import { showToast } from "../../Components/Toaster/Toaster"

const useUpdateEditorService = ()=>{





    const [editorValue, setEditorValue] = useState({
        editorContent:{},
        tags:[],
        tag_name:'',
        attachements:[],
        confirm:false,
        loading:false,
    })


    const editorContent = async(data)=>{
        setEditorValue((prevState)=>({
            ...prevState,
            editorContent:data
        }))
        try{
            await notesPoolApi.savedEditorContent(data)
        }catch(err){

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
                    id: editorValue.tags.length + 1, 
                    name: editorValue.tag_name.trim()
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

    const handleRemoveTag = (data)=>{
        setEditorValue((prevState) => {
            const updatedTags = prevState.tags.filter((ele) => ele.id !== data.id);

            // If a tag was removed, show a toast notification
            if (updatedTags.length !== prevState.tags.length) {
                showToast(`Tag "${data.name}" removed successfully`, 'success');
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


    const handleDrop = (e, data) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
    };

    const handleFileChange = (e, data) => {
        const selectedFiles = Array.from(e.target.files);
        uploadFiles(selectedFiles, data);
    };

    const handleRemoveFile = (index) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
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
        setFiles((prevFiles) => [...prevFiles, ...filesToUpload]);
        const formData = new FormData();
        filesToUpload.forEach((file) => {
            formData.append('file', file);  // Append each file individually
        });
        formData.append('note_id', data.note_id);
        formData.append('operation', 'upload_attachment');

        try {
            const response = await notesPoolApi.uploadNoteAttachemnt(formData, (progress) => {
                setUploadProgress((prevProgress) => ({
                    ...prevProgress,
                    [filesToUpload[0].name]: progress,
                }));
            });
            setUploadProgress({}); // Reset progress after upload completes
        } catch (error) {
            console.error("Upload failed:", error);
            setUploadProgress({}); // Reset progress on error
        }
    };


    const handleAddNotesData = async(data, toggleEditorNote)=>{
       const apiData = {
            notebook_title:data.notebook_id.label,
            note_title:data.note_title,
            notebook_id: data.notebook_id.value,
            note_id: data.note_id,
            tags: editorValue.tags.map(tag => tag.name),
            editorContent:editorValue.editorContent
        }

        setEditorValue((prevState)=>({
            ...prevState, 
            loading:true
        }))

        try{
            const response = await notesPoolApi.noteAdditionalData(apiData)
            const responseData = await response.data 
            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){

                toggleEditorNote()
                showToast('Note Added Successfully', 'success')
            }else{
                const apiError = responseData.ERROR_DESCRIPTION
                showToast(apiError, 'error')
            }
        }catch(err){
            console.log('err', err)
        }finally{
            setEditorValue((prevState)=>({
                ...prevState, 
                loading:false
            }))
        }

        
    }




    return { editorContent, editorValue, handleChangeEditor, handleAddTag,handleRemoveTag, handleAllTagRemove,
        confirmRemoveAllTags,toggleHandleConfirmTag,
        files,handleDrop,handleFileChange,handleRemoveFile,handleClick,handleAllFileRemove,fileInputRef,
        uploadProgress,
        handleAddNotesData

    }
}

export default useUpdateEditorService