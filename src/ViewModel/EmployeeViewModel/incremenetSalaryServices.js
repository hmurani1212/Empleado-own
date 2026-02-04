import { useState } from "react"

const useIncrementSalaryServices = ()=>{

    const incrementTypeData = [
        {id:1, title:'% Percent', value:1},
        {id:2, title:'Amount', value:2}
    ]

    const [incrementSalaryValue, setIncrementSalaryValue] = useState({
        show:false, 
        incrementType:1,
        currentSalary:'',
        effectiveFrom :'',
        incremenetDetails:'',
        emailBody:'',
        percentAmount:'',
        loading:false,
    })



    const handleOpenIncrement = (data)=>{
        setIncrementSalaryValue((prevState)=>({
            ...prevState,
            show:true,
            currentSalary:data.starting_salary
        }))
    }

    const toggleOpenIncrement = ()=>{
        setIncrementSalaryValue((prevState)=>({
            ...prevState,
            show:false
        }))

    }


    const handleOnChangeIncrementSalary = (e)=>{
        const {name, value} = e.target

        setIncrementSalaryValue((prevState)=>({
            ...prevState,
            [name]: value
        }))
    }


    return {
        incrementSalaryValue,
        handleOpenIncrement,
        toggleOpenIncrement,
        incrementTypeData,
        handleOnChangeIncrementSalary
    }
}


export default useIncrementSalaryServices