import { Button, Input } from "@material-tailwind/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CustomDialog from "../../Components/CustomDialog/CustomDialog";
import hireApi from "../../Model/Data/Hire/Hire_2";
import { showToast } from "../../Components/Toaster/Toaster";
import axios from "axios";

const MAKE_URL_ENDPOINT =
  "https://emp.veevotech.com/empleado_app/hiring/api/v1/organizations/make_url";
const COMPANY_ABOUT_MAX_LENGTH = 448;
const CARD_HEADING_MAX_LENGTH = 20;
const CARD_BODY_MAX_LENGTH = 66;
const SMALL_CARD_TEXT_MAX_LENGTH = 12;

/** Full-screen preview gallery (remote assets). Buttons open viewer one image at a time; Prev/Next cycles all four. */
const CAREER_PREVIEW_SLIDES = [
  {
    id: "image_1",
    label: "image_1 — Hero & header",
    src: "https://elephant.veevotech.com/files/4d7a41314e6a4d34/1_d07d1b94a38e7e8.png",
  },
  {
    id: "image_2",
    label: "image_2 — Vacancies",
    src: "https://elephant.veevotech.com/files/4d7a41314e6a4d35/1_866cb32d0387000.png",
  },
  {
    id: "image_3",
    label: "image_3 — Why / About",
    src: "https://elephant.veevotech.com/files/4d7a41314e6a4d35/1_866cb32d0387000.png",
  },
  {
    id: "image_4",
    label: "image_4 — About section",
    src: "https://elephant.veevotech.com/files/4d7a41314e6a5177/1_380c67eb3198944.png",
  },
];

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
    card1: { value: "", visible: true },
    card2: { value: "", visible: true },
    card3: { value: "", visible: true },
    card4: { value: "", visible: true },
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

  // Load card data
  const cards = hs.card_data && Array.isArray(hs.card_data)
    ? hs.card_data.map((card, index) => ({
        id: index + 1,
        heading: card.heading || "",
        body: convertCardBodyFromApi(card.body || ""),
        visible: true,
      }))
    : [
        { id: 1, heading: "", body: "", visible: true },
        { id: 2, heading: "", body: "", visible: true },
        { id: 3, heading: "", body: "", visible: true },
      ];

  // Load small card text
  const smallCardText = hs.small_card_text && typeof hs.small_card_text === "object"
    ? {
        card1: { value: hs.small_card_text.card1 || "", visible: true },
        card2: { value: hs.small_card_text.card2 || "", visible: true },
        card3: { value: hs.small_card_text.card3 || "", visible: true },
        card4: { value: hs.small_card_text.card4 || "", visible: true },
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
  ]);
  const [smallCardText, setSmallCardText] = useState({
    card1: { value: "", visible: true },
    card2: { value: "", visible: true },
    card3: { value: "", visible: true },
    card4: { value: "", visible: true },
  });

  const [careerPreviewOpen, setCareerPreviewOpen] = useState(false);
  const [careerPreviewFocus, setCareerPreviewFocus] = useState(0);

  useEffect(() => {
    if (!openDialog) setCareerPreviewOpen(false);
  }, [openDialog]);

  useEffect(() => {
    if (!careerPreviewOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [careerPreviewOpen]);

  useEffect(() => {
    if (!careerPreviewOpen) return;
    const len = CAREER_PREVIEW_SLIDES.length;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setCareerPreviewOpen(false);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCareerPreviewFocus((i) => (i - 1 + len) % len);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setCareerPreviewFocus((i) => (i + 1) % len);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [careerPreviewOpen]);

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
          setCompanyAbout(aboutEditorRef.current.innerHTML);
          setAboutPlainLength(aboutEditorRef.current.innerText?.length || 0);
        }
      } else {
        document.execCommand(command, false, value);
        setCompanyAbout(aboutEditorRef.current.innerHTML);
        setAboutPlainLength(aboutEditorRef.current.innerText?.length || 0);
      }
    }
  };

  const handleInsertBullet = () => {
    const ed = aboutEditorRef.current;
    if (!ed) return;
    insertAboutBullet(ed);
    const len = ed.innerText?.length || 0;
    if (len > COMPANY_ABOUT_MAX_LENGTH) {
      showToast(
        `About Company cannot exceed ${COMPANY_ABOUT_MAX_LENGTH} characters.`,
        "error"
      );
      return;
    }
    setCompanyAbout(ed.innerHTML);
    setAboutPlainLength(len);
  };

  const handleAboutInput = () => {
    if (aboutEditorRef.current) {
      const plain = aboutEditorRef.current.innerText || "";

      if (plain.length > COMPANY_ABOUT_MAX_LENGTH) {
        if (!aboutLimitToastShownRef.current) {
          showToast(
            `About Company cannot exceed ${COMPANY_ABOUT_MAX_LENGTH} characters.`,
            "error"
          );
          aboutLimitToastShownRef.current = true;
        }
        return;
      }
      aboutLimitToastShownRef.current = false;
      setCompanyAbout(aboutEditorRef.current.innerHTML);
      setAboutPlainLength(plain.length);
    }
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
      setAboutPlainLength(aboutEditorRef.current.innerText?.length || 0);
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

      // Prepare small_card_text
      const hasVisibleSmallCards = smallCardText.card1.visible || smallCardText.card2.visible || smallCardText.card3.visible || smallCardText.card4.visible;
      const smallCardTextData = hasVisibleSmallCards ? {
        card1: smallCardText.card1.visible ? String(smallCardText.card1.value || "").trim() : "",
        card2: smallCardText.card2.visible ? String(smallCardText.card2.value || "").trim() : "",
        card3: smallCardText.card3.visible ? String(smallCardText.card3.value || "").trim() : "",
        card4: smallCardText.card4.visible ? String(smallCardText.card4.value || "").trim() : "",
      } : null;

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

  const body = (
    <div className="flex flex-col min-w-0 overflow-x-hidden">
      <div className="p-6 space-y-6">
        {loading ? (
          <p className="text-sm text-slate-500 py-6 text-center">Loading…</p>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200/80">
              <p className="text-xs text-slate-500 mb-4">
                Opens a full-screen preview over the whole page. The Career page settings form is hidden until you close the
                preview (✕ or Escape). Use Prev / Next or arrow keys for images 1–4.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCareerPreviewFocus(0);
                  setCareerPreviewOpen(true);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-center text-base font-semibold text-slate-800 shadow-sm transition-colors hover:bg-[#8bc9f8]/15 hover:border-[#8bc9f8]/50 sm:text-lg"
              >
                Career page layout reference
              </button>
            </div>

            {/* Settings Section */}
            <div className="bg-white p-5 rounded-xl">
              <h3 className="text-base font-semibold text-slate-800 mb-5 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#8bc9f8] rounded-full"></span>
                Career Page Settings
              </h3>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-800">OneID Login</label>
                    <p className="text-xs text-slate-500">Require candidates to sign in with OneID before applying</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setOneidSetting(true)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        oneidSetting
                          ? 'bg-[#8bc9f8] text-white shadow-md'
                          : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setOneidSetting(false)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        !oneidSetting
                          ? 'bg-[#8bc9f8] text-white shadow-md'
                          : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-800">Contact Form</label>
                    <p className="text-xs text-slate-500">Allow candidates to contact your organization</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onContactFormToggle(true)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        contactFormEnabled
                          ? 'bg-[#8bc9f8] text-white shadow-md'
                          : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => onContactFormToggle(false)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        !contactFormEnabled
                          ? 'bg-[#8bc9f8] text-white shadow-md'
                          : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {contactFormEnabled && (
                  <div className="pl-4 pt-2">
                    <Input
                      type="email"
                      label="Contact Email"
                      placeholder="name@company.com"
                      value={contactFormEmail}
                      onChange={(e) => setContactFormEmail(e.target.value)}
                      className="text-slate-800"
                      color="blue"
                      labelProps={{ className: "text-slate-700 font-medium" }}
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Candidates can reach your support team via this email
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Branding Section */}
            <div className="bg-white p-5 rounded-xl">
              <h3 className="text-base font-semibold text-slate-800 mb-5 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#8bc9f8] rounded-full"></span>
                Branding & Appearance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">
                    Background company logo
                  </label>
                  <p className="text-xs text-slate-500">
                    Wide image shown behind the career header (same field as before:
                    <span className="font-mono"> image</span> in hiring settings).
                  </p>
                  <input
                    ref={imageFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadImage}
                    className="hidden"
                  />
                  <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-100">
                    <div className="relative h-32 sm:h-40 w-full">
                      {image ? (
                        <img
                          src={image}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                          No background image
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none" />
                    </div>
                    <div className="flex items-center justify-end gap-2 p-3 bg-slate-50 border-t border-slate-200">
                      <Button
                        size="sm"
                        variant="outlined"
                        className="border-slate-300 text-slate-700 normal-case"
                        onClick={() => imageFileInputRef.current?.click()}
                        disabled={uploadingImage}
                      >
                        {uploadingImage ? "Uploading…" : "Upload background image"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Header Color */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Header Color</label>
                  <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50">
                    <div
                      className="h-10 w-10 rounded-lg border-2 border-slate-200 cursor-pointer"
                      style={{ backgroundColor: headerColor }}
                      onClick={() => document.getElementById('headerColorPicker')?.click()}
                    />
                    <input
                      id="headerColorPicker"
                      type="color"
                      value={headerColor}
                      onChange={(e) => setHeaderColor(e.target.value)}
                      className="h-8 w-8 cursor-pointer border-0 p-0 opacity-0 absolute"
                    />
                    <span className="text-sm font-mono text-slate-600">{headerColor}</span>
                  </div>
                </div>

                {/* Header Text */}
                <div className="space-y-2">
                  <Input
                    type="text"
                    label="Header Text"
                    placeholder="Join Our Team"
                    value={headerText}
                    onChange={(e) => setHeaderText(e.target.value)}
                    className="text-slate-800"
                    color="blue"
                    labelProps={{ className: "text-slate-700" }}
                  />
                </div>

                {/* Subheading */}
                <div className="space-y-2">
                  <Input
                    type="text"
                    label="Subheading"
                    placeholder="Write subheading"
                    value={sybHeading}
                    onChange={(e) => setSybHeading(e.target.value)}
                    className="text-slate-800"
                    color="blue"
                    labelProps={{ className: "text-slate-700" }}
                  />
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="bg-white p-5 rounded-xl">
              <h3 className="text-base font-semibold text-slate-800 mb-5 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#8bc9f8] rounded-full"></span>
                Company Information
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">About Company</label>
                  <p className="text-xs text-slate-500">
                    One bullet style (disc). Use “• Bullets” on plain text to add a list; use it again with the
                    caret on a bulleted line to remove that line’s bullet. Payload:{" "}
                    <span className="font-mono text-[11px]">&lt;bulit&gt;…&lt;/bulit&gt;</span> per line,{" "}
                    <span className="font-mono text-[11px]">&lt;i&gt;…&lt;/i&gt;</span> for italics.
                  </p>
                  <div className="border border-slate-300 rounded-lg overflow-hidden">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 p-2 bg-slate-50 border-b border-slate-200">
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          aboutEditorRef.current?.focus();
                          handleFormatText("bold");
                        }}
                        className="p-2 rounded hover:bg-slate-200 transition-colors text-slate-700 font-bold"
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
                        className="p-2 rounded hover:bg-slate-200 transition-colors text-slate-700 italic"
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
                        className="p-2 rounded hover:bg-slate-200 transition-colors text-slate-700 underline"
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
                        className="p-2 rounded hover:bg-slate-200 transition-colors text-slate-700 line-through"
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
                        className="px-2 py-1.5 rounded border border-slate-300 text-sm text-slate-700 bg-white max-w-[120px]"
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
                        className="px-3 py-1.5 rounded border border-slate-300 text-sm text-slate-700 bg-white hover:bg-slate-100"
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
                      className="w-full px-4 py-3 text-sm text-slate-800 outline-none min-h-[120px] focus-visible:ring-1 focus-visible:ring-[#8bc9f8]"
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
            <div className="bg-white p-5 rounded-xl">
              <h3 className="text-base font-semibold text-slate-800 mb-5 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#8bc9f8] rounded-full"></span>
                Display Settings
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="number"
                    label="Vacancies per Career Page"
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
                    className="text-slate-800"
                    color="blue"
                    labelProps={{ className: "text-slate-700" }}
                  />
                  <p className="text-xs text-slate-500">
                    Number of vacancies displayed on each career page (1-999)
                  </p>
                </div>
              </div>
            </div>

            {/* Card Data Section */}
            <div className="bg-white p-5 rounded-xl">
              <h3 className="text-base font-semibold text-slate-800 mb-5 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#8bc9f8] rounded-full"></span>
                Card Data
              </h3>
              <div className="space-y-4">
                {cards.filter(card => card.visible).map((card, index) => (
                  <div key={card.id} className="p-4 bg-slate-50 rounded-lg">
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
                        <Input
                          type="text"
                          label="Heading"
                          placeholder="Enter card heading"
                          value={card.heading}
                          onChange={(e) => handleCardHeadingChange(card.id, e.target.value)}
                          className="text-slate-800"
                          color="blue"
                          labelProps={{ className: "text-slate-700 font-medium" }}
                        />
                        <p className="text-xs text-slate-500 text-right mt-1">
                          {card.heading.length}/{CARD_HEADING_MAX_LENGTH}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 block mb-2">Body</label>
                        <textarea
                          value={card.body}
                          onChange={(e) => handleCardBodyChange(card.id, e.target.value)}
                          placeholder="Enter card body text"
                          rows={3}
                          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#8bc9f8] focus:ring-1 focus:ring-[#8bc9f8] resize-none"
                        />
                        <p className="text-xs text-slate-500 text-right mt-1">
                          {card.body.length}/{CARD_BODY_MAX_LENGTH}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Small Card Text Section */}
            <div className="bg-white p-5 rounded-xl">
              <h3 className="text-base font-semibold text-slate-800 mb-5 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#8bc9f8] rounded-full"></span>
                Small Card Text
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {smallCardText.card1.visible && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-800">Card 1</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSmallCardText('card1')}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="Remove card"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <Input
                      type="text"
                      placeholder="Enter small card text"
                      value={smallCardText.card1.value}
                      onChange={(e) => handleSmallCardTextChange('card1', e.target.value)}
                      className="text-slate-800"
                      color="blue"
                      labelProps={{ className: "text-slate-700 font-medium" }}
                    />
                    <p className="text-xs text-slate-500 text-right mt-1">
                      {smallCardText.card1.value.length}/{SMALL_CARD_TEXT_MAX_LENGTH}
                    </p>
                  </div>
                )}
                {smallCardText.card2.visible && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-800">Card 2</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSmallCardText('card2')}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="Remove card"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <Input
                      type="text"
                      placeholder="Enter small card text"
                      value={smallCardText.card2.value}
                      onChange={(e) => handleSmallCardTextChange('card2', e.target.value)}
                      className="text-slate-800"
                      color="blue"
                      labelProps={{ className: "text-slate-700 font-medium" }}
                    />
                    <p className="text-xs text-slate-500 text-right mt-1">
                      {smallCardText.card2.value.length}/{SMALL_CARD_TEXT_MAX_LENGTH}
                    </p>
                  </div>
                )}
                {smallCardText.card3.visible && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-800">Card 3</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSmallCardText('card3')}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="Remove card"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <Input
                      type="text"
                      placeholder="Enter small card text"
                      value={smallCardText.card3.value}
                      onChange={(e) => handleSmallCardTextChange('card3', e.target.value)}
                      className="text-slate-800"
                      color="blue"
                      labelProps={{ className: "text-slate-700 font-medium" }}
                    />
                    <p className="text-xs text-slate-500 text-right mt-1">
                      {smallCardText.card3.value.length}/{SMALL_CARD_TEXT_MAX_LENGTH}
                    </p>
                  </div>
                )}
                {smallCardText.card4.visible && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-800">Card 4</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSmallCardText('card4')}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="Remove card"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <Input
                      type="text"
                      placeholder="Enter small card text"
                      value={smallCardText.card4.value}
                      onChange={(e) => handleSmallCardTextChange('card4', e.target.value)}
                      className="text-slate-800"
                      color="blue"
                      labelProps={{ className: "text-slate-700 font-medium" }}
                    />
                    <p className="text-xs text-slate-500 text-right mt-1">
                      {smallCardText.card4.value.length}/{SMALL_CARD_TEXT_MAX_LENGTH}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Note Section */}
            <div className="rounded-xl bg-blue-50/50 border border-blue-200/50 p-4">
              <p className="text-sm text-blue-800 font-medium mb-2">💡 Tips</p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc pl-4">
                <li>Enable OneID login for candidates to sign in before applying</li>
                <li>Contact form allows candidates to reach your support team</li>
                <li>Customize branding to match your company identity</li>
                <li>Add card data to showcase additional information on your career page</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-end gap-3 px-6 py-4 border-t border-slate-200/80 bg-slate-50/90 shrink-0">
        <Button
          variant="outlined"
          className="border-slate-300 text-slate-700 px-6 py-2.5"
          onClick={onClose}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          className="bg-[#8bc9f8] text-white px-6 py-2.5"
          onClick={handleSave}
          disabled={loading || saving}
        >
          {saving ? "Saving…" : "Save Settings"}
        </Button>
      </div>
    </div>
  );

  const previewSlide = CAREER_PREVIEW_SLIDES[careerPreviewFocus] ?? CAREER_PREVIEW_SLIDES[0];
  const previewLen = CAREER_PREVIEW_SLIDES.length;

  const careerPreviewModal =
    typeof document !== "undefined" &&
    careerPreviewOpen &&
    createPortal(
      <div
        className="fixed inset-0 z-[99999] flex flex-col bg-black"
        role="dialog"
        aria-modal="true"
        aria-labelledby="career-preview-title"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white">
          <h2 id="career-preview-title" className="min-w-0 flex-1 truncate font-poppins text-base font-semibold sm:text-lg">
            {previewSlide.label}
          </h2>
          <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-sm tabular-nums text-white/90">
            {careerPreviewFocus + 1} / {previewLen}
          </span>
          <button
            type="button"
            aria-label="Close preview"
            className="shrink-0 rounded-lg p-2 text-white/90 transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40"
            onClick={() => setCareerPreviewOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 py-2 sm:px-6">
          <button
            type="button"
            aria-label="Previous image"
            className="absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:left-4"
            onClick={() =>
              setCareerPreviewFocus((i) => (i - 1 + previewLen) % previewLen)
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <img
            src={previewSlide.src}
            alt={previewSlide.label}
            className="max-h-[calc(100dvh-8rem)] w-auto max-w-full object-contain"
            draggable={false}
          />

          <button
            type="button"
            aria-label="Next image"
            className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:right-4"
            onClick={() => setCareerPreviewFocus((i) => (i + 1) % previewLen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <p className="shrink-0 px-4 pb-4 text-center text-xs text-white/50">
          Arrow keys ← → to step through images · Escape to close
        </p>
      </div>,
      document.body
    );

  /** Hide the Career page settings dialog while full-screen preview is active — only the image viewer is shown. */
  const showSettingsDialog = openDialog && !careerPreviewOpen;

  return (
    <>
      {showSettingsDialog && (
        <CustomDialog
          openDialog={showSettingsDialog}
          handleOpen={onClose}
          title="Career page settings"
          size="xl"
          footer={false}
          scrollableBody
          compo={body}
        />
      )}
      {careerPreviewModal}
    </>
  );
};

export default HireCareerSettingsModal;
