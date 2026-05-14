import { Button, Input, Switch } from "@material-tailwind/react";
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { HiOutlineEye, HiArrowUpTray } from "react-icons/hi2";
import { FaPalette } from "react-icons/fa";
import CustomDialog from "../../Components/CustomDialog/CustomDialog";
import hireApi from "../../Model/Data/Hire/Hire_2";
import { showToast } from "../../Components/Toaster/Toaster";
import axios from "axios";

const MAKE_URL_ENDPOINT =
  "https://emp.veevotech.com/empleado_app/hiring/api/v1/organizations/make_url";
const COMPANY_ABOUT_MAX_LENGTH = 448;
const CARD_HEADING_MAX_LENGTH = 20;
const CARD_BODY_MAX_LENGTH = 60;
const SMALL_CARD_TEXT_MAX_LENGTH = 12;

/** Career settings mock: 1px #D1D5DB outline, ~8px corners (rounded-lg) on panels + fields */
const hirePanel = "rounded-lg border border-[#D1D5DB] bg-white";
const hireInputSurface =
  "!rounded-lg !border-[#D1D5DB] text-slate-800 placeholder:text-slate-400 focus:!border-slate-400 focus:!ring-1 focus:!ring-slate-300/70";

/** MT outlined `label` sits on the border; hide it and use a normal `<label>` above the field */
const hireInputLabelHidden = { className: "hidden" };

/** Section preview screenshots (Elephant CDN). */
const SECTION_PREVIEW = {
  careerSettings:
    "https://elephant.veevotech.com/files/4d7a41314e6a5531/1_d9e5c19e542fe3b.png",
  branding:
    "https://elephant.veevotech.com/files/4d7a41314e6a5532/1_10d2170c0af7263.png",
  companyInformation:
    "https://elephant.veevotech.com/files/4d7a41314e6a5977/1_5a40bf8440c47ae.png",
  cardData:
    "https://elephant.veevotech.com/files/4d7a41314e6a5978/1_078bdea89e10df0.png",
  smallCardText:
    "https://elephant.veevotech.com/files/4d7a41314e6a597a/1_d8be9f6113fc6d4.png",
  smallCardIcons:
    "https://elephant.veevotech.com/files/4d7a41314e6a5135/1_94a3c6d12549863.png",
};

function parseSmallCardFromApi(raw) {
  if (raw == null) return { value: "", logo: "" };
  if (typeof raw === "object" && raw !== null) {
    const text = raw.text ?? raw.value ?? "";
    return {
      value: String(text).slice(0, SMALL_CARD_TEXT_MAX_LENGTH),
      logo: String(raw.logo ?? "").trim(),
    };
  }
  return {
    value: String(raw).slice(0, SMALL_CARD_TEXT_MAX_LENGTH),
    logo: "",
  };
}

function isValidUrl(value) {
  if (value == null || typeof value !== "string") return false;
  const t = value.trim();
  if (!t) return false;
  try {
    const parsed = new URL(t);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

function isValidEmail(value) {
  if (value == null || typeof value !== "string") return false;
  const t = value.trim();
  if (!t) return false;
  return EMAIL_REGEX.test(t);
}

function normalizeHexColor(value, fallback = "#1E40AF") {
  const raw = String(value || "").trim();
  const hex = raw.startsWith("#") ? raw : `#${raw}`;
  const shortHexPattern = /^#([0-9a-fA-F]{3})$/;
  const longHexPattern = /^#([0-9a-fA-F]{6})$/;
  if (longHexPattern.test(hex)) return hex.toUpperCase();
  if (shortHexPattern.test(hex)) {
    const r = hex[1];
    const g = hex[2];
    const b = hex[3];
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return fallback;
}

/** Editor-only; payload stores `<bulit>…</bulit>` instead of HTML `<ul>`. */
const ABOUT_BULLET_UL_STYLE = "list-style-type:disc;padding-left:1.25rem;";

/**
 * Payload bullets: `<bulit>line html</bulit><bulit>…</bulit>` (italic e.g. `<bulit>this is <i>text</i> ok</bulit>`).
 * Legacy: `<lst disc><ln>…</ln></lst>`.
 */
function deserializeAboutListsAndSizes(customFormat) {
  if (!customFormat) return "";
  let converted = String(customFormat);

  converted = converted.replace(
    /<lst\s+([\w-]+)>([\s\S]*?)<\/lst>/gi,
    (_m, _type, inner) => {
      const items = [];
      inner.replace(/<ln>([\s\S]*?)<\/ln>/gi, (_, body) => {
        items.push(`<li>${body}</li>`);
        return "";
      });
      return `<ul data-lst="disc" style="${ABOUT_BULLET_UL_STYLE}">${items.join("")}</ul>`;
    }
  );

  converted = converted.replace(
    /<bulit>[\s\S]*?(?:<\/bulit>|<\/built>|<\/builit>)(?:\s*<bulit>[\s\S]*?(?:<\/bulit>|<\/built>|<\/builit>))*/gi,
    (block) => {
      const items = [];
      const row = /<bulit>([\s\S]*?)(<\/bulit>|<\/built>|<\/builit>)/gi;
      let m;
      while ((m = row.exec(block)) !== null) {
        items.push(`<li>${m[1]}</li>`);
      }
      return `<ul data-lst="disc" style="${ABOUT_BULLET_UL_STYLE}">${items.join("")}</ul>`;
    }
  );

  converted = converted.replace(
    /<(\d+)px>(.*?)<\/\1px>/gi,
    '<span style="font-size: $1px">$2</span>'
  );

  return converted;
}

function serializeAboutLists(html) {
  if (!html || typeof document === "undefined") return html;
  const wrap = document.createElement("div");
  wrap.innerHTML = html;
  const uls = [...wrap.querySelectorAll("ul")];
  uls.forEach((ul) => {
    const lis = [...ul.querySelectorAll(":scope > li")];
    const frag = document.createDocumentFragment();
    lis.forEach((li) => {
      const t = document.createElement("template");
      t.innerHTML = `<bulit>${li.innerHTML}</bulit>`;
      const node = t.content.firstChild;
      if (node) frag.appendChild(node);
    });
    ul.replaceWith(frag);
  });
  return wrap.innerHTML;
}

function mergeRootLevelUls(editor) {
  const uls = [...editor.querySelectorAll(":scope > ul")];
  if (uls.length <= 1) return;
  const first = uls[0];
  for (let i = 1; i < uls.length; i++) {
    const u = uls[i];
    while (u.firstChild) first.appendChild(u.firstChild);
    u.remove();
  }
}

function isLiEmpty(li) {
  if (!li) return true;
  const t = li.innerText.replace(/\u200b/g, "").replace(/\n/g, "").trim();
  return t.length === 0;
}

/** Keep at most one empty <li> before the first line that has text; collapse all-empty lists to one row. */
function pruneLeadingStackedEmptyLis(ul) {
  if (!ul) return;
  const lis = [...ul.querySelectorAll(":scope > li")];
  if (lis.length === 0) return;
  let firstNonEmpty = -1;
  for (let i = 0; i < lis.length; i++) {
    if (!isLiEmpty(lis[i])) {
      firstNonEmpty = i;
      break;
    }
  }
  if (firstNonEmpty === -1) {
    while (ul.querySelector(":scope > li:nth-child(2)")) {
      ul.removeChild(ul.lastElementChild);
    }
    return;
  }
  if (firstNonEmpty <= 1) return;
  for (let i = 0; i < firstNonEmpty - 1; i++) {
    ul.firstElementChild?.remove();
  }
}

function isEditorMeaningfullyEmpty(editor) {
  if (!editor) return true;
  const t = editor.innerText.replace(/\uFEFF/g, "").replace(/\n/g, "").trim();
  return t.length === 0;
}

function placeCaretAtStartOf(node) {
  const sel = window.getSelection();
  if (!sel || !node) return;
  const r = document.createRange();
  if (node.nodeType === Node.TEXT_NODE) {
    r.setStart(node, 0);
  } else {
    let n = node.firstChild;
    while (n && n.nodeType !== Node.TEXT_NODE && n.firstChild) n = n.firstChild;
    if (n && n.nodeType === Node.TEXT_NODE) r.setStart(n, 0);
    else if (node.firstChild) r.setStart(node.firstChild, 0);
    else r.setStart(node, 0);
  }
  r.collapse(true);
  sel.removeAllRanges();
  sel.addRange(r);
}

function placeCaretAtEndOfNode(node) {
  const sel = window.getSelection();
  if (!sel || !node) return;
  const r = document.createRange();
  r.selectNodeContents(node);
  r.collapse(false);
  sel.removeAllRanges();
  sel.addRange(r);
}

function rootUl(editor) {
  return editor.querySelector(":scope > ul");
}

/** Remove bullet from the line containing `li`: unwrap to a plain `<div>` (toggle off). */
function unwrapBulletLine(editor, li) {
  const ul = li.parentElement;
  if (!ul || ul.tagName !== "UL" || !editor.contains(ul)) return;

  const allLis = [...ul.querySelectorAll(":scope > li")];
  const idx = allLis.indexOf(li);
  if (idx === -1) return;

  const beforeLis = allLis.slice(0, idx);
  const afterLis = allLis.slice(idx + 1);

  const block = document.createElement("div");
  while (li.firstChild) block.appendChild(li.firstChild);
  if (block.childNodes.length === 0) block.appendChild(document.createElement("br"));
  li.remove();

  const parent = ul.parentNode;
  if (!parent) return;

  if (beforeLis.length === 0 && afterLis.length === 0) {
    ul.replaceWith(block);
  } else {
    const frag = document.createDocumentFragment();
    if (beforeLis.length > 0) {
      const u1 = document.createElement("ul");
      u1.setAttribute("data-lst", "disc");
      u1.setAttribute("style", ABOUT_BULLET_UL_STYLE);
      beforeLis.forEach((n) => u1.appendChild(n));
      frag.appendChild(u1);
    }
    frag.appendChild(block);
    if (afterLis.length > 0) {
      const u2 = document.createElement("ul");
      u2.setAttribute("data-lst", "disc");
      u2.setAttribute("style", ABOUT_BULLET_UL_STYLE);
      afterLis.forEach((n) => u2.appendChild(n));
      frag.appendChild(u2);
    }
    parent.insertBefore(frag, ul);
    ul.remove();
  }

  mergeRootLevelUls(editor);
  placeCaretAtStartOf(block);
}

/**
 * Bullets: plain text → add bullet line(s). Caret already inside `<li>` → remove bullet from that line (toggle off).
 */
function insertAboutBullet(editor) {
  if (!editor || typeof document === "undefined") return;
  editor.focus();
  mergeRootLevelUls(editor);
  const sel = window.getSelection();
  if (!sel?.rangeCount || !editor.contains(sel.anchorNode)) return;
  const range = sel.getRangeAt(0);

  const getLi = () => {
    let n = range.startContainer;
    if (n.nodeType === Node.TEXT_NODE) n = n.parentElement;
    return n?.closest?.("li");
  };

  const finishUl = (ul) => {
    if (!ul) return;
    ul.setAttribute("data-lst", "disc");
    ul.setAttribute("style", ABOUT_BULLET_UL_STYLE);
    pruneLeadingStackedEmptyLis(ul);
    mergeRootLevelUls(editor);
  };

  const li = getLi();
  if (li && editor.contains(li)) {
    const ul = li.parentElement;
    if (ul?.tagName === "UL" && editor.contains(ul)) {
      unwrapBulletLine(editor, li);
      return;
    }
  }

  const ulExisting = rootUl(editor);
  if (ulExisting && !ulExisting.contains(range.startContainer)) {
    const rel = ulExisting.compareDocumentPosition(range.startContainer);
    const caretAfterUl = (rel & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;

    if (caretAfterUl) {
      const afterR = document.createRange();
      afterR.setStart(range.startContainer, range.startOffset);
      afterR.setEndAfter(editor.lastChild);
      if (!afterR.collapsed) {
        const frag = afterR.extractContents();
        const newLi = document.createElement("li");
        newLi.appendChild(frag);
        if (newLi.childNodes.length === 0) newLi.appendChild(document.createElement("br"));
        ulExisting.appendChild(newLi);
        placeCaretAtStartOf(newLi);
      } else {
        const lastLi = ulExisting.querySelector(":scope > li:last-child");
        if (lastLi && isLiEmpty(lastLi)) {
          placeCaretAtStartOf(lastLi);
        } else {
          const newLi = document.createElement("li");
          newLi.appendChild(document.createElement("br"));
          ulExisting.appendChild(newLi);
          placeCaretAtStartOf(newLi);
        }
      }
    } else {
      const pre = document.createRange();
      pre.selectNodeContents(editor);
      pre.setEnd(range.startContainer, range.startOffset);
      if (!pre.collapsed) {
        const frag = pre.extractContents();
        const firstLi = ulExisting.querySelector(":scope > li");
        if (firstLi) {
          firstLi.insertBefore(frag, firstLi.firstChild);
          placeCaretAtStartOf(firstLi);
        }
      }
    }
    finishUl(ulExisting);
    return;
  }

  if (!range.collapsed) {
    const frag = range.extractContents();
    const ul = document.createElement("ul");
    ul.setAttribute("data-lst", "disc");
    ul.setAttribute("style", ABOUT_BULLET_UL_STYLE);
    const newLi = document.createElement("li");
    newLi.appendChild(frag);
    if (newLi.childNodes.length === 0) newLi.appendChild(document.createElement("br"));
    ul.appendChild(newLi);
    editor.appendChild(ul);
    finishUl(ul);
    placeCaretAtStartOf(newLi);
    return;
  }

  if (isEditorMeaningfullyEmpty(editor)) {
    while (editor.firstChild) editor.removeChild(editor.firstChild);
    const ul = document.createElement("ul");
    ul.setAttribute("data-lst", "disc");
    ul.setAttribute("style", ABOUT_BULLET_UL_STYLE);
    const lone = document.createElement("li");
    lone.appendChild(document.createElement("br"));
    ul.appendChild(lone);
    editor.appendChild(ul);
    finishUl(ul);
    placeCaretAtStartOf(lone);
    return;
  }

  const beforeR = document.createRange();
  beforeR.selectNodeContents(editor);
  beforeR.setEnd(range.startContainer, range.startOffset);
  const beforeFrag = beforeR.cloneContents();

  const afterR = document.createRange();
  afterR.setStart(range.startContainer, range.startOffset);
  afterR.selectNodeContents(editor);
  const afterFrag = afterR.cloneContents();

  while (editor.firstChild) editor.removeChild(editor.firstChild);

  const ul = document.createElement("ul");
  ul.setAttribute("data-lst", "disc");
  ul.setAttribute("style", ABOUT_BULLET_UL_STYLE);
  const li1 = document.createElement("li");
  const li2 = document.createElement("li");
  li1.appendChild(beforeFrag);
  li2.appendChild(afterFrag);
  if (li1.childNodes.length === 0) li1.appendChild(document.createElement("br"));
  if (li2.childNodes.length === 0) li2.appendChild(document.createElement("br"));

  const empty1 = isLiEmpty(li1);
  const empty2 = isLiEmpty(li2);
  let caretTarget = li2;

  if (empty1 && empty2) {
    li1.innerHTML = "";
    li1.appendChild(document.createElement("br"));
    ul.appendChild(li1);
    caretTarget = li1;
  } else if (empty1 && !empty2) {
    /* Caret at start of text — one bullet row with all content (no empty first line) */
    ul.appendChild(li2);
    caretTarget = li2;
  } else if (!empty1 && empty2) {
    /* Caret at end — one bullet row with all content */
    ul.appendChild(li1);
    caretTarget = li1;
  } else {
    ul.appendChild(li1);
    ul.appendChild(li2);
    caretTarget = li2;
  }

  editor.appendChild(ul);
  finishUl(ul);
  if (caretTarget === li1 && !empty1 && empty2) {
    placeCaretAtEndOfNode(li1);
  } else {
    placeCaretAtStartOf(caretTarget);
  }
}

function convertToCustomFormat(html) {
  if (!html) return "";
  let converted = serializeAboutLists(html);

  converted = converted.replace(/<strong>/gi, "<b>");
  converted = converted.replace(/<\/strong>/gi, "</b>");
  converted = converted.replace(/<em>/gi, "<i>");
  converted = converted.replace(/<\/em>/gi, "</i>");
  converted = converted.replace(/<strike>/gi, "<s>");
  converted = converted.replace(/<\/strike>/gi, "</s>");
  converted = converted.replace(/<del>/gi, "<s>");
  converted = converted.replace(/<\/del>/gi, "</s>");

  converted = converted.replace(
    /<span[^>]*style="[^"]*font-weight:\s*bold[^"]*"[^>]*>(.*?)<\/span>/gi,
    "<b>$1</b>"
  );
  converted = converted.replace(
    /<span[^>]*style="[^"]*font-style:\s*italic[^"]*"[^>]*>(.*?)<\/span>/gi,
    "<i>$1</i>"
  );
  converted = converted.replace(
    /<span[^>]*style="[^"]*text-decoration:\s*underline[^"]*"[^>]*>(.*?)<\/span>/gi,
    "<u>$1</u>"
  );
  converted = converted.replace(
    /<span[^>]*style="[^"]*text-decoration[^"]*line-through[^"]*"[^>]*>(.*?)<\/span>/gi,
    "<s>$1</s>"
  );
  converted = converted.replace(
    /<span[^>]*style="[^"]*font-size:\s*(\d+)px[^"]*"[^>]*>(.*?)<\/span>/gi,
    "<$1px>$2</$1px>"
  );

  converted = converted.replace(/<span[^>]*>/gi, "");
  converted = converted.replace(/<\/span>/gi, "");

  return converted;
}

function normalizeLimitNoFromApi(value) {
  if (value == null || value === "") return "10";
  const num = Number(value);
  if (!Number.isFinite(num) || num < 1) return "10";
  return String(Math.min(999, Math.trunc(num)));
}

function convertCardBodyFromApi(customFormat) {
  if (!customFormat) return "";
  return String(customFormat).replace(
    /<(\d+)px>(.*?)<\/\1px>/gi,
    '<span style="font-size: $1px">$2</span>'
  );
}

function stateFromHiringSetting(hs) {
  const emptySmallCards = () => ({
    card1: { value: "", logo: "", visible: true },
    card2: { value: "", logo: "", visible: true },
    card3: { value: "", logo: "", visible: true },
    card4: { value: "", logo: "", visible: true },
  });

  if (!hs || typeof hs !== "object") {
    return {
      oneidSetting: true,
      contactFormEnabled: false,
      contactFormUrl: "",
      headerText: "",
      sybHeading: "",
      image: "",
      headerColor: "#1E40AF",
      companyAbout: "",
      limitNo: "10",
      cards: [
        { id: 1, heading: "", body: "", visible: true },
        { id: 2, heading: "", body: "", visible: true },
        { id: 3, heading: "", body: "", visible: true },
        { id: 4, heading: "", body: "", visible: true },
      ],
      smallCardText: emptySmallCards(),
    };
  }
  const oneidSetting = !!hs.oneid_setting;
  const raw = hs.contact_form;
  const hasContact =
    raw != null &&
    String(raw).trim() !== "" &&
    String(raw).trim().toLowerCase() !== "null";

  const MAX_CARD_DATA = 4;
  const defaultCards = () =>
    Array.from({ length: MAX_CARD_DATA }, (_, i) => ({
      id: i + 1,
      heading: "",
      body: "",
      visible: true,
    }));

  // Load card data (always up to 4 slots for UI)
  const cardsFromApi = hs.card_data && Array.isArray(hs.card_data)
    ? hs.card_data.slice(0, MAX_CARD_DATA).map((card, index) => ({
        id: index + 1,
        heading: String(card.heading || "").slice(0, CARD_HEADING_MAX_LENGTH),
        body: String(convertCardBodyFromApi(card.body || "")).slice(
          0,
          CARD_BODY_MAX_LENGTH
        ),
        visible: true,
      }))
    : [];

  const cards =
    cardsFromApi.length > 0
      ? defaultCards().map((slot, i) =>
          cardsFromApi[i]
            ? { ...cardsFromApi[i], id: i + 1, visible: true }
            : { ...slot, id: i + 1 }
        )
      : defaultCards();

  const smallCardText = hs.small_card_text && typeof hs.small_card_text === "object"
    ? {
        card1: { ...parseSmallCardFromApi(hs.small_card_text.card1), visible: true },
        card2: { ...parseSmallCardFromApi(hs.small_card_text.card2), visible: true },
        card3: { ...parseSmallCardFromApi(hs.small_card_text.card3), visible: true },
        card4: { ...parseSmallCardFromApi(hs.small_card_text.card4), visible: true },
      }
    : emptySmallCards();

  return {
    oneidSetting,
    contactFormEnabled: hasContact,
    contactFormUrl: hasContact ? String(raw).trim() : "",
    headerText: hs.header_text ? String(hs.header_text) : "",
    sybHeading:
      hs.syb_heading != null
        ? String(hs.syb_heading)
        : hs.sub_heading != null
        ? String(hs.sub_heading)
        : "",
    image: hs.image ? String(hs.image) : "",
    headerColor: normalizeHexColor(hs.header_color, "#1E40AF"),
    companyAbout: hs.company_about
      ? deserializeAboutListsAndSizes(String(hs.company_about)).slice(
          0,
          COMPANY_ABOUT_MAX_LENGTH
        )
      : "",
    limitNo: normalizeLimitNoFromApi(hs.limit_no),
    cards,
    smallCardText,
  };
}

const HireCareerSettingsModal = ({ openDialog, onClose }) => {
  const [loadedSetting, setLoadedSetting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [oneidSetting, setOneidSetting] = useState(true);
  const [contactFormEnabled, setContactFormEnabled] = useState(false);
  const [contactFormEmail, setContactFormEmail] = useState("");
  const [headerText, setHeaderText] = useState("");
  const [sybHeading, setSybHeading] = useState("");
  const [image, setImage] = useState("");
  const [headerColor, setHeaderColor] = useState("#1E40AF");
  const [companyAbout, setCompanyAbout] = useState("");
  const [aboutPlainLength, setAboutPlainLength] = useState(0);
  const [aboutEditorTick, setAboutEditorTick] = useState(0);
  const [fontSizePick, setFontSizePick] = useState("12px");
  const [limitNo, setLimitNo] = useState("10");
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageFileInputRef = useRef(null);
  const aboutLimitToastShownRef = useRef(false);
  const aboutEditorRef = useRef(null);

  // Card data state
  const [cards, setCards] = useState([
    { id: 1, heading: "", body: "", visible: true },
    { id: 2, heading: "", body: "", visible: true },
    { id: 3, heading: "", body: "", visible: true },
    { id: 4, heading: "", body: "", visible: true },
  ]);
  const [smallCardText, setSmallCardText] = useState({
    card1: { value: "", logo: "", visible: true },
    card2: { value: "", logo: "", visible: true },
    card3: { value: "", logo: "", visible: true },
    card4: { value: "", logo: "", visible: true },
  });

  const [sectionPreview, setSectionPreview] = useState({
    open: false,
    src: "",
    title: "",
  });
  const [previewBodyMinPx, setPreviewBodyMinPx] = useState(null);
  const [uploadingSmallLogo, setUploadingSmallLogo] = useState(null);
  const smallCardLogoInputRefs = useRef({
    card1: null,
    card2: null,
    card3: null,
    card4: null,
  });
  const careerSettingsBodyScrollRef = useRef(0);
  /** True while section preview is open — used to detect preview→form transition for scroll restore */
  const lastSectionPreviewOpenRef = useRef(false);

  const openSectionPreview = (src, title) => {
    // Capture scroll synchronously only. A follow-up requestAnimationFrame(capture) was
    // overwriting the saved position with ~0 after the preview DOM replaced the form.
    const getScrollEl = () => {
      let el =
        document.querySelector(".hire-career-settings-dialog-body") ||
        document.querySelector('[class*="hire-career-settings"]');
      if (!el) {
        const dialog = document.querySelector('[role="dialog"]');
        if (dialog) {
          for (const node of dialog.querySelectorAll("div")) {
            if (node.scrollHeight > node.clientHeight + 2) {
              el = node;
              break;
            }
          }
        }
      }
      return el;
    };

    const el = getScrollEl();
    if (el) {
      const scrollTop = el.scrollTop;
      careerSettingsBodyScrollRef.current = scrollTop;
      try {
        sessionStorage.setItem("careerSettingsScrollPos", String(scrollTop));
      } catch {
        /* ignore */
      }
      const h = Math.round(el.getBoundingClientRect().height);
      const fallback = Math.min(620, Math.round(window.innerHeight * 0.72));
      setPreviewBodyMinPx(h > 120 ? h : fallback);
    } else {
      setPreviewBodyMinPx(Math.min(620, Math.round(window.innerHeight * 0.72)));
    }

    setSectionPreview({ open: true, src, title });
  };
  const closeSectionPreview = () => {
    // Do NOT read scrollTop from the dialog body here — while preview is open the
    // body shows short preview content, so scrollTop is often ~0 and would overwrite
    // the position saved in openSectionPreview (careerSettingsBodyScrollRef).
    setPreviewBodyMinPx(null);
    setSectionPreview((s) => ({ ...s, open: false }));
  };

  useEffect(() => {
    if (!openDialog) {
      setSectionPreview((s) => ({ ...s, open: false }));
      setPreviewBodyMinPx(null);
      lastSectionPreviewOpenRef.current = false;
      careerSettingsBodyScrollRef.current = 0;
    }
  }, [openDialog]);

  /** Restore dialog body scroll after closing preview — layout effect runs before paint. */
  useLayoutEffect(() => {
    if (!openDialog) return undefined;

    const wasPreviewOpen = lastSectionPreviewOpenRef.current;
    lastSectionPreviewOpenRef.current = sectionPreview.open;

    if (sectionPreview.open) return undefined;
    if (!wasPreviewOpen) return undefined;

    let y = careerSettingsBodyScrollRef.current;
    if (!Number.isFinite(y) || y < 0) {
      try {
        const stored = sessionStorage.getItem("careerSettingsScrollPos");
        const parsed = stored != null ? parseInt(stored, 10) : NaN;
        y = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
      } catch {
        y = 0;
      }
    }
    const savedY = y;

    const getBody = () =>
      document.querySelector(".hire-career-settings-dialog-body") ||
      document.querySelector('[class*="hire-career-settings"]');

    const apply = () => {
      const el = getBody();
      if (!el || el.scrollHeight <= 0) return false;
      el.style.scrollBehavior = "auto";
      const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
      el.scrollTop = Math.min(Math.max(0, savedY), maxScroll);
      return true;
    };

    apply();
    let innerRaf = 0;
    const outerRaf = requestAnimationFrame(() => {
      apply();
      innerRaf = requestAnimationFrame(apply);
    });

    const t0 = setTimeout(apply, 0);
    const t1 = setTimeout(apply, 50);
    const t2 = setTimeout(apply, 150);
    const t3 = setTimeout(apply, 400);

    return () => {
      cancelAnimationFrame(outerRaf);
      cancelAnimationFrame(innerRaf);
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [sectionPreview.open, openDialog]);

  useEffect(() => {
    if (!sectionPreview.open) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeSectionPreview();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [sectionPreview.open]);

  // Card handlers
  const handleCardHeadingChange = (id, value) => {
    const trimmed = String(value || "").slice(0, CARD_HEADING_MAX_LENGTH);
    setCards(cards.map(card =>
      card.id === id ? { ...card, heading: trimmed } : card
    ));
  };

  const handleCardBodyChange = (id, value) => {
    const trimmed = String(value || "").slice(0, CARD_BODY_MAX_LENGTH);
    setCards(cards.map(card =>
      card.id === id ? { ...card, body: trimmed } : card
    ));
  };

  const handleRemoveCard = (id) => {
    setCards(cards.map(card =>
      card.id === id ? { ...card, visible: false } : card
    ));
  };

  const handleAddCard = () => {
    const hidden = cards.find((c) => !c.visible);
    if (!hidden) return;
    setCards((prev) =>
      prev.map((card) =>
        card.id === hidden.id ? { ...card, visible: true } : card
      )
    );
  };

  const handleSmallCardTextChange = (cardKey, value) => {
    const trimmed = String(value || "").slice(0, SMALL_CARD_TEXT_MAX_LENGTH);
    setSmallCardText(prev => ({
      ...prev,
      [cardKey]: { ...prev[cardKey], value: trimmed }
    }));
  };

  const handleRemoveSmallCardText = (cardKey) => {
    setSmallCardText(prev => ({
      ...prev,
      [cardKey]: { ...prev[cardKey], visible: false }
    }));
  };

  const getAboutPlainLength = (el) =>
    (el?.innerText || "").replace(/\uFEFF/g, "").length;

  /** Hard-cap plain text at 448; sync counter + React state. May strip rich formatting if content had to be clipped. */
  const finalizeAboutEditorChange = (options = {}) => {
    const { silent = false } = options;
    const ed = aboutEditorRef.current;
    if (!ed) return;
    let plain = (ed.innerText || "").replace(/\uFEFF/g, "");
    if (plain.length > COMPANY_ABOUT_MAX_LENGTH) {
      ed.textContent = plain.slice(0, COMPANY_ABOUT_MAX_LENGTH);
      if (silent) {
        aboutLimitToastShownRef.current = false;
      } else if (!aboutLimitToastShownRef.current) {
        showToast(
          `About Company cannot exceed ${COMPANY_ABOUT_MAX_LENGTH} characters.`,
          "error"
        );
        aboutLimitToastShownRef.current = true;
      }
    } else {
      aboutLimitToastShownRef.current = false;
    }
    plain = (ed.innerText || "").replace(/\uFEFF/g, "");
    setAboutPlainLength(plain.length);
    setCompanyAbout(ed.innerHTML);
  };

  const handleFormatText = (command, value = null) => {
    if (aboutEditorRef.current) {
      document.execCommand("styleWithCSS", false, true);

      if (command === "fontSize") {
        const selection = window.getSelection();
        if (selection.rangeCount > 0 && !selection.isCollapsed) {
          const range = selection.getRangeAt(0);
          const selectedText = range.toString();
          const span = document.createElement("span");
          span.style.fontSize = value;
          span.textContent = selectedText;
          range.deleteContents();
          range.insertNode(span);
          range.setStartAfter(span);
          range.setEndAfter(span);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } else {
        document.execCommand(command, false, value);
      }
      finalizeAboutEditorChange();
    }
  };

  const handleInsertBullet = () => {
    const ed = aboutEditorRef.current;
    if (!ed) return;
    insertAboutBullet(ed);
    finalizeAboutEditorChange();
  };

  const handleAboutInput = () => {
    finalizeAboutEditorChange();
  };

  const handleAboutBeforeInput = (e) => {
    const ed = aboutEditorRef.current;
    if (!ed) return;

    const currentLen = getAboutPlainLength(ed);
    const sel = window.getSelection();
    const selInEditor =
      sel.rangeCount > 0 &&
      (ed.contains(sel.anchorNode) || ed === sel.anchorNode);
    const selLen = selInEditor ? sel.toString().length : 0;
    const eff = Math.max(0, currentLen - selLen);

    if (e.inputType === "insertText" && e.data != null) {
      if (eff + e.data.length > COMPANY_ABOUT_MAX_LENGTH) {
        e.preventDefault();
        const room = COMPANY_ABOUT_MAX_LENGTH - eff;
        if (room > 0) {
          document.execCommand("insertText", false, e.data.slice(0, room));
          finalizeAboutEditorChange();
        }
      }
      return;
    }

    if (
      e.inputType === "insertLineBreak" ||
      e.inputType === "insertParagraph"
    ) {
      if (eff >= COMPANY_ABOUT_MAX_LENGTH) {
        e.preventDefault();
      }
    }
  };

  const insertPlainAtSelection = (text) => {
    const ed = aboutEditorRef.current;
    if (!ed || !text) return;
    ed.focus();
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    let inserted = false;
    try {
      inserted = document.execCommand("insertText", false, text);
    } catch {
      inserted = false;
    }
    if (!inserted) {
      const r = sel.getRangeAt(0);
      r.deleteContents();
      const tn = document.createTextNode(text);
      r.insertNode(tn);
      r.setStartAfter(tn);
      r.collapse(true);
      sel.removeAllRanges();
      sel.addRange(r);
    }
  };

  const handleAboutPaste = (e) => {
    e.preventDefault();
    const ed = aboutEditorRef.current;
    if (!ed) return;

    const pastedRaw = e.clipboardData?.getData("text/plain") ?? "";
    const pasted = pastedRaw.replace(/\r\n/g, "\n");

    const currentLen = getAboutPlainLength(ed);
    const sel = window.getSelection();
    const selInEditor =
      sel.rangeCount > 0 &&
      (ed.contains(sel.anchorNode) || ed === sel.anchorNode);
    const selLen = selInEditor ? sel.toString().length : 0;
    const eff = Math.max(0, currentLen - selLen);
    const room = Math.max(0, COMPANY_ABOUT_MAX_LENGTH - eff);
    const insertText = pasted.slice(0, room);

    if (insertText.length > 0) {
      insertPlainAtSelection(insertText);
    }
    finalizeAboutEditorChange();
  };

  useEffect(() => {
    if (!openDialog || loading) return;
    if (aboutEditorRef.current) {
      const raw = companyAbout || "";
      aboutEditorRef.current.innerHTML = raw;
      aboutEditorRef.current.querySelectorAll(":scope > ul").forEach(pruneLeadingStackedEmptyLis);
      const cleaned = aboutEditorRef.current.innerHTML;
      if (cleaned !== raw) {
        setCompanyAbout(cleaned);
      }
      finalizeAboutEditorChange({ silent: true });
    }
  }, [openDialog, loading, aboutEditorTick]);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await hireApi.getHiringSetting();
      const data = res?.data;
      if (data?.STATUS === "SUCCESSFUL") {
        const hs = data.DB_DATA?.hiring_setting;
        setLoadedSetting(hs && typeof hs === "object" ? hs : null);
        const next = stateFromHiringSetting(hs);
        setOneidSetting(next.oneidSetting);
        setContactFormEnabled(next.contactFormEnabled);
        setContactFormEmail(next.contactFormUrl);
        setHeaderText(next.headerText);
        setSybHeading(next.sybHeading);
        setImage(next.image);
        setHeaderColor(next.headerColor);
        setCompanyAbout(next.companyAbout);
        setAboutEditorTick((t) => t + 1);
        setLimitNo(next.limitNo);
        setCards(next.cards);
        setSmallCardText(next.smallCardText);
      } else {
        showToast(
          data?.ERROR_DESCRIPTION || "Could not load settings.",
          "error"
        );
      }
    } catch (e) {
      console.error(e);
      showToast("Could not load hiring settings.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!openDialog) return;
    setLoadedSetting(null);
    loadSettings();
  }, [openDialog, loadSettings]);

  const onContactFormToggle = (enabled) => {
    setContactFormEnabled(enabled);
    if (!enabled) {
      setContactFormEmail("");
    }
  };

  const handleSave = async () => {
    if (contactFormEnabled) {
      if (!isValidEmail(contactFormEmail)) {
        showToast("Please enter a valid contact email.", "error");
        return;
      }
    }
    if (image && !isValidUrl(image)) {
      showToast("Please enter a valid image URL.", "error");
      return;
    }

    const limitNum = parseInt(String(limitNo).trim(), 10);
    if (!Number.isFinite(limitNum) || limitNum < 1 || limitNum > 999) {
      showToast(
        "Please enter a valid number of vacancies to show per career page (1–999).",
        "error"
      );
      return;
    }

    setSaving(true);
    try {
      const contact_form = contactFormEnabled
        ? contactFormEmail.trim()
        : null;

      const companyAboutFormatted = convertToCustomFormat(companyAbout);

      const cardData = cards
        .filter(card => card.visible && (card.heading || card.body))
        .map(card => ({
          heading: String(card.heading || "").trim(),
          body: convertToCustomFormat(card.body || "")
        }));

      const buildSmallCardPayloadEntry = (card) => {
        if (!card.visible) return { text: "", logo: "" };
        const logo = String(card.logo || "").trim();
        if (logo && !isValidUrl(logo)) {
          return null;
        }
        return {
          text: String(card.value || "").trim(),
          logo,
        };
      };

      const hasVisibleSmallCards =
        smallCardText.card1.visible ||
        smallCardText.card2.visible ||
        smallCardText.card3.visible ||
        smallCardText.card4.visible;

      let smallCardTextData = null;
      if (hasVisibleSmallCards) {
        const e1 = buildSmallCardPayloadEntry(smallCardText.card1);
        const e2 = buildSmallCardPayloadEntry(smallCardText.card2);
        const e3 = buildSmallCardPayloadEntry(smallCardText.card3);
        const e4 = buildSmallCardPayloadEntry(smallCardText.card4);
        if (e1 === null || e2 === null || e3 === null || e4 === null) {
          showToast("Please enter valid logo URLs for small cards (upload again if needed).", "error");
          return;
        }
        smallCardTextData = {
          card1: e1,
          card2: e2,
          card3: e3,
          card4: e4,
        };
      }

      const payload = {
        oneid_setting: oneidSetting,
        contact_form,
        header_text: String(headerText || "").trim(),
        syb_heading: String(sybHeading || "").trim(),
        image: String(image || "").trim(),
        header_color: normalizeHexColor(headerColor, "#1E40AF"),
        company_time: null,
        company_about: companyAboutFormatted
          .trim()
          .slice(0, COMPANY_ABOUT_MAX_LENGTH),
        limit_no: limitNum,
        card_data: cardData.length > 0 ? cardData : null,
        small_card_text: smallCardTextData,
        ...(loadedSetting?._id != null && { _id: loadedSetting._id }),
        ...(loadedSetting?.org_id != null && {
          org_id: loadedSetting.org_id,
        }),
      };
      const res = await hireApi.updateHiringSetting(payload);
      const data = res?.data;
      if (data?.STATUS === "SUCCESSFUL") {
        showToast("Career page settings saved.", "success");
        onClose?.();
      } else {
        showToast(data?.ERROR_DESCRIPTION || "Save failed.", "error");
      }
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.ERROR_DESCRIPTION ||
        e?.message ||
        "Save failed. If the problem continues, confirm the update API with the backend.";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImage = async (event) => {
    const file = event?.target?.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("fileInput", file);
      const res = await axios.post(MAKE_URL_ENDPOINT, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = res?.data;
      const generatedUrl = data?.url || data?.FILE_URL || "";
      if (res?.status === 200 && data?.STATUS === "SUCCESSFUL" && generatedUrl) {
        setImage(String(generatedUrl));
        showToast("Image uploaded successfully.", "success");
      } else {
        showToast(data?.ERROR_DESCRIPTION || "Image upload failed.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Image upload failed.", "error");
    } finally {
      setUploadingImage(false);
      if (event?.target) event.target.value = "";
    }
  };

  const handleSmallCardLogoUpload = async (cardKey, event) => {
    const file = event?.target?.files?.[0];
    if (!file) return;

    try {
      setUploadingSmallLogo(cardKey);
      const formData = new FormData();
      formData.append("fileInput", file);
      const res = await axios.post(MAKE_URL_ENDPOINT, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = res?.data;
      const generatedUrl = data?.url || data?.FILE_URL || "";
      if (res?.status === 200 && data?.STATUS === "SUCCESSFUL" && generatedUrl) {
        setSmallCardText((prev) => ({
          ...prev,
          [cardKey]: { ...prev[cardKey], logo: String(generatedUrl) },
        }));
        showToast("Logo uploaded.", "success");
      } else {
        showToast(data?.ERROR_DESCRIPTION || "Logo upload failed.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Logo upload failed.", "error");
    } finally {
      setUploadingSmallLogo(null);
      if (event?.target) event.target.value = "";
    }
  };

  const handleClearSmallCardLogo = (cardKey) => {
    setSmallCardText((prev) => ({
      ...prev,
      [cardKey]: { ...prev[cardKey], logo: "" },
    }));
  };

  const previewBtnClass =
    "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-[#D1D5DB] bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 self-start sm:self-auto";

  const iconsPreviewBtnClass =
    "inline-flex shrink-0 items-center justify-center rounded-full border border-[#D1D5DB] bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 self-start sm:self-auto";

  const renderSectionHeader = (
    title,
    previewSrc,
    previewTitle,
    accentBarClass = "bg-sky-500",
    barWidthClass = "w-1"
  ) => (
    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2.5 min-w-0">
        <span
          className={`${barWidthClass} self-stretch min-h-5 shrink-0 rounded-sm ${accentBarClass}`}
          aria-hidden
        />
        <span className="min-w-0">{title}</span>
      </h3>
      <button
        type="button"
        onClick={() => openSectionPreview(previewSrc, previewTitle)}
        className={previewBtnClass}
      >
        <HiOutlineEye className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
        Preview
      </button>
    </div>
  );

  const renderSimpleSectionHeader = (title, accentBarClass = "bg-orange-500") => (
    <div className="mb-5 flex flex-col gap-2">
      <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2.5">
        <span
          className={`w-1 self-stretch min-h-5 shrink-0 rounded-sm ${accentBarClass}`}
          aria-hidden
        />
        {title}
      </h3>
    </div>
  );

  const body = (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden">
        {loading ? (
          <p className="text-sm text-slate-500 px-6 py-6 text-center">Loading…</p>
        ) : sectionPreview.open && sectionPreview.src ? (
          <div
            className="flex min-h-0 w-full flex-1 flex-col bg-slate-50/95"
            role="region"
            aria-labelledby="section-preview-title"
            style={
              previewBodyMinPx != null
                ? { minHeight: `${previewBodyMinPx}px` }
                : undefined
            }
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#D1D5DB] bg-white px-4 py-3 text-slate-800 shadow-sm">
              <h2
                id="section-preview-title"
                className="min-w-0 flex-1 truncate font-poppins text-base font-semibold sm:text-lg"
              >
                {sectionPreview.title || "Preview"}
              </h2>
              <button
                type="button"
                aria-label="Close preview"
                className="shrink-0 rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300"
                onClick={closeSectionPreview}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="relative flex min-h-0 w-full flex-1 items-center justify-center px-3 py-6 sm:px-8">
              <img
                src={sectionPreview.src}
                alt=""
                className="max-h-full w-auto max-w-full rounded-lg border border-[#D1D5DB] bg-white object-contain object-center shadow-sm"
                draggable={false}
              />
            </div>
            <p className="shrink-0 border-t border-[#D1D5DB] bg-white px-4 py-2 text-center text-xs text-slate-500">
              Press Escape to close preview
            </p>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-4xl p-6">
          <div className="space-y-6 w-full">
            {/* Career Page Settings — top (Figma): title row + subtitle + Preview + toggle cards */}
            <div className="w-full">
              <div className="mb-4 border-b border-[#D1D5DB] pb-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2.5">
                    <span
                      className="mt-1 w-1 min-h-7 shrink-0 self-stretch rounded-sm bg-blue-600"
                      aria-hidden
                    />
                    <h2 className="font-poppins text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                      Career Page Settings
                    </h2>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    Customize your career page experience
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    openSectionPreview(
                      SECTION_PREVIEW.careerSettings,
                      "Career Page Settings"
                    )
                  }
                  className={previewBtnClass}
                >
                  <HiOutlineEye className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                  Preview
                </button>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between ${hirePanel}`}>
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-sm font-semibold text-slate-900">OneID Login</span>
                    <p className="text-xs text-slate-500">
                      Require candidates to sign in with OneID before applying
                    </p>
                  </div>
                  <Switch
                    color="blue"
                    checked={oneidSetting}
                    onChange={(e) => setOneidSetting(!!e?.target?.checked)}
                    className="h-full w-full checked:bg-[#2563eb]"
                    containerProps={{ className: "w-11 h-6 shrink-0" }}
                    circleProps={{ className: "before:hidden left-0.5 border-none" }}
                  />
                </div>
                <div className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between ${hirePanel}`}>
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-sm font-semibold text-slate-900">Contact Form</span>
                    <p className="text-xs text-slate-500">
                      Allow candidates to contact your organization
                    </p>
                  </div>
                  <Switch
                    color="blue"
                    checked={contactFormEnabled}
                    onChange={(e) => onContactFormToggle(!!e?.target?.checked)}
                    className="h-full w-full checked:bg-[#2563eb]"
                    containerProps={{ className: "w-11 h-6 shrink-0" }}
                    circleProps={{ className: "before:hidden left-0.5 border-none" }}
                  />
                </div>
                {contactFormEnabled ? (
                  <div className={`space-y-2 p-4 ${hirePanel}`}>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="hire-career-contact-email"
                        className="block text-sm font-semibold text-slate-900"
                      >
                        Contact Email
                      </label>
                      <Input
                        id="hire-career-contact-email"
                        type="email"
                        placeholder="name@company.com"
                        value={contactFormEmail}
                        onChange={(e) => setContactFormEmail(e.target.value)}
                        className={`text-slate-800 !py-2.5 ${hireInputSurface}`}
                        color="blue"
                        labelProps={hireInputLabelHidden}
                        containerProps={{ className: "w-full min-w-0" }}
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Candidates can reach your support team via this email
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Subheading */}
            <div className={`w-full p-5 ${hirePanel}`}>
              <div className="space-y-1.5">
                <label
                  htmlFor="hire-career-subheading"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Subheading
                </label>
                <Input
                  id="hire-career-subheading"
                  type="text"
                  placeholder="BEST OPPORTUNITIES FOR BETTER FUTURE!"
                  value={sybHeading}
                  onChange={(e) => setSybHeading(e.target.value)}
                  className={`text-slate-800 !py-2.5 ${hireInputSurface}`}
                  color="blue"
                  labelProps={hireInputLabelHidden}
                  containerProps={{ className: "w-full min-w-0" }}
                />
              </div>
            </div>

            {/* Content Section */}
            <div className={`w-full p-5 ${hirePanel}`}>
              {renderSectionHeader(
                "Company Information",
                SECTION_PREVIEW.companyInformation,
                "Company Information",
                "bg-teal-500"
              )}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">About Company</label>
                  <p className="text-xs text-slate-500">
                    One bullet style (disc). Use “• Bullets” on plain text to add a list; use it again with the
                    caret on a bulleted line to remove that line’s bullet. Payload:{" "}
                    <span className="font-mono text-[11px]">&lt;bulit&gt;…&lt;/bulit&gt;</span> per line,{" "}
                    <span className="font-mono text-[11px]">&lt;i&gt;…&lt;/i&gt;</span> for italics.
                  </p>
                  <div className="overflow-hidden rounded-lg border border-[#D1D5DB]">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 border-b border-[#D1D5DB] bg-slate-50 px-2 py-2">
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          aboutEditorRef.current?.focus();
                          handleFormatText("bold");
                        }}
                        className="rounded border border-transparent p-2 text-slate-700 font-bold transition-colors hover:bg-slate-200"
                        title="Bold"
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          aboutEditorRef.current?.focus();
                          handleFormatText("italic");
                        }}
                        className="rounded border border-transparent p-2 text-slate-700 italic transition-colors hover:bg-slate-200"
                        title="Italic"
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          aboutEditorRef.current?.focus();
                          handleFormatText("underline");
                        }}
                        className="rounded border border-transparent p-2 text-slate-700 underline transition-colors hover:bg-slate-200"
                        title="Underline"
                      >
                        U
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          aboutEditorRef.current?.focus();
                          handleFormatText("strikeThrough");
                        }}
                        className="rounded border border-transparent p-2 text-slate-700 line-through transition-colors hover:bg-slate-200"
                        title="Strikethrough"
                      >
                        S
                      </button>
                      <div className="w-px h-6 bg-slate-300 mx-1 hidden sm:block" />
                      <select
                        value={fontSizePick}
                        onChange={(e) => {
                          const v = e.target.value;
                          setFontSizePick(v);
                          aboutEditorRef.current?.focus();
                          if (v) handleFormatText("fontSize", v);
                        }}
                        className="max-w-[120px] rounded-lg border border-[#D1D5DB] bg-white px-2 py-1.5 text-sm text-slate-700"
                      >
                        <option value="">Font size</option>
                        {[10, 11, 12, 14, 16, 18, 20, 24].map((size) => (
                          <option key={size} value={`${size}px`}>
                            {size}px
                          </option>
                        ))}
                      </select>
                      <div className="w-px h-6 bg-slate-300 mx-1 hidden sm:block" />
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleInsertBullet();
                        }}
                        className="rounded-lg border border-[#D1D5DB] bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                        title="Add bullets on plain text; click again on a bullet line to remove it"
                      >
                        • Bullets
                      </button>
                    </div>
                    <div
                      ref={aboutEditorRef}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={handleAboutInput}
                      onBeforeInput={handleAboutBeforeInput}
                      onCompositionEnd={() => finalizeAboutEditorChange()}
                      onPaste={handleAboutPaste}
                      className="min-h-[120px] w-full px-4 py-3 text-sm text-slate-800 outline-none focus-visible:ring-1 focus-visible:ring-slate-300/70"
                      style={{ minHeight: "120px", direction: "ltr", unicodeBidi: "normal", textAlign: "left" }}
                      aria-label="About company — rich text"
                    />
                  </div>
                  <p className="text-xs text-slate-500 text-right">
                    {aboutPlainLength}/{COMPANY_ABOUT_MAX_LENGTH} (plain text length)
                  </p>
                </div>
              </div>
            </div>

            {/* Display Section */}
            <div className={`w-full p-5 ${hirePanel}`}>
              {renderSimpleSectionHeader("Display Settings", "bg-orange-500")}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="hire-career-vacancies-limit"
                      className="block text-sm font-semibold text-slate-800"
                    >
                      Vacancies per Career Page
                    </label>
                    <Input
                      id="hire-career-vacancies-limit"
                      type="number"
                      placeholder="e.g. 10"
                      value={limitNo}
                      onChange={(e) => {
                        const raw = String(e.target.value ?? "");
                        if (raw === "") {
                          setLimitNo("");
                          return;
                        }
                        const digitsOnly = raw.replace(/\D/g, "").slice(0, 3);
                        setLimitNo(digitsOnly);
                      }}
                      min={1}
                      max={999}
                      className={`text-slate-800 !py-2.5 ${hireInputSurface}`}
                      color="blue"
                      labelProps={hireInputLabelHidden}
                      containerProps={{ className: "w-full min-w-0" }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Number of vacancies displayed on each career page (1-999)
                  </p>
                </div>
              </div>
            </div>

            {/* Branding Section */}
            <div className={`w-full p-5 ${hirePanel}`}>
              {renderSectionHeader(
                "Branding & Appearance",
                SECTION_PREVIEW.branding,
                "Branding & Appearance",
                "bg-violet-600"
              )}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-800">
                    Background Company Logo
                  </label>
                  <p className="text-xs text-slate-500">
                    Wide image is recommended (please keep image file size below 5MB).
                  </p>
                  <input
                    ref={imageFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadImage}
                    className="hidden"
                  />
                  <div className="overflow-hidden rounded-lg border border-[#D1D5DB] bg-slate-100">
                    <div className="relative h-32 w-full sm:h-40">
                      {image ? (
                        <img
                          src={image}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-start gap-2 bg-slate-900 p-4 text-sm text-slate-300">
                          <span className="text-slate-400">Background</span>
                        </div>
                      )}
                      {image ? (
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
                      ) : null}
                    </div>
                    <div className="flex items-center justify-start gap-2 border-t border-[#D1D5DB] bg-slate-50 p-3">
                      <Button
                        size="sm"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white normal-case shadow-md hover:opacity-95"
                        onClick={() => imageFileInputRef.current?.click()}
                        disabled={uploadingImage}
                      >
                        <HiArrowUpTray className="h-4 w-4 shrink-0" aria-hidden />
                        {uploadingImage ? "Uploading…" : "Upload Background Image"}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 md:col-span-2 md:flex-row md:items-start md:gap-6">
                  <div className="w-full min-w-0 space-y-2 md:flex-1">
                    <div className="text-sm font-medium leading-5 text-slate-700">
                      Header Color
                    </div>
                    <div className="relative flex h-[52px] items-center gap-3 rounded-lg border border-[#D1D5DB] bg-slate-50 px-3">
                      <div className="relative h-10 w-10 shrink-0">
                        <div
                          className="h-10 w-10 rounded-lg border-2 border-[#D1D5DB]"
                          style={{ backgroundColor: headerColor }}
                          aria-hidden
                        />
                        <input
                          id="headerColorPicker"
                          type="color"
                          value={headerColor}
                          onChange={(e) => setHeaderColor(e.target.value)}
                          className="absolute inset-0 cursor-pointer opacity-0"
                          title="Pick header color"
                          aria-label="Choose header color"
                        />
                      </div>
                      <span className="min-w-0 flex-1 font-mono text-sm text-slate-600">{headerColor}</span>
                      <span className="shrink-0 text-slate-400" aria-hidden title="Color">
                        <FaPalette className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                  <div className="w-full min-w-0 space-y-2 md:flex-1">
                    <label
                      htmlFor="career-header-text-field"
                      className="block text-sm font-medium leading-5 text-slate-700"
                    >
                      Header Text
                    </label>
                    <input
                      id="career-header-text-field"
                      type="text"
                      placeholder="JOIN THE VISIONARY CTN"
                      value={headerText}
                      onChange={(e) => setHeaderText(e.target.value)}
                      className="h-[52px] w-full rounded-lg border border-[#D1D5DB] bg-white px-4 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-300/70"
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card Data — outer shell borderless so only inner cards show edges (Figma) */}
            <div className="w-full">
              {renderSectionHeader(
                "Card Data",
                SECTION_PREVIEW.cardData,
                "Card Data",
                "bg-rose-700",
                "w-1.5"
              )}
              <div className="space-y-4">
                {cards.filter(card => card.visible).map((card, index) => (
                  <div key={card.id} className={`p-4 ${hirePanel}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-slate-800">Card {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => handleRemoveCard(card.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="Remove card"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="space-y-1.5">
                          <label
                            htmlFor={`hire-career-card-heading-${card.id}`}
                            className="block text-xs font-normal text-slate-500"
                          >
                            Heading
                          </label>
                          <Input
                            id={`hire-career-card-heading-${card.id}`}
                            type="text"
                            placeholder="Enter card heading"
                            value={card.heading}
                            onChange={(e) => handleCardHeadingChange(card.id, e.target.value)}
                            className={`text-slate-800 !py-2.5 ${hireInputSurface}`}
                            color="blue"
                            labelProps={hireInputLabelHidden}
                            containerProps={{ className: "w-full min-w-0" }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 text-right mt-1">
                          {card.heading.length}/{CARD_HEADING_MAX_LENGTH}
                        </p>
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-normal text-slate-500">Body</label>
                        <textarea
                          value={card.body}
                          onChange={(e) => handleCardBodyChange(card.id, e.target.value)}
                          placeholder="Enter card body text"
                          rows={3}
                          className="min-h-20 w-full resize-y rounded-lg border border-[#D1D5DB] px-4 py-3 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300/70"
                        />
                        <p className="text-xs text-slate-500 text-right mt-1">
                          {card.body.length}/{CARD_BODY_MAX_LENGTH}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {cards.some((c) => !c.visible) ? (
                  <button
                    type="button"
                    onClick={handleAddCard}
                    className="w-full rounded-lg border border-rose-200 bg-rose-50/50 py-3 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50/80"
                  >
                    + Add Card
                  </button>
                ) : null}
              </div>
            </div>

            {/* Small Card Text Section */}
            <div className={`w-full p-5 ${hirePanel}`}>
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-1.5 self-stretch min-h-5 shrink-0 rounded-sm bg-sky-600"
                    aria-hidden
                  />
                  <span className="min-w-0">Small Card Text</span>
                </h3>
                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() =>
                      openSectionPreview(
                        SECTION_PREVIEW.smallCardText,
                        "Small Card Text"
                      )
                    }
                    className={previewBtnClass}
                  >
                    <HiOutlineEye className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                    Preview
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {(["card1", "card2", "card3", "card4"]).map((cardKey) => {
                  const card = smallCardText[cardKey];
                  if (!card.visible) return null;
                  const idx = cardKey.replace("card", "");
                  return (
                    <div key={cardKey} className={`space-y-2 p-4 ${hirePanel}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-slate-800">
                          Card {idx}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSmallCardText(cardKey)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                          title="Remove card"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <input
                        ref={(el) => {
                          smallCardLogoInputRefs.current[cardKey] = el;
                        }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleSmallCardLogoUpload(cardKey, e)}
                      />
                      <div className="flex flex-col sm:flex-row gap-3 sm:items-start">
                        <div
                          className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg ${
                            card.logo
                              ? "border border-[#D1D5DB] bg-white"
                              : "border border-dashed border-[#D1D5DB] bg-slate-50/80"
                          }`}
                        >
                          {card.logo ? (
                            <img
                              src={card.logo}
                              alt=""
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <span className="text-[10px] text-center text-slate-400 px-1">
                              No logo
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 space-y-2 w-full">
                          <div className="space-y-1.5">
                            <label
                              htmlFor={`hire-career-small-label-${cardKey}`}
                              className="block text-sm font-medium text-slate-700"
                            >
                              Label ({idx})
                            </label>
                            <Input
                              id={`hire-career-small-label-${cardKey}`}
                              type="text"
                              placeholder="Enter small card text"
                              value={card.value}
                              onChange={(e) =>
                                handleSmallCardTextChange(cardKey, e.target.value)
                              }
                              className={`text-slate-800 w-full! !py-2.5 ${hireInputSurface}`}
                              containerProps={{ className: "w-full min-w-0" }}
                              color="blue"
                              labelProps={hireInputLabelHidden}
                            />
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              className="text-sm font-medium text-blue-600 underline decoration-blue-600/40 underline-offset-2 transition-colors hover:text-blue-700 disabled:opacity-50"
                              onClick={() =>
                                smallCardLogoInputRefs.current[cardKey]?.click()
                              }
                              disabled={uploadingSmallLogo === cardKey}
                            >
                              {uploadingSmallLogo === cardKey
                                ? "Uploading…"
                                : "Upload logo"}
                            </button>
                            {card.logo ? (
                              <button
                                type="button"
                                className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
                                onClick={() => handleClearSmallCardLogo(cardKey)}
                              >
                                Remove logo
                              </button>
                            ) : null}
                          </div>
                          <p className="text-xs text-slate-500 text-right">
                            {card.value.length}/{SMALL_CARD_TEXT_MAX_LENGTH}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-[#D1D5DB] bg-slate-50/90 px-6 py-4">
        <Button
          variant="outlined"
          className="border-[#D1D5DB] text-slate-700 px-6 py-2.5"
          onClick={onClose}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          className="bg-[#8bc9f8] text-white px-6 py-2.5"
          onClick={handleSave}
          disabled={loading || saving || sectionPreview.open}
        >
          {saving ? "Saving…" : "Save Settings"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {openDialog && (
        <CustomDialog
          openDialog={openDialog}
          handleOpen={onClose}
          title={<span className="sr-only">Career Page Settings</span>}
          minimalHeader
          size="xl"
          footer={false}
          scrollableBody
          bodyClassName="hire-career-settings-dialog-body"
          compo={body}
        />
      )}
    </>
  );
};

export default HireCareerSettingsModal;
