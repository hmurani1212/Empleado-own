import { useState } from "react";
import { showToast } from "../../Components/Toaster/Toaster";
import notesPoolApi from "../../Model/Data/NotesPool/NotesPool";

const useSharedNotebookHandler = () => {
  const [shareNotebookValue, setShareNotebookValue] = useState({
    id: "",
    show: false,
    type: 2,
    notebook_name: "",
    allowPermission: [],
    shareWith: null,
    loading: false,
    showSubDept: [],
    empDepartment_id: [],
    empBranches_id: [],
    emp_id: [],
    operation_type: "notebook_sharing_operation",
  });

  const [copied, setCopied] = useState(false);

  const handleShareMenuClick = (notebook) => {
    setShareNotebookValue((prevState) => ({
      ...prevState,
      id: notebook._id || notebook.id,
      notebook_name: notebook.notebook_name,
      show: true,
      type: 2,
      allowPermission: [],
      shareWith: null,
      empDepartment_id: [],
      empBranches_id: [],
      emp_id: [],
    }));
  };

  const toggleShareDialog = () => {
    setShareNotebookValue((prevState) => ({
      ...prevState,
      show: false,
    }));
  };

  const handleChangeShareNotebook = (e) => {
    const { name, value } = e.target;

    setShareNotebookValue((prevState) => {
      let newState = { ...prevState };

      if (name === "type") {
        const finalValue = parseInt(value);
        newState = {
          ...newState,
          [name]: finalValue,
        };
      } else if (name === "allowPermission") {
        // Toggle permission - add if not present, remove if already present
        const isPresent = prevState.allowPermission.includes(value);
        newState = {
          ...newState,
          [name]: isPresent
            ? prevState.allowPermission.filter((perm) => perm !== value)
            : [...prevState.allowPermission, value],
        };
      } else if (name === "shareWith") {
        // Clear other arrays when 'shareWith' is changed
        newState = {
          ...newState,
          empBranches_id: [],
          empDepartment_id: [],
          emp_id: [],
          [name]: value,
        };
      } else if (name === "empBranches_id") {
        const isPresent = prevState.empBranches_id.includes(value);
        newState = {
          ...newState,
          [name]: isPresent
            ? prevState.empBranches_id.filter((id) => id !== value)
            : [...prevState.empBranches_id, value],
        };
      } else if (name === "empDepartment_id") {
        const isPresent = prevState.empDepartment_id.includes(value);
        newState = {
          ...newState,
          [name]: isPresent
            ? prevState.empDepartment_id.filter((id) => id !== value)
            : [...prevState.empDepartment_id, value],
        };
      } else if (name === "emp_id") {
        const isPresent = prevState.emp_id.includes(value);
        newState = {
          ...newState,
          [name]: isPresent
            ? prevState.emp_id.filter((id) => id !== value)
            : [...prevState.emp_id, value],
        };
      } else {
        newState = {
          ...newState,
          [name]: value,
        };
      }

      return newState;
    });
  };

  const handleSelectShareNote = (select, field) => {
    setShareNotebookValue((prevState) => ({
      ...prevState,
      [field]: select,
    }));
  };

  const handleToggleSubDept = (deptId) => {
    setShareNotebookValue((prevState) => {
      const isDeptVisible = prevState.showSubDept?.includes(deptId);

      return {
        ...prevState,
        showSubDept: isDeptVisible
          ? prevState.showSubDept.filter((id) => id !== deptId)
          : [...(prevState.showSubDept || []), deptId],
      };
    });
  };

  const shareNotebookValidation = () => {
    const {
      notebook_name,
      allowPermission,
      shareWith,
      empBranches_id,
      empDepartment_id,
      emp_id,
    } = shareNotebookValue;

    if (!notebook_name || notebook_name.trim() === "") {
      showToast("Please enter notebook name", "error");
      return false;
    }
    if (!allowPermission || allowPermission.length === 0) {
      showToast("Please select at least one permission", "error");
      return false;
    }
    if (!shareWith) {
      showToast("Please select who to share with", "error");
      return false;
    }

    // Validate based on shareWith selection
    if (shareWith === "branch") {
      if (!empBranches_id || empBranches_id.length === 0) {
        showToast("Please select at least one branch", "error");
        return false;
      }
    } else if (shareWith === "dept") {
      if (!empDepartment_id || empDepartment_id.length === 0) {
        showToast("Please select at least one department", "error");
        return false;
      }
    } else if (shareWith === "employee") {
      if (!emp_id || emp_id.length === 0) {
        showToast("Please select at least one employee", "error");
        return false;
      }
    }
    return true;
  };

  const handleShareNotebookAdd = async () => {
    const { id, operation_type } = shareNotebookValue;
    const validation = shareNotebookValidation();

    if (validation) {
      setShareNotebookValue((prevState) => ({
        ...prevState,
        loading: true,
      }));

      try {
        // Transform permissions array to object with values of 1
        const permissionsObject = {};
        shareNotebookValue.allowPermission.forEach((permission) => {
          permissionsObject[permission] = 1;
        });

        const apiDataAdd = {
          notebook_id: id,
          operation_type: operation_type,
          notebook_type: "new_notebook",
          notebook_name: shareNotebookValue.notebook_name,
          new_notebook_name: shareNotebookValue.notebook_name,
          ...permissionsObject,
          name_dept_branch: shareNotebookValue.shareWith,
          branch: shareNotebookValue.empBranches_id,
          dept: shareNotebookValue.empDepartment_id,
          members: shareNotebookValue.emp_id,
        };

        const response = await notesPoolApi.shareNoteBookPoint(apiDataAdd);
        const responseData = await response.data;

        if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
          showToast(`Notebook shared successfully`, "success");
          setShareNotebookValue((prevState) => ({
            ...prevState,
            show: false,
          }));
        } else {
          const error = responseData.ERROR_DESCRIPTION;
          showToast(error, "error");
        }
      } catch (err) {
        console.error("Share notebook error:", err);
        showToast("Failed to share notebook", "error");
      } finally {
        setShareNotebookValue((prevState) => ({
          ...prevState,
          loading: false,
        }));
      }
    }
  };

  const handleCopytoClipboard = async (text) => {
    if (!text || text.trim() === "") {
      showToast("No link available to copy", "error");
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        showToast("Link copied to clipboard", "success");
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          const successful = document.execCommand("copy");
          if (successful) {
            setCopied(true);
            showToast("Link copied to clipboard", "success");
          } else {
            throw new Error("execCommand failed");
          }
        } catch (err) {
          throw err;
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error("Copy failed:", err);
      setCopied(false);
      showToast(
        "Failed to copy link. Please try selecting and copying manually.",
        "error"
      );
    }
  };

  const handleCopytoClipboardMouseLeave = () => {
    setCopied(false);
  };

  return {
    shareNotebookValue,
    handleShareMenuClick,
    toggleShareDialog,
    handleChangeShareNotebook,
    handleSelectShareNote,
    handleToggleSubDept,
    handleShareNotebookAdd,
    handleCopytoClipboard,
    handleCopytoClipboardMouseLeave,
    copied,
  };
};

export default useSharedNotebookHandler;
