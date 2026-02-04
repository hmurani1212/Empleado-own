import { useState } from "react"
import { useDebounce } from "../../services/__debounceServices";
import useStore from "../../Store/store";

const useSearchServices = ()=>{

    const serachingNote = useStore((state)=> state.serachingNote)
    const serachingNoteBook = useStore((state)=> state.serachingNoteBook)
    const serachingMySharedNoteBook = useStore((state)=> state.serachingMySharedNoteBook)
    const searchingNotes = useStore((state)=> state.searchingNotes)
    const searchingMySharedNotes = useStore((state)=> state.searchingMySharedNotes)


    const [noteSearchValue, setNoteSerachValue] = useState({
        name:'',
    })
    const [noteBookSearchValue, setNoteBookSerachValue] = useState({
        name:'',
    })





    const debounceNoteSearch = useDebounce((value) => {
        searchingNotes(value)
    }, 500); // 500ms debounce time


    const handleChangeNoteSearch = (e)=>{
        const {name, value} = e.target
        setNoteSerachValue((prevState)=>({
            ...prevState,
            [name]: value
        }))

        debounceNoteSearch(value);
    }



    const debounceNoteBookSearch = useDebounce(async(value) => {
        
        const apiData = {
            name:value.trim(), 
            portal:"admin"
        }
        await serachingNoteBook(apiData)

       
    }, 500); // 500ms debounce time

    const handleChangeNoteBookSearch = (e)=>{
        const {name, value} = e.target
        setNoteBookSerachValue((prevState)=>({
            ...prevState,
            [name]: value
        }))

        debounceNoteBookSearch(value);
    }


    const debounceMySharedNoteBookSearch = useDebounce(async(value) => {
        
        const apiData = {
            name:value.trim(), 
            portal:"admin"
        }
        await serachingMySharedNoteBook(apiData)
       
    }, 500); // 500ms debounce time
    const handleChangeMyShareNoteBookSearch = (e)=>{
        const {name, value} = e.target
        setNoteBookSerachValue((prevState)=>({
            ...prevState,
            [name]: value
        }))

        debounceMySharedNoteBookSearch(value);
    }




    const debounceMySharedNoteSearch = useDebounce((value) => {
        searchingMySharedNotes(value)
    }, 500); // 500ms debounce time


    const handleChangeMySharedNoteSearch = (e)=>{
        const {name, value} = e.target
        setNoteSerachValue((prevState)=>({
            ...prevState,
            [name]: value
        }))

        debounceMySharedNoteSearch(value);
    }



    return { handleChangeNoteSearch, noteSearchValue,
        handleChangeNoteBookSearch,noteBookSearchValue,
        handleChangeMyShareNoteBookSearch,
        handleChangeMySharedNoteSearch

    }

}


export default useSearchServices