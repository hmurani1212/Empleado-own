/**
 * Notes Pool / legacy PHP Empleado compatibility for EditorJS payloads.
 *
 * Legacy apps store note body as JSON with a nested shape so consumers read
 * `editor_content.editor_content` (inner string is the EditorJS OutputData JSON).
 * Flat `{ time, blocks, version }` alone may not round-trip for the PHP client.
 */

/**
 * @param {unknown} raw - EditorJS output, JSON string, or legacy `{ editor_content: ... }`
 * @returns {{ time: number, blocks: unknown[], version: string }}
 */
export function normalizeEditorJsToInner(raw) {
  let data = raw;
  if (data == null) {
    return { time: Date.now(), blocks: [], version: '2.31.0' };
  }
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      return { time: Date.now(), blocks: [], version: '2.31.0' };
    }
  }
  if (typeof data !== 'object' || data === null) {
    return { time: Date.now(), blocks: [], version: '2.31.0' };
  }
  // Legacy wrapper: { editor_content: "<json>" | object } without top-level blocks
  if ('editor_content' in data && !Array.isArray(data.blocks)) {
    const inner = data.editor_content;
    if (typeof inner === 'string') {
      try {
        data = JSON.parse(inner);
      } catch {
        return { time: Date.now(), blocks: [], version: '2.31.0' };
      }
    } else if (inner && typeof inner === 'object') {
      data = inner;
    }
  }
  let time = data.time != null ? Number(data.time) : Date.now();
  // Heuristic: unix seconds (~10 digits) vs ms (~13 digits)
  if (time > 0 && time < 1e12) {
    time = time * 1000;
  }
  if (!Number.isFinite(time) || time <= 0) {
    time = Date.now();
  }
  return {
    time,
    blocks: Array.isArray(data.blocks) ? data.blocks : [],
    version: data.version != null ? String(data.version) : '2.31.0',
  };
}

/**
 * String to send as API/DB `editor_content` so legacy PHP Empleado reads the same shape
 * as notes created in the old app: outer JSON string containing `editor_content` key
 * whose value is the stringified EditorJS `{ time, blocks, version }`.
 *
 * @param {unknown} editorContent - same accepted shapes as {@link normalizeEditorJsToInner}
 * @returns {string}
 */
export function serializeEditorContentForLegacyBackend(editorContent) {
  const inner = normalizeEditorJsToInner(editorContent);
  const innerStr = JSON.stringify(inner);
  return JSON.stringify({ editor_content: innerStr });
}
