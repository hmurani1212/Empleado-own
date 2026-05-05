import { useState } from "react"
import useStore from "../../Store/store"
const useInboxServives = () => {

    const InboxData = useStore((state) => state.InboxData)
    const StoryLisyAll = useStore((state) => state.getEmployeesAll);
    const markAllInboxAsRead = useStore((state) => state.markAllInboxAsRead);
    const markInboxStoriesAsRead = useStore((state) => state.markInboxStoriesAsRead);
    const loadMoreInboxData = useStore((state) => state.loadMoreInboxData);
    const hasMorePages = useStore((state) => state.hasMorePages);
    const isLoadingMoreInbox = useStore((state) => state.isLoadingMoreInbox);
    const isLoadingInbox = useStore((state) => state.isLoadingInbox);

    // New state for employee detail view
    const selectedEmployeeStories = useStore((state) => state.selectedEmployeeStories);
    const selectedEmployee = useStore((state) => state.selectedEmployee);
    const isEmployeeDetailView = useStore((state) => state.isEmployeeDetailView);
    const isLoadingEmployeeStories = useStore((state) => state.isLoadingEmployeeStories);
    const isLoadingMoreStories = useStore((state) => state.isLoadingMoreStories);
    const selectedStory = useStore((state) => state.selectedStory);
    const showChat = useStore((state) => state.showChat);
    const chatMessages = useStore((state) => state.chatMessages);
    const isLoadingMessages = useStore((state) => state.isLoadingMessages);
    const isLoadingMoreMessages = useStore((state) => state.isLoadingMoreMessages);
    const hasMoreMessages = useStore((state) => state.hasMoreMessages);
    const messageScrollPosition = useStore((state) => state.messageScrollPosition);
    const getEmployeeStories = useStore((state) => state.getEmployeeStories);
    const loadMoreEmployeeStories = useStore((state) => state.loadMoreEmployeeStories);
    const setSelectedEmployee = useStore((state) => state.setSelectedEmployee);
    const resetEmployeeDetailView = useStore((state) => state.resetEmployeeDetailView);
    const selectStory = useStore((state) => state.selectStory);
    const closeChat = useStore((state) => state.closeChat);
    const loadStoryMessages = useStore((state) => state.loadStoryMessages);
    const loadMoreMessages = useStore((state) => state.loadMoreMessages);
    const scrollToBottom = useStore((state) => state.scrollToBottom);
    const sendMessage = useStore((state) => state.sendMessage);
    const uploadFileToElephant = useStore((state) => state.uploadFileToElephant);
    const story_link = useStore((state) => state.story_link);
    const type_ref = useStore((state) => state.type_ref);
    const approval_panelfn = useStore((state) => state.approval_panelfn);
    const addMessageToChat = useStore((state) => state.addMessageToChat);

    // Form details state and functions (using type_ref)
    const application_data = useStore((state) => state.application_data);
    const isLoadingApplicationDetails = useStore((state) => state.isLoadingApplicationDetails);
    const getFormDetailsByTypeRef = useStore((state) => state.getFormDetailsByTypeRef);
    const updateAdjustmentTime = useStore((state) => state.updateAdjustmentTime);
    const applicationDetailsCache = useStore((state) => state.applicationDetailsCache);
    const shouldAutoScroll = useStore((state) => state.shouldAutoScroll);

    const [activeInbox, setActiveInbox] = useState('')
    const [activeData, setActiveData] = useState({})

    const [inboxViewValue, setInboxViewValue] = useState({
        activeInbox: '',
        activeData: {},
        applications: [],
        showApplications: false,
        showSideMenu: false,
        applicationDetails: false,
    })

    const toggleInbox = (data) => {
        setActiveData(data)
        setActiveInbox(data.id)
        setInboxViewValue((prevState) => ({
            ...prevState,
            applications: data.applications,
            showApplications: true
        }))
    }

    // New function to handle employee selection
    const handleEmployeeClick = async (employee) => {
        try {
            setSelectedEmployee(employee);
            await getEmployeeStories(employee.initiator_orgid, employee.initiator_oneid);
        } catch (error) {
            console.error('Error fetching employee stories:', error);
        }
    }

    // Function to go back to employee list
    const handleBackToEmployeeList = () => {
        resetEmployeeDetailView();
    }

    // Function to load more stories
    const handleLoadMore = async () => {
        try {
            await loadMoreEmployeeStories();
        } catch (error) {
            console.error('Error loading more stories:', error);
        }
    }

    // Function to load more inbox data
    const handleLoadMoreInbox = async () => {
        try {
            await loadMoreInboxData();
        } catch (error) {
            console.error('Error loading more inbox data:', error);
        }
    }

    const mouseLeaveHandler = () => {
        setInboxViewValue((prevState) => ({
            ...prevState,
            showSideMenu: false
        }))
    }

    const mouseEnterHandler = () => {
        setInboxViewValue((prevState) => ({
            ...prevState,
            showSideMenu: true
        }))
    }

    const handleApplicationDetails = (data) => {
        setInboxViewValue((prevState) => ({
            ...prevState,
            applicationDetails: true
        }))
    }

    const [stepsValue, setStepsValue] = useState({
        activeStep: 0,
        isFirstStep: true,
        isLastStep: false,
    });

    const handleStepActive = (step) => {
        setStepsValue((prevState) => ({
            ...prevState,
            activeStep: step,
            isFirstStep: step === 0,
            isLastStep: step === 1,
        }));
    };

    return {
        toggleInbox,
        activeInbox,
        activeData,
        inboxViewValue,
        mouseLeaveHandler,
        mouseEnterHandler,
        handleApplicationDetails,
        handleStepActive,
        stepsValue,
        StoryLisyAll,
        markAllInboxAsRead,
        markInboxStoriesAsRead,
        InboxData,
        loadMoreInboxData: handleLoadMoreInbox,
        hasMorePages,
        isLoadingMoreInbox,
        isLoadingInbox,
        // New functions and state
        handleEmployeeClick,
        handleBackToEmployeeList,
        handleLoadMore,
        selectedEmployeeStories,
        selectedEmployee,
        isEmployeeDetailView,
        isLoadingEmployeeStories,
        isLoadingMoreStories,
        selectedStory,
        showChat,
        selectStory,
        closeChat,
        chatMessages,
        isLoadingMessages,
        isLoadingMoreMessages,
        hasMoreMessages,
        messageScrollPosition,
        loadStoryMessages,
        loadMoreMessages,
        scrollToBottom,
        sendMessage,
        uploadFileToElephant,
        story_link,
        type_ref,
        approval_panelfn,
        addMessageToChat,
        // Form details exports (using type_ref)
        application_data,
        isLoadingApplicationDetails,
        getFormDetailsByTypeRef,
        updateAdjustmentTime,
        applicationDetailsCache,
        shouldAutoScroll
    }
}

export default useInboxServives;