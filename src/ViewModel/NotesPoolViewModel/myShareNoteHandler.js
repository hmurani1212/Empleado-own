import { useState } from "react"
import notesPoolApi from "../../Model/Data/NotesPool/NotesPool"

import useStore from "../../Store/store"
import { showToast } from "../../Components/Toaster/Toaster"

const useMyShareNoteHandler = ()=>{


    const myShareNotebookDelete = useStore((state)=> state.myShareNotebookDelete)

    const [deleteValue, setDeleteValue]  = useState({
        confirm: false, 
        loading: false, 
        id: null
    })


    const handleMyShareNoteBookMenuList = (data)=>{
        setDeleteValue((prevState)=>({
            ...prevState, 
            id:data._id || data.id,
            confirm:true,
        }))
    }


    const deleteMyShareNoteBookConfirmation = async()=>{

        const apiData = {
            id:deleteValue.id,
            portal : "admin"
        }
        setDeleteValue((prevState)=>({
            ...prevState,
            loading: true
        }))
        try{

            const response = await notesPoolApi.deleteMySharedNoteBook(apiData)
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){

                myShareNotebookDelete(deleteValue.id)
                showToast('MyShared Notebook Deleted Successfully', 'success')
                setDeleteValue((prevState)=>({
                    ...prevState, 
                    confirm:false,
                }))
            }else{
                const error = responseData.ERROR_DESCRIPTION
                showToast(error, 'error')
                setDeleteValue((prevState)=>({
                    ...prevState, 
                    confirm:false,
                }))
            }
            
        }catch(err){
            console.error("Delete my shared notebook error:", err)
            showToast('Failed to delete shared notebook', 'error')
            setDeleteValue((prevState)=>({
                ...prevState, 
                confirm:false,
            }))
        }

        finally{
            setDeleteValue((prevState)=>({
                ...prevState,
                loading: false
            }))
        }
        
    }



    function toggleConfirmationMySharedNoteBook(){
        setDeleteValue((prevState)=>({
            ...prevState, 
            confirm:false,
        }))
    }



    return { handleMyShareNoteBookMenuList,deleteValue,deleteMyShareNoteBookConfirmation,toggleConfirmationMySharedNoteBook }



}

export default useMyShareNoteHandler