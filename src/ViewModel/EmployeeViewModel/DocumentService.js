import { useState } from "react"
import useStore from "../../Store/store"
import employeesApi from "../../Model/Data/Employees/Employees"
import { showToast } from "../../Components/Toaster/Toaster"
import { File_BASE_URL } from "../../Model/BaseUri"
// import useElephantSerivce from "../../services/__elephantServices"

const useDocumentServices = ()=>{
    
    // const { fileHitting } = useElephantSerivce()

    const deleteSingleDocument =  useStore((state)=> state.deleteSingleDocument)
    const addNewDocument =  useStore((state)=> state.addNewDocument)



    const [documentValue, setDocumentValue] = useState({
        emp_id:'',
        show:false,
        loading:false,
        title:'',
        file:null,
        fileUploading:false,
        uploadProgress:0

    })


    const handleDocumentAdd = async(empID)=>{
        setDocumentValue((prevState)=>({
            ...prevState,
            show:true,
            emp_id:empID,

            
        }))
    }

    const handleDocumentAddClose = ()=>{
        setDocumentValue((prevState)=>({
            ...prevState, 
            show:false,
            title:'',
            file:null,
            fileUploading:false,
            uploadProgress:0,


        }))
    }

    const handleDocumentInputChange = (e)=>{
        const {name, value} = e.target

            setDocumentValue((prevState)=>({
                ...prevState,
                [name]:value
            }))
        
    }


    const handleDocumentFileChange = async (e) => {
        const file = e.target.files[0];
        setDocumentValue({
            ...documentValue,
            file: file,
        });
        // if (file) {
        //     setDocumentValue((prevState) => ({
        //         ...prevState,
        //         fileUploading: true,
        //         uploadProgress: 0, // Reset progress before upload,
                
        //     }));

        //     try {
        //       const data =   await fileHitting(file, (progress) => {
        //             setDocumentValue((prevState) => ({
        //                 ...prevState,
        //                 uploadProgress: progress, // Update upload progress
        //             }));
        //         });

        //         setDocumentValue((prevState) => ({
        //             ...prevState,
        //            file:data
                    
        //         }));
        //         showToast('File Uploaded Successfully', 'success')
        //     } catch (err) {
        //         console.error('Error uploading file:', err);
        //     } finally {
        //         setDocumentValue((prevState) => ({
        //             ...prevState,
        //             fileUploading: false,
        //         }));
        //     }
        // } else {
        //     console.log('No file selected');
        // }
    };


    const validateDocument = ()=>{
        const {file, title} = documentValue 
        if(title === ''){
            showToast('Title is required', 'error')
            return
        }
        else if(file === null){
            showToast('Upload File', 'error')
            return
        }
        return true
    }

    const handleSubmitDocument =async()=>{
        const validation = validateDocument()
        if(validation){

            const formData = new FormData()
            formData.append('operation', 'set_emp_document');
            formData.append('emp_id', documentValue.emp_id);
            formData.append('doc_file', documentValue.file);
            formData.append('doc_name', documentValue.title);

            setDocumentValue((prevState)=>({
                ...prevState,
                loading:true
            }))


            try {
                const response = await employeesApi.addDocument(formData)
                console.log('response', response)
                const responseData = response.data 
                if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                    const newData = responseData.INSERTED_DATA
                    addNewDocument(newData)
                    setDocumentValue((prevState)=>({
                        ...prevState,
                        show:false
                    }))
                }else{
                    const error = responseData.ERROR_DESCRIPTION 
                    showToast(error, 'error')
                }
                
            } catch (error) {
                
            }finally{
                setDocumentValue((prevState)=>({
                    ...prevState,
                    loading:false
                }))
            }
        }
    }

    const [deleteDocumentValue, setDeleteDocumentValue] = useState({
        id:'',
        show:false,
        empId:'',
        loading:false
    })

    const deleteDoument = (id, empId)=>{
        setDeleteDocumentValue((prevState)=>({
            ...prevState,
            id:id,
            empId:empId,
            show:true
        }))
    }

    const toggleDeleteDocument = ()=>{
        setDeleteDocumentValue((prevState)=>({
            ...prevState,
            show:false
        }))
    }


    const confirmDeleteDocument = async()=>{
        const apiData = {
            emp_data:[
                'document',
                deleteDocumentValue.id,
                deleteDocumentValue.empId

            ]
        }
        setDeleteDocumentValue((prevState)=>({
            ...prevState,
            loading:true
        }))
        try{
            const response = await employeesApi.deleteFromOfficialInfo(apiData)
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                // console.log('Hello')
                deleteSingleDocument(deleteDocumentValue.id)
                setDeleteDocumentValue((prevState)=>({
                    ...prevState,
                    show:false
                }))
                showToast('Document Removed Successfully', 'success')
            }
        }catch(err){

        }finally{

            setDeleteDocumentValue((prevState)=>({
                ...prevState,
                loading:false
            }))
        }
    }



    const handleDocumentView = (data)=>{
        if (data?.doc_url) {
            const url = `${File_BASE_URL}${data.doc_url}`
            window.open(url, '_blank');
        }
    }


    return {
        deleteDocumentValue,deleteDoument,toggleDeleteDocument,confirmDeleteDocument,
        documentValue,handleDocumentAdd, handleDocumentAddClose,
        handleDocumentInputChange, handleDocumentFileChange, handleSubmitDocument,handleDocumentView
    }
}
export default useDocumentServices