import { BiEditAlt } from "react-icons/bi"
import { FaEye, FaTrash } from "react-icons/fa6"
import performanceApi from "../Model/Data/Performance/Performance"

export const includeModuleData = [
    {id:1, title:'Goal'},
    {id:2, title:'Competency'},
]


export const PRCActionList =[
    {id:1, name:'Edit', icon:<BiEditAlt className="text-green-500" />},
    {id:2, name:'View', icon:<FaEye  className="text-indigo-500" />},
    {id:3, name:'Delete', icon: <FaTrash className="text-red-500" />}
]

export const competencyActionList =[
    {id:2, name:'View', icon:<FaEye  className="text-indigo-500" />},
    {id:3, name:'Delete', icon: <FaTrash className="text-red-500" />}
]



export const subGoalsActionList = [
    {id:1, name:'Start', icon:<BiEditAlt  className="text-blue-500" />},
    {id:2, name:'Edit', icon:<BiEditAlt  className="text-green-500" />},
    {id:3, name:'Delete', icon: <FaTrash className="text-red-500" />}
]


export const priorityData = [
    {id:1, title:'Low'},
    {id:2, title: 'Medium'},
    {id:3, title: 'High'}
]



export const getPerformance = async()=>{
    try{

        const response = await performanceApi.getPerformance()
        return response

    }catch(err){

    }
}