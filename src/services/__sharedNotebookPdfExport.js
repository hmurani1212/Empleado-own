import jsPDF from 'jspdf';

/** Normalize API payload to a flat array of note objects. */
function normalizeSharedNotebookNotes(dbData) {
  if (dbData == null) return [];
  if (Array.isArray(dbData)) return dbData;
  if (Array.isArray(dbData.notes)) return dbData.notes;
  return [];
}

function formatContent(content) {
  if (content == null || content === undefined) return '';
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === 'object' && item !== null) {
          return Object.values(item)
            .map((v) => formatContent(v))
            .filter(Boolean)
            .join(' ');
        }
        return String(item);
      })
      .filter(Boolean)
      .join('\n');
  }
  if (typeof content === 'object') {
    return Object.values(content)
      .map((v) => formatContent(v))
      .filter(Boolean)
      .join(' ');
  }
  return String(content);
}

/** Strip HTML to plain text (browser). */
function htmlToPlain(html) {
  if (html == null) return '';
  const raw = formatContent(html);
  if (typeof document === 'undefined') {
    return String(raw)
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  const div = document.createElement('div');
  div.innerHTML = String(raw);
  return (div.textContent || div.innerText || '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Extract EditorJS blocks from a note (same shapes as EditorData). */
function getBlocksFromNote(note) {
  if (!note || typeof note !== 'object') return [];
  let ec = note.note?.editor_content ?? note.editor_content;
  if (!ec && note.note) {
    ec = note.note.editor_content ?? note.note;
  }
  if (ec == null) return [];

  try {
    if (typeof ec === 'string') {
      const parsed = JSON.parse(ec);
      if (parsed?.blocks) return parsed.blocks;
      if (parsed?.editor_content != null) {
        const inner =
          typeof parsed.editor_content === 'string'
            ? JSON.parse(parsed.editor_content)
            : parsed.editor_content;
        return inner?.blocks || [];
      }
      return [];
    }
    if (typeof ec === 'object') {
      if (ec.blocks) return ec.blocks;
      if (ec.editor_content != null) {
        const inner =
          typeof ec.editor_content === 'string' ? JSON.parse(ec.editor_content) : ec.editor_content;
        return inner?.blocks || [];
      }
    }
  } catch {
    return [];
  }
  return [];
}

function blockToPlainText(block) {
  if (!block || !block.type) return '';
  const parts = [];
  switch (block.type) {
    case 'header': {
      const t = htmlToPlain(block.data?.text);
      const level = block.data?.level || 3;
      const prefix = level === 1 ? '# ' : level === 2 ? '## ' : '### ';
      parts.push(prefix + t);
      break;
    }
    case 'paragraph':
      parts.push(htmlToPlain(block.data?.text));
      break;
    case 'list': {
      const items = block.data?.items || [];
      const ordered = block.data?.style === 'ordered';
      items.forEach((item, i) => {
        const line = ordered ? `${i + 1}. ${htmlToPlain(item)}` : `• ${htmlToPlain(item)}`;
        parts.push(line);
      });
      break;
    }
    case 'table': {
      const rows = block.data?.content || [];
      rows.forEach((row) => {
        if (!Array.isArray(row)) return;
        parts.push(row.map((cell) => htmlToPlain(cell)).join(' | '));
      });
      break;
    }
    case 'quote': {
      parts.push('> ' + htmlToPlain(block.data?.text));
      if (block.data?.caption) parts.push(htmlToPlain(block.data.caption));
      break;
    }
    case 'code':
      parts.push(String(formatContent(block.data?.code) || ''));
      break;
    case 'image':
      parts.push('[Image]' + (block.data?.caption ? `: ${block.data.caption}` : ''));
      break;
    case 'checklist':
      (block.data?.items || []).forEach((item) => {
        const mark = item.checked ? '[x]' : '[ ]';
        parts.push(`${mark} ${htmlToPlain(item.text)}`);
      });
      break;
    case 'raw':
      parts.push(htmlToPlain(block.data?.html));
      break;
    default:
      parts.push(htmlToPlain(block.data?.text ?? formatContent(block)));
  }
  return parts.filter(Boolean).join('\n');
}

function noteToPlainBody(note) {
  const blocks = getBlocksFromNote(note);
  if (!blocks.length) return '';
  return blocks.map((b) => blockToPlainText(b)).filter(Boolean).join('\n\n');
}

function noteTitle(note) {
  return (
    note?.note_title ||
    note?.note?.note_title ||
    note?.title ||
    'Untitled note'
  );
}

/**
 * Build and trigger download of a PDF for a shared notebook.
 * @param {string} notebookName
 * @param {Array} notes - raw notes from download API
 */
export function downloadSharedNotebookPdf(notebookName, notes) {
  const safeName = String(notebookName || 'notebook').replace(/[^a-z0-9_\- ]/gi, '_');
  const downloadedAt = new Date().toLocaleString();

  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxW = pageW - 2 * margin;
  let y = margin;

  const ensureSpace = (mm) => {
    if (y + mm > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const addLines = (text, fontSize = 10, style = 'normal') => {
    const body = text == null ? '' : String(text);
    doc.setFont('helvetica', style);
    doc.setFontSize(fontSize);
    const lh = fontSize * 0.48;
    const lines = doc.splitTextToSize(body, maxW);
    lines.forEach((line) => {
      ensureSpace(lh + 1);
      doc.text(line, margin, y);
      y += lh;
    });
  };

  /** Notebook title: top center (may wrap). */
  const titleText = String(notebookName || 'Notebook');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  const nbTitleLines = doc.splitTextToSize(titleText, maxW);
  const nbTitleLh = 18 * 0.48;
  nbTitleLines.forEach((line) => {
    ensureSpace(nbTitleLh + 1);
    doc.text(line, pageW / 2, y, { align: 'center' });
    y += nbTitleLh;
  });

  y += 2;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(90);
  ensureSpace(10);
  doc.text(`Exported: ${downloadedAt}`, pageW - margin, y, { align: 'right' });
  y += 10;
  doc.setTextColor(0);

  const list = normalizeSharedNotebookNotes(notes);
  if (!list.length) {
    addLines('No notes in this notebook.', 11, 'normal');
    doc.save(`${safeName}.pdf`);
    return;
  }

  list.forEach((note, idx) => {
    ensureSpace(20);
    if (idx > 0) {
      y += 6;
      doc.setDrawColor(220);
      doc.line(margin, y, pageW - margin, y);
      y += 8;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    const title = noteTitle(note);
    const noteHeader = `Note #${String(idx + 1).padStart(2, '0')} ${title}`;
    const headerLines = doc.splitTextToSize(noteHeader, maxW);
    const titleLh = 13 * 0.48;
    headerLines.forEach((line) => {
      ensureSpace(titleLh + 1);
      doc.text(line, margin, y);
      y += titleLh;
    });

    y += 2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const body = noteToPlainBody(note);
    if (!body.trim()) {
      doc.setTextColor(120);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      addLines('(No content)', 10, 'normal');
      doc.setTextColor(0);
    } else {
      addLines(body, 10, 'normal');
    }
  });

  doc.save(`${safeName}.pdf`);
}
