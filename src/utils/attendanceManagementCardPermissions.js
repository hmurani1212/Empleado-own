import { permissionTagsGrantModule } from "./oneIdPermissionUtils";
import { isFullAdmin } from "../Authentication/roleHelpers";

/** Maps admin attendance dashboard card id (AttendanceServices) to permission prefixes */
const CARD_ID_PREFIXES = {
  1: ["ATTENDANCE_EXPORT"],
  2: ["ATTENDANCE_DATA"],
  3: ["BRANCH_WISE_ATTENDANCE"],
  4: ["ATTENDANCE_RAW_LOGS", "ATTEANDANCE_RAW_LOGS"],
  5: ["ATTENDANCE_DATA", "ATTENDANCE_EXPORT"],
  6: ["ATTENDANCE_DATA", "FORMSANDAPPROVE"],
  7: ["ATTENDANCE_DATA"],
  8: ["ATTENDANCE_DATA"],
};

/**
 * Filters attendance management cards by OneID permissions. Full admin sees all.
 */
export function filterAttendanceManagementCards(cards, permissionTags, rawRoleId) {
  if (!Array.isArray(cards)) return [];
  if (isFullAdmin(rawRoleId)) return cards;
  const tags = Array.isArray(permissionTags) ? permissionTags : [];
  if (!tags.length) return cards;
  return cards.filter((card) => {
    const prefixes = CARD_ID_PREFIXES[card.id];
    if (!prefixes?.length) return true;
    return permissionTagsGrantModule(tags, prefixes);
  });
}
