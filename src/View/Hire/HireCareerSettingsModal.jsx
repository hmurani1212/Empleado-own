import { Button, Input, Radio, Typography } from "@material-tailwind/react";
import React, { useCallback, useEffect, useState } from "react";
import CustomDialog from "../../Components/CustomDialog/CustomDialog";
import hireApi from "../../Model/Data/Hire/Hire_2";
import { showToast } from "../../Components/Toaster/Toaster";

/** Aligns with Validation.js email patterns used elsewhere in the app */
const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

function isValidEmail(value) {
  if (value == null || typeof value !== "string") return false;
  const t = value.trim();
  if (!t) return false;
  return EMAIL_REGEX.test(t);
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
        a support email that inquiries will be sent to.
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

function stateFromHiringSetting(hs) {
  if (!hs || typeof hs !== "object") {
    return {
      oneidSetting: true,
      contactFormEnabled: false,
      contactFormEmail: "",
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
    contactFormEmail: hasContact ? String(raw).trim() : "",
  };
}

const HireCareerSettingsModal = ({ openDialog, onClose }) => {
  const [loadedSetting, setLoadedSetting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [oneidSetting, setOneidSetting] = useState(true);
  const [contactFormEnabled, setContactFormEnabled] = useState(false);
  const [contactFormEmail, setContactFormEmail] = useState("");

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
        setContactFormEmail(next.contactFormEmail);
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
        showToast("Please enter a valid email.", "error");
        return;
      }
    }

    setSaving(true);
    try {
      const contact_form = contactFormEnabled
        ? contactFormEmail.trim()
        : null;

      const payload = {
        oneid_setting: oneidSetting,
        contact_form,
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
                  label="Enter email"
                  placeholder="Enter email"
                  value={contactFormEmail}
                  onChange={(e) => setContactFormEmail(e.target.value)}
                  className="text-slate-800"
                  color="blue"
                  labelProps={{ className: "text-slate-700" }}
                />
                <p className="text-xs text-slate-500 mt-2">
                  Please provide the email for contact support on the hiring
                  page. Candidates will use the contact form to reach your
                  organization.
                </p>
              </div>
            )}
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
      size="md"
      footer={false}
      scrollableBody
      compo={body}
    />
  );
};

export default HireCareerSettingsModal;
