import axios from 'axios';

const GET_CONTENT_URL = 'https://usher.veevotech.com/service_api/get_content';

/**
 * Fetch content by label (used in Payroll Settings, etc.).
 * @param {string} contentLabel - e.g. 'SOCIALSECURITY2_PAYROLL_EMP'
 * @returns {Promise<{ STATUS: string, DATA: Array }>} API response
 */
export const getContentByLabel = async (contentLabel) => {
  const form_data = new FormData();
  form_data.append('content_label', contentLabel);
  const { data } = await axios.post(GET_CONTENT_URL, form_data);
  return data;
};
