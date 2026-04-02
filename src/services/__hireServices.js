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
 * Resolve city ids to city names using hiring_city list (id, city_name).
 * Handles vacancy.locations from vacancy_location table.
 * @param {number[]|undefined} cityIds - e.g. [105]
 * @param {Array<{id: number, city_name?: string, name?: string}>|undefined} hiringCityList - from GET /api/v1/locations/hiring_city
 * @returns {string[]} - e.g. ["Islamabad"]
 */
export const getCityNamesFromIds = (cityIds, hiringCityList) => {
  if (!Array.isArray(cityIds) || cityIds.length === 0) return [];
  if (!Array.isArray(hiringCityList)) return [];
  return cityIds
    .map((id) => {
      const city = hiringCityList.find((c) => c.id === id || c.id === Number(id));
      return city?.city_name ?? city?.name ?? "";
    })
    .filter(Boolean);
};