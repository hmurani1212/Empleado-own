import { BiEditAlt, BiShare } from "react-icons/bi";
import { FaTrash  } from "react-icons/fa6";
import { IoCopy,IoCut   } from 'react-icons/io5'

export const notbookMenuList =[
    {id:1, name:'Edit', icon:<BiEditAlt className="text-green-500" />},
    {id:2, name:'Delete', icon: <FaTrash className="text-red-500" />},
    {id:3, name:'Share', icon:<BiShare className="text-yellow-500" />}
]
export const notMenuList =[
    {id:1, name:'Edit Title', icon:<BiEditAlt className="text-green-500" />},
    {id:2, name:'Edit Note', icon:<BiEditAlt className="text-green-500" />},
    {id:3, name:'Copy', icon:<IoCopy className="text-[#8bc9f8]" />},
    {id:4, name:'Cut', icon:<IoCut  className="text-indigo-500" />},
    {id:5, name:'Delete', icon: <FaTrash className="text-red-500" />},
    {id:6, name:'Share', icon:<BiShare className="text-yellow-500" />}
]


export const mysharenotesMenuList = [
    {id:2, name:'Edit', icon:<BiEditAlt className="text-green-500" />},

]
export const mysharenoteBookenuList = [
    {id:2, name:'Delete', icon: <FaTrash className="text-red-500" />},

]

export const notebookShareData = [
    {id: 1, title :'Add notes to already shared pool notebook'},
    {id: 2, title :'Add this NoteBook to Shared Pool'}
]


export const sharenotbookPermissionData = [
    {id:1, title:'Download'},
    {id:2, title:'Sharing'},
    {id:3, title:'Notes Addition'},
    {id:4, title:'Read'},
    {id:5, title:'Write'},

]


export const sharenotebookShareWithData = [
    {id:1, title:'Whole Organization', value:'whole_organization'},
    {id:2, title:'Branch',value:'branch'},
    {id:3, title:'Departments', value:'dept'},
    {id:4, title:'Employee', value:'employee'},
]


export const noteShareData = [
    {id: 1, title :'Add notes to already shared pool notebook'},
    {id: 2, title :'Add this NoteBook to Shared Pool'},
    {id: 3, title :'Share Publicly'},
]
