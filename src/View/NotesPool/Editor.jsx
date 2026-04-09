import React, { useEffect, useRef, useState } from 'react';
import {motion} from 'framer-motion'
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Image from '@editorjs/image';
import Quote from '@editorjs/quote';
import Table from '@editorjs/table';
import Code from '@editorjs/code';
import Paragraph from '@editorjs/paragraph';
import Marker from '@editorjs/marker';
import { axiosInstanceFile, NotesPoolinstancemodeule, NotesPoolFileInstance } from '../../Model/base';
import useEditorService from '../../ViewModel/NotesPoolViewModel/EditorServices';
import { FaTrash, FaXmark } from 'react-icons/fa6';
import ConfirmationDialog from '../../Components/ConfirmationDialog/ConfirmationDialog';
import EditorFileUpload from './EditorFileUpload';
import CustomButton from '../../Components/CustomButton/CustomButton';
import { formatTimestampToTimeSeconds } from '../../services/__dateTimeServices';
import { serializeEditorContentForLegacyBackend } from '../../services/__notesPoolEditorContent';


const headerClasses = {
  1: 'text-4xl font-bold my-4',
  2: 'text-3xl font-bold my-3',
  3: 'text-2xl font-bold my-2',
  4: 'text-xl font-bold my-2',
  5: 'text-lg font-bold my-1',
};

const Editor = (props) => {

  const { addNoteValue, toggleEditorNote } = props

  const { editorContent, editorValue, handleChangeEditor, handleAddTag, handleRemoveTag, handleAllTagRemove,confirmRemoveAllTags, toggleHandleConfirmTag,
    files,handleDrop,handleFileChange,handleRemoveFile,handleClick,handleAllFileRemove,fileInputRef,uploadProgress,
    handleAddNotesData,
    settingEditorData
  } = useEditorService()

  useEffect(() => {
    if (addNoteValue) {
      settingEditorData(addNoteValue);
    }
  }, [addNoteValue?.note_id, addNoteValue?.id, addNoteValue?._id]);
  const editorInstance = useRef(null);

  // Helper function to save editor content to database (format: { time: ms, blocks, version })
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
        console.error('Note ID is undefined for saving AI response!');
        return;
      }
      
      const apiData = {
        note_id: noteId,
        editor_content: serializeEditorContentForLegacyBackend(normalized),
      };

      editorContent(apiData, addNoteValue.last_updated, currentTimeInSeconds);
    } catch (error) {
      console.error('Error saving editor content:', error);
    }
  };

  // AI functionality state
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

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

      // Send request to AI
          const response = await NotesPoolinstancemodeule.post(
            "http://172.18.0.34:8754/api/v1/enhance_notes",
            payload,
            { withCredentials: true }
          );

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
      console.error("Error sending content to AI:", error);
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
      console.log("Treating as single paragraph selection");
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
      } else {
        console.log(`Unknown or empty block type at index ${index}:`, block.type);
      }
    });
    
    const finalText = textParts.join('\n\n');
    
    return finalText;
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
    // Check if the holder element exists before initializing
    const holderElement = document.getElementById('editorjs');
    if (!holderElement) {
      console.warn('Editor holder element not found, skipping editor initialization');
      return;
    }

    editorInstance.current = new EditorJS({
      holder: 'editorjs',
      data: {
        time: new Date().getTime(),
        blocks: addNoteValue?.editor_content?.blocks || addNoteValue?.editorContent?.blocks || [],
      },
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
              // uploadByUrl(url) {
              //   return axios.post('https://your-api-endpoint.com/fetchUrl', { url })
              //     .then((response) => {
              //       return {
              //         success: 1,
              //         file: {
              //           url: response.data.url,
              //         },
              //       };
              //     })
              //     .catch((error) => {
              //       console.error('Error fetching image by URL:', error);
              //       return {
              //         success: 0,
              //         error: 'Image fetch failed',
              //       };
              //     });
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
      onChange() {
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
          editorContent(apiData, addNoteValue.last_updated, currentTimeInSeconds);
        }).catch((error) => {
          console.error('Error saving content:', error);
        });
      },
    });

    return () => {
      if (editorInstance.current) {
        try {
          // Check if the editor instance has the expected methods
          if (typeof editorInstance.current.destroy === 'function') {
            editorInstance.current.destroy();
          } else if (typeof editorInstance.current.clear === 'function') {
            editorInstance.current.clear();
          } else if (typeof editorInstance.current.isReady === 'function' && editorInstance.current.isReady()) {
            // If editor is ready but no destroy method, try to clear the content
            editorInstance.current.clear();
          }
        } catch (error) {
          console.warn('Error destroying editor instance:', error);
        } finally {
          editorInstance.current = null;
        }
      }
    };
  }, [addNoteValue.note_id]); // Add dependency to prevent unnecessary re-initializations

  return (
    <>
      <div className="w-full mx-auto px-2.5 pb-6">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)] px-5 sm:px-8 py-6 sm:py-8 space-y-6">
         <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
           <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
             <span className="text-slate-400">Last save</span>
             <span className="tabular-nums text-slate-700">
               {(() => {
                 const saveTime = editorValue.autoSave ?? editorValue.last_updated;
                 const valid = saveTime != null && saveTime !== "" && Number(saveTime) > 0;
                 const displayTime = valid ? saveTime : Math.floor(Date.now() / 1000);
                 return formatTimestampToTimeSeconds(displayTime);
               })()}
             </span>
           </span>
           <div>
             <button
               type="button"
               className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
               disabled={aiLoading}
               onClick={() => handleEnhancedWithAI(addNoteValue.note_id || addNoteValue.noteHeader?.note_id || addNoteValue.id || addNoteValue._id)}
             >
               {aiLoading ? 'Processing…' : 'Enhanced with AI'}
             </button>
           </div>
         </div>

        <div id="editorjs" className="editor-content min-h-[280px] w-full rounded-xl border border-gray-200 bg-slate-50/40 p-4 shadow-inner ring-1 ring-gray-200" />
        
        <div className='space-y-3'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <label className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Tags</label>
            {editorValue.tags.length > 1 &&
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
            {editorValue.tags?.map((ele, index) => (
              <div 
                key={ele.id || index} 
                className='flex items-center gap-2 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm'
              >
                <span>{ele.label}</span>
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleRemoveTag(ele)}
                  className='cursor-pointer rounded-full bg-white/20 p-0.5 text-indigo-100 hover:bg-white/30'
                >
                  <FaXmark className="h-3.5 w-3.5" />
                </motion.span>
              </div>
            ))}
            <input 
              className='min-w-[8rem] flex-1 rounded-lg border-0 bg-transparent py-2 pl-2 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400'
              type='text' 
              value={editorValue.tag_name}
              name='tag_name' 
              onChange={handleChangeEditor}
              placeholder='Add a tag — press Enter'
              onKeyDown={handleAddTag}
            />
          </div>

          
        </div>

        <EditorFileUpload 
          files = {files} 
          handleDrop = {handleDrop} 
          handleFileChange = {handleFileChange}
          handleRemoveFile = {handleRemoveFile}
          handleClick = {handleClick}
          handleAllFileRemove = {handleAllFileRemove}
          fileInputRef = {fileInputRef}
          addNoteValue = {addNoteValue}
          uploadProgress = {uploadProgress}
          editorValue = {editorValue}
        />
        <div className="flex justify-end border-t border-gray-200 pt-6">
            <CustomButton 
              title="Update"
              type="button"
              className="min-w-[7rem]"
              loading={editorValue.loading}
              onClick={async () => {
                try {
                  let payload = { ...addNoteValue };
                  if (editorInstance.current) {
                    const savedData = await editorInstance.current.save();
                    const timeMs = Date.now();
                    const normalized = {
                      time: timeMs,
                      blocks: savedData?.blocks ?? [],
                      version: savedData?.version ?? "2.31.0",
                    };
                    payload = {
                      ...addNoteValue,
                      editor_content: serializeEditorContentForLegacyBackend(normalized),
                      editorContent: normalized,
                    };
                  }
                  await handleAddNotesData(payload, toggleEditorNote);
                } catch (err) {
                  console.error("Update note failed:", err);
                  await handleAddNotesData(addNoteValue, toggleEditorNote);
                }
              }}
            />
          </div>

        </div>
      </div>

      {editorValue.confirm && 
        <ConfirmationDialog 
          openDialog = {editorValue.confirm}
          handleOpen = {toggleHandleConfirmTag}
          handleConfirm = {confirmRemoveAllTags}
          message = "Are you sure you want to remove all tags ?"
          title = "Tags Remove Confirmation"
        />
      }
    </>
  );
};

export default Editor;