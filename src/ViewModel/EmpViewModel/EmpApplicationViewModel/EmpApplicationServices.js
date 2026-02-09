import { useEffect, useRef, useState } from "react"
import useStore from "../../../Store/store"

const useEmpApplcationServices = ()=>{

    

    const existingApplication = useStore((state)=> state.existingApplication)
    const getAllEmpExistingApplication = useStore((state)=> state.getAllEmpExistingApplication)
    const getNextEmpExistingApplication = useStore((state)=> state.getNextEmpExistingApplication)
    const isEmpApplicationLoading = useStore((state)=> state.isEmpApplicationLoading)
    const [active, setActive] = useState(1)

    const existingApplicationRef = useRef(null)

    const handleApplicationToggle = (id)=>{
        setActive(id)
    }

    const debounce = (func, wait) => {
        let timeout;
        return function (...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    };
    
    const [scrollPosition, setScrollPosition] = useState(0);

    const handleScroll = () => {
        if (existingApplicationRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = existingApplicationRef.current;
            const buffer = 5; // Define your buffer size in pixels
            const isScrollAtBottom = scrollTop + clientHeight >= scrollHeight - buffer;

            setScrollPosition(scrollTop);
            if (isScrollAtBottom) {
                getNextEmpExistingApplication()
            }
        }
    };

    const debouncedHandleScroll = debounce(handleScroll, 200); // Adjust debounce wait time as needed

    useEffect(() => {
        const scrollElement = existingApplicationRef.current;

        if (scrollElement) {
            scrollElement.addEventListener('scroll', debouncedHandleScroll, { passive: true });
        }

        return () => {
            if (scrollElement) {
                scrollElement.removeEventListener('scroll', debouncedHandleScroll);
            }
        };
    }, [debouncedHandleScroll]);


    

    return {
        active,handleApplicationToggle,getAllEmpExistingApplication,
        existingApplication,
        existingApplicationRef,
        isEmpApplicationLoading
        
    }
}


export default useEmpApplcationServices