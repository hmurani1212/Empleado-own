/**
 * DP (Display Picture) URL Builder
 *
 * This module provides functions to build image URLs from database values
 * Database stores:
 * - dp: filename (e.g., "dp6996acea823291771482346_10824961.png")
 * - dp_folder: numeric folder ID (e.g., 1)
 *
 * The dp_folder is encrypted using simple_encrypt algorithm before being used in URL
 */

/** Base URL for profile images when API returns relative path */
const FILE_BASE_URL = 'https://emp-beta.veevotech.com/';

/**
 * Simple encryption function (replicates PHP simple_encrypt)
 * PHP: bin2hex(base64_encode($data))
 * Browser-compatible version that produces the same result as Node.js Buffer version
 * 
 * @param {string|number} data - Data to encrypt (will be converted to string)
 * @returns {string} Encrypted hexadecimal string
 */
export function simpleEncrypt(data) {
  if (!data && data !== 0) return '';
  
  // Convert to string if number (matches PHP behavior)
  const dataStr = String(data);
  
  try {
    // Step 1: Base64 encode (matches PHP base64_encode)
    // Use btoa for browser compatibility - produces same result as Buffer.from(dataStr, 'utf8').toString('base64')
    const base64 = btoa(unescape(encodeURIComponent(dataStr)));
    
    // Step 2: Convert to hex using bin2hex equivalent
    // PHP bin2hex converts binary string to hexadecimal
    // This matches: Buffer.from(base64, 'binary').toString('hex')
    const hex = base64
      .split('')
      .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
    
    return hex;
  } catch (error) {
    console.error('Error encrypting data:', error);
    return '';
  }
}

/**
 * Simple decryption function (replicates PHP simple_decrypt)
 * PHP: base64_decode(hex2bin($data))
 * 
 * @param {string} hexData - Hexadecimal encrypted string
 * @returns {string} Decrypted original value
 */
export function simpleDecrypt(hexData) {
  if (!hexData) return '';
  
  try {
    // Step 1: Convert hex to binary string (hex2bin equivalent)
    // This matches: Buffer.from(hexData, 'hex').toString('binary')
    let binary = '';
    for (let i = 0; i < hexData.length; i += 2) {
      const hexByte = hexData.substr(i, 2);
      binary += String.fromCharCode(parseInt(hexByte, 16));
    }
    
    // Step 2: Base64 decode
    // This matches: Buffer.from(binary, 'base64').toString('utf8')
    const decoded = decodeURIComponent(escape(atob(binary)));
    
    return decoded;
  } catch (error) {
    console.error('Error decrypting data:', error);
    return '';
  }
}

/**
 * Build full image URL from database dp and dp_folder values
 * 
 * @param {string} dp - Display picture filename from database (e.g., "dp6996acea823291771482346_10824961.png")
 * @param {string|number} dp_folder - Folder ID from database (e.g., 1)
 * @param {string} gender - Employee gender (0 = female, 1 = male) - optional, for default image fallback
 * @returns {string} Complete image URL
 */
export function buildImageUrl(dp, dp_folder, gender = null) {
  // If no dp, return default image based on gender
  if (!dp || dp.trim() === '') {
    if (gender === '0' || gender === 0) {
      return 'https://emp-beta.veevotech.com/images/icons/empf.jpg';
    }
    return 'https://emp-beta.veevotech.com/images/icons/empm.jpg';
  }
  
  // Convert dp_folder to string for length check
  const folderStr = String(dp_folder || '');
  
  // If dp_folder length > 5, use Elephant storage (matches PHP condition: strlen($dp_folder) > 5)
  if (folderStr.length > 5) {
    return `https://elephant.veevotech.com/files/${dp_folder}/${dp}`;
  }
  
  // For numeric dp_folder (length <= 5), encrypt and use standard path
  if (dp_folder && dp_folder !== '') {
    const encryptedFolder = simpleEncrypt(dp_folder);
    return `https://emp-beta.veevotech.com/files/images/${encryptedFolder}/${dp}`;
  }
  
  // Fallback to default image
  if (gender === '0' || gender === 0) {
    return 'https://emp-beta.veevotech.com/images/icons/empf.jpg';
  }
  return 'https://emp-beta.veevotech.com/images/icons/empm.jpg';
}

/**
 * Build thumbnail image URL from database dp and dp_folder values
 * 
 * @param {string} dp - Display picture filename from database
 * @param {string|number} dp_folder - Folder ID from database
 * @param {string} gender - Employee gender (0 = female, 1 = male) - optional, for default image fallback
 * @returns {string} Complete thumbnail image URL
 */
export function buildThumbnailUrl(dp, dp_folder, gender = null) {
  // If no dp, return default image based on gender
  if (!dp || dp.trim() === '') {
    if (gender === '0' || gender === 0) {
      return 'https://emp-beta.veevotech.com/images/icons/empf.jpg';
    }
    return 'https://emp-beta.veevotech.com/images/icons/empm.jpg';
  }
  
  // Convert dp_folder to string for length check
  const folderStr = String(dp_folder || '');
  
  // If dp_folder length > 5, use Elephant storage (matches PHP condition: strlen($dp_folder) > 5)
  if (folderStr.length > 5) {
    return `https://elephant.veevotech.com/files/${dp_folder}/${dp}`;
  }
  
  // For numeric dp_folder, encrypt and add thumb_ prefix
  if (dp_folder && dp_folder !== '') {
    const encryptedFolder = simpleEncrypt(dp_folder);
    // Add thumb_ prefix to filename if not already present
    const thumbDp = dp.startsWith('thumb_') ? dp : `thumb_${dp}`;
    return `https://emp-beta.veevotech.com/files/images/${encryptedFolder}/${thumbDp}`;
  }
  
  // Fallback to default image
  if (gender === '0' || gender === 0) {
    return 'https://emp-beta.veevotech.com/images/icons/empf.jpg';
  }
  return 'https://emp-beta.veevotech.com/images/icons/empm.jpg';
}

/**
 * Extract dp and dp_folder from employee data object
 * Searches through all possible locations in the data structure
 * 
 * @param {Object} employeeData - Full employee data object
 * @returns {Object} Object with dp, dp_folder, and gender
 */
export function extractImageDataFromEmployee(employeeData) {
  if (!employeeData) {
    return { dp: null, dp_folder: 1, gender: null, dpIsFullUrl: false };
  }

  // Try to find dp in various locations (API may return DB_DATA or flat structure)
  let dp =
    employeeData?.DB_DATA?.Official_Info?.dp ||
    employeeData?.DB_DATA?.official_info?.dp ||
    employeeData?.DB_DATA?.employee?.dp ||
    employeeData?.Official_Info?.dp ||
    employeeData?.official_info?.dp ||
    employeeData?.OfficialInfo?.dp ||
    employeeData?.employee?.Official_Info?.dp ||
    employeeData?.employee?.official_info?.dp ||
    employeeData?.employee?.dp ||
    employeeData?.basic_information?.dp ||
    employeeData?.basicInformation?.dp ||
    employeeData?.dp ||
    employeeData?.DP ||
    employeeData?.display_picture ||
    employeeData?.profile_picture ||
    employeeData?.image_url ||
    employeeData?.photo ||
    null;

  // If dp is already a full URL (e.g. from some APIs), return it as-is via a flag
  const dpIsFullUrl = typeof dp === 'string' && /^https?:\/\//i.test(dp);

  // Try to find dp_folder in various locations (default 1 or 2 when missing)
  let dp_folder =
    employeeData?.DB_DATA?.Official_Info?.dp_folder ||
    employeeData?.DB_DATA?.official_info?.dp_folder ||
    employeeData?.Official_Info?.dp_folder ||
    employeeData?.official_info?.dp_folder ||
    employeeData?.OfficialInfo?.dp_folder ||
    employeeData?.Official_Info?.dpFolder ||
    employeeData?.official_info?.dpFolder ||
    employeeData?.dp_folder ||
    employeeData?.dpFolder ||
    employeeData?.dp_folder_id ||
    employeeData?.dpFolderId ||
    employeeData?.folder_id ||
    employeeData?.folderId ||
    1; // Default to 1 when not found (common for profile images)

  // Try to find gender in various locations (check DB_DATA structure first)
  let gender = 
    employeeData?.DB_DATA?.basic_information?.gender ||
    employeeData?.DB_DATA?.basicInformation?.gender ||
    employeeData?.basic_information?.gender ||
    employeeData?.basicInformation?.gender ||
    employeeData?.Basic_Info?.gender ||
    employeeData?.basic_info?.gender ||
    employeeData?.gender ||
    employeeData?.Gender ||
    null;

  return { dp, dp_folder, gender, dpIsFullUrl: !!dpIsFullUrl };
}

/**
 * Build image URL from full employee data object
 * Automatically extracts dp, dp_folder, and gender from the data.
 * If dp is already a full URL (http/https), returns it as-is.
 *
 * @param {Object} employeeData - Full employee data object (e.g. API response.DB_DATA)
 * @param {boolean} thumbnail - Whether to return thumbnail URL (default: false)
 * @returns {string} Complete image URL
 */
export function getImageUrlFromEmployeeData(employeeData, thumbnail = false) {
  const { dp, dp_folder, gender, dpIsFullUrl } = extractImageDataFromEmployee(employeeData);

  // console.log('Extracted image data:', { dp, dp_folder, gender, dpIsFullUrl });


  // If API returned a full image URL, use it directly
  if (dpIsFullUrl && typeof dp === 'string') {
    return dp;
  }

  // If API returned a relative path (e.g. "files/images/...")
  if (typeof dp === 'string' && dp && !/^https?:\/\//i.test(dp) && (dp.startsWith('files/') || dp.startsWith('/'))) {
    const path = dp.startsWith('/') ? dp.slice(1) : dp;
    return `${FILE_BASE_URL}${path}`;
  }

  return thumbnail ? buildThumbnailUrl(dp, dp_folder, gender) : buildImageUrl(dp, dp_folder, gender);
}

/**
 * Build image URL from employee object
 * Convenience function that extracts dp and dp_folder from employee object
 * 
 * @param {Object} employee - Employee object with dp, dp_folder, and optionally gender
 * @param {boolean} thumbnail - Whether to return thumbnail URL (default: false)
 * @returns {string} Complete image URL
 */
export function buildEmployeeImageUrl(employee, thumbnail = false) {
  if (!employee) {
    return 'https://emp-beta.veevotech.com/images/icons/empm.jpg';
  }
  
  const dp = employee.dp || employee.DP || '';
  const dp_folder = employee.dp_folder || employee.dpFolder || employee.dp_folder_id || 1; // Default to 1 if not provided
  const gender = employee.gender || employee.Gender || null;
  
  if (thumbnail) {
    return buildThumbnailUrl(dp, dp_folder, gender);
  }
  
  return buildImageUrl(dp, dp_folder, gender);
}

/**
 * Build full URL for employee document file (for viewing/download).
 * doc has doc_name (filename or full URL), folder_id, host_id.
 * If doc_name is already a full URL, return as-is. Otherwise build from base URL and folder.
 *
 * @param {Object} doc - Document object with doc_name, folder_id, host_id
 * @returns {string} Full URL to the document
 */
export function buildDocumentFileUrl(doc) {
  if (!doc || !doc.doc_name) return '';
  const name = doc.doc_name.trim();
  if (/^https?:\/\//i.test(name)) return name;
  const folderId = doc.folder_id ?? doc.host_id ?? 1;
  const folderStr = String(folderId);
  if (folderStr.length > 5) {
    return `https://elephant.veevotech.com/files/${folderId}/${name}`;
  }
  const encryptedFolder = simpleEncrypt(folderId);
  return `${FILE_BASE_URL}files/images/${encryptedFolder}/${name}`;
}

/**
 * Build image URL from API response structure (Official_Info)
 * Handles the case where dp_folder might not be in the response
 * 
 * @param {Object} officialInfo - Official_Info object from API response
 * @param {Object} basicInfo - basic_information object (optional, for gender)
 * @param {boolean} thumbnail - Whether to return thumbnail URL (default: false)
 * @returns {string} Complete image URL
 */
export function buildImageUrlFromApiResponse(officialInfo, basicInfo = null, thumbnail = false) {
  if (!officialInfo || !officialInfo.dp) {
    const gender = basicInfo?.gender || null;
    if (gender === '0' || gender === 0) {
      return 'https://emp-beta.veevotech.com/images/icons/empf.jpg';
    }
    return 'https://emp-beta.veevotech.com/images/icons/empm.jpg';
  }
  
  const dp = officialInfo.dp;
  // dp_folder is usually 1 for most employees, but check if it exists in response
  const dp_folder = officialInfo.dp_folder || officialInfo.dpFolder || 1;
  const gender = basicInfo?.gender || officialInfo.gender || null;
  
  if (thumbnail) {
    return buildThumbnailUrl(dp, dp_folder, gender);
  }
  
  return buildImageUrl(dp, dp_folder, gender);
}
