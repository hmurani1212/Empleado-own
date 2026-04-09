/**
 * Notes Pool — attachment rows from upload API and payloads for update_note_content.
 */

/**
 * Extract attachment row(s) from upload_attachment API response (shape varies by backend).
 * @param {object} responseData - axios response.data
 * @returns {unknown[]}
 */
function extractUploadedAttachmentRowsFromShape(responseData) {
  if (!responseData || typeof responseData !== 'object') return [];

  const ins =
    responseData.INSERTED_DATA ??
    responseData.inserted_data ??
    responseData.DB_DATA?.INSERTED_DATA ??
    responseData.DB_DATA?.inserted_data ??
    responseData.DB_DATA?.attachment;

  if (ins != null) {
    if (Array.isArray(ins)) return ins;
    return [ins];
  }

  const db = responseData.DB_DATA;
  if (db && typeof db === 'object') {
    if (Array.isArray(db)) return db;
    if (db.FILE_NAME || db.file_name || db.REC_ID || db.rec_id || db.FILE_ID || db.file_id) {
      return [db];
    }
  }

  return [];
}

/**
 * @param {object} responseData - axios response.data
 */
export function extractUploadedAttachmentRows(responseData) {
  let rows = extractUploadedAttachmentRowsFromShape(responseData);
  if (rows.length === 0 && responseData?.data && typeof responseData.data === 'object') {
    rows = extractUploadedAttachmentRowsFromShape(responseData.data);
  }
  return rows;
}

/**
 * Dedupe and merge payload + React state attachment lists for update calls.
 */
export function mergeAttachmentListsForUpdate(payloadList, stateList) {
  const list = [...(stateList || []), ...(payloadList || [])];
  const seen = new Set();
  const out = [];
  for (const f of list) {
    if (f == null) continue;
    const id = f.REC_ID ?? f.rec_id ?? f.FILE_ID ?? f.file_id ?? f.id;
    const key =
      id != null
        ? `id:${id}`
        : `n:${f.FILE_NAME || f.file_name || f.name || ''}-${f.size ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(f);
  }
  return out;
}

/**
 * Omit inline images from attachment payload (handled in editor blocks); keep PDFs/docs/etc.
 * Rows without mime type are kept (legacy API rows).
 */
export function filterAttachmentsForNoteUpdatePayload(files) {
  return (files || []).filter((file) => {
    const mimeType =
      file.FILE_MIME ||
      file.type ||
      file.mimeType ||
      file.mime_type ||
      file.file_type;
    if (mimeType == null || mimeType === '') return true;
    return !String(mimeType).toLowerCase().startsWith('image/');
  });
}
