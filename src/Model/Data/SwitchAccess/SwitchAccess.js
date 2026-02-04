import { CORE_BASE_URL } from "../../BaseUri";

// Build redirect URL for switch access flow handled by Core module
export const buildSwitchAccessUrl = ({ roleId, accessCredentials, customRedirectUrl }) => {
    const params = new URLSearchParams();
    if (roleId) params.append('role_id', roleId);
    if (accessCredentials) params.append('access_credentials', accessCredentials);
    if (customRedirectUrl) params.append('custom_redirect_url', customRedirectUrl);
    return `${CORE_BASE_URL}/switch_access?${params.toString()}`;
};

export default {
    buildSwitchAccessUrl
};


