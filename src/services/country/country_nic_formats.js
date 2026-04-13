/**
 * National ID / civil number digit grouping (dashes inserted between groups).
 * Keys MUST match `country_name` from `country_list` / locations API.
 *
 * If a country uses alphanumeric IDs (e.g. UK NINO, Mexico CURP), users typing
 * letters bypass digit masking — passport-style input is preserved.
 *
 * Extend this map as you confirm official formats for more countries.
 */
export const COUNTRY_NIC_DIGIT_GROUPS = {
    // South Asia
    Pakistan: [5, 7, 1],
    India: [4, 4, 4],
    Bangladesh: [4, 4, 5],
    "Sri Lanka": [4, 4, 4],
    Nepal: [4, 4, 4, 2],
    Bhutan: [4, 4, 4],
    Afghanistan: [4, 4, 4],

    // East Asia & Pacific
    China: [6, 8, 4],
    Japan: [4, 4, 4],
    "South Korea": [6, 7],
    "North Korea": [6, 7],
    Mongolia: [4, 4, 4],
    Taiwan: [4, 4, 4],
    Indonesia: [4, 4, 4, 4],
    Malaysia: [6, 2, 4],
    Philippines: [4, 4, 4, 4],
    Thailand: [1, 4, 5, 2, 1],
    Vietnam: [4, 4, 4],
    Singapore: [4, 4, 4],
    Australia: [4, 3, 3, 3],
    "New Zealand": [2, 3, 3],
    "Papua New Guinea": [4, 4, 4],
    Fiji: [4, 4, 4],

    // Middle East
    "United Arab Emirates": [3, 4, 7, 1],
    "Saudi Arabia": [1, 4, 4, 1],
    Kuwait: [4, 4, 4],
    Qatar: [4, 4, 3],
    Bahrain: [4, 4, 4, 4],
    Oman: [4, 4, 4],
    Jordan: [4, 4, 4],
    Lebanon: [4, 4, 4],
    Israel: [4, 4, 4],
    Iraq: [4, 4, 4],
    Iran: [4, 4, 4],
    Yemen: [4, 4, 4],
    Syria: [4, 4, 4],
    "Palestinian Territory Occupied": [4, 4, 4],
    Palestine: [4, 4, 4],
    Turkey: [3, 3, 3, 2],
    Azerbaijan: [4, 4, 4],
    Armenia: [4, 4, 4],
    Georgia: [4, 4, 4],

    // Americas
    "United States": [3, 2, 4],
    Canada: [3, 3, 3],
    Brazil: [3, 3, 3, 2],
    Argentina: [2, 3, 3, 1],
    Chile: [2, 3, 3],
    Colombia: [4, 4, 4],
    Peru: [4, 4, 4],
    Venezuela: [4, 4, 4],
    Ecuador: [4, 4, 4],
    Uruguay: [3, 3, 3, 2],
    Paraguay: [4, 4, 4],
    Bolivia: [4, 4, 4],
    "Costa Rica": [4, 4, 4],
    Panama: [4, 4, 4],
    Guatemala: [4, 4, 4],
    Honduras: [4, 4, 4],
    "El Salvador": [4, 4, 4],
    Nicaragua: [4, 4, 4],
    Jamaica: [4, 4, 4],
    Cuba: [4, 4, 4],
    "Dominican Republic": [4, 4, 4],
    Haiti: [4, 4, 4],
    "Bahamas The": [4, 4, 4],
    Barbados: [4, 4, 4],
    "Trinidad and Tobago": [4, 4, 4],

    // Europe
    Germany: [2, 3, 3, 3],
    France: [3, 3, 3, 3, 3],
    Spain: [4, 4, 4, 4],
    Ireland: [4, 4, 4],
    Netherlands: [4, 4, 4],
    Belgium: [4, 4, 3],
    Switzerland: [4, 4, 4],
    Austria: [4, 4, 4],
    Sweden: [6, 4],
    Norway: [4, 4, 4],
    Denmark: [6, 4],
    Finland: [6, 4],
    Poland: [4, 4, 4, 4],
    "Czech Republic": [4, 4, 4],
    Slovakia: [4, 4, 4],
    Hungary: [4, 4, 4],
    Romania: [4, 4, 4],
    Bulgaria: [4, 4, 4],
    Greece: [4, 4, 4],
    Portugal: [4, 4, 4],
    Ukraine: [4, 4, 4],
    Russia: [4, 4, 4],
    Belarus: [4, 4, 4],
    "Bosnia and Herzegovina": [4, 4, 4],
    Serbia: [4, 4, 4],
    "Croatia (Hrvatska)": [4, 4, 4],
    Slovenia: [4, 4, 4],
    Albania: [4, 4, 4],
    "North Macedonia": [4, 4, 4],
    Estonia: [4, 4, 4],
    Latvia: [4, 4, 4],
    Lithuania: [4, 4, 4],
    Iceland: [4, 4, 4],
    Luxembourg: [4, 4, 4],
    Malta: [4, 4, 4],
    Cyprus: [4, 4, 4],

    // Africa
    "South Africa": [6, 4, 3],
    Nigeria: [3, 3, 3, 2],
    Kenya: [4, 4, 4],
    Egypt: [4, 4, 4, 2],
    Ethiopia: [4, 4, 4],
    Ghana: [4, 4, 4],
    Morocco: [4, 4, 4],
    Algeria: [4, 4, 4],
    Tunisia: [4, 4, 4],
    Libya: [4, 4, 4],
    Sudan: [4, 4, 4],
    Uganda: [4, 4, 4],
    Tanzania: [4, 4, 4],
    Zimbabwe: [4, 4, 4],
    Zambia: [4, 4, 4],
    Botswana: [4, 4, 4],
    Namibia: [4, 4, 4],
    Angola: [4, 4, 4],
    Mozambique: [4, 4, 4],
    Cameroon: [4, 4, 4],
    "Cote D'Ivoire (Ivory Coast)": [4, 4, 4],
    Senegal: [4, 4, 4],
    Rwanda: [4, 4, 4],
    Mauritius: [4, 4, 4],

    // Central Asia
    Kazakhstan: [4, 4, 4],
    Uzbekistan: [4, 4, 4],
    Turkmenistan: [4, 4, 4],
    Kyrgyzstan: [4, 4, 4],
    Tajikistan: [4, 4, 4],

    // Other / territories (generic chunking where no standard — adjust as needed)
    "French Southern Territories": [4, 4, 4],
};

/** Used when `country_name` is missing or not listed above — 16 digits in four groups. */
const DEFAULT_NIC_DIGIT_GROUPS = [4, 4, 4, 4];

/**
 * @param {string|null|undefined} countryName
 * @returns {number[]}
 */
export function getNicDigitGroups(countryName) {
    const name =
        countryName && typeof countryName === "string"
            ? countryName.trim()
            : "";
    if (name && COUNTRY_NIC_DIGIT_GROUPS[name]) {
        return COUNTRY_NIC_DIGIT_GROUPS[name];
    }
    return DEFAULT_NIC_DIGIT_GROUPS;
}

/**
 * @param {string|null|undefined} rawInput
 * @param {number[]} groups
 * @param {string} [separator]
 * @returns {string|null}
 */
export function formatNicDigitsWithGroups(rawInput, groups, separator = "-") {
    if (!groups?.length) return null;
    const maxDigits = groups.reduce((a, b) => a + b, 0);
    const digits = String(rawInput ?? "")
        .replace(/\D/g, "")
        .slice(0, maxDigits);
    let out = "";
    let pos = 0;
    for (let i = 0; i < groups.length; i++) {
        const chunk = digits.slice(pos, pos + groups[i]);
        if (!chunk) break;
        out += (i > 0 ? separator : "") + chunk;
        pos += groups[i];
    }
    return out;
}

/**
 * Format stored value for display when hydrating the form (digits only → dashed).
 * If the value contains letters, it is treated as passport / alphanumeric ID.
 */
export function formatNicForCountryDisplay(raw, countryName) {
    const s = raw == null ? "" : String(raw);
    if (!s.trim()) return "";
    if (/[a-zA-Z]/.test(s)) return s;
    const groups = getNicDigitGroups(countryName);
    const formatted = formatNicDigitsWithGroups(s, groups);
    return formatted != null ? formatted : s;
}

/**
 * Apply mask while typing (live input).
 * Letters → passport path, return as-is (no digit stripping).
 */
export function formatNicInputValue(rawInput, countryName) {
    const s = String(rawInput ?? "");
    if (/[a-zA-Z]/.test(s)) return s;
    const groups = getNicDigitGroups(countryName);
    const formatted = formatNicDigitsWithGroups(s, groups);
    return formatted != null ? formatted : "";
}

/**
 * Max length of the visible field including separators (for &lt;Input maxLength /&gt;).
 */
export function getNicMaxInputLength(countryName) {
    const groups = getNicDigitGroups(countryName);
    const digits = groups.reduce((a, b) => a + b, 0);
    return digits + Math.max(0, groups.length - 1);
}
