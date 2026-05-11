import { Button, Input, Radio, Typography } from "@material-tailwind/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
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

function normalizeCompanyYear(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const num = Number(raw);
  if (!Number.isNaN(num)) {
    // Already a year like 2025
    if (num >= 1900 && num <= 3000) return String(Math.trunc(num));
    // Unix timestamp seconds/ms -> year
    const date = new Date(num > 1e12 ? num : num * 1000);
    if (!Number.isNaN(date.getTime())) return String(date.getUTCFullYear());
  }
  // Fallback for date-like strings
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) return String(parsed.getUTCFullYear());
  return "";
}

const NOTE_COPY = (
  <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
    <p className="font-medium text-slate-800">Note</p>
    <p>
      These settings control how candidates interact with your public hiring
      career page.
    </p>
    <ul className="list-disc pl-5 space-y-2">
      <li>
        <span className="font-medium">OneID login:</span> When enabled,
        candidates sign in with OneID and complete their profile before they can
        apply.
      </li>
      <li>
        <span className="font-medium">Contact form:</span> When enabled,
        candidates can contact your organization from the hiring page. Provide
        your support email address.
      </li>
    </ul>
  </div>
);

function BoolSettingRow({ label, namePrefix, value, onChange }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 min-w-0">
      <Typography className="text-slate-800 font-medium text-sm min-w-0 sm:pr-2">
        {label}
      </Typography>
      <div className="flex flex-wrap items-center gap-6 shrink-0">
        <Radio
          color="blue"
          name={`${namePrefix}_yes`}
          label="Yes"
          checked={value === true}
          onChange={() => onChange(true)}
          className="text-sm"
          labelProps={{ className: "text-slate-700" }}
        />
        <Radio
          color="blue"
          name={`${namePrefix}_no`}
          label="No"
          checked={value === false}
          onChange={() => onChange(false)}
          className="text-sm"
          labelProps={{ className: "text-slate-700" }}
        />
      </div>
    </div>
  );
}

function normalizeLimitNoFromApi(value) {
  if (value == null || value === "") return "10";
  const num = Number(value);
  if (!Number.isFinite(num) || num < 1) return "10";
  return String(Math.min(999, Math.trunc(num)));
}

function stateFromHiringSetting(hs) {
  if (!hs || typeof hs !== "object") {
    return {
      oneidSetting: true,
      contactFormEnabled: false,
      contactFormUrl: "",
      headerText: "",
      sybHeading: "",
      image: "",
      headerColor: "#1E40AF",
      companyTime: "",
      companyAbout: "",
      limitNo: "10",
      cards: [
        { id: 1, heading: "", body: "", visible: true },
        { id: 2, heading: "", body: "", visible: true },
        { id: 3, heading: "", body: "", visible: true },
      ],
      smallCardText: {
        card1: "",
        card2: "",
        card3: "",
        card4: "",
      },
    };
  }
  const oneidSetting = !!hs.oneid_setting;
  const raw = hs.contact_form;
  const hasContact =
    raw != null &&
    String(raw).trim() !== "" &&
    String(raw).trim().toLowerCase() !== "null";

  // Convert custom format back to HTML for display
  const convertFromCustomFormat = (customFormat) => {
    if (!customFormat) return "";
    let converted = customFormat;

    // Convert <Xpx>text</Xpx> to <span style="font-size: Xpx">text</span>
    converted = converted.replace(/<(\d+)px>(.*?)<\/\1px>/gi, '<span style="font-size: $1px">$2</span>');

    return converted;
  };

  // Load card data
  const cards = hs.card_data && Array.isArray(hs.card_data)
    ? hs.card_data.map((card, index) => ({
        id: index + 1,
        heading: card.heading || "",
        body: convertFromCustomFormat(card.body || ""),
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
    : {
        card1: { value: "", visible: true },
        card2: { value: "", visible: true },
        card3: { value: "", visible: true },
        card4: { value: "", visible: true },
      };

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
    companyTime: normalizeCompanyYear(hs.company_time),
    companyAbout: hs.company_about
      ? convertFromCustomFormat(String(hs.company_about)).slice(0, COMPANY_ABOUT_MAX_LENGTH)
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
  const [companyTime, setCompanyTime] = useState("");
  const [companyAbout, setCompanyAbout] = useState("");
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

  // Rich text editor handlers - disabled for textarea
  const handleFormatText = (command, value = null) => {
    // Rich text formatting is not available with textarea
    // This is a temporary fix for the text direction issue
    showToast("Rich text formatting is currently disabled to fix text direction issues.", "info");
  };

  const handleAboutInput = () => {
    if (aboutEditorRef.current) {
      const textContent = aboutEditorRef.current.value || "";
      
      if (textContent.length > COMPANY_ABOUT_MAX_LENGTH) {
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
      setCompanyAbout(textContent);
    }
  };

  // Convert HTML to custom format for database storage
  const convertToCustomFormat = (html) => {
    if (!html) return "";
    let converted = html;

    // Convert <strong> to <b>
    converted = converted.replace(/<strong>/gi, '<b>');
    converted = converted.replace(/<\/strong>/gi, '</b>');

    // Convert <em> to <i>
    converted = converted.replace(/<em>/gi, '<i>');
    converted = converted.replace(/<\/em>/gi, '</i>');

    // Convert <span style="font-weight: bold"> to <b>
    converted = converted.replace(/<span[^>]*style="[^"]*font-weight:\s*bold[^"]*"[^>]*>(.*?)<\/span>/gi, '<b>$1</b>');

    // Convert <span style="font-style: italic"> to <i>
    converted = converted.replace(/<span[^>]*style="[^"]*font-style:\s*italic[^"]*"[^>]*>(.*?)<\/span>/gi, '<i>$1</i>');

    // Convert <span style="font-size: Xpx"> to <Xpx>
    converted = converted.replace(/<span[^>]*style="[^"]*font-size:\s*(\d+)px[^"]*"[^>]*>(.*?)<\/span>/gi, '<$1px>$2</$1px>');

    // Convert inline style="font-weight: bold" to <b>
    converted = converted.replace(/<[^>]+style="[^"]*font-weight:\s*bold[^"]*"[^>]*>/gi, (match) => {
      const tag = match.match(/<(\w+)/)[1];
      const content = match.replace(/<[^>]+>/gi, '');
      return `<b>${content}</b>`;
    });

    // Convert inline style="font-style: italic" to <i>
    converted = converted.replace(/<[^>]+style="[^"]*font-style:\s*italic[^"]*"[^>]*>/gi, (match) => {
      const tag = match.match(/<(\w+)/)[1];
      const content = match.replace(/<[^>]+>/gi, '');
      return `<i>${content}</i>`;
    });

    // Remove any remaining span tags with empty styles
    converted = converted.replace(/<span[^>]*>/gi, '');
    converted = converted.replace(/<\/span>/gi, '');

    return converted;
  };

  // Convert custom format back to HTML for display
  const convertFromCustomFormat = (customFormat) => {
    if (!customFormat) return "";
    let converted = customFormat;

    // Convert <Xpx>text</Xpx> to <span style="font-size: Xpx">text</span>
    converted = converted.replace(/<(\d+)px>(.*?)<\/\1px>/gi, '<span style="font-size: $1px">$2</span>');

    // Convert <b> to <strong> (or keep as <b>)
    converted = converted.replace(/<b>/gi, '<b>');
    converted = converted.replace(/<\/b>/gi, '</b>');

    // Convert <i> to <em> (or keep as <i>)
    converted = converted.replace(/<i>/gi, '<i>');
    converted = converted.replace(/<\/i>/gi, '</i>');

    return converted;
  };

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
        setCompanyTime(next.companyTime);
        setCompanyAbout(next.companyAbout);
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

      // Convert company_about to custom format
      const companyAboutFormatted = convertToCustomFormat(companyAbout);

      // Prepare card_data JSON
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
        company_time: normalizeCompanyYear(companyTime),
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
                {/* Company Image */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Company Logo</label>
                  <input
                    ref={imageFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadImage}
                    className="hidden"
                  />
                  <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50">
                    {image ? (
                      <img
                        src={image}
                        alt="Company"
                        className="h-16 w-16 rounded-lg border border-slate-200 object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-lg border-2 border-dashed border-slate-300 bg-slate-100 flex items-center justify-center shrink-0">
                        <span className="text-xs text-slate-400">No image</span>
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="outlined"
                      className="border-slate-300 text-slate-700 normal-case"
                      onClick={() => imageFileInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? "Uploading..." : "Upload Logo"}
                    </Button>
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

                {/* Company Year */}
                <div className="space-y-2">
                  <Input
                    type="number"
                    label="Company Year"
                    placeholder="2025"
                    value={companyTime}
                    onChange={(e) => {
                      const raw = String(e.target.value || "");
                      const digitsOnly = raw.replace(/\D/g, "").slice(0, 4);
                      setCompanyTime(digitsOnly);
                    }}
                    min={1900}
                    max={3000}
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
                  <div className="border border-slate-300 rounded-lg overflow-hidden">
                    {/* Formatting Toolbar */}
                    <div className="flex items-center gap-2 p-2 bg-slate-50 border-b border-slate-200">
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          aboutEditorRef.current?.focus();
                          handleFormatText('bold');
                        }}
                        className="p-2 rounded hover:bg-slate-200 transition-colors text-slate-700"
                        title="Bold"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          aboutEditorRef.current?.focus();
                          handleFormatText('italic');
                        }}
                        className="p-2 rounded hover:bg-slate-200 transition-colors text-slate-700"
                        title="Italic"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 4h4m-2 0v16m-4 0h8" />
                        </svg>
                      </button>
                      <div className="w-px h-6 bg-slate-300 mx-2"></div>
                      <select
                        onChange={(e) => handleFormatText('fontSize', e.target.value)}
                        className="px-2 py-1 rounded border border-slate-300 text-sm text-slate-700 bg-white"
                      >
                        {[1, 2, 4, 6, 8, 9, 10, 11, 12, 14, 16, 18, 20].map(size => (
                          <option key={size} value={`${size}px`} selected={size === 12}>{size}px</option>
                        ))}
                      </select>
                    </div>
                    {/* Content Editable Div */}
                    <textarea
                      ref={aboutEditorRef}
                      value={companyAbout}
                      onChange={handleAboutInput}
                      placeholder="Write a short description about your company..."
                      className="w-full px-4 py-3 text-sm text-slate-800 outline-none min-h-[100px] focus:border-[#8bc9f8] focus:ring-1 focus:ring-[#8bc9f8] resize-none"
                      style={{ minHeight: '100px', direction: 'ltr', unicodeBidi: 'normal', textAlign: 'left' }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 text-right">
                    {companyAbout.length}/{COMPANY_ABOUT_MAX_LENGTH}
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

  return (
    <CustomDialog
      openDialog={openDialog}
      handleOpen={onClose}
      title="Career page settings"
      size="xl"
      footer={false}
      scrollableBody
      compo={body}
    />
  );
};

export default HireCareerSettingsModal;
