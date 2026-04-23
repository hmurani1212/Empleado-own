import employeesApi from "../Model/Data/Employees/Employees";

const cleanSignatureText = (value) => {
  const text = value == null ? "" : String(value).trim();
  return text;
};

const extractDigitalSignatureText = (payload) => {
  if (!payload || typeof payload !== "object") return "";
  return cleanSignatureText(
    payload.field_value ?? payload.signature_text ?? payload.signature ?? ""
  );
};

/** Join all non-empty signatures from `get_signature` (Excel signatures list). */
const extractExcelSignaturesJoined = (payload) => {
  if (Array.isArray(payload) && payload.length > 0) {
    const parts = payload
      .map((item) =>
        cleanSignatureText(
          item?.signature ?? item?.field_value ?? item?.signature_text ?? ""
        )
      )
      .filter(Boolean);
    return parts.join(" | ");
  }
  if (payload && typeof payload === "object") {
    return cleanSignatureText(
      payload.signature ?? payload.field_value ?? payload.signature_text ?? ""
    );
  }
  return "";
};

/**
 * Digital signature resolver for print/application pages.
 * Uses ONLY `get_digital_signature`.
 */
export const getDigitalOfficeSignature = async () => {
  try {
    const digitalRes = await employeesApi.getDigitalSignature();
    const digitalData = digitalRes?.data;
    if (
      digitalRes?.status === 200 &&
      digitalData?.STATUS === "SUCCESSFUL"
    ) {
      const digitalText = extractDigitalSignatureText(digitalData?.DB_DATA);
      if (digitalText) return digitalText;
    }
  } catch {
    // ignore and return empty
  }

  return "";
};

/**
 * Excel signature resolver for Excel exports only.
 * Uses `get_signature`.
 */
export const getExcelSignature = async () => {
  try {
    const signatureRes = await employeesApi.getSignatures();
    const signatureData = signatureRes?.data;
    if (
      signatureRes?.status === 200 &&
      signatureData?.STATUS === "SUCCESSFUL"
    ) {
      return extractExcelSignaturesJoined(signatureData?.DB_DATA);
    }
  } catch {
    // ignore and return empty
  }
  return "";
};

// Backward-compatible alias. Now intentionally digital-only.
export const getPreferredOfficeSignature = getDigitalOfficeSignature;

export const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
