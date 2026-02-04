import { useRef } from "react";

const useDropdownService = ()=>{



    


    const triggerRefs = useRef([]);

    const getDropdownPosition = (index) => {
        const triggerElement = triggerRefs.current[index];
        if (triggerElement) {
        const triggerRect = triggerElement.getBoundingClientRect();
        const dropdownHeight = 200; // Assume the height of your dropdown

        return window.innerHeight - triggerRect.bottom < dropdownHeight ? 'top' : 'bottom';
        }
        return 'bottom';
    };

    return { getDropdownPosition , triggerRefs}
}


export default useDropdownService