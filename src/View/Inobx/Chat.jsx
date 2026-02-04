import { Tooltip, Typography } from "@material-tailwind/react";
import { motion } from "framer-motion";
import { IoAttach } from "react-icons/io5";
import { BsFillSendFill } from "react-icons/bs";
import { useEffect, useRef, useState } from "react";
import { convertDateToCustom } from "../../services/__dashboardServcies";
import { getUserData } from "../../Authentication/jwt_decode";
import useSocket from "../../Components/useSocket/useSocket";

// ---------- DATE HELPERS (WhatsApp Style) ----------

const getMessageTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

const formatDateLabel = (dateString) => {
  const today = new Date();
  const date = new Date(dateString);

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    weekday: "long",
  });
};

// ----------------------------------------------------

const Chat = ({
  messages = [],
  isLoading = false,
  isLoadingMore = false,
  hasMoreMessages = false,
  onLoadMore,
  onScroll,
  scrollToBottom,
  onSendMessage,
  selectedStory,
  uploadFileToElephant,
  shouldAutoScroll = true,
}) => {
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [message, setMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Load current user from token
  useEffect(() => {
    const userData = getUserData();
    if (userData && userData?.oneid) {
      setCurrentUserId(userData?.oneid);
    }
  }, []);

  const scrollToBottomHandler = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottomHandler();
    }
  }, [messages, shouldAutoScroll]);

  const handleScroll = (e) => {
    const { scrollTop } = e.target;

    if (scrollTop === 0 && hasMoreMessages && !isLoadingMore) {
      onLoadMore();
    }
    onScroll?.(scrollTop);
  };

  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();
    const hasMessage = trimmedMessage.length > 0;
    const hasFile = selectedFile !== null;

    // Must have either message or file
    if ((!hasMessage && !hasFile) || isSending || !selectedStory) return;

    setIsSending(true);
    try {
      const receiverOneId = selectedStory.initiator_oneid;
      const storyId = selectedStory.story_id || selectedStory._id;

      let fileUrl = null;
      
      // If file is selected, upload it first
      if (hasFile) {
        try {
          const uploadResult = await uploadFileToElephant(selectedFile);
          if (uploadResult.success) {
            fileUrl = uploadResult.fileUrl;
          } else {
            throw new Error('File upload failed');
          }
        } catch (uploadError) {
          console.error("File upload error:", uploadError);
          setIsSending(false);
          return;
        }
      }

      // Send message with both text and file (if available)
      const result = await onSendMessage(
        hasMessage ? trimmedMessage : null, 
        storyId, 
        receiverOneId, 
        fileUrl
      );

      if (result.success) {
        setMessage("");
        if (hasFile) {
          setSelectedFile(null);
          fileInputRef.current.value = "";
        }
        setTimeout(() => {
          scrollToBottom?.();
          scrollToBottomHandler();
        }, 50);
      }
    } catch (error) {
      console.error("Send error:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Own message check
  const isOwnMessage = (messageOneId) => {
    return currentUserId && messageOneId && currentUserId === messageOneId;
  };

  // FILE MESSAGE HANDLING
  const getAttachmentFromMessage = (messageText) => {
    if (!messageText) return null;
    if (messageText.includes("📎") && messageText.includes("\n")) {
      const lines = messageText.split("\n");
      return {
        fileName: lines[0].replace("📎 ", ""),
        filePath: lines[1],
      };
    }
    const trimmed = messageText.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return {
        fileName: trimmed.split("/").pop(),
        filePath: trimmed,
      };
    }
    return null;
  };

  const getAttachment = (msg) => {
    if (msg?.file) {
      return {
        fileName: msg.file.split("/").pop(),
        filePath: msg.file,
      };
    }
    if (msg?.message) {
      return getAttachmentFromMessage(msg.message);
    }
    return null;
  };

  const handleFileClick = (filePath) => {
    if (!filePath) return;
    const hasProtocol = filePath.startsWith("http");
    const hasFilesPrefix = filePath.startsWith("files/");
    const baseUrl = "https://elephant.veevotech.com/";
    const fullUrl = hasProtocol
      ? filePath
      : hasFilesPrefix
      ? `${baseUrl}${filePath}`
      : `${baseUrl}files/${filePath}`;
    window.open(fullUrl, "_blank");
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  // This function is kept for backward compatibility but now handleSendMessage handles both
  const handleFileUpload = async () => {
    // Delegate to handleSendMessage which now handles both file and text
    await handleSendMessage();
  };

  return (
    <div className="flex flex-col h-full space-y-2 mt-10">

      {/* ---------------- CHAT BODY ---------------- */}
      <div
        className="flex-1 p-2 overflow-y-auto customScroll"
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
        {isLoadingMore && (
          <div className="flex justify-center py-2 text-sm text-gray-500">
            Loading more messages…
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, index) => {

              const ownMessage = isOwnMessage(msg.one_id);
              const defaultMessage = !msg.app_id || msg.app_id === "";

              const currentMsgDate = formatDateLabel(msg.entry_time);
              const previousMsgDate =
                index > 0 ? formatDateLabel(messages[index - 1].entry_time) : null;

              const showDateHeader = index === 0 || currentMsgDate !== previousMsgDate;

              return (
                <div key={msg._id}>

                  {/* ---------- DATE HEADER (WHATSAPP STYLE) ---------- */}
                  {showDateHeader && (
                    <div className="flex justify-center my-2">
                      <span className="bg-gray-300 text-gray-800 px-3 py-1 rounded-full text-xs">
                        {currentMsgDate}
                      </span>
                    </div>
                  )}

                  {/* ---------- MESSAGE BUBBLE ---------- */}
                  <div
                    className={`flex w-full ${
                      defaultMessage
                        ? "justify-center"
                        : ownMessage
                        ? "justify-end"
                        : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] px-3 py-2 rounded-lg border ${
                        defaultMessage
                          ? "bg-[#ebf6fe] border-gray-200 text-black text-center"
                          : "bg-[#138496] text-white border-transparent"
                      }`}
                    >
                      {/* FILE MESSAGE */}
                      {(() => {
                        const attachment = getAttachment(msg);
                        const hasText = msg.message && msg.message.trim() !== '';
                        
                        return (
                          <div>
                            {attachment && (
                              <div className={hasText ? "mb-1" : ""}>
                                <div
                                  className="cursor-pointer underline text-sm"
                                  onClick={() => handleFileClick(attachment.filePath)}
                                >
                                   {attachment.fileName}
                                </div>
                                {/* <div className="text-[10px] opacity-70 break-all">
                                  {attachment.filePath}
                                </div> */}
                              </div>
                            )}
                            {hasText && (
                              <p className="text-sm whitespace-pre-line break-words">
                                {msg.message}
                              </p>
                            )}
                          </div>
                        );
                      })()}

                      {/* -------- TIME -------- */}
                      <p className="text-[10px] opacity-70 mt-1">
                        {getMessageTime(msg.entry_time)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div ref={messagesEndRef}></div>
      </div>

      {/* ---------------- INPUT AREA ---------------- */}
      <div className="flex-shrink-0 border border-gray-300 flex rounded-lg p-1.5">
        <div className="h-full w-[90%]">
          <textarea
            rows="2"
            placeholder="Type your message here"
            className="text-[#333] text-[12px] w-full py-1.5 px-3 outline-none resize-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />

          {selectedFile && (
            <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded">
              <span className="text-[11px]">📎 {selectedFile.name}</span>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-red-500 text-[11px]"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div className="h-full flex items-center gap-1.5 px-1">
          <Tooltip content={<Typography className="text-[11px]">Attach File</Typography>}>
            <motion.span
              whileHover={{ scale: 1.1 }}
              className="text-[18px] text-gray-500 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <IoAttach />
            </motion.span>
          </Tooltip>

          <Tooltip
            content={
              <Typography className="text-[11px]">
                {selectedFile ? "Send File" : "Send Message"}
              </Typography>
            }
          >
            <motion.span
              whileHover={{ scale: (isSending || isUploading) ? 1 : 1.1 }}
              className={`h-7 w-7 text-[16px] flex items-center justify-center rounded-full cursor-pointer ${
                isSending || isUploading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#138496] hover:bg-[#138496]/90"
              } text-white`}
              onClick={
                isSending || isUploading
                  ? undefined
                  : handleSendMessage
              }
            >
              {isSending || isUploading ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <BsFillSendFill />
              )}
            </motion.span>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default Chat;
