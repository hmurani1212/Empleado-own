import React, { useEffect, useMemo, useState } from 'react'
import profileImage from '../../assets/images/userProfileNote.png'
import { formatDateDMY, formatTimestampToTime } from '../../services/__dateTimeServices'
import { FaClock, FaPaperclip } from 'react-icons/fa6'
import { Checkbox, Typography } from '@material-tailwind/react';
import { titleNameAlpha } from '../../services/appServices';
import { getLocalStorage } from '../../Authentication/localStorageServices';

import SyntaxHighlighter from 'react-syntax-highlighter';
import solarizedlight from 'react-syntax-highlighter';

import { FaFilePdf } from "react-icons/fa6";
import { FaFileAlt, FaFileExcel, FaFileWord, FaFileVideo } from "react-icons/fa";
import { motion } from 'framer-motion'

/** Thumbnails for attachment list. `compact` uses smaller icons/previews for a denser grid. */
const renderFilePreview = (file, index, compact = false) => {
  const thumb = compact ? 'h-12 w-12' : 'h-[72px] w-[72px]';
  const icon = compact ? 'h-10 w-10' : 'h-14 w-14';
  const rounded = compact ? 'rounded-md' : 'rounded-lg';

  // Add null checks and handle different file object structures
  if (!file) {
    return <FaFileAlt className={`${icon} shrink-0 ${rounded} object-cover text-slate-400`} />;
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
        className={`${thumb} shrink-0 object-cover ${rounded}`}
        onError={(e) => {
          console.error('Image failed to load:', fileUrl);
          e.target.style.display = 'none';
          // Show fallback icon
          const fallback = document.createElement('div');
          fallback.innerHTML = '<FaFileAlt class="w-10 h-10 object-cover rounded-md text-slate-400" />';
          e.target.parentNode.appendChild(fallback.firstChild);
        }}
      />
    );
  } else if (mimeType && mimeType.startsWith("video/")) {
    return (
      <video
        src={fileUrl}
        className={`${thumb} shrink-0 object-cover ${rounded}`}
        controls={false}
        onError={(e) => {
          console.error('Video failed to load:', fileUrl);
          e.target.style.display = 'none';
          // Show fallback icon
          const fallback = document.createElement('div');
          fallback.innerHTML = '<FaFileVideo class="w-10 h-10 object-cover rounded-md text-blue-500" />';
          e.target.parentNode.appendChild(fallback.firstChild);
        }}
      />
    );
  } else {
    // Handle document types
    if (mimeType) {
      switch (mimeType) {
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          return <FaFileWord className={`${icon} shrink-0 ${rounded} object-cover text-blue-500`} />;
        case "application/vnd.ms-excel":
          return <FaFileExcel className={`${icon} shrink-0 ${rounded} object-cover text-green-500`} />;
        case "application/pdf":
          return <FaFilePdf className={`${icon} shrink-0 ${rounded} object-cover text-red-500`} />;
        default:
          return <FaFileAlt className={`${icon} shrink-0 ${rounded} object-cover text-slate-500`} />;
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
              className={`${thumb} shrink-0 object-cover ${rounded}`}
              onError={(e) => {
                console.error('Image failed to load:', fileUrl);
                e.target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.innerHTML = '<FaFileAlt class="w-10 h-10 object-cover rounded-md text-slate-400" />';
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
              className={`${thumb} shrink-0 object-cover ${rounded}`}
              controls={false}
              onError={(e) => {
                console.error('Video failed to load:', fileUrl);
                e.target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.innerHTML = '<FaFileVideo class="w-10 h-10 object-cover rounded-md text-blue-500" />';
                e.target.parentNode.appendChild(fallback.firstChild);
              }}
            />
          );
        case 'pdf':
          return <FaFilePdf className={`${icon} shrink-0 ${rounded} object-cover text-red-500`} />;
        case 'doc':
        case 'docx':
          return <FaFileWord className={`${icon} shrink-0 ${rounded} object-cover text-blue-500`} />;
        case 'xls':
        case 'xlsx':
          return <FaFileExcel className={`${icon} shrink-0 ${rounded} object-cover text-green-500`} />;
        default:
          return <FaFileAlt className={`${icon} shrink-0 ${rounded} object-cover text-slate-500`} />;
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
                      <th key={headerIndex} className='border-b border-gray-200 bg-slate-50 p-4 text-left align-top min-w-0 max-w-[50%]'>
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
                        <td key={cellIndex} className='p-4 border-b border-gray-200 text-left align-top min-w-0 max-w-[50%]'>
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
          <figure key={index} className="my-5 mx-auto max-w-xs sm:max-w-sm">
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-slate-50/50 shadow-sm">
              <img
                src={block.data.file.url}
                alt={block.data.caption || ''}
                className="mx-auto max-h-48 w-full object-contain sm:max-h-56"
              />
            </div>
            {block.data.caption ? (
              <figcaption className="mt-2 text-center text-xs text-slate-500">
                {block.data.caption}
              </figcaption>
            ) : null}
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

const EditorData = (props) => {
  const { editorData } = props

  useEffect(() => {
    console.log('editorData', editorData);
  });
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
            font-size: 15px;
            line-height: 1.7;
            letter-spacing: 0.01em;
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
      <div className="w-full mx-auto max-w-full overflow-hidden px-2.5 pb-6">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <div className="border-b border-gray-200 bg-gradient-to-b from-slate-50/80 to-white px-4 py-5 sm:px-6">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                {editorData?.creator_name || editorData?.created_by || editorData?.user_name || editorData?.author ? (
                  (() => {
                    const { firstLetter, bgColor } = titleNameAlpha(editorData?.creator_name || editorData?.created_by || editorData?.user_name || editorData?.author || 'U');
                    return (
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-semibold text-white shadow-md ring-2 ring-white"
                        style={{ backgroundColor: bgColor || '#6366f1' }}
                      >
                        {firstLetter}
                      </div>
                    );
                  })()
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-400 to-slate-600 text-lg font-semibold text-white shadow-md ring-2 ring-white">
                    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0A7 7 0 013 18z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800 sm:text-base">
                  {editorData?.creator_name || editorData?.content?.creator_name || editorData?.created_by || editorData?.user_name || editorData?.author || 'Unknown User'}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                  <FaClock className="shrink-0 text-slate-400" />
                  <span>{editorData.last_updated ? formatDateDMY(editorData.last_updated) : 'N/A'}</span>
                  <span className="text-slate-300">·</span>
                  <span>{editorData.last_updated ? formatTimestampToTime(editorData.last_updated) : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="editor-note-content px-4 py-6 sm:px-8 sm:py-8">
            <RenderEditorContent data={blocks} />
          </div>

          {attachments && attachments.length > 0 && (
            <div className="border-t border-gray-200 bg-slate-50/40 px-4 py-4 sm:px-8 sm:py-8">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-gray-200">
                  <FaPaperclip className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Attachments</h4>
                  <p className="text-xs text-slate-500">Click a file to download</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
                {attachments.map((file, i) => (
                  <motion.button
                    type="button"
                    key={i}
                    whileHover={{ y: -1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="group flex w-full flex-col items-center rounded-lg border border-gray-200 bg-white p-2 text-center shadow-sm transition hover:border-gray-300 hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    title={`Download ${file.file_name || file.FILE_NAME || file.name || 'file'}`}
                    onClick={() => handleDownloadFile(file)}
                  >
                    <div className="relative inline-block">
                      {renderFilePreview(file, i, true)}
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-md bg-black/0 transition-colors duration-150 group-hover:bg-black/10" />
                    </div>
                    <p
                      className="mt-1.5 line-clamp-2 w-full max-w-full break-all text-center text-[10px] leading-snug text-slate-600 group-hover:text-slate-900"
                      title={file.file_name || file.FILE_NAME || file.name || 'Unknown file'}
                    >
                      {file.file_name || file.FILE_NAME || file.name || 'Unknown file'}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default EditorData