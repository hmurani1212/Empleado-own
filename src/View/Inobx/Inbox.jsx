import React, { useEffect, useState, useRef } from "react";
import useInboxServives from "../../ViewModel/InboxViewModel/inboxServices";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import { BiSearch } from "react-icons/bi";
import { HiMail, HiCheckCircle, HiXCircle, HiUser } from "react-icons/hi";
import { BsCheckAll, BsEnvelope } from "react-icons/bs";
import ApplicationInfo from "./ApplicationInfo";
import Chat from "./Chat";
import { getUserData } from "../../Authentication/jwt_decode";
import useSocket from "../../Components/useSocket/useSocket";
import { showToast } from "../../Components/Toaster/Toaster";

// Avatar component with fallback to user icon
const UserAvatar = ({ src, alt, className, showOnlineIndicator = false, showUnreadIndicator = false }) => {
  const [imageError, setImageError] = useState(false);
  const hasImage = src && !imageError;

  // Extract size classes to determine icon size
  const isSmall = className.includes('h-8') || className.includes('h-10');
  const iconSize = isSmall ? 'h-5 w-5 md:h-6 md:w-6' : 'h-6 w-6 md:h-7 md:w-7';

  return (
    <div className="relative">
      {hasImage ? (
        <img
          src={`https://emp-beta.veevotech.com${src.startsWith('/') ? src : '/' + src}`}
          alt={alt}
          className={className}
          onError={() => setImageError(true)}
          loading="lazy"
        />
      ) : (
        <div className={`${className} bg-gray-200 flex items-center justify-center`}>
          <HiUser className={`${iconSize} text-gray-500`} />
        </div>
      )}
      {showOnlineIndicator && (
        <span className="absolute bottom-0 right-0 h-2 w-2 bg-green-500 rounded-full border-2 border-white"></span>
      )}
      {showUnreadIndicator && (
        <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
      )}
    </div>
  );
};

const readStatusFilterOptions = [
  { value: null, label: "Select Status" },
  { value: 1, label: "Read" },
  { value: 0, label: "Unread" }
];

const readTypeFilterOptions = [
  { value: null, label: "Select Type" },
  { value: 0, label: "Time Adjustment Request" }, // app_type=0, form_id 44
  { value: 1, label: "Leave Application" },
  { value: 2, label: "Loan Application" },
];

const Inbox = () => {
  // Get user role for access control
  const token_data = getUserData();
  const userRole = token_data?.roleId;
  const isAdmin = userRole === 'Admin';
  const userOneId = token_data?.oneid; // Get oneid from token

  // Helper function to check if current user is the receiver of the story
  // Returns the matched user object if found, null otherwise
  const getUserReceiverInfo = (story) => {
    if (!story || !story.users || !Array.isArray(story.users) || !userOneId) {
      return null;
    }
    
    // Format: receiver is "ID10869736", so we need to add "ID" prefix to oneid
    // Convert oneid to string to handle both number and string formats
    const userReceiverId = `ID${String(userOneId)}`;
    
    // Find the user in the users array that matches the receiver
    const matchedUser = story.users.find(user => {
      // Handle both string and number comparisons
      const receiver = String(user.receiver || '');
      return receiver === userReceiverId;
    });
    
    // Debug logging (can be removed later)
    if (story.story_id && matchedUser) {
      console.log('getUserReceiverInfo check:', {
        story_id: story.story_id,
        userOneId,
        userReceiverId,
        matchedUser: matchedUser,
        userStatus: matchedUser.type_base_info
      });
    }
    
    return matchedUser || null;
  };

  const {
    StoryLisyAll,
    InboxData,
    getFilteredInboxData,
    loadMoreInboxData,
    hasMorePages,
    isLoadingMoreInbox,
    isLoadingInbox,
    selectedStory,
    showChat,
    selectStory,
    loadStoryMessages,
    loadMoreMessages,
    chatMessages,
    isLoadingMessages,
    isLoadingMoreMessages,
    hasMoreMessages,
    scrollToBottom,
    sendMessage,
    uploadFileToElephant,
    application_data,
    getFormDetailsByTypeRef,
    isLoadingApplicationDetails,
    story_link,
    type_ref,
    approval_panelfn,
    addMessageToChat,
    shouldAutoScroll
  } = useInboxServives();


  // console.log('what is the selected story here:', selectedStory);

  // Socket for real-time messaging
  const { socketRef, socketIoRef } = useSocket();

  // Track processed messages to prevent duplicates (persist across renders)
  const processedMessagesRef = useRef(new Set());

  // Handle real-time message updates and story room management
  useEffect(() => {
    if (!socketRef.current && !socketIoRef.current) return;

    // Join story room when selectedStory changes on both sockets
    if (selectedStory) {
      const storyRoom = selectedStory.story_id || selectedStory._id;
      if (socketRef.current) {
        socketRef.current.emit('join_story', storyRoom);
      }
      if (socketIoRef.current) {
        socketIoRef.current.emit('join_story', storyRoom);
      }
    }

    const handleNewMessage = (data) => {
      console.log('📨 Socket received message:', data);
      
      // Extract message object - could be in data.message or data itself
      const messageObj = data.message || data;
      if (!messageObj) {
        console.warn('⚠️ No message object in socket data');
        return;
      }

      // Create unique message ID to prevent duplicates
      const messageId = messageObj._id || `${messageObj.one_id}_${messageObj.entry_time || Date.now()}`;

      // Check if message already processed
      if (processedMessagesRef.current.has(messageId)) {
        console.log('⏭️ Skipping duplicate message:', messageId);
        return; // Skip duplicate messages silently
      }

      // Mark message as processed
      processedMessagesRef.current.add(messageId);

      // Get story_id from message or data
      const messageStoryId = messageObj.story_id || data.story_id;
      const currentStoryId = selectedStory?.story_id || selectedStory?._id;

      console.log('🔍 Message check - Message story_id:', messageStoryId, 'Current story_id:', currentStoryId);

      // Check if the message belongs to the currently selected story
      if (selectedStory && messageStoryId && currentStoryId && messageStoryId === currentStoryId) {
        console.log('✅ Adding message to chat:', messageObj);
        addMessageToChat(messageObj, true);
      } else {
        console.log('⏭️ Message not for current story. Message story_id:', messageStoryId, 'Current story_id:', currentStoryId);
      }
    };

    // Listen for new messages on both socket connections
    if (socketRef.current) {
      socketRef.current.on('chat_message', handleNewMessage);
    }
    if (socketIoRef.current) {
      socketIoRef.current.on('chat_message', handleNewMessage);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('chat_message', handleNewMessage);
        if (selectedStory) {
          const storyRoom = selectedStory.story_id || selectedStory._id;
          socketRef.current.emit('leave_story', storyRoom);
        }
      }
      if (socketIoRef.current) {
        socketIoRef.current.off('chat_message', handleNewMessage);
        if (selectedStory) {
          const storyRoom = selectedStory.story_id || selectedStory._id;
          socketIoRef.current.emit('leave_story', storyRoom);
        }
      }
    };
  }, [socketRef, socketIoRef, selectedStory, addMessageToChat]);






  // console.log('approval_panelfn:', approval_panelfn);


  // console.log('Get_app_ibox_data in Inbox component:', chatMessages);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [readStatusFilter, setReadStatusFilter] = useState(null); // null = all, 1 = read, 0 = unread
  const [readTypeFilter, setReadTypeFilter] = useState(null); // null = all, 0/1/2 = app_type filter
  const [filteredInboxData, setFilteredInboxData] = useState([]);
  const [showApplicationInfo, setShowApplicationInfo] = useState(false);
  const [selectedApplicationData, setSelectedApplicationData] = useState(null);
  const [currentStoryStatus, setCurrentStoryStatus] = useState(null); // Track current story status

  // Reference to the inbox list scroll container to maintain scroll position
  const inboxListRef = useRef(null);

  useEffect(() => {
    StoryLisyAll();
  }, []);

  // Reset current story status when selectedStory or story_link changes
  useEffect(() => {
    if (selectedStory) {
      // Priority: story_link > selectedStory.type_base_info > selectedStory.users (for non-admin)
      let storyStatus = null;
      
      if (story_link && story_link.length > 0) {
        storyStatus = story_link[0]?.type_base_info?.trim();
      } else if (selectedStory.type_base_info) {
        storyStatus = selectedStory.type_base_info.trim();
      } else if (selectedStory.users && Array.isArray(selectedStory.users) && !isAdmin) {
        // For non-admin users, check their specific user status
        const matchedUser = getUserReceiverInfo(selectedStory);
        storyStatus = matchedUser?.type_base_info?.trim();
      }
      
      setCurrentStoryStatus(storyStatus);
    } else {
      setCurrentStoryStatus(null);
    }
  }, [selectedStory, story_link, isAdmin]);

  // Debug: Log when chatMessages changes
  useEffect(() => {
    // console.log('💬 Chat messages updated:', chatMessages?.length, 'messages');
    if (chatMessages && chatMessages.length > 0) {
      // console.log('💬 Last message:', chatMessages[chatMessages.length - 1]);
    }
  }, [chatMessages]);

  // Debounced search effect - reduced delay for faster response
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay for faster response

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle search and filter with request cancellation
  useEffect(() => {
    let isCancelled = false;
    
    const performSearch = async () => {
      const trimmedSearch = debouncedSearchTerm.trim();
      const hasSearch = trimmedSearch !== "";
      const hasReadStatus = readStatusFilter !== null;
      const hasTypeFilter = readTypeFilter !== null;

      if (!hasSearch && !hasReadStatus && !hasTypeFilter) {
        // If no filters are applied, load all data
        if (!isCancelled) {
          await StoryLisyAll();
        }
        return;
      }

      // Perform filtered search with the selected app_type
      if (!isCancelled) {
        await getFilteredInboxData(
          trimmedSearch,
          null,
          readStatusFilter,
          readTypeFilter
        );
      }
    };

    performSearch();

    return () => {
      isCancelled = true;
    };
  }, [debouncedSearchTerm, readStatusFilter, readTypeFilter]);

  // Update filtered data when InboxData changes
  useEffect(() => {
    let filteredData = InboxData || [];

    // Apply local search filter if needed
    if (debouncedSearchTerm.trim() !== "") {
      filteredData = filteredData.filter(story =>
        (story.emp_name || story.full_name || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    // Apply local read status filter if needed
    if (readStatusFilter !== null) {
      filteredData = filteredData.filter(story => {
        if (story.users && Array.isArray(story.users) && story.users.length > 0) {
          return story.users[0].read_status === readStatusFilter;
        }
        return false;
      });
    }

    setFilteredInboxData(filteredData);
  }, [InboxData, debouncedSearchTerm, readStatusFilter, readTypeFilter]);

  const [openMenu, setOpenMenu] = React.useState([]);
  const handleMenuToggle = (i) => {
    setOpenMenu((prevState) => ({
      ...prevState,
      [i]: !prevState[i],
    }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleReadStatusFilterChange = (selectedOption) => {
    setReadStatusFilter(selectedOption.value);
  };

  const handleReadTypeFilterChange = (selectedOption) => {
    setReadTypeFilter(selectedOption?.value ?? null);
  };

  // Handle Mark All Read
  const handleMarkAllRead = () => {
    // Update all stories in filteredInboxData to mark them as read
    const updatedInboxData = filteredInboxData.map(story => {
      const updatedUsers = story.users?.map(user => ({
        ...user,
        read_status: 1
      })) || [];
      
      return {
        ...story,
        users: updatedUsers
      };
    });

    setFilteredInboxData(updatedInboxData);
    showToast('All messages marked as read', 'success');
  };

  const handleStoryClick = (story) => {
    selectStory(story);
    // Load messages for the selected story - use story_id if available, otherwise _id
    const storyId = story.story_id || story._id;
    loadStoryMessages(storyId);

    // Set the current story status based on story_link data
    if (story_link && story_link.length > 0) {
      const storyStatus = story_link[0]?.type_base_info?.trim();
      setCurrentStoryStatus(storyStatus);
    }

    // Remove blue background by updating read status to 1 in local state
    if (hasUnreadMessages(story)) {
      const updatedInboxData = filteredInboxData.map(item => {
        if (item.story_id === storyId) {
          // Update the users array to set read_status to 1
          const updatedUsers = item.users?.map(user => ({
            ...user,
            read_status: 1
          })) || [];

          return {
            ...item,
            users: updatedUsers
          };
        }
        return item;
      });

      setFilteredInboxData(updatedInboxData);
    }
  };

  const handleLoadMoreMessages = () => {
    if (selectedStory) {
      const storyId = selectedStory.story_id || selectedStory._id;
      loadMoreMessages(storyId);
    }
  };

  const handleSendMessage = async (message, storyId, receiverOneId, fileUrl) => {
    // console.log('📤 Sending message:', { message, storyId, receiverOneId, fileUrl });

    // Check if message exists and is not empty
    const hasText = message !== null && message !== undefined && typeof message === 'string' && message.trim() !== '';
    // Check if fileUrl exists and is not empty
    const hasFile = fileUrl !== null && fileUrl !== undefined && typeof fileUrl === 'string' && fileUrl.trim() !== '';

    if (!hasText && !hasFile) {
      console.warn('Skipping send: no message or file provided');
      return { success: false, error: 'Message or file required' };
    }

    if (typeof sendMessage === 'function') {
      return await sendMessage(message, storyId, receiverOneId, fileUrl);
    } else {
      console.error('sendMessage is not a function! Using fallback implementation');

      // Fallback implementation
      try {
        const messageData = {
          one_id: receiverOneId,
          app_id: "10",
          story_id: storyId,
          type: "GENERAL",
          message: hasText ? message.trim() : null,
          file: hasFile ? fileUrl.trim() : null
        };

        const response = await fetch('http://localhost:4560/api/v1/inbox/send_message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
          },
          body: JSON.stringify(messageData)
        });

        const data = await response.json();

        if (response.status === 201 && data?.STATUS === 'SUCCESSFUL') {
          const newMessage = data?.DB_DATA?.message;
          if (newMessage) {
            // Don't add message immediately - let socket handle it
            console.log('✅ Message sent successfully:', newMessage);
          }
          return { success: true, message: newMessage };
        } else {
          console.error('❌ Failed to send message:', data);
          return { success: false, error: data?.ERROR_DESCRIPTION || 'Failed to send message' };
        }
      } catch (error) {
        console.error('❌ Error sending message:', error);
        return { success: false, error: 'Network error' };
      }
    }
  };


  const handleViewApplication = async (story) => {
    if (!type_ref) {
      console.error('No type_ref found in story messages');
      showToast('Unable to load form details. Please try again.', 'error');
      return;
    }

    // console.log('Fetching form details with type_ref:', type_ref);

    try {
      // Call the API using type_ref - error toasts are handled in the ViewModel
      const result = await getFormDetailsByTypeRef(type_ref);

      if (result.success) {
        // console.log('Form data fetched successfully:', result.data);
        setSelectedApplicationData(result.data);
        setShowApplicationInfo(true);
      } else {
        console.error('Failed to fetch form details:', result.error);
        // Toast is already shown in ViewModel, no need to duplicate
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
      // Toast is already shown in ViewModel, no need to duplicate
    }
  };


  // useEffect(() => {
  //   console.log('Get_app_ibox_data updated:', Get_app_ibox_data);
  // }, [handleViewApplication])

  const handleCloseApplicationInfo = () => {
    setShowApplicationInfo(false);
    setSelectedApplicationData(null);
  };

  // Custom approval functions that update local status
  const handleApprove = async (storyId) => {
    console.log('Approve button clicked for story:', storyId);

    // Store current scroll position before updating
    const scrollPosition = inboxListRef.current?.scrollTop || 0;

    try {
      const result = await approval_panelfn({ story_id: storyId, "type": "ACCEPTED" });
      if (result && result.success) {
        // Get status from API response - use overall_status or updated_link.type_base_info
        const newStatus = result.data?.DB_DATA?.overall_status || 
                         result.data?.DB_DATA?.updated_link?.type_base_info || 
                         'ACCEPTED';
        
        // Update current story status immediately for real-time UI update
        setCurrentStoryStatus(newStatus);

        // Get updated_link from API response which contains the updated user object
        const updatedLink = result.data?.DB_DATA?.updated_link;
        
        // Update selectedStory if it matches the current story
        if (selectedStory && selectedStory.story_id === storyId) {
          let updatedUsers = selectedStory.users || [];
          
          if (updatedLink && Array.isArray(selectedStory.users)) {
            // Update the users array in selectedStory with the updated user
            updatedUsers = selectedStory.users.map(user => {
              // Match by receiver to find the user that was updated
              if (user.receiver === updatedLink.receiver) {
                // Return the updated user object from API response
                return {
                  ...user,
                  ...updatedLink,
                  type_base_info: updatedLink.type_base_info || newStatus
                };
              }
              return user;
            });
          }

          // Update selectedStory with new users array and status
          const updatedSelectedStory = {
            ...selectedStory,
            users: updatedUsers,
            type_base_info: newStatus
          };
          
          // Update selectedStory in store
          selectStory(updatedSelectedStory);
        }

        // Update filtered inbox data to reflect status change
        const updatedFilteredData = filteredInboxData.map(story => {
          if (story.story_id === storyId) {
            // Update users array if updatedLink is available
            let updatedUsers = story.users || [];
            if (updatedLink && Array.isArray(story.users)) {
              updatedUsers = story.users.map(user => {
                if (user.receiver === updatedLink.receiver) {
                  return {
                    ...user,
                    ...updatedLink,
                    type_base_info: updatedLink.type_base_info || newStatus
                  };
                }
                return user;
              });
            }
            
            return {
              ...story,
              status: newStatus,
              type_base_info: newStatus,
              users: updatedUsers
            };
          }
          return story;
        });
        setFilteredInboxData(updatedFilteredData);

        // Restore scroll position after state update
        setTimeout(() => {
          if (inboxListRef.current) {
            inboxListRef.current.scrollTop = scrollPosition;
          }
        }, 0);

        // Add success message to chat if available (fix: use DB_DATA.message instead of Message)
        if (result.data?.DB_DATA?.message) {
          const messageData = result.data.DB_DATA.message;
          const successMessage = {
            _id: messageData._id,
            story_id: messageData.story_id,
            one_id: messageData.one_id,
            app_id: messageData.app_id || "",
            type: messageData.type || "GENERAL",
            message: messageData.message,
            file: messageData.file || null,
            entry_time: messageData.entry_time,
            createdAt: messageData.createdAt,
            updatedAt: messageData.updatedAt,
            isSystemMessage: true // Flag to identify system messages
          };

          // Add the message to chat messages without auto-scrolling
          addMessageToChat(successMessage, false);
          console.log('Adding system message to chat:', successMessage);
        }
      }
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  const handleReject = async (storyId) => {
    console.log('Reject button clicked for story:', storyId);

    // Store current scroll position before updating
    const scrollPosition = inboxListRef.current?.scrollTop || 0;

    try {
      const result = await approval_panelfn({ story_id: storyId, "type": "REJECTED" });
      if (result && result.success) {
        // Get status from API response - use overall_status or updated_link.type_base_info
        const newStatus = result.data?.DB_DATA?.overall_status || 
                         result.data?.DB_DATA?.updated_link?.type_base_info || 
                         'REJECTED';
        
        // Update current story status immediately for real-time UI update
        setCurrentStoryStatus(newStatus);

        // Get updated_link from API response which contains the updated user object
        const updatedLink = result.data?.DB_DATA?.updated_link;
        
        // Update selectedStory if it matches the current story
        if (selectedStory && selectedStory.story_id === storyId) {
          let updatedUsers = selectedStory.users || [];
          
          if (updatedLink && Array.isArray(selectedStory.users)) {
            // Update the users array in selectedStory with the updated user
            updatedUsers = selectedStory.users.map(user => {
              // Match by receiver to find the user that was updated
              if (user.receiver === updatedLink.receiver) {
                // Return the updated user object from API response
                return {
                  ...user,
                  ...updatedLink,
                  type_base_info: updatedLink.type_base_info || newStatus
                };
              }
              return user;
            });
          }

          // Update selectedStory with new users array and status
          const updatedSelectedStory = {
            ...selectedStory,
            users: updatedUsers,
            type_base_info: newStatus
          };
          
          // Update selectedStory in store
          selectStory(updatedSelectedStory);
        }

        // Update filtered inbox data to reflect status change
        const updatedFilteredData = filteredInboxData.map(story => {
          if (story.story_id === storyId) {
            // Update users array if updatedLink is available
            let updatedUsers = story.users || [];
            if (updatedLink && Array.isArray(story.users)) {
              updatedUsers = story.users.map(user => {
                if (user.receiver === updatedLink.receiver) {
                  return {
                    ...user,
                    ...updatedLink,
                    type_base_info: updatedLink.type_base_info || newStatus
                  };
                }
                return user;
              });
            }
            
            return {
              ...story,
              status: newStatus,
              type_base_info: newStatus,
              users: updatedUsers
            };
          }
          return story;
        });
        setFilteredInboxData(updatedFilteredData);

        // Restore scroll position after state update
        setTimeout(() => {
          if (inboxListRef.current) {
            inboxListRef.current.scrollTop = scrollPosition;
          }
        }, 0);

        // Add success message to chat if available (fix: use DB_DATA.message instead of Message)
        if (result.data?.DB_DATA?.message) {
          const messageData = result.data.DB_DATA.message;
          const successMessage = {
            _id: messageData._id,
            story_id: messageData.story_id,
            one_id: messageData.one_id,
            app_id: messageData.app_id || "",
            type: messageData.type || "GENERAL",
            message: messageData.message,
            file: messageData.file || null,
            entry_time: messageData.entry_time,
            createdAt: messageData.createdAt,
            updatedAt: messageData.updatedAt,
            isSystemMessage: true // Flag to identify system messages
          };

          // Add the message to chat messages without auto-scrolling
          addMessageToChat(successMessage, false);
          console.log('Adding system message to chat:', successMessage);
        }
      }
    } catch (error) {
      console.error('Rejection failed:', error);
    }
  };

  // Function to check if a story has unread messages
  const hasUnreadMessages = (story) => {
    if (story.users && Array.isArray(story.users)) {
      return story.users.some(user => user.read_status === 0);
    }
    return false;
  };


  // Use currentStoryStatus if available, otherwise fall back to story_link or selectedStory
  const story_status = currentStoryStatus || story_link[0]?.type_base_info?.trim() || selectedStory?.type_base_info?.trim();

  // console.log('story_status:', story_status);
  // console.log('currentStoryStatus:', currentStoryStatus);





  return (
    <div className="h-[calc(100vh-65px)] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden flex flex-col">
      <div className="flex-1 min-h-0 p-2 md:p-4 overflow-hidden flex flex-col">
      {/* Application Info Full Page View */}
      {showApplicationInfo && selectedApplicationData ? (
        <div className="h-full bg-white rounded-xl overflow-hidden shadow-lg">
          <ApplicationInfo
            data={application_data}
            isLoading={isLoadingApplicationDetails}
            onClose={handleCloseApplicationInfo}
          />
        </div>
      ) : (
        /* Regular Inbox Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full flex-1 min-h-0">
          {/* Left Column - Inbox List */}
          <div className="lg:col-span-4 bg-white rounded-xl overflow-hidden flex flex-col border border-gray-200 shadow-lg h-full">
            {/* Header */}
            <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-white rounded-lg shadow-sm">
                  <HiMail className="text-customBlue text-[18px]" />
                </div>
                <h2 className="text-customBlack-100 font-semibold text-[16px] md:text-[18px]">
                  Inbox
                </h2>
              </div>

              {/* Filters - Full Width in Flex */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1">
                  <CustomSelect
                    cStyle={true}
                    customStyles={{
                      control: (base) => ({
                        ...base,
                        fontSize: '1px',
                        minHeight: '32px',
                        border: '2px solid #E5E7EB',
                        borderRadius: '8px',
                        width: '100%',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                        padding: '2px 4px',
                        '&:hover': {
                          border: '2px solid #3da5f4',
                        },
                      }),
                      option: (base) => ({
                        ...base,
                        fontSize: '1px',
                      }),
                    }}
                  options={readStatusFilterOptions}
                  placeHolderTitle="Read Status"
                  onChangeHandler={handleReadStatusFilterChange}
                  value={readStatusFilterOptions.find(option => option.value === readStatusFilter)}
                  isClearable={false}
                  isSearchable={false}
                />
                </div>
                <div className="flex-1">
                  <CustomSelect
                    isTrue={true}
                    cStyle={true}
                    customStyles={{
                      control: (base) => ({
                        ...base,
                        fontSize: '1px',
                        minHeight: '32px',
                        border: '2px solid #E5E7EB',
                        borderRadius: '8px',
                        width: '100%',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                        padding: '2px 4px',
                        '&:hover': {
                          border: '2px solid #3da5f4',
                        },
                      }),
                      option: (base) => ({
                        ...base,
                        fontSize: '1px',
                      }),
                    }}
                    options={readTypeFilterOptions}
                    placeHolderTitle="Select Type"
                    onChangeHandler={handleReadTypeFilterChange}
                    value={readTypeFilterOptions.find(option => option.value === readTypeFilter)}
                    isClearable={false}
                    isSearchable={false}
                  />
                </div>
              </div>

              {/* Search and Mark All Read Button */}
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full pl-9 pr-3 py-1.5 border-2 border-gray-200 rounded-lg text-customBlack-100 text-[14px] focus:outline-none focus:border-customBlue focus:ring-2 focus:ring-customBlue/20 transition-all shadow-sm"
                  />
                </div>
                <button
                  onClick={handleMarkAllRead}
                  className="px-3 py-1.5 bg-gradient-to-r from-customBlue to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all text-[13px] font-medium whitespace-nowrap shadow-md hover:shadow-lg flex items-center gap-1.5"
                >
                  <BsCheckAll className="text-[14px]" />
                  Mark All Read
                </button>
              </div>
            </div>

            {/* Inbox List */}
            <div className="flex-1 overflow-auto customDrwerScroll" ref={inboxListRef}>
              {isLoadingInbox ? (
                <div className="flex items-center justify-center h-32">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-3 border-customBlue border-t-transparent"></div>
                    <p className="text-gray-500 text-sm">Loading messages...</p>
                  </div>
                </div>
              ) : filteredInboxData?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                  <div className="p-4 bg-gray-100 rounded-full mb-4">
                    <BsEnvelope className="text-gray-400 text-4xl" />
                  </div>
                  <p className="text-gray-500 text-[16px] font-medium">No messages found</p>
                  <p className="text-gray-400 text-[14px] mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="p-2">
                  {filteredInboxData?.map((story, index) => {
                    const isSelected = selectedStory && selectedStory.story_id === story.story_id;
                    const isUnread = hasUnreadMessages(story);
                    
                    return (
                      <div
                        key={story.story_id || story._id || index}
                        className={`group flex items-center gap-2 p-2 mb-1 rounded-lg cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'bg-gradient-to-r from-customBlue/10 to-blue-50 border-2 border-customBlue shadow-md' 
                            : isUnread
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm hover:shadow-md'
                            : 'bg-white border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md'
                        }`}
                        onClick={() => handleStoryClick(story)}
                      >
                        <div className="relative flex-shrink-0">
                          <UserAvatar
                            src={story.emp_image}
                            alt={story.emp_name || story.full_name}
                            className="h-10 w-10 md:h-11 md:w-11 object-cover rounded-full overflow-hidden ring-2 ring-white shadow-sm"
                            showUnreadIndicator={isUnread}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h4 className={`font-semibold text-[13px] md:text-[14px] truncate ${
                              isSelected ? 'text-customBlue' : 'text-gray-900'
                            }`}>
                              {story.emp_name || story.full_name || 'Unknown Employee'}
                            </h4>
                            <span className={`text-[10px] md:text-[11px] whitespace-nowrap ml-2 ${
                              isSelected ? 'text-customBlue' : 'text-gray-500'
                            }`}>
                              {new Date(story.entry_time).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: window.innerWidth >= 640 ? 'numeric' : undefined
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[11px] md:text-[12px] truncate ${
                              isSelected ? 'text-gray-600' : 'text-gray-500'
                            }`}>
                              {story?.title?.replace('_', ' ')}
                            </span>
                            {isUnread && (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-medium rounded-full">
                                New
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Load More Button */}
                  {hasMorePages && (
                    <div className="p-2 text-center">
                      <button
                        onClick={loadMoreInboxData}
                        disabled={isLoadingMoreInbox}
                        className="px-4 py-1.5 bg-gradient-to-r from-customBlue to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-[12px] font-medium shadow-sm hover:shadow-md"
                      >
                        {isLoadingMoreInbox ? (
                          <div className="flex items-center gap-1.5">
                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                            Loading...
                          </div>
                        ) : (
                          'Load More'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>



          {/* Right Column - Chat Interface */}
          {showChat && selectedStory && (
            <div className="lg:col-span-8 h-full border border-gray-200 rounded-xl overflow-hidden bg-white flex flex-col shadow-lg" style={{ marginTop: '0px' }}>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <UserAvatar
                    src={selectedStory?.emp_image}
                    alt={selectedStory?.emp_name || selectedStory?.full_name}
                    className="h-8 w-8 md:h-10 md:w-10 object-cover rounded-full overflow-hidden ring-2 ring-customBlue/20 shadow-sm"
                    showOnlineIndicator={true}
                  />
                  <div>
                    <h3 className="text-gray-900 font-semibold text-[14px] md:text-[15px]">
                      {selectedStory?.emp_name || selectedStory?.full_name || 'Unknown Employee'}
                    </h3>
                    <p className="text-gray-500 text-[11px] md:text-[12px] flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                      {selectedStory?.type?.replace('_', " ")} • {new Date(selectedStory?.entry_time).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Action Icons */}
                {isAdmin ? (
                  (() => {
                    switch (story_status) {
                      case 'ACCEPTED':
                        return (
                          <div className="flex items-center gap-3">
                            <button
                              className="p-1.5 text-amber-600 hover:text-amber-700 transition-all bg-amber-50 hover:bg-amber-100 rounded-lg shadow-sm hover:shadow-md"
                              onClick={() => handleViewApplication(selectedStory)}
                              title="View Application"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                              </svg>
                            </button>
                            <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-[10px] font-semibold px-2 py-1 rounded-full border border-green-200 shadow-sm flex items-center gap-1">
                              <HiCheckCircle className="text-green-600 text-[12px]" />
                              ACCEPTED
                            </span>
                          </div>
                        );
                      case 'REJECTED':
                        return (
                          <div className="flex items-center gap-3">
                            <button
                              className="p-1.5 text-amber-600 hover:text-amber-700 transition-all bg-amber-50 hover:bg-amber-100 rounded-lg shadow-sm hover:shadow-md"
                              onClick={() => handleViewApplication(selectedStory)}
                              title="View Application"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                              </svg>
                            </button>
                            <span className="bg-gradient-to-r from-red-100 to-rose-100 text-red-800 text-[10px] font-semibold px-2 py-1 rounded-full border border-red-200 shadow-sm flex items-center gap-1">
                              <HiXCircle className="text-red-600 text-[12px]" />
                              REJECTED
                            </span>
                          </div>
                        );
                      case 'PENDING':
                        return (
                          <div className="flex items-center gap-3">
                            <button
                              className="p-1.5 text-amber-600 hover:text-amber-700 transition-all bg-amber-50 hover:bg-amber-100 rounded-lg shadow-sm hover:shadow-md"
                              onClick={() => handleViewApplication(selectedStory)}
                              title="View Application"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                              </svg>
                            </button>
                            <button 
                              className="p-1.5 text-green-600 hover:text-green-700 transition-all bg-green-50 hover:bg-green-100 rounded-lg shadow-sm hover:shadow-md" 
                              onClick={() => handleApprove(selectedStory.story_id)}
                              title="Approve"
                            >
                              <HiCheckCircle className="w-5 h-5" />
                            </button>
                            <button 
                              className="p-1.5 text-red-600 hover:text-red-700 transition-all bg-red-50 hover:bg-red-100 rounded-lg shadow-sm hover:shadow-md" 
                              onClick={() => handleReject(selectedStory.story_id)}
                              title="Reject"
                            >
                              <HiXCircle className="w-5 h-5" />
                            </button>
                          </div>
                        );
                      default:
                        return (
                          <div className="flex items-center gap-3">
                            <button
                              className="p-1.5 text-amber-600 hover:text-amber-700 transition-all bg-amber-50 hover:bg-amber-100 rounded-lg shadow-sm hover:shadow-md"
                              onClick={() => handleViewApplication(selectedStory)}
                              title="View Application"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                              </svg>
                            </button>
                            <button 
                              className="p-1.5 text-green-600 hover:text-green-700 transition-all bg-green-50 hover:bg-green-100 rounded-lg shadow-sm hover:shadow-md" 
                              onClick={() => handleApprove(selectedStory.story_id)}
                              title="Approve"
                            >
                              <HiCheckCircle className="w-5 h-5" />
                            </button>
                            <button 
                              className="p-1.5 text-red-600 hover:text-red-700 transition-all bg-red-50 hover:bg-red-100 rounded-lg shadow-sm hover:shadow-md" 
                              onClick={() => handleReject(selectedStory.story_id)}
                              title="Reject"
                            >
                              <HiXCircle className="w-5 h-5" />
                            </button>
                          </div>
                        );
                    }
                  })()
                ) : (
                  // Non-admin users (Employees) - show Accept/Reject if they are the receiver
                  // BUT: If user's oneid matches receiver, show ONLY view icon (user is the initiator)
                  (() => {
                    // Check if user is receiver - ensure selectedStory exists
                    if (!selectedStory) {
                      return null;
                    }
                    
                    // Get the matched user receiver info (the specific user object in users array)
                    const matchedUser = getUserReceiverInfo(selectedStory);
                    
                    // Check if current user's oneid matches the receiver
                    // If it matches, user is the initiator (they created the request), so show only view icon
                    const userReceiverId = userOneId ? `ID${String(userOneId)}` : null;
                    const isUserReceiver = matchedUser && userReceiverId && matchedUser.receiver === userReceiverId;
                    
                    // If user is not a receiver, show default view button only
                    if (!matchedUser) {
                      return (
                        <div className="flex items-center gap-3">
                          <button
                            className="p-1.5 text-amber-600 hover:text-amber-700 transition-all bg-amber-50 hover:bg-amber-100 rounded-lg shadow-sm hover:shadow-md"
                            onClick={() => handleViewApplication(selectedStory)}
                            title="View Application"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                            </svg>
                          </button>
                        </div>
                      );
                    }
                    
                    // If user's oneid matches receiver, show ONLY view icon (user is the initiator)
                    if (isUserReceiver) {
                      return (
                        <div className="flex items-center gap-3">
                          <button
                            className="p-1.5 text-amber-600 hover:text-amber-700 transition-all bg-amber-50 hover:bg-amber-100 rounded-lg shadow-sm hover:shadow-md"
                            onClick={() => handleViewApplication(selectedStory)}
                            title="View Application"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                            </svg>
                          </button>
                        </div>
                      );
                    }
                    
                    // Get status from the matched user's type_base_info (not the story's type_base_info)
                    const userStatus = matchedUser?.type_base_info?.trim() || '';
                    const isPending = userStatus === 'PENDING';
                    const isAccepted = userStatus === 'ACCEPTED';
                    const isRejected = userStatus === 'REJECTED';
                    
                    // If user is receiver (but not the initiator) and their status is PENDING, show Accept/Reject buttons
                    if (isPending) {
                      return (
                        <div className="flex items-center gap-3">
                          <button
                            className="p-1.5 text-amber-600 hover:text-amber-700 transition-all bg-amber-50 hover:bg-amber-100 rounded-lg shadow-sm hover:shadow-md"
                            onClick={() => handleViewApplication(selectedStory)}
                            title="View Application"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                            </svg>
                          </button>
                          <button 
                            className="p-1.5 text-green-600 hover:text-green-700 transition-all bg-green-50 hover:bg-green-100 rounded-lg shadow-sm hover:shadow-md" 
                            onClick={() => handleApprove(selectedStory.story_id)}
                            title="Approve"
                          >
                            <HiCheckCircle className="w-5 h-5" />
                          </button>
                          <button 
                            className="p-1.5 text-red-600 hover:text-red-700 transition-all bg-red-50 hover:bg-red-100 rounded-lg shadow-sm hover:shadow-md" 
                            onClick={() => handleReject(selectedStory.story_id)}
                            title="Reject"
                          >
                            <HiXCircle className="w-5 h-5" />
                          </button>
                        </div>
                      );
                    }
                    
                    // If user's status is ACCEPTED, show accepted badge
                    if (isAccepted) {
                      return (
                        <div className="flex items-center gap-3">
                          <button
                            className="p-1.5 text-amber-600 hover:text-amber-700 transition-all bg-amber-50 hover:bg-amber-100 rounded-lg shadow-sm hover:shadow-md"
                            onClick={() => handleViewApplication(selectedStory)}
                            title="View Application"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                            </svg>
                          </button>
                          <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-[10px] font-semibold px-2 py-1 rounded-full border border-green-200 shadow-sm flex items-center gap-1">
                            <HiCheckCircle className="text-green-600 text-[12px]" />
                            ACCEPTED
                          </span>
                        </div>
                      );
                    }
                    
                    // If user's status is REJECTED, show rejected badge
                    if (isRejected) {
                      return (
                        <div className="flex items-center gap-3">
                          <button
                            className="p-1.5 text-amber-600 hover:text-amber-700 transition-all bg-amber-50 hover:bg-amber-100 rounded-lg shadow-sm hover:shadow-md"
                            onClick={() => handleViewApplication(selectedStory)}
                            title="View Application"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                            </svg>
                          </button>
                          <span className="bg-gradient-to-r from-red-100 to-rose-100 text-red-800 text-[10px] font-semibold px-2 py-1 rounded-full border border-red-200 shadow-sm flex items-center gap-1">
                            <HiXCircle className="text-red-600 text-[12px]" />
                            REJECTED
                          </span>
                        </div>
                      );
                    }
                    
                    // Default: only show view button
                    return (
                      <div className="flex items-center gap-3">
                        <button
                          className="p-1.5 text-amber-600 hover:text-amber-700 transition-all bg-amber-50 hover:bg-amber-100 rounded-lg shadow-sm hover:shadow-md"
                          onClick={() => handleViewApplication(selectedStory)}
                          title="View Application"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                          </svg>
                        </button>
                      </div>
                    );
                  })()
                )}


              </div>

              {/* Chat Component */}
              <div className="flex-1 overflow-hidden">
                <Chat
                  messages={chatMessages}
                  isLoading={isLoadingMessages}
                  isLoadingMore={isLoadingMoreMessages}
                  hasMoreMessages={hasMoreMessages}
                  onLoadMore={handleLoadMoreMessages}
                  scrollToBottom={scrollToBottom}
                  onSendMessage={handleSendMessage}
                  selectedStory={selectedStory}
                  selectedEmployee={selectedStory}
                  uploadFileToElephant={uploadFileToElephant}
                  story_link={story_link}
                  shouldAutoScroll={shouldAutoScroll}
                />


              </div>
            </div>
          )}

          {/* Chat Placeholder - Show when no chat is active */}
          {!showChat && (
            <>
              {/* Desktop View */}
              <div className="hidden lg:flex lg:col-span-8 h-full border border-gray-200 rounded-xl overflow-hidden bg-gradient-to-br from-white to-gray-50 items-center justify-center shadow-lg">
                <div className="text-center p-8">
                  <div className="mb-6 flex justify-center">
                    <div className="p-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full">
                      <HiMail className="text-6xl text-customBlue" />
                    </div>
                  </div>
                  <h3 className="text-gray-700 text-xl font-semibold mb-2">
                    Select a Conversation
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Choose a message from the inbox to start chatting
                  </p>
                </div>
              </div>
              {/* Mobile View */}
              <div className="lg:hidden col-span-1 h-full border border-gray-200 rounded-xl overflow-hidden bg-gradient-to-br from-white to-gray-50 flex items-center justify-center shadow-lg">
                <div className="text-center p-6">
                  <div className="mb-4 flex justify-center">
                    <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full">
                      <HiMail className="text-4xl text-customBlue" />
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm font-medium">
                    Select a conversation
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
          )}
      </div>
    </div>
  );
};

export default Inbox;

