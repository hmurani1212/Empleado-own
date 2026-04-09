/**
 * Notes Pool API responses often use `STATUS` / `status` with varying casing or values.
 */

/**
 * @param {object} [responseData] - axios response.data
 * @returns {boolean}
 */
export function isNotesPoolStatusSuccessful(responseData) {
  if (!responseData || typeof responseData !== "object") return false;
  const s = responseData.STATUS ?? responseData.status;
  if (s === true || s === 1 || s === "1") return true;
  if (s == null || s === "") return false;
  const u = String(s).trim().toUpperCase();
  return (
    u === "SUCCESSFUL" ||
    u === "SUCCESS" ||
    u === "OK" ||
    u === "TRUE" ||
    u === "COMPLETE" ||
    u === "COMPLETED"
  );
}

/**
 * Explicit failure in body (HTTP may still be 200).
 * @param {object} [responseData]
 * @returns {boolean}
 */
export function isNotesPoolStatusError(responseData) {
  if (!responseData || typeof responseData !== "object") return false;
  const s = responseData.STATUS ?? responseData.status;
  if (s == null || s === "") return false;
  const u = String(s).trim().toUpperCase();
  return u === "ERROR" || u === "FAILED" || u === "FAILURE" || u === "FALSE";
}

/**
 * HTTP 200 update/upload succeeded: explicit success, or no STATUS field (not an error).
 * Fails when STATUS is present but not a known success value (unless explicit error already handled).
 * @param {number} httpStatus
 * @param {object} [responseData]
 */
export function isNotesPoolOperationSuccess(httpStatus, responseData) {
  if (httpStatus !== 200) return false;
  if (isNotesPoolStatusError(responseData)) return false;
  if (isNotesPoolStatusSuccessful(responseData)) return true;
  const hasStatus =
    responseData &&
    typeof responseData === "object" &&
    ("STATUS" in responseData || "status" in responseData);
  if (!hasStatus) return true;
  return false;
}

/**
 * Update/upload: HTTP 200 and not an explicit ERROR/FAILED status.
 * Use when the backend may omit STATUS or use values we don't map yet, but still returns 200 on success.
 * @param {number} httpStatus
 * @param {object} [responseData]
 */
export function isNotesPoolLooseSuccess(httpStatus, responseData) {
  if (httpStatus !== 200) return false;
  return !isNotesPoolStatusError(responseData);
}
