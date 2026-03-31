/**
 * Shared react-select styles for Create Performance Review Cycle (AddEditPRC)
 * Branch / Department / Employee — reuse anywhere we need identical UI (e.g. Review Cycle on Emp Performance).
 */
export const prcFormSearchSelectStyles = {
  control: (base) => ({
    ...base,
    fontSize: '14px',
    minHeight: '36px',
    border: 'none',
    borderRadius: '10px',
    backgroundColor: 'white',
    boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      boxShadow: '0px 0px 12px 0px rgba(61, 165, 244, 0.3)',
    },
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
    borderRadius: '10px',
    boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)',
    border: 'none',
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 10000,
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: '200px !important',
    height: 'auto !important',
    borderRadius: '10px',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#3DA5F4'
      : state.isFocused
        ? '#E3F1FF'
        : 'transparent',
    color: state.isSelected ? 'white' : '#333',
    '&:hover': {
      backgroundColor: state.isSelected ? '#2B8FD4' : '#F0F8FF',
    },
  }),
  singleValue: (base) => ({
    ...base,
    fontSize: '14px',
    color: '#474747',
  }),
  placeholder: (base) => ({
    ...base,
    fontSize: '14px',
    color: '#999',
  }),
}
