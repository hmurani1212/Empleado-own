
import InboxApi from "../../Model/Data/inboxDate/InboxApiData";
import { showToast } from "../../Components/Toaster/Toaster";
import { getUserData } from "../../Authentication/jwt_decode";

const INBOX_MARKED_READ_STORAGE_KEY = 'inbox_marked_read_story_ids';

const getMarkedReadStoryIds = () => {
    try {
        const raw = sessionStorage.getItem(INBOX_MARKED_READ_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const addMarkedReadStoryIds = (storyIds) => {
    if (!storyIds || storyIds.length === 0) return;
    try {
        const existing = getMarkedReadStoryIds();
        const set = new Set([...existing, ...storyIds]);
        sessionStorage.setItem(INBOX_MARKED_READ_STORAGE_KEY, JSON.stringify([...set]));
    } catch (e) {
        console.warn('Inbox: could not persist marked-read ids', e);
    }
};

const applyPersistedReadStatus = (stories) => {
    const markedIds = getMarkedReadStoryIds();
    if (markedIds.length === 0) return stories;
    const idSet = new Set(markedIds);
    return stories.map(story => {
        const sid = story.story_id || story._id;
        if (!sid || !idSet.has(sid)) return story;
        const updatedUsers = Array.isArray(story.users) && story.users.length > 0
            ? story.users.map(u => ({ ...u, read_status: 1 }))
            : (story.users || []);
        return { ...story, read_status: 1, users: updatedUsers };
    });
};

/** Monotonic id so overlapping inbox list requests cannot clear or overwrite data after a newer fetch started. */
let inboxListFetchSeq = 0;

const InboxViewModel = (set, get) => ({
    InboxData: [],
    selectedEmployeeStories: [],
    selectedEmployee: null,
    isEmployeeDetailView: false,
    isLoadingEmployeeStories: false,
    isLoadingMoreStories: false,
    currentPage: 1,
    hasMorePages: false,
    nextPageUrl: null,
    selectedStory: null,
    showChat: false,
    chatMessages: [],
    isLoadingMessages: false,
    isLoadingMoreMessages: false,
    messagePage: 1,
    hasMoreMessages: false,
    messageScrollPosition: 0,
    isLoadingInbox: false,
    isLoadingMoreInbox: false,
    story_link: [],
    type_ref: null, // Store type_ref from story messages

    // Application details state
    application_data: null,
    isLoadingApplicationDetails: false,
    // Cache full application details by type_ref id for print-all (avoids refetching)
    applicationDetailsCache: {},

    // Flag to control auto-scroll in Chat component
    shouldAutoScroll: true,

    // Store current filter state for pagination
    currentFilters: {
        name: '',
        status: null,
        read_status: null,
        app_type: null
    },

    // Cache timestamp to prevent duplicate calls within short time window
    lastApiCallTime: 0,

    getEmployeesAll: async () => {
        // Prevent duplicate calls if already loading or called within 2 seconds
        const currentState = get();
        const now = Date.now();
        if (currentState.isLoadingInbox) {
            console.log('Inbox API already loading, skipping duplicate call');
            return;
        }
        if (now - currentState.lastApiCallTime < 2000) {
            console.log('Inbox API called too recently, skipping duplicate call');
            return;
        }

        const seq = ++inboxListFetchSeq;
        set({ isLoadingInbox: true, currentPage: 1, lastApiCallTime: now });
        try {
            // Reset filter state when loading all data
            set({ currentFilters: { name: '', status: null, read_status: null, app_type: null } });
            
            // Check user role to determine which API to call
            const userData = getUserData();
            const isAdmin = userData?.roleId === 'Admin';
            
            // Call appropriate API based on user role
            const response = isAdmin 
                ? await InboxApi.get_inbox_data(1)
                : await InboxApi.get_employee_inbox_data(1);

            if (seq !== inboxListFetchSeq) return;
            
            const data = response.data;
            if (response.status === 200 && data?.STATUS === 'SUCCESSFUL') {
                // Map the new API response structure to the expected format
                const mappedStories = data?.DB_DATA.stories.map(story => ({
                    ...story,
                    emp_name: story.emp_name || story.full_name || story.initiator_name || story.name || story.user_name || story.applicant_name || (story.applications?.[0]?.emp_name) || (story.applications?.[0]?.full_name) || 'Unknown Employee',
                    emp_image: story.emp_image || '/images/icons/empm.jpg',
                    id: story.story_id,
                    initiator_oneid: story.initiator_oneid,
                    initiator_orgid: story.initiator_orgid,
                    stories: 1, // Default count for display
                    applications: [] // Empty applications array for compatibility
                }));
                const withReadStatus = applyPersistedReadStatus(mappedStories);
                const hasNextPage = !!data?.NEXT_PAGE;
                set({
                    InboxData: withReadStatus,
                    hasMorePages: hasNextPage,
                    nextPageUrl: data?.NEXT_PAGE || null,
                    isLoadingInbox: false,
                    currentPage: 1
                })
            } else if (response.status === 200 && data?.STATUS === 'ERROR') {
                if (seq !== inboxListFetchSeq) return;
                set({
                    InboxData: [],
                    hasMorePages: false,
                    nextPageUrl: null,
                    isLoadingInbox: false
                })
            }
        } catch (error) {
            if (seq !== inboxListFetchSeq) return;
            const hadStories = (get().InboxData || []).length > 0;
            // Timeout / network on a duplicate or slow second request must not wipe a successful first load
            if (hadStories) {
                set({ isLoadingInbox: false });
            } else {
                set({
                    InboxData: [],
                    hasMorePages: false,
                    nextPageUrl: null,
                    isLoadingInbox: false
                })
            }
        }
    },

    markAllInboxAsRead: () => {
        const state = get();
        const currentInboxData = state.InboxData || [];
        if (currentInboxData.length === 0) return;
        const storyIds = currentInboxData.map(s => s.story_id || s._id).filter(Boolean);
        addMarkedReadStoryIds(storyIds);
        const updatedInboxData = currentInboxData.map(story => {
            const updatedUsers = Array.isArray(story.users) && story.users.length > 0
                ? story.users.map(user => ({ ...user, read_status: 1 }))
                : (story.users || []);
            return {
                ...story,
                read_status: 1,
                users: updatedUsers
            };
        });
        set({ InboxData: updatedInboxData });
    },

    markInboxStoriesAsRead: (storyIds) => {
        if (!storyIds || storyIds.length === 0) return;
        const idSet = new Set(storyIds.map(String));
        const state = get();
        const currentInboxData = state.InboxData || [];
        addMarkedReadStoryIds([...idSet]);
        const updatedInboxData = currentInboxData.map(story => {
            const sid = story.story_id || story._id;
            if (!sid || !idSet.has(String(sid))) return story;
            const updatedUsers = Array.isArray(story.users) && story.users.length > 0
                ? story.users.map(u => ({ ...u, read_status: 1 }))
                : (story.users || []);
            return { ...story, read_status: 1, users: updatedUsers };
        });
        set({ InboxData: updatedInboxData });
    },

    getFilteredInboxData: async (name = '', status = null, read_status = null, appType = null) => {
        // Prevent duplicate calls if already loading or called within 2 seconds
        const currentState = get();
        const now = Date.now();
        if (currentState.isLoadingInbox) {
            console.log('Filtered inbox API already loading, skipping duplicate call');
            return;
        }
        if (now - currentState.lastApiCallTime < 2000) {
            console.log('Filtered inbox API called too recently, skipping duplicate call');
            return;
        }

        const seq = ++inboxListFetchSeq;
        set({ isLoadingInbox: true, currentPage: 1, lastApiCallTime: now });
        try {
            // Store current filter state for pagination
            set({ currentFilters: { name, status, read_status, app_type: appType } });
            
            // Check user role to determine which API to call
            const userData = getUserData();
            const isAdmin = userData?.roleId === 'Admin';
            
            // Call appropriate API based on user role
            const response = isAdmin 
                ? await InboxApi.get_filtered_inbox_data(name, status, read_status, 1, appType)
                : await InboxApi.get_filtered_employee_inbox_data(name, status, read_status, 1, appType);

            if (seq !== inboxListFetchSeq) return;
            
            const data = response.data;
            if (response.status === 200 && data?.STATUS === 'SUCCESSFUL') {
                // Map the new API response structure to the expected format
                const mappedStories = data?.DB_DATA.stories.map(story => ({
                    ...story,
                    emp_name: story.emp_name || story.full_name || story.initiator_name || story.name || story.user_name || story.applicant_name || (story.applications?.[0]?.emp_name) || (story.applications?.[0]?.full_name) || 'Unknown Employee',
                    emp_image: story.emp_image || '/images/icons/empm.jpg',
                    id: story.story_id,
                    initiator_oneid: story.initiator_oneid,
                    initiator_orgid: story.initiator_orgid,
                    stories: 1, // Default count for display
                    applications: [] // Empty applications array for compatibility
                }));
                const withReadStatus = applyPersistedReadStatus(mappedStories);
                const hasNextPage = !!data?.NEXT_PAGE;
                set({
                    InboxData: withReadStatus,
                    hasMorePages: hasNextPage,
                    nextPageUrl: data?.NEXT_PAGE || null,
                    isLoadingInbox: false,
                    currentPage: 1
                })
            } else if (response.status === 200 && data?.STATUS === 'ERROR') {
                if (seq !== inboxListFetchSeq) return;
                set({
                    InboxData: [],
                    hasMorePages: false,
                    nextPageUrl: null,
                    isLoadingInbox: false
                })
            }
        } catch (error) {
            if (seq !== inboxListFetchSeq) return;
            const hadStories = (get().InboxData || []).length > 0;
            if (hadStories) {
                set({ isLoadingInbox: false });
            } else {
                set({
                    InboxData: [],
                    hasMorePages: false,
                    nextPageUrl: null,
                    isLoadingInbox: false
                })
            }
        }
    },

    loadMoreInboxData: async () => {
        const { isLoadingMoreInbox, hasMorePages, currentFilters, currentPage } = get();
        if (isLoadingMoreInbox || !hasMorePages) return;

        const newPage = (currentPage || 1) + 1;
        set({ isLoadingMoreInbox: true });
        try {
            const userData = getUserData();
            const isAdmin = userData?.roleId === 'Admin';
            const hasActiveFilters =
                (currentFilters?.name && currentFilters.name.trim() !== '') ||
                currentFilters?.status !== null ||
                currentFilters?.read_status !== null ||
                currentFilters?.app_type !== null;

            let response;
            if (hasActiveFilters) {
                response = isAdmin
                    ? await InboxApi.get_filtered_inbox_data(
                        currentFilters?.name || '',
                        currentFilters?.status,
                        currentFilters?.read_status,
                        newPage,
                        currentFilters?.app_type
                    )
                    : await InboxApi.get_filtered_employee_inbox_data(
                        currentFilters?.name || '',
                        currentFilters?.status,
                        currentFilters?.read_status,
                        newPage,
                        currentFilters?.app_type
                    );
            } else {
                response = isAdmin
                    ? await InboxApi.get_inbox_data(newPage)
                    : await InboxApi.get_employee_inbox_data(newPage);
            }

            const data = response.data;
            if (response.status === 200 && data?.STATUS === 'SUCCESSFUL') {
                const mappedStories = data?.DB_DATA.stories.map(story => ({
                    ...story,
                    emp_name: story.emp_name || story.full_name || story.initiator_name || story.name || story.user_name || story.applicant_name || (story.applications?.[0]?.emp_name) || (story.applications?.[0]?.full_name) || 'Unknown Employee',
                    emp_image: story.emp_image || '/images/icons/empm.jpg',
                    id: story.story_id,
                    initiator_oneid: story.initiator_oneid,
                    initiator_orgid: story.initiator_orgid,
                    stories: 1,
                    applications: []
                }));
                const withReadStatus = applyPersistedReadStatus(mappedStories);
                const hasNextPage = !!data?.NEXT_PAGE;
                set((state) => ({
                    InboxData: [...state.InboxData, ...withReadStatus],
                    hasMorePages: hasNextPage,
                    nextPageUrl: data?.NEXT_PAGE || null,
                    isLoadingMoreInbox: false,
                    currentPage: newPage
                }))
            } else {
                set({ isLoadingMoreInbox: false });
            }
        } catch (error) {
            set({ isLoadingMoreInbox: false });
        }
    },

    getEmployeeStories: async (org_id, one_id) => {
        set({ isLoadingEmployeeStories: true, currentPage: 1 });
        try {
            const response = await InboxApi.get_employee_stories(org_id, one_id, 1);
            const data = response.data;
            if (response.status === 200 && data?.STATUS === 'SUCCESSFUL') {
                const hasNextPage = !!data?.NEXT_PAGE;
                set({
                    selectedEmployeeStories: data?.DB_DATA.stories || [],
                    isEmployeeDetailView: true,
                    isLoadingEmployeeStories: false,
                    hasMorePages: hasNextPage,
                    nextPageUrl: data?.NEXT_PAGE || null
                })
            } else if (response.status === 200 && data.STATUS === 'ERROR') {
                set({
                    selectedEmployeeStories: [],
                    isEmployeeDetailView: true,
                    isLoadingEmployeeStories: false,
                    hasMorePages: false,
                    nextPageUrl: null
                })
            }
        } catch (error) {
            set({
                selectedEmployeeStories: [],
                isEmployeeDetailView: true,
                isLoadingEmployeeStories: false,
                hasMorePages: false,
                nextPageUrl: null
            })
        }
    },

    loadMoreEmployeeStories: async () => {
        const { nextPageUrl } = get();
        if (!nextPageUrl || get().isLoadingMoreStories) return;

        set({ isLoadingMoreStories: true });
        try {
            const response = await InboxApi.loadMoreStories(nextPageUrl);
            const data = response.data;
            if (response.status === 200 && data?.STATUS === 'SUCCESSFUL') {
                const hasNextPage = !!data?.NEXT_PAGE;
                set((state) => ({
                    selectedEmployeeStories: [...state.selectedEmployeeStories, ...(data?.DB_DATA.stories || [])],
                    hasMorePages: hasNextPage,
                    nextPageUrl: data?.NEXT_PAGE || null,
                    isLoadingMoreStories: false
                }))
            } else {
                set({ isLoadingMoreStories: false });
            }
        } catch (error) {
            set({ isLoadingMoreStories: false });
        }
    },

    setSelectedEmployee: (employee) => {
        set({ selectedEmployee: employee })
    },

    resetEmployeeDetailView: () => {
        set({
            selectedEmployeeStories: [],
            selectedEmployee: null,
            isEmployeeDetailView: false,
            isLoadingEmployeeStories: false,
            isLoadingMoreStories: false,
            currentPage: 1,
            hasMorePages: false,
            nextPageUrl: null,
            selectedStory: null,
            showChat: false
        })
    },

    selectStory: (story) => {
        set({
            selectedStory: story,
            showChat: true
        })
    },

    closeChat: () => {
        set({
            selectedStory: null,
            showChat: false,
            chatMessages: [],
            messagePage: 1,
            hasMoreMessages: false,
            messageScrollPosition: 0
        })
    },

    loadStoryMessages: async (storyId) => {
        set({ isLoadingMessages: true, messagePage: 1 });
        try {
            const response = await InboxApi.getStoryMessages(storyId);
            const data = response.data;
            if (data?.STATUS === 'SUCCESSFUL') {
                const messages = data?.DB_DATA || [];
                // Show latest 20 messages initially
                const latestMessages = messages.slice(-20);
                set({
                    story_link: data?.find_story_link,
                    type_ref: data?.type_ref || null, // Store type_ref for application details
                    chatMessages: latestMessages,
                    isLoadingMessages: false,
                    hasMoreMessages: messages.length > 20,
                    messageScrollPosition: latestMessages.length
                });
            } else {
                set({
                    story_link: [],
                    type_ref: null,
                    chatMessages: [],
                    isLoadingMessages: false,
                    hasMoreMessages: false
                });
            }
        } catch (error) {
            // console.error('Error loading story messages222222222222:', error?.response?.data?.type_ref);
            set({
                story_link: [],
                type_ref: error?.response?.data?.type_ref || null,
                chatMessages: [],
                isLoadingMessages: false,
                hasMoreMessages: false
            });
        }
    },

    loadMoreMessages: async (storyId) => {
        const { chatMessages, messagePage, isLoadingMoreMessages, hasMoreMessages } = get();
        if (isLoadingMoreMessages || !hasMoreMessages) return;

        set({ isLoadingMoreMessages: true });
        try {
            const response = await InboxApi.getStoryMessages(storyId);
            const data = response.data;
            if (response.status === 200 && data?.STATUS === 'SUCCESSFUL') {
                const allMessages = data?.DB_DATA || [];
                const currentCount = chatMessages.length;
                const nextBatch = allMessages.slice(0, currentCount + 20);

                set((state) => ({
                    chatMessages: nextBatch,
                    isLoadingMoreMessages: false,
                    hasMoreMessages: allMessages.length > nextBatch.length,
                    messageScrollPosition: state.messageScrollPosition + 20
                }));
            } else {
                set({ isLoadingMoreMessages: false });
            }
        } catch (error) {
            ;
            set({ isLoadingMoreMessages: false });
        }
    },

    scrollToBottom: () => {
        set({ messageScrollPosition: get().chatMessages.length });
    },

    // Add message to chat with deduplication
    addMessageToChat: (newMessage, shouldScrollToBottom = false) => {
        const { chatMessages } = get();

        // Check if message already exists in chat
        const messageExists = chatMessages.some(msg => msg._id === newMessage._id);

        if (messageExists) {
            return; // Skip silently
        }

        const updatedMessages = [...chatMessages, newMessage];
        set({
            chatMessages: updatedMessages,
            shouldAutoScroll: shouldScrollToBottom // Flag for Chat component to decide whether to scroll
        });
    },

    sendMessage: async (message, storyId, receiverOneId, fileUrl = null) => {
        const { selectedStory } = get();
        // Check if message exists and is not empty
        const hasMessage = message !== null && message !== undefined && typeof message === 'string' && message.trim() !== '';
        // Check if fileUrl exists and is not empty
        const hasFile = fileUrl !== null && fileUrl !== undefined && typeof fileUrl === 'string' && fileUrl.trim() !== '';
        
        // Must have either message or file
        if (!hasMessage && !hasFile) {
            console.error('Cannot send message: both message and file are empty');
            return { success: false, error: 'Message or file is required' };
        }

        try {
            // Enable auto-scroll for user messages
            set({ shouldAutoScroll: true });

            const messageData = {
                one_id: receiverOneId, // Receiver's one_id
                app_id: "10",
                story_id: storyId,
                type: "GENERAL",
                message: hasMessage ? message.trim() : null,
                file: hasFile ? fileUrl.trim() : null
            };

            const response = await InboxApi.sendMessage(messageData);
            const data = response.data;

            if (response.status === 201 && data?.STATUS === 'SUCCESSFUL') {
                const newMessage = data?.DB_DATA?.message;
                
                // Add message immediately as fallback if socket doesn't receive it
                // Socket will handle it, but this ensures it shows up right away
                if (newMessage && newMessage._id) {
                    // Use setTimeout to give socket a chance to receive it first
                    setTimeout(() => {
                        const currentState = get();
                        const messageExists = currentState.chatMessages?.some(msg => msg._id === newMessage._id);
                        if (!messageExists) {
                            console.log('📤 Adding sent message as fallback (socket may not have received it yet)');
                            // Add directly to state as fallback
                            const { chatMessages } = get();
                            set({
                                chatMessages: [...(chatMessages || []), newMessage],
                                shouldAutoScroll: true
                            });
                        }
                    }, 500); // Wait 500ms for socket, then add if not received
                }
                
                return { success: true, message: newMessage };
            } else {
                console.error('Failed to send message:', data);
                return { success: false, error: data?.ERROR_DESCRIPTION || 'Failed to send message' };
            }
        } catch (error) {
            console.error('Error sending message:', error);
            return { success: false, error: 'Network error' };
        }
    },

    // Upload file to elephant server
    uploadFileToElephant: async (file, deviceId = 'abc123', latitude = '34.123', longitude = '71.123') => {
        try {
            const formData = new FormData();
            formData.append('operation', 'store_file');
            formData.append('fileInput', file);
            formData.append('device_id', deviceId);
            formData.append('latitude', latitude);
            formData.append('longitude', longitude);

            const response = await InboxApi.uploadFileToElephant(formData);
            const data = response.data;

            if (data.STATUS === "SUCCESSFUL") {
                return {
                    success: true,
                    fileUrl: data.url || data.FILE_URL,
                    fileName: data.DB_DATA?.FILE_NAME || data.ELEPHANT_RESP?.FILE_NAME || file.name
                };
            } else {
                throw new Error(data.ERROR_DESCRIPTION || 'Failed to upload file');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    },


    // Approval panel function
    approval_panelfn: async (ApiData) => {
        try {

            // Validate required data
            if (!ApiData.story_id || !ApiData.type) {
                showToast('Missing required data: story_id or type', 'error');
                return { success: false, error: 'Missing required data' };
            }

            const response = await InboxApi.approval_panel(ApiData);

            const data = response.data;
            if (data?.STATUS === 'SUCCESSFUL') {
                showToast(`Request ${ApiData.type.toLowerCase()} successfully`, 'success');

                // Update local state instead of reloading all inbox data
                const currentState = get();

                // Get updated_link from API response which contains the updated user object
                const updatedLink = data?.DB_DATA?.updated_link;

                // Update InboxData to reflect the status change in the list
                const updatedInboxData = currentState.InboxData.map(story => {
                    if (story.story_id === ApiData.story_id) {
                        // Update users array if updatedLink is available
                        let updatedUsers = story.users || [];
                        if (updatedLink && Array.isArray(story.users)) {
                            updatedUsers = story.users.map(user => {
                                // Match by receiver to find the user that was updated
                                if (user.receiver === updatedLink.receiver) {
                                    // Return the updated user object from API response
                                    return {
                                        ...user,
                                        ...updatedLink,
                                        type_base_info: updatedLink.type_base_info || ApiData.type
                                    };
                                }
                                return user;
                            });
                        }
                        
                        return {
                            ...story,
                            // Update any status-related fields if they exist
                            status: ApiData.type,
                            is_accepted: ApiData.type === 'ACCEPTED',
                            is_rejected: ApiData.type === 'REJECTED',
                            users: updatedUsers
                        };
                    }
                    return story;
                });

                // Get the status from API response - use overall_status or updated_link.type_base_info
                const statusFromApi = data?.DB_DATA?.overall_status || updatedLink?.type_base_info || ApiData.type;

                // Update story_link to reflect the new status (this controls the UI badge)
                const updatedStoryLink = currentState.story_link.length > 0 
                    ? currentState.story_link.map(link => ({
                        ...link,
                        type_base_info: statusFromApi
                    }))
                    : [{
                        type_base_info: statusFromApi,
                        story_id: ApiData.story_id
                    }];

                // Update selectedStory if it matches the current story
                let updatedSelectedStory = currentState.selectedStory;
                if (updatedSelectedStory && updatedSelectedStory.story_id === ApiData.story_id) {
                    let updatedUsers = updatedSelectedStory.users || [];
                    
                    if (updatedLink && Array.isArray(updatedSelectedStory.users)) {
                        updatedUsers = updatedSelectedStory.users.map(user => {
                            if (user.receiver === updatedLink.receiver) {
                                return {
                                    ...user,
                                    ...updatedLink,
                                    type_base_info: updatedLink.type_base_info || statusFromApi
                                };
                            }
                            return user;
                        });
                    }

                    updatedSelectedStory = {
                        ...updatedSelectedStory,
                        users: updatedUsers,
                        type_base_info: statusFromApi
                    };
                }

                set({
                    InboxData: updatedInboxData,
                    story_link: updatedStoryLink,
                    selectedStory: updatedSelectedStory
                });

                // Return the full response data including the message
                return { success: true, data: data };
            } else {
                showToast(data?.ERROR_DESCRIPTION || 'Action failed', 'error');
                return { success: false, error: data?.ERROR_DESCRIPTION || 'Action failed' };
            }
        } catch (error) {
            console.error('Approval panel error:', error);
            const errorMessage = error?.response?.data?.ERROR_DESCRIPTION ||
                error?.data?.ERROR_DESCRIPTION ||
                error?.message ||
                'Action failed';
            showToast(errorMessage, 'error');
            return { success: false, error: errorMessage };
        }
    },

    // Update time adjustment (for ATT_TIME_ADJUSTMENT in Inbox). Updates time outside form_data (root level).
    updateAdjustmentTime: async (submissionId, payload) => {
        try {
            const response = await InboxApi.updateAdjustmentTime(submissionId, payload);
            const data = response.data;
            if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
                const updated = data.DB_DATA;
                const current = get().application_data;
                if (updated && current && (String(current.id) === String(submissionId) || String(current._id) === String(submissionId))) {
                    // Update root-level in_time, out_time, date (outside form_data) from payload or API response
                    const nextRoot = {
                        ...current,
                        in_time: payload.in_time ?? updated.in_time ?? current.in_time,
                        out_time: payload.out_time ?? updated.out_time ?? current.out_time,
                        date: payload.date ?? updated.date ?? current.date,
                    };
                    nextRoot.form_data = { ...current?.form_data, ...updated?.form_data };
                    set({ application_data: nextRoot });
                }
                return { success: true, data: data.DB_DATA };
            }
            showToast(data.ERROR_DESCRIPTION || 'Failed to update time adjustment', 'error');
            return { success: false, error: data.ERROR_DESCRIPTION };
        } catch (error) {
            const errMsg = error?.response?.data?.ERROR_DESCRIPTION || error?.message || 'Failed to update time adjustment';
            showToast(errMsg, 'error');
            return { success: false, error: errMsg };
        }
    },

    // Fetch form details using type_ref ID from story messages
    getFormDetailsByTypeRef: async (typeRefId) => {
        set({ isLoadingApplicationDetails: true });
        try {
            const response = await InboxApi.getFormDetails(typeRefId);
            const data = response.data;

            if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
                const cached = get().applicationDetailsCache || {};
                set({
                    application_data: data.DB_DATA,
                    isLoadingApplicationDetails: false,
                    applicationDetailsCache: { ...cached, [typeRefId]: data.DB_DATA }
                });
                return { success: true, data: data.DB_DATA };
            } else {
                showToast(data.ERROR_DESCRIPTION || 'Failed to fetch form details', 'error');
                set({ isLoadingApplicationDetails: false });
                return { success: false, error: data.ERROR_DESCRIPTION };
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.ERROR_DESCRIPTION ||
                error?.data?.ERROR_DESCRIPTION ||
                error?.message ||
                'Failed to fetch form details';
            showToast(errorMessage, 'error');
            set({ isLoadingApplicationDetails: false });
            return { success: false, error: errorMessage };
        }
    },

    // Check if accept/reject icons should be shown for a story
    // Returns true if: current user is receiver (allows both admin and employee roles when ID matches)
    shouldShowAcceptRejectIcons: (story) => {
        if (!story || !story.users || !Array.isArray(story.users) || story.users.length === 0) {
            return false;
        }

        // Get current user data
        const userData = getUserData();
        if (!userData || !userData.oneid) {
            return false;
        }

        // Format current user's oneid as "ID{oneid}" to match receiver format
        const userReceiverId = `ID${String(userData.oneid)}`;

        // Check if current user is a receiver in the story's users array
        const isReceiver = story.users.some(user => {
            const receiver = String(user.receiver || '');
            return receiver === userReceiverId;
        });

        // If user is not a receiver, don't show icons
        if (!isReceiver) {
            return false;
        }

        // Check if user is Employee role
        const userRole = userData.roleId || userData.roleDbId;
        const isEmployee = userRole === 'Employee' || userRole === 'employee';
        
        // For non-employees (admins), always show icons if they are receiver
        if (!isEmployee) {
            return true;
        }

        // For employees, only show icons if they are the specific receiver
        // This allows employees to accept/reject when their oneid matches the receiver ID
        return isReceiver;
    },
});

export default InboxViewModel;

