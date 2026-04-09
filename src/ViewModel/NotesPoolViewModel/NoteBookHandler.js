import { useState } from "react";
import { validateInput } from "../../Validation/CustomValidation";
import { showToast } from "../../Components/Toaster/Toaster";
import notesPoolApi from "../../Model/Data/NotesPool/NotesPool";
import useStore from "../../Store/store";
import {
  gettingDepartmentsServices,
  gettingEmployesServices,
} from "../../services/__frequentApiServices";
import getEmployeesList from "../EmployeeViewModel/Employees";
import { normalizeMySharedNotebooksFromApi, buildSharingPermission } from "../../services/__notesPoolServices";

const useNoteBookHandler = () => {
  const updateNoteBook = useStore((state) => state.updateNoteBook);
  const notebookDelete = useStore((state) => state.notebookDelete);

  const [notesValue, setNotesValue] = useState({
    id: "",
    name: "",
    show: false,
    loading: false,
    update: true,
    deleteConfirmation: false,
  });

  const [shareNotebookValue, setShareNotebookValue] = useState({
    // notebook_id:'',
    id: "",
    existing_nb_id: "",
    members: [],
    show: false,
    type: 1,
    notebookList: [],
    notebook_id: null,
    shared_notebook_id: null,
    mySharedNotebooks: [],
    branches: [],
    branch_id: null,
    departments: [],
    department_id: null,
    operation_type: "notebook_sharing_operation",
    allowPermission: [],
    shareWith: null,
    loading: false,
    showSubDept: [],
    empDepartment: [],
    empDepartment_id: null,
    empBranches: [],
    empBranches_id: null,
    empsList: [],
    emp_id: [],
    notebook_name: "",
    textToCopy: "",
    /** True while getMySharedNotebooks / notebook list for the shared-pool picker is in flight */
    loadingMySharedNotebooks: false,
  });


  const validateNoteBook = () => {
    const { name } = notesValue;
    const nameValidation = validateInput("Notebook Title", name);
    if (!nameValidation.isValid) {
      return { isValid: false, message: nameValidation.message };
    }
    return { isValid: true, message: "" };
  };

  const handleMenuList = (data, menuItem) => {
    switch (menuItem.id) {
      case 1:
        setNotesValue((prevState) => ({
          ...prevState,
          update: true,
          show: true,
          id: data.id,
          name: data.notebook_title,
        }));

        break;
      case 2:
        setNotesValue((prevState) => ({
          ...prevState,
          id: data.id,
          deleteConfirmation: true,
        }));

        break;

      case 3:
        gettingNotebookList();
        setShareNotebookValue((prevState) => ({
          ...prevState,
          type: 1,
          id: data.id,
          show: true,
          notebook_name: data.notebook_title,
        }));
        // // Fetch my shared notebooks when opening the share modal
        // console.log("🚀 Opening share modal for notebook, fetching shared notebooks...");
        // // Add a small delay to ensure state is set
        // setTimeout(() => {
        //     console.log("⏰ Timeout triggered, calling fetchMySharedNotebooks...");
        //     fetchMySharedNotebooks();
        // }, 100);

        break;

      default:
        break;
    }
  };

  const toggleNoteBookShare = () => {
    setShareNotebookValue((prevState) => ({
      ...prevState,
      show: false,
    }));
  };

  const handleConfirmToggle = () => {
    setNotesValue((prevState) => ({
      ...prevState,
      deleteConfirmation: false,
    }));
  };

  const handleDrawerToggle = () => {
    setNotesValue((prevState) => ({
      ...prevState,
      show: false,
    }));
  };

  const handleNoteBookInputChange = (e) => {
    const { name, value } = e.target;
    setNotesValue((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitNoteBook = async (e) => {
    e.preventDefault();
    const validation = validateNoteBook();
    if (!validation.isValid) {
      showToast(validation.message, "error"); // Display the validation message to the user
      return;
    }
    setNotesValue((prevState) => ({
      ...prevState,
      loading: true,
    }));
    try {
      const apiData = {
        notebook_id: notesValue.id,
        notebook_title: notesValue.name,
      };
      const response = await notesPoolApi.updateNoteBook(apiData);
      const responseData = response.data;
      if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
        // Build the update payload from known local values so the store update
        // is reliable even when the API response uses _id instead of id, or
        // returns an incomplete / differently-shaped object.
        updateNoteBook({
          ...(responseData.DB_DATA || {}),
          id: notesValue.id,
          _id: notesValue.id,
          notebook_id: notesValue.id,
          notebook_title: notesValue.name,
        });
        showToast("Notebook Updated Successfully", "success");
        handleDrawerToggle();
      } else {
        const error = responseData.ERROR_DESCRIPTION;
        showToast(error, "error");
        handleDrawerToggle();
      }
    } catch (err) {
      console.error("Update notebook error:", err);
      showToast("Failed to update notebook", "error");
      handleDrawerToggle();
    } finally {
      setNotesValue((prevState) => ({
        ...prevState,
        loading: false,
      }));
    }
  };

  const deleteNoteBook = async () => {
    const apiData = { id: notesValue.id, portal: "admin" };
    console.log("Delete notebook - API data:", apiData);
    setNotesValue((prevState) => ({
      ...prevState,
      loading: true,
    }));
    try {
      const response = await notesPoolApi.deleteSpecificNoteBook(apiData);
      const responseData = response.data;
      
      if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
        notebookDelete(notesValue.id);
        showToast("Notebook Deleted Successfully", "success");
        handleConfirmToggle();
      } else {
        const error = responseData.ERROR_DESCRIPTION;
        showToast(error, "error");
        handleConfirmToggle();
      }
    } catch (err) {
      console.error("Delete notebook error:", err);
      showToast("Failed to delete notebook", "error");
      handleConfirmToggle();
    } finally {
      setNotesValue((prevState) => ({
        ...prevState,
        loading: false,
      }));
    }
  };

  const handleChangeShareNotebook = (e) => {
    const { name, value } = e.target;

    if (name === "type" && parseInt(value, 10) === 1) {
      void gettingNotebookList();
    }

    setShareNotebookValue((prevState) => {
      let newState = { ...prevState };

      if (name === "type") {
        const finalValue = parseInt(value);
        if (finalValue === 3) {
          getNotebookPublicLink();
        }
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
            ? prevState.allowPermission.filter(perm => perm !== value)
            : [...prevState.allowPermission, value],
        };
      } else if (name === "shareWith") {
        // Clear other arrays when 'shareWith' is changed (null for react-select single-value fields)
        newState = {
          ...newState,
          empBranches_id: null,
          empDepartment_id: null,
          emp_id: [],
          [name]: value,
        };
      } else if (name === "empBranches_id") {
        {
          const rawVal = value;
          const prevRaw = prevState.empBranches_id;
          let prev = [];
          if (Array.isArray(prevRaw)) prev = [...prevRaw];
          else if (prevRaw != null && typeof prevRaw === "object" && prevRaw.value != null)
            prev = [prevRaw.value];
          else if (prevRaw != null && prevRaw !== "") prev = [prevRaw];
          const coerced =
            typeof rawVal === "string" && rawVal !== "" && !Number.isNaN(Number(rawVal))
              ? Number(rawVal)
              : rawVal;
          const exists = prev.some((x) => x === coerced || String(x) === String(rawVal));
          newState = {
            ...newState,
            [name]: exists
              ? prev.filter((x) => x !== coerced && String(x) !== String(rawVal))
              : [...prev, coerced],
          };
        }
      } else if (name === "empDepartment_id") {
        newState = {
          ...newState,
          [name]: [...prevState.empDepartment_id, value],
        };
      } else if (name === "emp_id") {
        newState = {
          ...newState,
          [name]: [...prevState.emp_id, value],
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

  const gettingNotebookList = async () => {
    setShareNotebookValue((prev) => ({
      ...prev,
      loadingMySharedNotebooks: true,
    }));
    try {
      const sharedNotebooksResponse = await notesPoolApi.getMySharedNotebooks();
      const sharedNotebooksData = sharedNotebooksResponse.data;

      let finalNotebookList = [];
      if (
        sharedNotebooksResponse.status === 200 &&
        sharedNotebooksData.STATUS === "SUCCESSFUL"
      ) {
        finalNotebookList = normalizeMySharedNotebooksFromApi(sharedNotebooksData);
      }

      let branchesEtc = {};
      try {
        const response = await notesPoolApi.getNotebooksList();
        const responseData = response.data;
        if (
          response.status === 200 &&
          responseData.STATUS === "SUCCESSFUL" &&
          responseData.DB_DATA
        ) {
          const dbData = responseData.DB_DATA;
          branchesEtc = {
            branches: dbData.branch,
            empBranches: dbData.branch,
            departments: dbData.dept,
            empDepartment: dbData.dept,
          };
          if (finalNotebookList.length === 0) {
            const regularNotebooks = Array.isArray(dbData.shared_notebooks)
              ? dbData.shared_notebooks
              : [];
            finalNotebookList = regularNotebooks;
          }
        }
      } catch (inner) {
        console.error("getNotebooksList (share modal):", inner);
      }

      setShareNotebookValue((prevState) => ({
        ...prevState,
        notebookList: finalNotebookList,
        mySharedNotebooks: finalNotebookList,
        ...branchesEtc,
        loadingMySharedNotebooks: false,
      }));
    } catch (err) {
      console.error("gettingNotebookList:", err);
      setShareNotebookValue((prevState) => ({
        ...prevState,
        notebookList: [],
        mySharedNotebooks: [],
        loadingMySharedNotebooks: false,
      }));
    }
  };

  const handleSelectShareNote = async (select, field) => {
    
    if (field === "empBranches_id") {
      if (shareNotebookValue.shareWith !== "employee") {
        setShareNotebookValue((prevState) => ({
          ...prevState,
          empBranches_id: select,
          empDepartment_id: null,
        }));
        return;
      }
      try {
        const data = await gettingDepartmentsServices(select.value);
        setShareNotebookValue((prevState) => ({
          ...prevState,
          [field]: select,
          empDepartment: data,
          empsList: [],
          empDepartment_id: null,
        }));
      } catch (error) {
        console.error('Error fetching departments (Notebook):', error);
      }
    } else if (field === "empDepartment_id") {
      // Don't call API - employees are already available in employeeCheckListValue
      // The EmployeeView component filters employees locally from employeeCheckListValue
      setShareNotebookValue((prevState) => ({
        ...prevState,
        [field]: select,
        // empsList will be populated from employeeCheckListValue in the UI component
      }));
    } else {
      setShareNotebookValue((prevState) => ({
        ...prevState,
        [field]: select,
      }));
    }
  };

  const shareNoteValidation = () => {
    const { notebook_id, shared_notebook_id, type, notebook_name, allowPermission, shareWith, empBranches_id, empDepartment_id, emp_id } = shareNotebookValue;

    if (type === 1) {
      if (shared_notebook_id === null) {
        showToast("Please select a shared notebook", "error");
        return false;
      }
    } else if (type === 2) {
      if (!notebook_name || notebook_name.trim() === '') {
        showToast("Please enter notebook name22", "error");
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
      
      // Validate based on shareWith selection (checkbox arrays or react-select { value, label })
      const hasBranch = (v) => {
        if (v == null) return false;
        if (Array.isArray(v)) return v.length > 0;
        return v.value != null && v.value !== "";
      };
      const hasDept = (v) => {
        if (v == null) return false;
        if (Array.isArray(v)) return v.length > 0;
        return v.value != null && v.value !== "";
      };
      if (shareWith === "branch") {
        if (!hasBranch(empBranches_id)) {
          showToast("Please select a branch", "error");
          return false;
        }
      } else if (shareWith === "dept") {
        if (!hasBranch(empBranches_id)) {
          showToast("Please select a branch", "error");
          return false;
        }
        if (!hasDept(empDepartment_id)) {
          showToast("Please select a department", "error");
          return false;
        }
      } else if (shareWith === "employee") {
        if (!empBranches_id || !empDepartment_id) {
          showToast("Please select both branch and department", "error");
          return false;
        }
        if (!emp_id || emp_id.length === 0) {
          showToast("Please select at least one employee", "error");
          return false;
        }
      }
    }
    return true;
  };

  // Function to fetch my shared notebooks
  const fetchMySharedNotebooks = async () => {
    setShareNotebookValue((prev) => ({
      ...prev,
      loadingMySharedNotebooks: true,
    }));
    try {
      const response = await notesPoolApi.getMySharedNotebooks();
      const responseData = response.data;
      
      if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
        const list = normalizeMySharedNotebooksFromApi(responseData);
        setShareNotebookValue((prevState) => ({
          ...prevState,
          mySharedNotebooks: list,
          notebookList: list,
          loadingMySharedNotebooks: false,
        }));
      } else {
        console.error("Failed to fetch shared notebooks")
        setShareNotebookValue((prev) => ({ ...prev, loadingMySharedNotebooks: false }));
      }
    } catch (error) {
      console.error("Error fetching my shared notebooks:", error)
      setShareNotebookValue((prev) => ({ ...prev, loadingMySharedNotebooks: false }));
    }
  };

  const handleShareNotebookAdd = async () => {

    const { type, id, operation_type, notebook_id, shared_notebook_id } = shareNotebookValue;
    const validation = shareNoteValidation();
    if (validation) {
      setShareNotebookValue((prevState) => ({
        ...prevState,
        loading: true,
      }));
      try {
        if (type === 1) {
          // Share notebook to already shared notebook
          const apiData = {
            notebook_id: id,
            shared_notebook_id: shared_notebook_id.value,
          };

          const response = await notesPoolApi.shareNotebookToSharedNotebook(apiData);
          const responseData = await response.data;
          if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
            showToast(`Notebook shared to ${shared_notebook_id.label}`, "success");
            setShareNotebookValue((prevState) => ({
              ...prevState,
              show: false,
            }));
          } else {
            const error = responseData.ERROR_DESCRIPTION;
            showToast(error, "error");
          }
        } else {
          const scopeIds = (v) => {
            if (v == null) return v;
            if (Array.isArray(v)) return v;
            if (typeof v === "object" && v.value != null) return [v.value];
            return v;
          };

          const apiDataAdd = {
            notebook_id: id,
            operation_type: operation_type,
            notebook_type: "new_notebook",
            new_notebook_name: shareNotebookValue.notebook_name,
            sharing_permission: buildSharingPermission(shareNotebookValue.allowPermission),
            name_dept_branch: shareNotebookValue.shareWith,
            branch: scopeIds(shareNotebookValue.empBranches_id),
            dept: scopeIds(shareNotebookValue.empDepartment_id),
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
        }
      } catch (err) {
      } finally {
        setShareNotebookValue((prevState) => ({
          ...prevState,
          loading: false,
        }));
      }
    }
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

  const getNotebookPublicLink = async () => {
    // Ensure we have a valid ID
    if (!shareNotebookValue.id) {
      showToast('Notebook ID is missing', 'error');
      return;
    }
    
    // API expects _id, not notebook_id
    const apiData = {
      _id: shareNotebookValue.id,
    };
    try {
      const response = await notesPoolApi.getPublicShareLink(apiData);
      const responseData = response.data;
      if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
        // Try multiple possible response structures
        const publicUrl = responseData.DB_DATA?.link?.public_url || 
                         responseData.DB_DATA?.share_link || 
                         responseData.DB_DATA?.public_url ||
                         responseData.DB_DATA?.url ||
                         responseData.link?.public_url ||
                         responseData.share_link ||
                         responseData.public_url;
        
        if (publicUrl) {
          setShareNotebookValue((prevState) => ({
            ...prevState,
            textToCopy: publicUrl,
          }));
        } else {
          console.error('Public URL not found in response:', responseData);
          showToast('Public link not found in response', 'error');
        }
      } else {
        showToast(responseData.ERROR_DESCRIPTION || 'Failed to get public link', 'error');
      }
    } catch (err) {
      console.error('Error getting public link:', err);
      showToast('Failed to generate public link', 'error');
    }
  };

  const [copied, setCopied] = useState(false);

  const handleCopytoClipboard = async (text) => {
    // Validate text exists
    if (!text || text.trim() === '') {
      showToast("No link available to copy", "error");
      return;
    }

    try {
      // Try modern clipboard API first (requires HTTPS or localhost)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        showToast("Link copied to clipboard", "success");
      } else {
        // Fallback to older method for non-HTTPS contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          const successful = document.execCommand('copy');
          if (successful) {
            setCopied(true);
            showToast("Link copied to clipboard", "success");
          } else {
            throw new Error('execCommand failed');
          }
        } catch (err) {
          throw err;
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error('Copy failed:', err);
      setCopied(false);
      showToast("Failed to copy link. Please try selecting and copying manually.", "error");
    }
  };

  const handleCopytoClipboardMouseLeave = () => {
    setCopied(false);
  };

  return {
    handleMenuList,
    notesValue,
    handleDrawerToggle,
    handleSubmitNoteBook,
    handleNoteBookInputChange,
    handleConfirmToggle,
    deleteNoteBook,
    toggleNoteBookShare,
    shareNotebookValue,
    handleChangeShareNotebook,
    handleSelectShareNote,
    handleShareNotebookAdd,
    handleToggleSubDept,
    fetchMySharedNotebooks,
    handleCopytoClipboard,
    handleCopytoClipboardMouseLeave,
    copied,
  };
};

export default useNoteBookHandler;
