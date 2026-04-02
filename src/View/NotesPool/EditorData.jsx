import React, { useEffect, useMemo, useState } from 'react'
import profileImage from '../../assets/images/userProfileNote.png'
import { formatDateDMY, formatTimestampToTime } from '../../services/__dateTimeServices'
import { FaClock } from 'react-icons/fa6'
import { Checkbox, Typography } from '@material-tailwind/react';
import { titleNameAlpha } from '../../services/appServices';

import SyntaxHighlighter from 'react-syntax-highlighter';
import solarizedlight from 'react-syntax-highlighter';

import { FaFilePdf } from "react-icons/fa6";
import { FaFileAlt, FaFileExcel, FaFileWord, FaFileVideo } from "react-icons/fa";
import { motion } from 'framer-motion'

const renderFilePreview = (file, index) => {

  // Add null checks and handle different file object structures
  if (!file) {
    return <FaFileAlt className="w-[100px] h-[100px] object-cover rounded-lg" />;
  }

  // Check for different possible mime type properties
  const mimeType = file.FILE_MIME || file.type || file.mimeType || file.mime_type || file.file_type;
  const recId = file.REC_ID || file.rec_id;
  const fileName = file.FILE_NAME || file.file_name || file.name;
  
  // Construct URL using the specified format: https://elephant.veevotech.com/files/recid/filename
  let fileUrl = file.FILE_URL || file.url || file.preview;
  if (!fileUrl && recId && fileName && fileName !== 'Unknown file') {
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
          console.error('Image failed to load:', fileUrl);
          e.target.style.display = 'none';
          // Show fallback icon
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
          console.error('Video failed to load:', fileUrl);
          e.target.style.display = 'none';
          // Show fallback icon
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
                console.error('Image failed to load:', fileUrl);
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
                console.error('Video failed to load:', fileUrl);
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



// Helper: extract only values (no keys) from a value for display
const valuesOnly = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value.trim() ? value : '';
  }
  if (Array.isArray(value)) {
    return value.map((item) => valuesOnly(item)).filter(Boolean).join('\n');
  }
  if (typeof value === 'object') {
    const parts = Object.values(value).map((v) => valuesOnly(v)).filter(Boolean);
    return parts.join('\n');
  }
  return String(value);
};

// Helper function to format content and handle objects (show values only, no keys)
const formatContent = (content) => {
  if (content === null || content === undefined) {
    return '';
  }
  
  if (typeof content === 'string') {
    return content;
  }
  
  if (typeof content === 'object') {
    if (Array.isArray(content)) {
      return content.map((item) => {
        if (typeof item === 'object' && item !== null) {
          return valuesOnly(item);
        }
        return String(item);
      }).filter(Boolean).join('\n');
    }
    return valuesOnly(content);
  }
  
  return String(content);
};

// Note content from API/JSON is often HTML-entity encoded. Feeding `&lt;code&gt;...&lt;/code&gt; &amp; ...`
// into dangerouslySetInnerHTML leaves markup as visible text. Decode (repeat for double-encoding) first.
const decodeHtmlEntities = (str) => {
  if (str == null) return '';
  let s = String(str);
  if (typeof document === 'undefined') return s;
  let prev = '';
  let guard = 0;
  const textarea = document.createElement('textarea');
  while (s !== prev && guard < 6) {
    prev = s;
    textarea.innerHTML = s;
    s = textarea.value;
    guard += 1;
  }
  return s;
};

const htmlForNoteView = (raw) => decodeHtmlEntities(formatContent(raw));

const RenderEditorContent = ({ data }) => {
  const renderBlock = (block, index) => {
    if (block == null || typeof block !== 'object') return null;
    switch (block.type) {
      case 'header':
        let headerText = block.data.text || '';
        if (typeof headerText === 'object' && headerText !== null) {
          headerText = formatContent(headerText);
        }
        const headerHtml = htmlForNoteView(headerText);
        return (
          <div className='my-4' key={index}>
            {block.data.level === 1 ? (
              <h1 key={index} dangerouslySetInnerHTML={{ __html: headerHtml }} />
            ) : block.data.level === 2 ? (
              <h2 key={index} dangerouslySetInnerHTML={{ __html: headerHtml }} />
            ) : (
              <h3 key={index} dangerouslySetInnerHTML={{ __html: headerHtml }} />
            )
            }
          </div>
        )

      case 'paragraph':
        // Handle object content properly
        let paragraphText = block?.data?.text || '';
        if (typeof paragraphText === 'object' && paragraphText !== null) {
          paragraphText = formatContent(paragraphText);
        }
        return (
          <div className='my-4 min-w-0 break-words' key={index}>
            <p
              key={index}
              dangerouslySetInnerHTML={{ __html: htmlForNoteView(paragraphText) }}
              className="paragraph-content break-words"
            />
          </div>
        );
      //  case 'paragraph':
      // return(
      //   <div className='my-6' key={index}>
      //     <p 
      //       key={index} 
      //       dangerouslySetInnerHTML={{ __html: block?.data?.text }}
      //       className="paragraph-content"
      //     />
      //   </div>
      // );

      case 'list':

        return (
          <div className='my-4' key={index}>
            {block.data.style === 'unordered' ? (
              <ul key={index} className='list-disc pl-6 list-outside'>
                {block.data.items.map((item, idx) => {
                  let itemText = item;
                  if (typeof item === 'object' && item !== null) {
                    itemText = formatContent(item);
                  }
                  return <li key={idx} className='pl-1' dangerouslySetInnerHTML={{ __html: htmlForNoteView(itemText) }} />;
                })}
              </ul>
            ) : (
              <ol key={index} className='list-decimal pl-6 list-outside'>
                {block.data.items.map((item, idx) => {
                  let itemText = item;
                  if (typeof item === 'object' && item !== null) {
                    itemText = formatContent(item);
                  }
                  return <li key={idx} className='pl-1' dangerouslySetInnerHTML={{ __html: htmlForNoteView(itemText) }} />;
                })}
              </ol>
            )
            }
          </div>
        )

      case 'table':
        return (
          <div className='my-4 overflow-x-auto' key={index}>
            <table className='w-full table-auto my-4 editor-note-table'>
              <thead>
                <tr>
                  {block.data.content[0].map((headerCell, headerIndex) => {
                    let headerText = headerCell;
                    if (typeof headerCell === 'object' && headerCell !== null) {
                      headerText = formatContent(headerCell);
                    }
                    return (
                      <th key={headerIndex} className='border-b border-blue-gray-100 bg-blue-gray-50 p-4 text-left align-top min-w-0 max-w-[50%]'>
                        <Typography
                          variant="small"
                          className="text-[#474747] break-words whitespace-normal"
                        >
                          <span dangerouslySetInnerHTML={{ __html: htmlForNoteView(headerText) }} />
                        </Typography>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {block.data.content.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => {
                      let cellText = cell;
                      if (typeof cell === 'object' && cell !== null) {
                        cellText = formatContent(cell);
                      }
                      return (
                        <td key={cellIndex} className='p-4 border-b border-blue-gray-100 text-left align-top min-w-0 max-w-[50%]'>
                          <Typography
                            variant="small"
                            className="font-normal leading-snug opacity-100 text-[#474747] break-words whitespace-normal"
                          >
                            <span dangerouslySetInnerHTML={{ __html: htmlForNoteView(cellText) }} />
                          </Typography>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'checklist':
        return (
          <div className='flex flex-col' key={index}>
            {block.data.items.map((item, idx) => {
              let itemText = item.text || '';
              if (typeof itemText === 'object' && itemText !== null) {
                itemText = formatContent(itemText);
              }
              return (
                <Checkbox key={idx} color='blue' checked={item.checked} readOnly label={
                  <Typography>
                    <span dangerouslySetInnerHTML={{ __html: htmlForNoteView(itemText) }} className="break-words" />
                  </Typography>
                } />
              );
            })}
          </div>
        );

      case 'raw':
        return <div className='my-4' key={index} dangerouslySetInnerHTML={{ __html: htmlForNoteView(block.data.html) }} />;

      case 'quote':
        let quoteText = block.data.text || '';
        if (typeof quoteText === 'object' && quoteText !== null) {
          quoteText = formatContent(quoteText);
        }
        let quoteCaption = block.data.caption || '';
        if (typeof quoteCaption === 'object' && quoteCaption !== null) {
          quoteCaption = formatContent(quoteCaption);
        }
        return (
          <blockquote key={index} className='space-y-1 my-4'>
            <p dangerouslySetInnerHTML={{ __html: htmlForNoteView(quoteText) }} />
            <cite dangerouslySetInnerHTML={{ __html: htmlForNoteView(quoteCaption) }} />
          </blockquote>
        );

      case 'image':
        return (
          <figure key={index} className='my-4'>
            <img src={block.data.file.url} alt={block.data.caption} />
            <figcaption>{block.data.caption}</figcaption>
          </figure>
        );

      case 'code':
        let codeText = block.data.code || '';
        if (typeof codeText === 'object' && codeText !== null) {
          codeText = formatContent(codeText);
        }
        return (
          <SyntaxHighlighter key={index} language={block.data.language || 'javascript'} style={solarizedlight}>
            {decodeHtmlEntities(String(formatContent(codeText)))}
          </SyntaxHighlighter>
        );

      default:
        let defaultContent = '';
        if (typeof block === 'string') {
          defaultContent = block.split(".")
            .map(s => s.trim())
            .filter(Boolean)
            .join('\n');
        } else if (typeof block === 'object' && block !== null) {
          defaultContent = formatContent(block);
        }
        return <div className='my-4' key={index}>
          <p
            key={index}
            dangerouslySetInnerHTML={{
              __html: htmlForNoteView(defaultContent)
            }}
          >
          </p>
        </div>;
    }
  };

  const safeBlocks = Array.isArray(data) ? data.filter((b) => b != null) : [];
  return (
    <div>
      {safeBlocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
};



const EditorData = (props) => {
  const { editorData } = props
  // console.log("what is the Editor Data:",  editorData);
  const [attachments, setAttachments] = useState([]);

  // Process attachments from different possible sources
  useEffect(() => {

    // Check if attachments are in the note object
    if (editorData?.note?.attachments) {
      setAttachments(editorData.note.attachments);
      return;
    }

    // Check if attachments are directly in editorData
    if (editorData?.attachments) {
      setAttachments(editorData.attachments);
      return;
    }

    // Check if attachments are in attachements (with typo)
    if (editorData?.attachements) {
      setAttachments(editorData.attachements);
      return;
    }

    // Check if attachments are in notes_attachment
    if (editorData?.notes_attachment) {
      setAttachments(editorData.notes_attachment);
      return;
    }

    setAttachments([]);
  }, [editorData]);

  // Try different possible structures for blocks
  const blocks = useMemo(() => {

    // Check if editor_content is nested in note object
    if (editorData?.note?.editor_content?.editor_content) {
      try {
        const nestedContent = typeof editorData.note.editor_content.editor_content === 'string'
          ? JSON.parse(editorData.note.editor_content.editor_content)
          : editorData.note.editor_content.editor_content;
        if (nestedContent?.blocks) {
          return nestedContent.blocks;
        }
      } catch (error) {
        console.error("Error parsing nested editor_content:", error);
      }
    }

    // Check if editor_content is a string that needs parsing
    if (editorData?.editor_content && typeof editorData.editor_content === 'string') {
      try {
        const parsedContent = JSON.parse(editorData.editor_content);
        if (parsedContent?.blocks) {
          return parsedContent.blocks;
        }
      } catch (error) {
        console.error("Error parsing editor_content string:", error);
      }
    }

    // Check if editor_content is already parsed (from handleNoteHandler)
    if (editorData?.editor_content?.blocks) {
      return editorData.editor_content.blocks;
    }

    // Check if editor_content is a parsed object with blocks (from getNoteData)
    if (editorData?.editor_content && typeof editorData.editor_content === 'object' && editorData.editor_content.blocks) {
      return editorData.editor_content.blocks;
    }

    // Check if editor_content is a parsed object with blocks
    if (editorData?.editor_content?.blocks) {
      return editorData.editor_content.blocks;
    }

    // Check if editor_content is an array of blocks directly
    if (Array.isArray(editorData?.editor_content)) {
      return editorData.editor_content;
    }

    // Check if blocks exist directly on editorData
    if (editorData?.blocks) {
      return editorData.blocks;
    }

    // Check for nested editor_content structure
    if (editorData?.editor_content?.editor_content) {
      try {
        const nestedContent = typeof editorData.editor_content.editor_content === 'string'
          ? JSON.parse(editorData.editor_content.editor_content)
          : editorData.editor_content.editor_content;
        if (nestedContent?.blocks) {
          return nestedContent.blocks;
        }
      } catch (error) {
        console.error("Error parsing nested editor_content:", error);
      }
    }

    // No valid blocks structure found (e.g. editor_content is "" or missing) — show empty content
    return [];
  }, [editorData]);

  return (
    <>
      <style>
        {`
          .editor-note-content,
          .editor-note-content .paragraph-content,
          .editor-note-content p,
          .editor-note-content ul,
          .editor-note-content ol,
          .editor-note-content li,
          .editor-note-content h1,
          .editor-note-content h2,
          .editor-note-content h3,
          .editor-note-content blockquote {
            color: #474747;
          }
          
          .editor-note-content ul,
          .editor-note-content ol {
            padding-left: 1.5rem;
            list-style-position: outside;
            margin-left: 0;
          }
          
          .editor-note-content ul {
            list-style-type: disc;
          }
          
          .editor-note-content ol {
            list-style-type: decimal;
          }
          
          .editor-note-content li {
            padding-left: 0.35rem;
            margin-bottom: 0.25rem;
            display: list-item;
          }
          
          .editor-note-content > div:last-child {
            margin-bottom: 0 !important;
          }
          
          .paragraph-content .cdx-marker {
            background-color: #fcf392;
            padding: 2px 4px;
            border-radius: 2px;
            font-weight: 500;
          }
          
          .paragraph-content mark.cdx-marker {
            background-color: #fcf392;
            padding: 2px 4px;
            border-radius: 2px;
            font-weight: 500;
          }
          
          .paragraph-content em,
          .editor-note-content em {
            font-style: italic;
          }
          
          .paragraph-content strong,
          .paragraph-content b,
          .editor-note-content strong,
          .editor-note-content b {
            font-weight: bold;
          }
          
          .paragraph-content u,
          .editor-note-content u {
            text-decoration: underline;
          }
          
          .paragraph-content code.inline-code {
            background-color: #f4f4f4;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: monospace;
          }
          
          .paragraph-content a {
            color: #1976d2;
            text-decoration: underline;
          }
          
          .editor-note-content {
            overflow-wrap: break-word;
            word-wrap: break-word;
            word-break: break-word;
          }
          
          .editor-note-content .editor-note-table {
            table-layout: fixed;
          }
          
          .editor-note-content .editor-note-table th,
          .editor-note-content .editor-note-table td {
            overflow-wrap: break-word;
            word-wrap: break-word;
            word-break: break-word;
            white-space: normal;
          }
        `}
      </style>
      <div className='w-full max-w-[1100px] mx-auto space-y-4 pb-0 overflow-hidden'>
        <div className='flex items-center justify-between border-b pb-4'>
          <div className='flex items-center gap-4'>
            {/* Beautiful user avatar with initials */}
            <div className='relative'>
              {editorData?.creator_name || editorData?.created_by || editorData?.user_name || editorData?.author ? (
                (() => {
                  const { firstLetter, bgColor } = titleNameAlpha(editorData?.creator_name || editorData?.created_by || editorData?.user_name || editorData?.author || 'U');
                  return (
                    <div className='flex items-center justify-center w-14 h-14 rounded-full text-white text-lg font-semibold shadow-lg ring-2 ring-white' style={{ backgroundColor: bgColor || '#6366f1' }}>
                      {firstLetter}
                    </div>
                  );
                })()
              ) : (
                <div className='flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 text-white text-lg font-semibold shadow-lg ring-2 ring-white'>
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0A7 7 0 013 18z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className='flex flex-col gap-1'>
              <div className='flex items-center gap-2'>
                <span className='text-[14px] font-semibold text-gray-800'>
                  {editorData?.creator_name || editorData?.created_by || editorData?.user_name || editorData?.author || 'Unknown User'}
                </span>
              </div>
              <div className='flex items-center gap-2 text-[12px] text-gray-600'>
                <FaClock className='text-gray-500' />
                <span>{editorData.last_updated ? formatDateDMY(editorData.last_updated) : 'N/A'}</span>
                <span className='text-gray-400'>•</span>
                <span>{editorData.last_updated ? formatTimestampToTime(editorData.last_updated) : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className='px-10 editor-note-content pb-0'>
          <RenderEditorContent
            data={blocks}
          />
        </div>

        {/* Display attachments if any exist */}
        {attachments && attachments.length > 0 && (
          <div className='px-10'>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments:</h4>
            <div className='grid grid-cols-6 gap-3'>
              {attachments.map((file, i) => (
                <div key={i} className="text-center">
                  {renderFilePreview(file, i)}
                  <p className="text-xs mt-1 truncate w-[100px]">{file.file_name || file.FILE_NAME || file.name || 'Unknown file'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default EditorData