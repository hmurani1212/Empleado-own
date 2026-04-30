import { Button, Input, Radio, Typography } from "@material-tailwind/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import CustomDialog from "../../Components/CustomDialog/CustomDialog";
import hireApi from "../../Model/Data/Hire/Hire_2";
import { showToast } from "../../Components/Toaster/Toaster";
import axios from "axios";

const MAKE_URL_ENDPOINT =
  "https://emp.veevotech.com/empleado_app/hiring/api/v1/organizations/make_url";
const COMPANY_ABOUT_MAX_LENGTH = 448;

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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 border-b border-slate-200/80 last:border-0 min-w-0">
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
      image: "",
      headerColor: "#1E40AF",
      companyTime: "",
      companyAbout: "",
      limitNo: "10",
    };
  }
  const oneidSetting = !!hs.oneid_setting;
  const raw = hs.contact_form;
  const hasContact =
    raw != null &&
    String(raw).trim() !== "" &&
    String(raw).trim().toLowerCase() !== "null";
  return {
    oneidSetting,
    contactFormEnabled: hasContact,
    contactFormUrl: hasContact ? String(raw).trim() : "",
    headerText: hs.header_text ? String(hs.header_text) : "",
    image: hs.image ? String(hs.image) : "",
    headerColor: normalizeHexColor(hs.header_color, "#1E40AF"),
    companyTime: normalizeCompanyYear(hs.company_time),
    companyAbout: hs.company_about
      ? String(hs.company_about).slice(0, COMPANY_ABOUT_MAX_LENGTH)
      : "",
    limitNo: normalizeLimitNoFromApi(hs.limit_no),
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
  const [image, setImage] = useState("");
  const [headerColor, setHeaderColor] = useState("#1E40AF");
  const [companyTime, setCompanyTime] = useState("");
  const [companyAbout, setCompanyAbout] = useState("");
  const [limitNo, setLimitNo] = useState("10");
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageFileInputRef = useRef(null);
  const aboutLimitToastShownRef = useRef(false);

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
        setImage(next.image);
        setHeaderColor(next.headerColor);
        setCompanyTime(next.companyTime);
        setCompanyAbout(next.companyAbout);
        setLimitNo(next.limitNo);
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

      const payload = {
        oneid_setting: oneidSetting,
        contact_form,
        header_text: String(headerText || "").trim(),
        image: String(image || "").trim(),
        header_color: normalizeHexColor(headerColor, "#1E40AF"),
        company_time: normalizeCompanyYear(companyTime),
        company_about: String(companyAbout || "")
          .trim()
          .slice(0, COMPANY_ABOUT_MAX_LENGTH),
        limit_no: limitNum,
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
      <div className="p-5 space-y-5">
        <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4">
          {NOTE_COPY}
        </div>

        {loading ? (
          <p className="text-sm text-slate-500 py-6 text-center">Loading…</p>
        ) : (
          <div className="rounded-xl border border-slate-200/80 bg-white px-4 min-w-0">
            <BoolSettingRow
              label="OneID login"
              namePrefix="oneid"
              value={oneidSetting}
              onChange={setOneidSetting}
            />
            <BoolSettingRow
              label="Contact form"
              namePrefix="contact_form"
              value={contactFormEnabled}
              onChange={onContactFormToggle}
            />
            {contactFormEnabled && (
              <div className="py-3 border-b border-slate-200/80 last:border-0">
                <Input
                  type="email"
                  label="Contact email"
                  placeholder="name@company.com"
                  value={contactFormEmail}
                  onChange={(e) => setContactFormEmail(e.target.value)}
                  className="text-slate-800"
                  color="blue"
                  labelProps={{ className: "text-slate-700" }}
                />
                <p className="text-xs text-slate-500 mt-2">
                  Please provide the contact email for the hiring page.
                </p>
              </div>
            )}
            <div className="py-3 border-b border-slate-200/80 last:border-0 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div className="space-y-2 min-w-0">
                <Typography className="text-slate-700 text-sm">
                  Company image
                </Typography>
                <input
                  ref={imageFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImage}
                  className="hidden"
                />
                <div className="flex items-center gap-2">
                  {image ? (
                    <img
                      src={image}
                      alt="Company"
                      className="h-14 w-14 rounded-md border border-slate-200 object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-md border border-dashed border-slate-300 bg-slate-50 shrink-0" />
                  )}
                  <Button
                    size="sm"
                    variant="outlined"
                    className="border-slate-300 text-slate-700 normal-case"
                    onClick={() => imageFileInputRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? "Uploading..." : "Upload image"}
                  </Button>
                </div>
              </div>
              <Input
                type="text"
                label="Header text"
                placeholder="Join Our Team"
                value={headerText}
                onChange={(e) => setHeaderText(e.target.value)}
                className="text-slate-800"
                color="blue"
                labelProps={{ className: "text-slate-700" }}
              />
              <Input
                type="number"
                label="Company year"
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
            <div className="pb-3 border-b border-slate-200/80 last:border-0">
              <p className="text-xs text-slate-600">
                Selected company year: <span className="font-medium">{companyTime || "--"}</span>
              </p>
            </div>
            <div className="py-3 border-b border-slate-200/80 last:border-0">
              <div className="flex items-center gap-3 rounded-lg border border-slate-300 px-3 py-2 h-[42px]">
                <label className="text-sm text-slate-700 shrink-0">Header color</label>
                <input
                  type="color"
                  value={headerColor}
                  onChange={(e) => setHeaderColor(e.target.value)}
                  className="h-7 w-10 cursor-pointer border-0 p-0 bg-transparent"
                />
                <span className="text-xs text-slate-500">{headerColor}</span>
              </div>
            </div>
            <div className="py-3 border-b border-slate-200/80 last:border-0">
              <Input
                type="number"
                label="Vacancies per career page"
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
              <p className="text-xs text-slate-500 mt-2">
                Please enter the number of vacancies you want to show on each
                career page.
              </p>
            </div>
            <div className="py-3 border-b border-slate-200/80 last:border-0">
              <Typography className="text-slate-700 text-sm mb-2">
                About Company
              </Typography>
              <textarea
                value={companyAbout}
                onChange={(e) => {
                  const nextRaw = String(e.target.value || "");
                  if (nextRaw.length > COMPANY_ABOUT_MAX_LENGTH) {
                    if (!aboutLimitToastShownRef.current) {
                      showToast(
                        `About Company cannot exceed ${COMPANY_ABOUT_MAX_LENGTH} characters.`,
                        "error"
                      );
                      aboutLimitToastShownRef.current = true;
                    }
                    setCompanyAbout(nextRaw.slice(0, COMPANY_ABOUT_MAX_LENGTH));
                    return;
                  }
                  aboutLimitToastShownRef.current = false;
                  setCompanyAbout(nextRaw);
                }}
                placeholder="Write a short description about your company..."
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-slate-500 text-right">
                {companyAbout.length}/{COMPANY_ABOUT_MAX_LENGTH}
              </p>
            </div>
          </div>
        )}

        <p className="text-xs text-slate-500">
          Changes apply to your public career page.
        </p>
      </div>

      <div className="flex flex-wrap justify-end gap-3 px-5 py-4 border-t border-slate-200/80 bg-slate-50/90 shrink-0">
        <Button
          variant="outlined"
          className="border-slate-300 text-slate-700"
          onClick={onClose}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          className="bg-brand-500"
          onClick={handleSave}
          disabled={loading || saving}
        >
          {saving ? "Saving…" : "Save"}
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
