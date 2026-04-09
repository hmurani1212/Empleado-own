import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Image from '@editorjs/image';
import Quote from '@editorjs/quote';
import Table from '@editorjs/table';
import Code from '@editorjs/code';
import Paragraph from '@editorjs/paragraph';
import Marker from '@editorjs/marker';
import { useEffect, useRef, useState } from 'react';
import { formatDateDMY, formatTimestampToTime, formatTimestampToTimeSeconds } from '../../services/__dateTimeServices';
import { FaClock, FaTrash, FaXmark } from 'react-icons/fa6';
import profileImage from '../../assets/images/userProfileNote.png'
import { titleNameAlpha } from '../../services/appServices';
import CustomButton from '../../Components/CustomButton/CustomButton';
import ConfirmationDialog from '../../Components/ConfirmationDialog/ConfirmationDialog';
import { motion } from 'framer-motion'
import { HiXMark } from "react-icons/hi2";
import { FaFilePdf } from "react-icons/fa6";
import { FaFileAlt, FaFileExcel, FaFileWord, FaFileVideo } from "react-icons/fa";
import notesPoolApi from '../../Model/Data/NotesPool/NotesPool';
import { getLocalStorage } from '../../Authentication/localStorageServices';
import { showToast } from '../../Components/Toaster/Toaster';
import { serializeEditorContentForLegacyBackend } from '../../services/__notesPoolEditorContent';
import { isNotesPoolLooseSuccess } from '../../services/__notesPoolApi';
// import { cornersOfRectangle } from '@dnd-kit/core/dist/utilities/algorithms/helpers';


const headerClasses = {
  1: 'text-4xl font-bold my-4',
  2: 'text-3xl font-bold my-3',
  3: 'text-2xl font-bold my-2',
  4: 'text-xl font-bold my-2',
  5: 'text-lg font-bold my-1',
};

const renderFilePreview = (file, index) => {
  
  // Add null checks and handle different file object structures
  if (!file) {
    return <FaFileAlt className="w-[100px] h-[100px] object-cover rounded-lg" />;
  }
  
  // Check for different possible mime type properties
  const mimeType = file.FILE_MIME || file.type || file.mimeType || file.mime_type || file.file_type;
  const recId = file.REC_ID || file.rec_id;
  const fileName = file.FILE_NAME || file.file_name;
  
  // Construct URL using the specified format: https://elephant.veevotech.com/files/recid/filename
  let fileUrl = file.FILE_URL || file.url || file.preview;
  if (!fileUrl && recId && fileName) {
    fileUrl = `https://elephant.veevotech.com/files/${recId}/${fileName}`;
  } else if (!fileUrl && recId) {
    fileUrl = recId;
  }
  
  if (mimeType && mimeType.startsWith("image/")) {
    return (
      <motion.img
        src={fileUrl}
        alt={`Uploaded ${index}`}
        className="w-[100px] h-[100px] object-cover rounded-lg"
        onError={(e) => {
          e.target.style.display = 'none';
          const fallback = document.createElement('div');
          fallback.innerHTML = '<FaFileAlt className="w-[100px] h-[100px] object-cover rounded-lg" />';
          e.target.parentNode.appendChild(fallback.firstChild);
        }}
      />
    );
  } else if (mimeType && mimeType.startsWith("video/")) {
    return (
      <video 
        src={fileUrl}
        className="w-[100px] h-[100px] object-cover rounded-lg"
        controls={false}
        onError={(e) => {
          e.target.style.display = 'none';
          const fallback = document.createElement('div');
          fallback.innerHTML = '<FaFileVideo className="w-[100px] h-[100px] object-cover rounded-lg text-blue-500" />';
          e.target.parentNode.appendChild(fallback.firstChild);
        }}
      />
    );
  } else {
    // Handle document types
    if (mimeType) {
      switch (mimeType) {
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          return <FaFileWord className="w-[100px] h-[100px] object-cover rounded-lg text-blue-500" />;
        case "application/vnd.ms-excel":
          return <FaFileExcel className="w-[100px] h-[100px] object-cover rounded-lg text-green-500" />;
        case "application/pdf":
          return <FaFilePdf className="w-[100px] h-[100px] object-cover rounded-lg text-red-500" />;
        default:
          return <FaFileAlt className="w-[100px] h-[100px] object-cover rounded-lg" />;
      }
    } else {
      // Fallback for files without mime type - try to determine from file extension
      const fileNameForExt = file.file_name || file.name || file.FILE_NAME || '';
      const fileExtension = fileNameForExt.split('.').pop()?.toLowerCase();
      
      switch (fileExtension) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'bmp':
        case 'webp':
          // Try to show as image even without mime type
          return (
            <motion.img
              src={fileUrl}
              alt={`Uploaded ${index}`}
              className="w-[100px] h-[100px] object-cover rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.innerHTML = '<FaFileAlt className="w-[100px] h-[100px] object-cover rounded-lg" />';
                e.target.parentNode.appendChild(fallback.firstChild);
              }}
            />
          );
        case 'mp4':
        case 'avi':
        case 'mov':
        case 'wmv':
        case 'flv':
          // Try to show as video even without mime type
          return (
            <video 
              src={fileUrl}
              className="w-[100px] h-[100px] object-cover rounded-lg"
              controls={false}
              onError={(e) => {
                e.target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.innerHTML = '<FaFileVideo className="w-[100px] h-[100px] object-cover rounded-lg text-blue-500" />';
                e.target.parentNode.appendChild(fallback.firstChild);
              }}
            />
          );
        case 'pdf':
          return <FaFilePdf className="w-[100px] h-[100px] object-cover rounded-lg text-red-500" />;
        case 'doc':
        case 'docx':
          return <FaFileWord className="w-[100px] h-[100px] object-cover rounded-lg text-blue-500" />;
        case 'xls':
        case 'xlsx':
          return <FaFileExcel className="w-[100px] h-[100px] object-cover rounded-lg text-green-500" />;
        default:
          return <FaFileAlt className="w-[100px] h-[100px] object-cover rounded-lg" />;
      }
    }
  }
};

/** Fetch a file as a blob (with auth) and save it directly to the user's system. */
const handleDownloadFile = async (file) => {
  const recId = file.REC_ID || file.rec_id;
  const fileName = file.FILE_NAME || file.file_name || file.name || 'file';
  let fileUrl = file.FILE_URL || file.url || file.preview;
  if (!fileUrl && recId && fileName && fileName !== 'Unknown file') {
    fileUrl = `https://elephant.veevotech.com/files/${recId}/${fileName}`;
  } else if (!fileUrl && recId) {
    fileUrl = recId;
  }
  if (!fileUrl) return;

  const jwt = getLocalStorage();
  try {
    const res = await fetch(fileUrl, {
      headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = fileName;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error('Attachment download failed:', err);
    // Last-resort fallback: direct navigation (browser will prompt save if server sends Content-Disposition: attachment)
    const anchor = document.createElement('a');
    anchor.href = fileUrl;
    anchor.download = fileName;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }
};

const UpdateNoteData = (props) => {
    const {addNoteValue, toggleEditNote,editorContent,handleAllTagRemove,handleAddTag,handleChangeEditor,toggleHandleConfirmTag,
        handleRemoveTag, confirmRemoveAllTags,handleAddNotesData, handleDrop,handleFileChange,handleRemoveFile,handleClick,handleAllFileRemove,fileInputRef,uploadProgress,
    } = props 
    const [aiResponse, setAiResponse] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => { 
        console.log("addNoteValue", addNoteValue)
    }, [addNoteValue])
    
    // Add state for file previews
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);
    const editorInstance = useRef(null);

    const noteContent = addNoteValue?.editor_content?.blocks || [];
    const entry_time = addNoteValue?.last_updated

    // Function to create file preview
    const createFilePreview = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            
            if (file.type.startsWith("image/")) {
                reader.onload = (e) => {
                    resolve({
                        id: Date.now() + Math.random(),
                        file: file,
                        type: 'image',
                        preview: e.target.result,
                        name: file.name,
                        size: file.size
                    });
                };
                reader.readAsDataURL(file);
            } else if (file.type.startsWith("video/")) {
                reader.onload = (e) => {
                    resolve({
                        id: Date.now() + Math.random(),
                        file: file,
                        type: 'video',
                        preview: e.target.result,
                        name: file.name,
                        size: file.size
                    });
                };
                reader.readAsDataURL(file);
            } else {
                // For other file types, create a preview object without actual preview
                resolve({
                    id: Date.now() + Math.random(),
                    file: file,
                    type: 'document',
                    preview: null,
                    name: file.name,
                    size: file.size,
                    mimeType: file.type
                });
            }
        });
    };

    // Enhanced file change handler
    const handleFileChangeWithPreview = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        
        // Create previews for all selected files
        const previews = await Promise.all(
            selectedFiles.map(file => createFilePreview(file))
        );
        
        // Add to selected files state
        setSelectedFiles(prev => [...prev, ...selectedFiles]);
        setFilePreviews(prev => [...prev, ...previews]);
        
        // Clear the input
        e.target.value = '';
    };

    // Enhanced drop handler
    const handleDropWithPreview = async (e) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        
        // Create previews for all dropped files
        const previews = await Promise.all(
            droppedFiles.map(file => createFilePreview(file))
        );
        
        // Add to selected files state
        setSelectedFiles(prev => [...prev, ...droppedFiles]);
        setFilePreviews(prev => [...prev, ...previews]);
    };

    // Remove file from preview
    const handleRemoveFilePreview = (previewId) => {
        setFilePreviews(prev => prev.filter(preview => preview.id !== previewId));
        setSelectedFiles(prev => prev.filter((_, index) => {
            const previewIndex = filePreviews.findIndex(p => p.id === previewId);
            return index !== previewIndex;
        }));
    };

    // Save editor first, then upload pending files, then POST update_note_content (always runs after save).
    const handleUpdateWithFiles = async () => {
        try {
            setUpdating(true);
            let mergedAttachments = addNoteValue.attachements || addNoteValue.attachments || [];

            let payload = { ...addNoteValue, attachements: mergedAttachments };
            if (editorInstance.current) {
                try {
                    const savedData = await editorInstance.current.save();
                    const timeMs = Date.now();
                    const normalized = {
                        time: timeMs,
                        blocks: savedData?.blocks ?? [],
                        version: savedData?.version ?? "2.31.0",
                    };
                    payload = {
                        ...addNoteValue,
                        attachements: mergedAttachments,
                        editor_content: serializeEditorContentForLegacyBackend(normalized),
                        editorContent: normalized,
                    };
                } catch (e) {
                    payload = { ...addNoteValue, attachements: mergedAttachments };
                }
            }

            const noteId =
                addNoteValue.note_id ||
                addNoteValue.noteHeader?.note_id ||
                addNoteValue.noteHeader?.id ||
                addNoteValue.id ||
                addNoteValue._id;

            // If there are new files, do a SINGLE multipart call for update_note_content + file(s)
            if (selectedFiles.length > 0) {
                if (!noteId) {
                    showToast("Cannot update note: note ID is missing", "error");
                    return;
                }

                const formData = new FormData();
                formData.append("operation", "update_note_content");
                formData.append("note_id", String(noteId));
                formData.append("notebook_id", String(payload.notebook_id || payload.noteHeader?.notebook_id || ""));
                formData.append("notebook_title", String(payload.notebook_title || payload.noteHeader?.notebook_title || ""));
                formData.append("editor_content", String(payload.editor_content || ""));

                const tags = Array.isArray(payload.tags)
                    ? payload.tags
                    : Array.isArray(payload?.noteHeader?.tags)
                        ? payload.noteHeader.tags
                        : [];
                // backend expects tags array; safest in FormData is repeated keys
                tags
                    .map((t) => (t?.label ?? t?.name ?? t))
                    .filter((t) => t != null && String(t).trim() !== "")
                    .forEach((t) => formData.append("tags[]", String(t).trim()));

                // Attach files as `file` (same as existing upload API)
                selectedFiles.forEach((f) => formData.append("file", f));

                const response = await notesPoolApi.updateNoteContentWithAttachments(formData);
                const responseData = response.data;
                if (isNotesPoolLooseSuccess(response.status, responseData)) {
                    setSelectedFiles([]);
                    setFilePreviews([]);
                    toggleEditNote();
                    showToast("Note Updated Successfully", "success");
                    return;
                }
                showToast(responseData?.ERROR_DESCRIPTION || "Failed to update note", "error");
                return;
            }

            // No new files -> normal JSON update_note_content
            await handleAddNotesData(payload, toggleEditNote);
        } catch (error) {
            console.error("Update with files failed:", error);
            showToast("Failed to update note", "error");
        } finally {
            setUpdating(false);
        }
    };

    // Render file preview component
    const renderFilePreviewComponent = (preview) => {
        if (preview.type === 'image') {
            return (
                <motion.img
                    src={preview.preview}
                    alt={preview.name}
                    className="w-[100px] h-[100px] object-cover rounded-lg"
                />
            );
        } else if (preview.type === 'video') {
            return (
                <video 
                    src={preview.preview}
                    className="w-[100px] h-[100px] object-cover rounded-lg"
                    controls={false}
                />
            );
        } else {
            // Document files
            const getFileIcon = (mimeType) => {
                switch (mimeType) {
                    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                        return <FaFileWord className="w-[100px] h-[100px] object-cover rounded-lg text-blue-500" />;
                    case "application/vnd.ms-excel":
                        return <FaFileExcel className="w-[100px] h-[100px] object-cover rounded-lg text-green-500" />;
                    case "application/pdf":
                        return <FaFilePdf className="w-[100px] h-[100px] object-cover rounded-lg text-red-500" />;
                    default:
                        return <FaFileAlt className="w-[100px] h-[100px] object-cover rounded-lg" />;
                }
            };
            
            return (
                <div className="text-center">
                    {getFileIcon(preview.mimeType)}
                    <p className="text-xs mt-1 truncate w-[100px]">{preview.name}</p>
                </div>
            );
        }
    };

    // Helper function to save editor content to database
    const saveEditorContentToDatabase = async () => {
      if (!editorInstance.current) return;
      
      try {
        const savedData = await editorInstance.current.save();
        const timeMs = Date.now();
        const currentTimeInSeconds = Math.floor(timeMs / 1000);
        const normalized = {
          time: timeMs,
          blocks: savedData?.blocks ?? [],
          version: savedData?.version ?? "2.31.0",
        };
        
        const noteId = addNoteValue.note_id || addNoteValue.noteHeader?.note_id || addNoteValue.id || addNoteValue._id;
        
        if (!noteId) {
          return;
        }
        
        const apiData = {
          note_id: noteId,
          editor_content: serializeEditorContentForLegacyBackend(normalized),
        };
      
        editorContent(apiData, entry_time, currentTimeInSeconds);
      } catch (error) {
        // Handle error silently
      }
    };

    // Enhanced AI function that processes all text content while preserving sequence
    const handleEnhancedWithAI = async (note_id) => {
      setAiLoading(true);
      
      try {
        // Get current editor content
        const currentData = await editorInstance.current.save();
        const currentBlocks = currentData.blocks || [];
        
        // Extract all text content from blocks (excluding images)
        const allTextContent = extractAllTextFromBlocks(currentBlocks);
        
        if (!allTextContent || allTextContent.trim() === '') {
          setAiLoading(false);
          return;
        }

        // Build payload with all text content
            const payload = {
              note_id: note_id,
          message_content: allTextContent,
        };

        // Send request to AI through proper API
        const response = await notesPoolApi.enhanceWithAI(payload);
        const newContent = response.data.DB_DATA.DB_DATA.content;

        // Store AI response in state
            setAiResponse(newContent);

        // Replace text content while preserving sequence of paragraphs and images
        const updatedBlocks = replaceAllTextContentPreservingSequence(
          currentBlocks, 
          allTextContent, 
          newContent
        );

        // Render the updated content
            if (editorInstance.current) {
              await editorInstance.current.render({
                time: new Date().getTime(),
            blocks: updatedBlocks,
          });
          
          // Manually trigger the save to database after AI response is applied
          setTimeout(() => {
            saveEditorContentToDatabase();
          }, 100);
            }

          } catch (error) {
            // Handle error silently
          } finally {
            setAiLoading(false);
          }
    };

    // Enhanced helper function to replace selected content in blocks while preserving structure
    const replaceSelectedContentInBlocks = (blocks, selectedText, newContent, selection) => {
      const range = selection.getRangeAt(0);
      const selectedTextStart = selectedText;
      
      // More accurate detection of multi-paragraph selections
      // Check if selection spans across multiple EditorJS blocks
      const isMultiParagraphSelection = isSelectionSpanningMultipleBlocks(selection, blocks);
      
      // Fallback: Check if selected text contains multiple line breaks (indicating multiple paragraphs)
      const hasMultipleLineBreaks = selectedText.includes('\n\n') || selectedText.split('\n').length > 2;
      
      if (isMultiParagraphSelection || hasMultipleLineBreaks) {
        return handleMultiParagraphSelection(blocks, selectedText, newContent, selection);
        } else {
          // Treating as single paragraph selection
      }
      
      return blocks.map(block => {
        // Handle paragraph blocks
        if (block.type === 'paragraph' && block.data && block.data.text) {
          const blockText = block.data.text;
          
          // Check if this block contains the selected text
          if (blockText.includes(selectedTextStart)) {
            // Replace the selected text with AI response
            const updatedText = blockText.replace(selectedTextStart, newContent);
            return {
              ...block,
              data: {
                ...block.data,
                text: updatedText
              }
            };
          }
        }
        
        // Handle header blocks
        if (block.type === 'header' && block.data && block.data.text) {
          const blockText = block.data.text;
          
          if (blockText.includes(selectedTextStart)) {
            const updatedText = blockText.replace(selectedTextStart, newContent);
            return {
              ...block,
              data: {
                ...block.data,
                text: updatedText
              }
            };
          }
        }
        
        // Handle list blocks
        if (block.type === 'list' && block.data && block.data.items) {
          const updatedItems = block.data.items.map(item => {
            if (typeof item === 'string' && item.includes(selectedTextStart)) {
              return item.replace(selectedTextStart, newContent);
            }
            return item;
          });
          
          if (JSON.stringify(updatedItems) !== JSON.stringify(block.data.items)) {
            return {
              ...block,
              data: {
                ...block.data,
                items: updatedItems
              }
            };
          }
        }
        
        // Handle quote blocks
        if (block.type === 'quote' && block.data && block.data.text) {
          const blockText = block.data.text;
          
          if (blockText.includes(selectedTextStart)) {
            const updatedText = blockText.replace(selectedTextStart, newContent);
            return {
              ...block,
              data: {
                ...block.data,
                text: updatedText
              }
            };
          }
        }
        
        // Return unchanged block if no match found
        return block;
      });
    };

    // Handle multi-paragraph selections by replacing the entire selection with AI response
    const handleMultiParagraphSelection = (blocks, selectedText, newContent, selection) => {
      const range = selection.getRangeAt(0);
      const startContainer = range.startContainer;
      const endContainer = range.endContainer;
      
      // Find the blocks that contain the selection
      const startBlockIndex = findBlockIndex(blocks, startContainer);
      const endBlockIndex = findBlockIndex(blocks, endContainer);
      
      if (startBlockIndex === -1 || endBlockIndex === -1) {
        // Fallback to simple text replacement
        return blocks.map(block => {
          if (block.type === 'paragraph' && block.data && block.data.text) {
            const blockText = block.data.text;
            if (blockText.includes(selectedText)) {
              const updatedText = blockText.replace(selectedText, newContent);
              return {
                ...block,
                data: {
                  ...block.data,
                  text: updatedText
                }
              };
            }
          }
          return block;
        });
      }
      
      // Create new blocks array
      const newBlocks = [];
      
      // Add blocks before the selection
      for (let i = 0; i < startBlockIndex; i++) {
        newBlocks.push(blocks[i]);
      }
      
      // Add the AI response as a new paragraph block
      newBlocks.push({
        type: 'paragraph',
        data: {
          text: newContent
        }
      });
      
      // Add blocks after the selection
      for (let i = endBlockIndex + 1; i < blocks.length; i++) {
        newBlocks.push(blocks[i]);
      }
      
      return newBlocks;
    };

    // Helper function to detect if selection spans multiple EditorJS blocks
    const isSelectionSpanningMultipleBlocks = (selection, blocks) => {
      const range = selection.getRangeAt(0);
      const startContainer = range.startContainer;
      const endContainer = range.endContainer;
      
      // Find the EditorJS blocks that contain the start and end of selection
      const startBlock = findEditorJSBlock(startContainer);
      const endBlock = findEditorJSBlock(endContainer);
      
      // If we can't find blocks, assume single paragraph
      if (!startBlock || !endBlock) {
        return false;
      }
      
      // If start and end are in different blocks, it's a multi-paragraph selection
      const isMultiBlock = startBlock !== endBlock;
      return isMultiBlock;
    };

    // Helper function to find the EditorJS block element containing a given node
    const findEditorJSBlock = (node) => {
      let current = node;
      
      while (current && current !== document.body) {
        if (current.id === 'editorjs') {
          break;
        }
        
        // Look for EditorJS block elements - try multiple possible class names and attributes
        if (current.classList && (
          current.classList.contains('ce-block') ||
          current.classList.contains('ce-paragraph') ||
          current.classList.contains('ce-header') ||
          current.classList.contains('ce-list') ||
          current.classList.contains('ce-quote') ||
          current.classList.contains('ce-block__content') ||
          current.hasAttribute('data-cy') ||
          current.getAttribute('contenteditable') === 'true'
        )) {
          return current;
        }
        
        // Also check for data attributes that EditorJS might use
        if (current.hasAttribute && (
          current.hasAttribute('data-cy') ||
          current.hasAttribute('data-editorjs-block') ||
          current.getAttribute('contenteditable') === 'true'
        )) {
          return current;
        }
        
        current = current.parentNode;
      }
      return null;
    };

    // Helper function to find which block contains a given DOM node
    const findBlockIndex = (blocks, node) => {
      let current = node;
      while (current && current !== document.body) {
        if (current.id === 'editorjs') {
          break;
        }
        if (current.classList && current.classList.contains('ce-block')) {
          // Find the block index by checking the block content
          for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            if (block.type === 'paragraph' && block.data && block.data.text) {
              if (current.textContent && current.textContent.includes(block.data.text)) {
                return i;
              }
            }
          }
        }
        current = current.parentNode;
      }
      return -1;
    };

    // Extract all text content from blocks (excluding images)
    const extractAllTextFromBlocks = (blocks) => {
      const textParts = [];
      
      blocks.forEach((block, index) => {
        // Skip image blocks
        if (block.type === 'image') {
          return;
        }
        
        // Extract text from different block types
        if (block.type === 'paragraph' && block.data && block.data.text) {
          textParts.push(block.data.text);
        } else if (block.type === 'header' && block.data && block.data.text) {
          textParts.push(block.data.text);
        } else if (block.type === 'list' && block.data && block.data.items) {
          block.data.items.forEach(item => {
            if (typeof item === 'string') {
              textParts.push(item);
            }
          });
        } else if (block.type === 'quote' && block.data && block.data.text) {
          textParts.push(block.data.text);
        } else if (block.type === 'code' && block.data && block.data.code) {
          textParts.push(block.data.code);
        }
      });
      
      return textParts.join('\n\n');
    };

    // Convert HTML formatting to EditorJS formatting
    const convertHTMLToEditorJSFormatting = (text) => {
      // Convert HTML tags to EditorJS formatting
      let formattedText = text;
      
      // Handle HTML entities first
      formattedText = formattedText.replace(/&nbsp;/g, ' ');
      formattedText = formattedText.replace(/&amp;/g, '&');
      formattedText = formattedText.replace(/&lt;/g, '<');
      formattedText = formattedText.replace(/&gt;/g, '>');
      formattedText = formattedText.replace(/&quot;/g, '"');
      formattedText = formattedText.replace(/&#39;/g, "'");
      
      // Handle markdown bold formatting (**text**)
      formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<mark class="cdx-marker">$1</mark>');
      
      // Handle markdown italic formatting (*text*)
      formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      // Handle HTML bold tags
      formattedText = formattedText.replace(/<b>(.*?)<\/b>/g, '<mark class="cdx-marker">$1</mark>');
      formattedText = formattedText.replace(/<strong>(.*?)<\/strong>/g, '<mark class="cdx-marker">$1</mark>');
      
      // Handle HTML italic tags
      formattedText = formattedText.replace(/<i>(.*?)<\/i>/g, '<em>$1</em>');
      formattedText = formattedText.replace(/<em>(.*?)<\/em>/g, '<em>$1</em>');
      
      // Handle underline tags
      formattedText = formattedText.replace(/<u>(.*?)<\/u>/g, '<u>$1</u>');
      
      // Handle code tags
      formattedText = formattedText.replace(/<code>(.*?)<\/code>/g, '<code class="inline-code">$1</code>');
      
      // Handle links
      formattedText = formattedText.replace(/<a href="([^"]*)"[^>]*>(.*?)<\/a>/g, '<a href="$1">$2</a>');
      
      return formattedText;
    };

    // Parse AI response and convert to proper EditorJS blocks
    const parseAIResponseToBlocks = (aiResponse) => {
      const blocks = [];
      const lines = aiResponse.split('\n').filter(line => line.trim() !== '');
      
      let currentListItems = [];
      let currentListType = null;
      
      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        
        // Check for bullet points (-, *, •)
        if (trimmedLine.match(/^[-*•]\s+/)) {
          const listItem = trimmedLine.replace(/^[-*•]\s+/, '');
          const formattedListItem = convertHTMLToEditorJSFormatting(listItem);
          
          if (currentListType !== 'unordered') {
            // If we have a different list type, save the previous list
            if (currentListItems.length > 0) {
              blocks.push({
                type: 'list',
                data: {
                  style: currentListType,
                  items: [...currentListItems]
                }
              });
            }
            currentListItems = [];
            currentListType = 'unordered';
          }
          currentListItems.push(formattedListItem);
        }
        // Check for numbered lists (1., 2., etc.)
        else if (trimmedLine.match(/^\d+\.\s+/)) {
          const listItem = trimmedLine.replace(/^\d+\.\s+/, '');
          const formattedListItem = convertHTMLToEditorJSFormatting(listItem);
          
          if (currentListType !== 'ordered') {
            // If we have a different list type, save the previous list
            if (currentListItems.length > 0) {
              blocks.push({
                type: 'list',
                data: {
                  style: currentListType,
                  items: [...currentListItems]
                }
              });
            }
            currentListItems = [];
            currentListType = 'ordered';
          }
          currentListItems.push(formattedListItem);
        }
        // Check for headers (# ## ###)
        else if (trimmedLine.match(/^#{1,6}\s+/)) {
          // Save any pending list
          if (currentListItems.length > 0) {
            blocks.push({
              type: 'list',
              data: {
                style: currentListType,
                items: [...currentListItems]
              }
            });
            currentListItems = [];
            currentListType = null;
          }
          
          const headerLevel = trimmedLine.match(/^#+/)[0].length;
          const headerText = trimmedLine.replace(/^#+\s+/, '');
          const formattedHeaderText = convertHTMLToEditorJSFormatting(headerText);
          
          blocks.push({
            type: 'header',
            data: {
              text: formattedHeaderText,
              level: Math.min(headerLevel, 6) // EditorJS supports levels 1-6
            }
          });
        }
        // Check for quotes (>)
        else if (trimmedLine.match(/^>\s+/)) {
          // Save any pending list
          if (currentListItems.length > 0) {
            blocks.push({
              type: 'list',
              data: {
                style: currentListType,
                items: [...currentListItems]
              }
            });
            currentListItems = [];
            currentListType = null;
          }
          
          const quoteText = trimmedLine.replace(/^>\s+/, '');
          const formattedQuoteText = convertHTMLToEditorJSFormatting(quoteText);
          
          blocks.push({
            type: 'quote',
            data: {
              text: formattedQuoteText,
              caption: '',
              alignment: 'left'
            }
          });
        }
        // Regular paragraph
        else if (trimmedLine !== '') {
          // Save any pending list
          if (currentListItems.length > 0) {
            blocks.push({
              type: 'list',
              data: {
                style: currentListType,
                items: [...currentListItems]
              }
            });
            currentListItems = [];
            currentListType = null;
          }
          
          const formattedParagraphText = convertHTMLToEditorJSFormatting(trimmedLine);
          blocks.push({
            type: 'paragraph',
            data: {
              text: formattedParagraphText
            }
          });
        }
      });
      
      // Save any remaining list items
      if (currentListItems.length > 0) {
        blocks.push({
          type: 'list',
          data: {
            style: currentListType,
            items: [...currentListItems]
          }
        });
      }
      
      return blocks;
    };

    // Replace all text content while preserving sequence of paragraphs and images
    const replaceAllTextContentPreservingSequence = (blocks, originalText, newText) => {
      // Parse the AI response into proper blocks
      const aiBlocks = parseAIResponseToBlocks(newText);
      
      const updatedBlocks = [];
      let aiBlockIndex = 0;
      
      blocks.forEach((block, index) => {
        // Keep image blocks as they are
        if (block.type === 'image') {
          updatedBlocks.push(block);
          return;
        }
        
        // Replace text blocks with AI-generated content
        if (block.type === 'paragraph' || block.type === 'header' || block.type === 'list' || block.type === 'quote' || block.type === 'code') {
          if (aiBlockIndex < aiBlocks.length) {
            // Add the AI-generated block
            updatedBlocks.push(aiBlocks[aiBlockIndex]);
            aiBlockIndex++;
          }
        } else {
          // Keep other block types as they are
          updatedBlocks.push(block);
        }
      });
      
      // If there are more AI blocks than original text blocks, add them
      while (aiBlockIndex < aiBlocks.length) {
        updatedBlocks.push(aiBlocks[aiBlockIndex]);
        aiBlockIndex++;
      }
      
      return updatedBlocks;
    };

    useEffect(() => {
        editorInstance.current = new EditorJS({
        holder: 'editorjs',
        tools: {
            header: {
                class: Header,
                inlineToolbar: ['marker', 'bold', 'italic', 'link'],
                config: {
                    levels: [1, 2, 3, 4, 5],
                    defaultLevel: 5,
                },
                tunes: {
                    header: {
                    defaultClass: 'text-2xl font-bold my-3',
                    levels: headerClasses,
                    },
                },
            },
            list: {
                class: List,
                inlineToolbar: true,
            },
            image: {
                class: Image,
                config: {
                    endpoints: {
                        byFile: '', // Your backend file uploader endpoint
                        byUrl: '',  // Your endpoint that provides image by URL
                    },
                    uploader: {
                        uploadByFile(file) {
                            return new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                    resolve({
                                        success: 1,
                                        file: {
                                            url: e.target.result,
                                        },
                                    });
                                };
                                reader.readAsDataURL(file);
                            });
                        },
                    },
                },
            },
            quote: {
                class: Quote,
                inlineToolbar: true,
            },
            table: Table,
            code: Code,
            paragraph: {
                class: Paragraph,
                inlineToolbar: ['bold', 'italic', 'link'],
            },
            marker: Marker,
        },
        placeholder: 'Start typing your content here...',
        data: {
            time: new Date().getTime(),
            blocks: noteContent || [], // Load the existing content
        },
        onChange: () => {
          editorInstance.current.save().then((savedData) => {
            const timeMs = Date.now();
            const currentTimeInSeconds = Math.floor(timeMs / 1000);
            const normalized = {
              time: timeMs,
              blocks: savedData?.blocks ?? [],
              version: savedData?.version ?? "2.31.0",
            };

            const noteId = addNoteValue.note_id || addNoteValue.noteHeader?.note_id || addNoteValue.id || addNoteValue._id;

            const apiData = {
              note_id: noteId,
              editor_content: serializeEditorContentForLegacyBackend(normalized),
            };

            if (!apiData.note_id) {
              return;
            }
            editorContent(apiData, entry_time, currentTimeInSeconds);
          }).catch((error) => {
            // Handle error silently
          });
        },
        });

        return () => {
        if (editorInstance.current) {
            editorInstance.current.destroy();
            editorInstance.current = null;
        }
        };
    }, []);
  return (
    <>
    <div className="w-full mx-auto px-2.5 pb-6">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)] px-5 sm:px-8 py-6 sm:py-8 space-y-6">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            {/* Beautiful user avatar with initials */}
            <div className='relative shrink-0'>
              {addNoteValue?.creator_name || addNoteValue?.created_by || addNoteValue?.user_name || addNoteValue?.author ? (
                (() => {
                  const { firstLetter, bgColor } = titleNameAlpha(addNoteValue?.creator_name || addNoteValue?.created_by || addNoteValue?.user_name || addNoteValue?.author || 'U');
                  return (
                    <div className='flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-semibold text-white shadow-md ring-2 ring-white' style={{ backgroundColor: bgColor || '#6366f1' }}>
                      {firstLetter}
                    </div>
                  );
                })()
              ) : (
                <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-400 to-slate-600 text-lg font-semibold text-white shadow-md ring-2 ring-white'>
                  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0A7 7 0 013 18z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className='flex min-w-0 flex-col gap-0.5'>
              <span className='truncate text-sm font-semibold text-slate-800'>
                {addNoteValue?.creator_name || addNoteValue?.created_by || addNoteValue?.user_name || addNoteValue?.author || 'Unknown User'}
              </span>
              <div className='flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500'>
                <FaClock className='shrink-0 text-slate-400' />
                <span>{formatDateDMY(entry_time)}</span>
                <span className='text-slate-300'>·</span>
                <span>{formatTimestampToTime(entry_time)}</span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 justify-center sm:justify-end">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={aiLoading}
              onClick={() => handleEnhancedWithAI(addNoteValue.note_id || addNoteValue.noteHeader?.note_id || addNoteValue.id || addNoteValue._id)}
            >
              {aiLoading ? 'Processing…' : 'Enhanced with AI'}
            </button>
          </div>
          <div className="flex shrink-0 justify-center sm:justify-end sm:min-w-[9rem]">
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              <span className="text-slate-400">Last save</span>
              <span className="tabular-nums text-slate-700">
                {(() => {
                  const saveTime = addNoteValue.autoSaveTime ?? addNoteValue.last_updated;
                  const valid = saveTime != null && saveTime !== "" && Number(saveTime) > 0;
                  const displayTime = valid ? saveTime : Math.floor(Date.now() / 1000);
                  return formatTimestampToTimeSeconds(displayTime);
                })()}
              </span>
            </span>
          </div>
        </div>
        <div
          id="editorjs"
          className="editor-content min-h-[280px] w-full rounded-xl border border-gray-200 bg-slate-50/40 p-4 shadow-inner ring-1 ring-gray-200"
        />
           <div className='space-y-3'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <label className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Tags</label>
            {addNoteValue.tags && addNoteValue.tags.length > 1 &&
              <motion.div 
                whileHover={{scale:1.02}}
                className='flex cursor-pointer items-center gap-2 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-rose-600'
                onClick={handleAllTagRemove}  
              >
                <span>Remove all</span>
                <span className='rounded-full bg-white/20 p-1 text-[10px]'><FaTrash /></span>
              </motion.div>
            }
          </div>
          <div className='flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm'>
            {addNoteValue.tags?.map((ele, i) => (
              <div 
                key={i} 
                className='flex items-center gap-2 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm'
              >
                <span>{ele.label}</span>
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleRemoveTag(i)}
                  className='cursor-pointer rounded-full bg-white/20 p-0.5 text-indigo-100 hover:bg-white/30'
                >
                  <FaXmark className="h-3.5 w-3.5" />
                </motion.span>
              </div>
            ))}
            <input 
              className='min-w-[8rem] flex-1 rounded-lg border-0 bg-transparent py-2 pl-2 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400'
              type='text' 
              value={addNoteValue.tag_name}
              name='tag_name' 
              onChange={handleChangeEditor}
              placeholder='Add a tag — press Enter'
              onKeyDown={handleAddTag}
            />
          </div>
        </div>

        <div className="flex">
        </div>
        
        {/* Attachments display - only shows files uploaded through drop/select button */}
        <div className="flex mt-[20px] flex-wrap gap-2">
            {addNoteValue.attachements?.map((file, index) => (
                <div key={index} className="mr-[10px] text-center relative group">
                    <div
                        className="cursor-pointer relative inline-block"
                        title={`Download ${file.FILE_NAME || file.file_name || file.name || 'file'}`}
                        onClick={() => handleDownloadFile(file)}
                    >
                        {renderFilePreview(file, index)}
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 group-hover:bg-black/20 transition-colors duration-150 pointer-events-none" />
                    </div>
                    <motion.span
                        whileHover={{ scale: 1.2 }}
                        className="absolute -top-[9px] -right-[7px] bg-red-500 p-[4px] rounded-full border-2 border-gray-200 text-white text-[12px] cursor-pointer z-10"
                        onClick={(e) => { e.stopPropagation(); handleRemoveFile(file, addNoteValue, index); }}
                    >
                        <HiXMark />
                    </motion.span>
                    {uploadProgress[file?.FILE_NAME] !== undefined && (
                        <div className="w-[80%] bg-gray-200 rounded-full h-2.5 absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2">
                            <div
                                className="bg-blue-500 h-2.5 rounded-full"
                                style={{ width: `${uploadProgress[file?.FILE_NAME]}%` }}
                            ></div>
                        </div>
                    )}
                    <p className="text-xs mt-1 truncate w-[100px] group-hover:text-blue-600 transition-colors">
                        {file.FILE_NAME || file.file_name || file.name || 'file'}
                    </p>
                </div>
            ))}
        </div>

        {/* New file preview section */}
        {filePreviews.length > 0 && (
            <div className="mt-4">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Selected files — uploaded when you save</h4>
                <div className="flex flex-wrap gap-2">
                    {filePreviews.map((preview) => (
                        <div key={preview.id} className="relative">
                            {renderFilePreviewComponent(preview)}
                            <motion.span
                                whileHover={{ scale: 1.2 }}
                                className="absolute -top-[9px] -right-[7px] bg-red-500 p-[4px] rounded-full border-2 border-gray-200 text-white text-[12px] cursor-pointer"
                                onClick={() => handleRemoveFilePreview(preview.id)}
                            >
                                <HiXMark />
                            </motion.span>
                        </div>
                    ))}
                </div>
            </div>
        )}
    
        {/* File drop zone */}
        <div
            onClick={handleClick}
            onDrop={handleDropWithPreview}
            onDragOver={(e) => e.preventDefault()}
            className="group cursor-pointer rounded-xl border-2 border-dashed border-gray-200 bg-gradient-to-b from-slate-50/80 to-white px-6 py-10 text-center transition hover:border-gray-300 hover:bg-slate-50/50"
        >
            <input
                type="file"
                multiple
                onChange={handleFileChangeWithPreview}
                ref={fileInputRef}
                className="hidden"
                id="file-input"
            />
            <p className="text-sm font-medium text-slate-600 group-hover:text-slate-800">
              Drop files here or <span className="text-slate-700 underline decoration-gray-300 underline-offset-2">browse</span>
            </p>
            <p className="mt-1 text-xs text-slate-400">Images, PDFs, and documents</p>
        </div>
        
        <div className="flex justify-end border-t border-gray-200 pt-6">
            <CustomButton 
                title="Update"
                type="button"
                className="min-w-[7rem]"
                loading={updating || addNoteValue.loading}
                onClick={handleUpdateWithFiles}
            />
        </div>
      </div>
    </div>

    {addNoteValue.confirm && 
        <ConfirmationDialog 
            openDialog = {addNoteValue.confirm}
            handleOpen = {toggleHandleConfirmTag}
            handleConfirm = {confirmRemoveAllTags}
            message = "Are you sure you want to remove all tags ?"
            title = "Tags Remove Confirmation"
        />
    }
    </>
  )
}

export default UpdateNoteData