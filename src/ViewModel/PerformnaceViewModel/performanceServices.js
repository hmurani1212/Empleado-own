import { useEffect, useReducer, useRef, useState } from "react"
// import { IoReturnDownBack } from "react-icons/io5"
import { useNavigate } from "react-router"
import useStore from "../../Store/store"
// import { getPerformance } from "../../services/__performanceServices"

const usePerformanceServices = () => {



    const performanceScrollRef = useRef(null)

    const gettingPRCData = useStore((state) => state.gettingPRCData)
    const PRCData = useStore((state) => state.PRCData)
    const gettingNextPRCData = useStore((state) => state.gettingNextPRCData)
    const PRCLoading = useStore((state) => state.PRCLoading)
    const PRCPaginationData = useStore((state) => state.PRCPaginationData)
    const goToNextPRCPage = useStore((state) => state.goToNextPRCPage)
    const goToPreviousPRCPage = useStore((state) => state.goToPreviousPRCPage)
    const goToPRCPage = useStore((state) => state.goToPRCPage)


    const [openMenuValue, setOpenMenuValue] = useState({});
    const toggleMenuValue = (index, isOpen) => {
        setOpenMenuValue((prevOpenMenu) => ({
            ...prevOpenMenu,
            [index]: isOpen
        }))
    }




    const performanceTitles = [
        { id: 1, title: 'Performance Review Cycle', link: '/performance' },
        { id: 2, title: 'Goals', link: '/performance/goals' },
        { id: 3, title: 'Competency', link: '/performance/competency' },
        { id: 4, title: 'Feedback', link: '/performance/feedback' },
        { id: 5, title: 'History', link: '/performance/history' },

    ]


    const createInitialState = {

    }

    const navigate = useNavigate()

    const createReducer = (state, action) => {
        console.log('Reducer called with action:', action);
        switch (action.type) {
            case 1:
                console.log('Navigating to Performance Review Cycle');
                gettingPRCData()
                navigate(action.value)
                return
            case 2:
                console.log('Navigating to Goals');
                // gettingPerformance()
                navigate(action.value)
                return
            case 3:
                console.log('Navigating to Competency');
                navigate(action.value)
                return
            case 4:
                console.log('Navigating to Feedback');
                navigate(action.value)
                return
            case 5:
                console.log('Navigating to History');
                navigate(action.value)
                return
            default:
                console.log('No matching case for action type:', action.type);
                break;
        }
    }

    const [performanceState, dispatch] = useReducer(createReducer, createInitialState)




    const handleNavLinkClick = (data) => {
        console.log('handleNavLinkClick called with:', data);
        dispatch({ type: data.id, payload: data.id, value: data.link })
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
        if (performanceScrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = performanceScrollRef.current;
            const buffer = 5; // Define your buffer size in pixels
            const isScrollAtBottom = scrollTop + clientHeight >= scrollHeight - buffer;

            setScrollPosition(scrollTop);
            if (isScrollAtBottom) {
                gettingNextPRCData()
                console.log('reerer')
            }
        }
    };

    const debouncedHandleScroll = debounce(handleScroll, 200); // Adjust debounce wait time as needed

    useEffect(() => {
        const scrollElement = performanceScrollRef.current;

        if (scrollElement) {
            scrollElement.addEventListener('scroll', debouncedHandleScroll, { passive: true });
        }

        return () => {
            if (scrollElement) {
                scrollElement.removeEventListener('scroll', debouncedHandleScroll);
            }
        };
    }, [debouncedHandleScroll]);


    // async function gettingPerformance(){
    //     await getPerformance
    // }


    return { 
        performanceTitles, 
        handleNavLinkClick, 
        PRCData, 
        openMenuValue, 
        toggleMenuValue, 
        performanceScrollRef, 
        gettingPRCData, 
        PRCLoading,
        PRCPaginationData,
        goToNextPRCPage,
        goToPreviousPRCPage,
        goToPRCPage
    }

}


export default usePerformanceServices