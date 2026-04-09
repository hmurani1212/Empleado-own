import { Button, Checkbox, Radio, Typography } from '@material-tailwind/react'
import React, { useEffect } from 'react'
import { notebookShareData, sharenotbookPermissionData, sharenotebookShareWithData, filterDepartmentsForBranch, fetchActiveEmployeesForBranchDept } from '../../services/__notesPoolServices'
import CustomButton from '../../Components/CustomButton/CustomButton'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import useEmployees from '../../ViewModel/EmployeeViewModel/EmployeeServices'
import useEmployeeCheckList from '../../ViewModel/EmployeeViewModel/EmpCheckListServices'
import { IoCheckmarkCircleOutline } from 'react-icons/io5'
import { HiDocumentDuplicate } from 'react-icons/hi2'
import { NotesPoolInlineSpinner } from './NotesPoolSkeletons'

// Share modal: keep dropdown inside dialog with comfortable spacing
const shareSelectStyles = {
  menu: (base) => ({
    ...base,
    marginTop: 6,
    marginBottom: 14,
    padding: '10px 12px',
    borderRadius: 12,
    boxShadow: '0 10px 40px rgba(15, 23, 42, 0.14)',
    boxSizing: 'border-box',
  }),
  menuList: (base) => ({
    ...base,
    padding: '8px 10px',
  }),
  option: (base) => ({
    ...base,
    padding: '11px 14px',
    borderRadius: 8,
  }),
  control: (base) => ({
    ...base,
    paddingLeft: 10,
    paddingRight: 8,
  }),
  loadingMessage: (base) => ({
    ...base,
    width: '100%',
    padding: 0,
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 100050,
  }),
}

/** Render menus on `document.body` so they are not clipped by the dialog and stay visible on any viewport. */
const SHARE_SELECT_MENU_PORTAL = typeof document !== 'undefined' ? document.body : null

/** Styles for the "Select Shared Notebook" picker: caps menu at 300px, fits content below that. */
const sharedPoolSelectStyles = {
  ...shareSelectStyles,
  menuList: (base) => ({
    ...shareSelectStyles.menuList(base),
    maxHeight: 300,
    overflowY: 'auto',
  }),
};

const sharedPoolSelectLoadingMenu = () => (
  <div className="flex items-center justify-center gap-2 py-4 px-3 text-[#698592] text-[12px]">
    <div
      className="h-4 w-4 shrink-0 border-2 border-[#3DA5F4] border-t-transparent rounded-full animate-spin"
      aria-hidden
    />
    <span>Loading shared notebooks…</span>
  </div>
);

const branchSelectLoadingMenu = () => (
  <div className="flex items-center justify-center gap-2 py-4 px-3 text-[#698592] text-[12px]">
    <div className="h-4 w-4 shrink-0 border-2 border-[#3DA5F4] border-t-transparent rounded-full animate-spin" aria-hidden />
    <span>Loading branches…</span>
  </div>
);

const deptSelectLoadingMenu = () => (
  <div className="flex items-center justify-center gap-2 py-4 px-3 text-[#698592] text-[12px]">
    <div className="h-4 w-4 shrink-0 border-2 border-[#3DA5F4] border-t-transparent rounded-full animate-spin" aria-hidden />
    <span>Loading departments…</span>
  </div>
);

/**
 * "Select Shared Notebook" picker (type 1).
 * Rendered inside the modal (no portal). When the menu opens it adds padding-bottom
 * so the dialog body scrolls to reveal the full option list.
 */
const SharedPoolSelectBlock = ({ options, value, onChangeHandler, isLoading }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  return (
    <div
      className="relative w-full min-w-0 max-w-full sm:max-w-md"
      style={{ paddingBottom: menuOpen ? 320 : 0, transition: 'padding-bottom 0.15s ease' }}
    >
      <CustomSelect
        placeHolderTitle="Choose a shared notebook"
        options={options}
        cStyle={false}
        customStyles={sharedPoolSelectStyles}
        isLoading={isLoading}
        loadingMessage={sharedPoolSelectLoadingMenu}
        hideControlLoadingIndicator
        menuPlacement="bottom"
        menuPosition="absolute"
        menuPortalTarget={null}
        closeMenuOnScroll={false}
        value={value}
        onChangeHandler={onChangeHandler}
        onMenuOpen={() => setMenuOpen(true)}
        onMenuClose={() => setMenuOpen(false)}
      />
    </div>
  );
};

const branchIdsFromShareValue = (v) => {
  if (v == null) return [];
  if (Array.isArray(v)) return v;
  if (typeof v === 'object' && v.value != null) return [v.value];
  return [];
};

/** Share with Branch: checkbox list (not a select). */
const BranchOnlyShareView = ({ handleChangeShareNotebook, shareValue }) => {
  const { branchesLoading, fetchingAllBranches, empBranches } = useEmployees();
  useEffect(() => {
    fetchingAllBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load branches when branch-only picker mounts
  }, []);

  const selectedIds = branchIdsFromShareValue(shareValue?.empBranches_id);

  return (
    <div className="space-y-2">
      <label className="text-[#698592] text-[12px]">Select Branch</label>
      <div className="w-full min-w-0 max-w-full sm:max-w-md max-h-[min(220px,45vh)] overflow-y-auto rounded-lg border border-slate-200/80 bg-white/90 px-3 py-2">
        {branchesLoading ? (
          <div className="flex justify-center py-6">
            <NotesPoolInlineSpinner label="Loading branches…" />
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {empBranches?.map((ele) => (
              <Checkbox
                key={ele.id}
                color="blue"
                name="empBranches_id"
                value={ele.id}
                checked={selectedIds.some((id) => id === ele.id || String(id) === String(ele.id))}
                label={<Typography className="text-[12px]">{ele.branch_name}</Typography>}
                onChange={handleChangeShareNotebook}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/** Styles for Branch/Department selects in type-2: caps menu at 300px, fits content below that. */
const sharePairSelectStyles = {
  ...shareSelectStyles,
  menu: (base) => ({
    ...shareSelectStyles.menu(base),
    zIndex: 50,
  }),
  menuList: (base) => ({
    ...shareSelectStyles.menuList(base),
    maxHeight: 300,
    overflowY: 'auto',
  }),
};

/**
 * Branch + Department selects (filtered by branch). Used for Share with: Departments and Employee.
 * All menus render inside the modal (no body portal) and add paddingBottom scroll space when open.
 */
const ShareBranchDeptPair = ({
  handleSelectShareNote,
  handleChangeShareNotebook,
  showEmployeePickers,
  scopeKey,
}) => {
  const { branchesLoading, fetchingAllBranches, empBranches } = useEmployees();
  const { employeeCheckListValue, handleEmpCheckList } = useEmployeeCheckList();

  const [selectedBranch, setSelectedBranch] = React.useState(null);
  const [selectedDept, setSelectedDept] = React.useState(null);
  const [deptListLoading, setDeptListLoading] = React.useState(false);
  const [activeShareEmployees, setActiveShareEmployees] = React.useState([]);
  const [loadingShareEmployees, setLoadingShareEmployees] = React.useState(false);
  const [branchMenuOpen, setBranchMenuOpen] = React.useState(false);
  const [deptMenuOpen, setDeptMenuOpen] = React.useState(false);

  useEffect(() => {
    fetchingAllBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSelectedBranch(null);
    setSelectedDept(null);
    setActiveShareEmployees([]);
  }, [scopeKey]);

  useEffect(() => {
    if (selectedBranch?.value == null) {
      setDeptListLoading(false);
      return;
    }
    let cancelled = false;
    setDeptListLoading(true);
    // skipInitialShowToggle avoids opening the checklist panel as a side-effect.
    // handleEmpCheckList is intentionally excluded from deps — it is not memoized
    // and including it would create an infinite re-render loop.
    handleEmpCheckList(selectedBranch.value, { skipInitialShowToggle: true })
      .finally(() => {
        if (!cancelled) setDeptListLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranch?.value]);

  useEffect(() => {
    if (!showEmployeePickers) return;
    if (!selectedDept?.value || selectedBranch?.value == null) {
      setActiveShareEmployees([]);
      return;
    }
    let cancelled = false;
    setLoadingShareEmployees(true);
    fetchActiveEmployeesForBranchDept(selectedBranch.value, selectedDept.value)
      .then((rows) => {
        if (!cancelled) setActiveShareEmployees(rows);
      })
      .finally(() => {
        if (!cancelled) setLoadingShareEmployees(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDept?.value, selectedBranch?.value, showEmployeePickers]);

  // handleEmpCheckList already queries the API with the selected branchId, so the
  // returned departments are already scoped to that branch — no client-side filter needed.
  const filteredDepartments = selectedBranch?.value != null
    ? (employeeCheckListValue?.departmentList?.departments ?? [])
    : [];

  return (
    <div className="space-y-2">
      {showEmployeePickers && (
        <div>
          <span className="text-[#698592] text-[12px]">Employee</span>
        </div>
      )}
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 overflow-visible">

        {/* Branch select — adds paddingBottom when open to create scroll room */}
        <div
          className="relative z-[6] flex min-w-0 flex-1 flex-col overflow-visible"
          style={{ paddingBottom: branchMenuOpen ? 320 : 0, transition: 'padding-bottom 0.15s ease' }}
        >
          <label className="text-[#698592] text-[12px]">Select Branch</label>
          <div className="w-full min-w-0 max-w-full sm:max-w-md">
            <CustomSelect
              placeHolderTitle="Branch"
              options={empBranches?.map((ele) => ({ value: ele.id, label: ele.branch_name })) || []}
              cStyle={false}
              customStyles={sharePairSelectStyles}
              isLoading={branchesLoading}
              loadingMessage={branchSelectLoadingMenu}
              hideControlLoadingIndicator
              menuPlacement="bottom"
              menuPosition="absolute"
              menuPortalTarget={null}
              closeMenuOnScroll={false}
              value={selectedBranch}
              onChangeHandler={(select) => {
                setSelectedBranch(select);
                setSelectedDept(null);
                setActiveShareEmployees([]);
                // Mark departments as loading immediately so the very next render
                // shows a loader instead of stale departments from the previous branch.
                setDeptListLoading(true);
                handleSelectShareNote(select, 'empBranches_id');
              }}
              onMenuOpen={() => setBranchMenuOpen(true)}
              onMenuClose={() => setBranchMenuOpen(false)}
            />
          </div>
        </div>

        {/* Department select — adds paddingBottom when open to create scroll room */}
        <div
          className="relative z-[5] flex min-w-0 flex-1 flex-col overflow-visible"
          style={{ paddingBottom: deptMenuOpen ? 320 : 0, transition: 'padding-bottom 0.15s ease' }}
        >
          <label className="text-[#698592] text-[12px]">Select Department</label>
          <div className="w-full min-w-0 max-w-full sm:max-w-md">
            <CustomSelect
              placeHolderTitle="Department"
              options={deptListLoading ? [] : filteredDepartments.map((ele) => ({ value: ele.id, label: ele.name }))}
              cStyle={true}
              customStyles={sharePairSelectStyles}
              isLoading={deptListLoading}
              loadingMessage={deptSelectLoadingMenu}
              hideControlLoadingIndicator
              menuPlacement="bottom"
              menuPosition="absolute"
              menuPortalTarget={null}
              closeMenuOnScroll={false}
              value={deptListLoading ? null : selectedDept}
              onChangeHandler={(select) => {
                setSelectedDept(select);
                handleSelectShareNote(select, 'empDepartment_id');
              }}
              isDisabled={!selectedBranch}
              onMenuOpen={() => setDeptMenuOpen(true)}
              onMenuClose={() => setDeptMenuOpen(false)}
            />
          </div>
        </div>
      </div>

      {showEmployeePickers && (
        <div className="flex flex-wrap items-center gap-1 pt-0.5">
          {loadingShareEmployees ? (
            <NotesPoolInlineSpinner label="Loading employees…" />
          ) : (
            activeShareEmployees.map((emp) => (
              <Checkbox
                name="emp_id"
                value={emp.id}
                key={emp.id}
                label={<Typography className="text-[12px]">{emp.name}</Typography>}
                onChange={handleChangeShareNotebook}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};


/** Share with Employee: branch → department → employees (same UI as dept scope, with employee checkboxes). */
const EmployeeView = (props) => (
  <ShareBranchDeptPair
    handleSelectShareNote={props.handleSelectShareNote}
    handleChangeShareNotebook={props.handleChangeShareNotebook}
    showEmployeePickers
    scopeKey={props.shareNotebookValue?.shareWith}
  />
);

const ShareNoteBook = (props) => {
    const { handleChangeShareNotebook,shareNotebookValue,handleSelectShareNote,
        handleShareNotebookAdd,mySharedNotebooks,
        handleCopytoClipboard, handleCopytoClipboardMouseLeave, copied
     } = props
    const loadingSharedList = shareNotebookValue?.loadingMySharedNotebooks === true

  return (
    <div className='w-full max-w-full min-w-0 space-y-2'>
        <div className='flex items-center justify-between'>
            {notebookShareData.map((ele)=>(
                <Radio 
                    key={ele.id}
                    name="type"
                    checked={ ele.id === shareNotebookValue.type }
                    value={ele.id}
                    label={
                        <Typography>
                            {ele.title}
                        </Typography>
                    }
                    color='blue'
                    onChange={(e) => {
                        handleChangeShareNotebook(e);
                    }}
                />
            ))}
        </div>
        <div className='px-3 pt-1 pb-2'>
            {
                shareNotebookValue.type === 1 ? 
                    (
                        <div className='space-y-3'>
                            <label className='text-[#698592] text-[12px]'>Select Shared Notebook</label>
                            <SharedPoolSelectBlock
                                options={Array.isArray(mySharedNotebooks) ? mySharedNotebooks.map((ele) => ({ value: ele._id, label: ele.notebook_name })) : []}
                                value={shareNotebookValue?.shared_notebook_id}
                                onChangeHandler={(select) => handleSelectShareNote(select, 'shared_notebook_id')}
                                isLoading={loadingSharedList}
                            />
                        </div>
                    )
                :
                shareNotebookValue.type === 2 ?
                    (
                        <div className="space-y-2">
                            <div className='flex-1 px-0 sm:px-2 space-y-1 w-full min-w-0 max-w-full sm:max-w-md'>
                                <label className='text-[#698592] text-[12px]'>Notebook Name</label>
                                <input 
                                    className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                                    type='text' 
                                    value={ shareNotebookValue?.notebook_name}
                                    name='notebook_name' 
                                    onChange={handleChangeShareNotebook}
                                />
                            </div>
                            <div className='flex-1 px-2 space-y-1'>
                                <label className='text-[#698592] text-[12px]'>Allow Permission</label>
                                <div className='flex flex-wrap'>
                                    {
                                        sharenotbookPermissionData.map((ele)=>(
                                            <Checkbox 
                                                key={ele.id}
                                                color='blue'
                                                label={
                                                    <Typography className='text-[12px]'>
                                                        {ele.title}
                                                    </Typography>
                                                }
                                                value={ele.fieldName}
                                                name='allowPermission'
                                                checked={shareNotebookValue.allowPermission.includes(ele.fieldName)}
                                                onChange={handleChangeShareNotebook}
                                            />
                                        ))
                                    }
                                </div>
                            </div>
                            <div className='flex-1 px-2 space-y-1'>
                                <label className='text-[#698592] text-[12px]'>Share With</label>
                                <div className='flex'>
                                    {
                                        sharenotebookShareWithData.map((ele)=>(
                                            <Checkbox 
                                                key={ele.id}
                                                color='blue'
                                                name="shareWith"
                                                value={ele.value}
                                                checked={ ele.value === shareNotebookValue.shareWith }
                                                label={
                                                    <Typography className='text-[12px]'>
                                                        {ele.title}
                                                    </Typography>
                                                }
                                                onChange={handleChangeShareNotebook}
                                            />
                                        ))
                                    }
                                </div>
                            </div>
                            {
                                shareNotebookValue.shareWith === "branch" ? (
                                  <BranchOnlyShareView
                                    shareValue={shareNotebookValue}
                                    handleChangeShareNotebook={handleChangeShareNotebook}
                                  />
                                ) : shareNotebookValue.shareWith === "dept" ? (
                                  <ShareBranchDeptPair
                                    handleSelectShareNote={handleSelectShareNote}
                                    handleChangeShareNotebook={handleChangeShareNotebook}
                                    showEmployeePickers={false}
                                    scopeKey={shareNotebookValue.shareWith}
                                  />
                                ) : shareNotebookValue.shareWith === "employee" ? (
                                  <EmployeeView
                                    shareNotebookValue={shareNotebookValue}
                                    handleSelectShareNote={handleSelectShareNote}
                                    handleChangeShareNotebook={handleChangeShareNotebook}
                                  />
                                ) : null
                            }
                        </div>
                    )
                :
                shareNotebookValue.type === 3 ?
                    (
                        <div>
                            <Button
                                onMouseLeave={handleCopytoClipboardMouseLeave}
                                onClick={() => handleCopytoClipboard(shareNotebookValue.textToCopy)}
                                className="flex items-center gap-x-3 px-4 py-2.5 lowercase bg-[#8bc9f8]  font-medium text-[12px]"
                            >
                                <Typography
                                    className="border-r border-black-400/50 pr-3 font-normal"
                                    variant="small"
                                >
                                    {shareNotebookValue.textToCopy}
                                </Typography>
                                {copied ? (
                                    <IoCheckmarkCircleOutline className="h-4 w-4 text-white" />
                                ) : (
                                    <HiDocumentDuplicate className="h-4 w-4 text-white" />
                                )}
                            </Button>
                        </div>
                    )
                :
                null
                    
            }
        </div>
        {shareNotebookValue.type !== 3 && 
            <div className='px-3 pt-1 pb-3'>
                <CustomButton 
                    title= 'Share'
                    onClick = {handleShareNotebookAdd}
                    type="button"
                    loading = {shareNotebookValue.loading}
                />
            </div>
        }
    </div>
  )
}

export default ShareNoteBook