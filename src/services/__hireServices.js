import { VACANCY_PUBLIC_APP_ORIGIN } from "../Model/BaseUri"

/**
 * Shareable public URL for a vacancy (career app deep link).
 * Format: `{origin}/app/source_id={vacancyId}` (matches backend / marketing app expectations).
 * @param {string|number} vacancyId - vacancy primary key from API
 * @returns {string}
 */
export const buildVacancyPublicShareUrl = (vacancyId) => {
  const id = Number(vacancyId)
  if (!Number.isFinite(id) || id <= 0) return ""
  const base = String(VACANCY_PUBLIC_APP_ORIGIN || "").replace(/\/$/, "")
  if (!base) return ""
  return `${base}/app/source_id=${id}`
}

export const getAllYearsHire = () => {
  const startYear = 2016;
  const currentYear = new Date().getFullYear();
  const years = [];

  for (let year = currentYear; year >= startYear; year--) {
    years.push(year);
  }

  return years;
};

  export const getAllAge =()=> {
    const startAge = 18;
    const endAge = 60;
    const ages = [];

    for (let age = startAge; age <= endAge; age++) {
      ages.push(age);
    }

    return ages;
  };

/**
 * Resolve vacancy locations to city name strings.
 *
 * Handles two shapes returned by the API:
 *  - Old shape: plain array of city IDs  → [36, 105]
 *  - New shape: array of vacancy_location objects →
 *      [{ id, city_id, city_name, city: { id, city_name } }]
 *
 * For the new shape the city name is read directly from the object so
 * hiringCityList is only used as a fallback.
 *
 * @param {Array<number|{id?:number, city_id?:number, city_name?:string, city?:{city_name?:string}}>|undefined} locations
 * @param {Array<{id: number, city_name?: string, name?: string}>|undefined} hiringCityList
 * @returns {string[]}
 */
export const getCityNamesFromIds = (locations, hiringCityList) => {
  if (!Array.isArray(locations) || locations.length === 0) return [];

  return locations
    .map((entry) => {
      // New API shape: location object with embedded city_name
      if (entry !== null && typeof entry === "object") {
        const direct =
          entry.city_name ||
          entry.city?.city_name ||
          entry.name ||
          entry.city?.name ||
          "";
        if (direct) return direct;

        // Fallback: look up by city_id or id in hiringCityList
        const lookupId = entry.city_id ?? entry.id;
        if (lookupId != null && Array.isArray(hiringCityList)) {
          const found = hiringCityList.find(
            (c) => c.id === lookupId || c.id === Number(lookupId)
          );
          return found?.city_name ?? found?.name ?? "";
        }
        return "";
      }

      // Old API shape: plain ID — look up in hiringCityList
      if (!Array.isArray(hiringCityList)) return "";
      const city = hiringCityList.find(
        (c) => c.id === entry || c.id === Number(entry)
      );
      return city?.city_name ?? city?.name ?? "";
    })
    .filter(Boolean);
};