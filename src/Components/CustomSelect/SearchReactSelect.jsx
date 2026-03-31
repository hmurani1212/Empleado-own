
import React from 'react';
import Select from 'react-select';
import useEmployees from '../../ViewModel/EmployeeViewModel/EmployeeServices';


const SearchReactSelect = (props) => {
  const {
    value,
    placeHolderTitle,
    onChangeHandler,
    cStyle,
    options,
    disabled,
    isSearchable = true,
    filterOption,
    menuIsOpen,
    onMenuOpen,
    onMenuClose,
    onInputChange,
    hideDropdownIndicator = false,
    isClearable = false,
    isMulti = false,
    customStyles: propCustomStyles,
    menuPortalTarget,
    menuPosition,
    menuPlacement,
  } = props
  const { customStyles: hookCustomStyles } = useEmployees()
    const baseStyles = {
    control: base => ({
      ...base,
      fontSize: 14,
      padding: '0 8px',
      boxShadow: 'none',
      outline: 'none',
      border: '1px solid #B3B3B3',
      borderRadius: '5px',
      color: '#495057',
    }),
    placeholder: base => ({
      ...base,
      color: '#698592',
    }),
    menu: base => ({
      ...base,
      minWidth: '200px',
      width: 'auto',
    }),
    menuList: base => ({
      ...base,
      maxHeight: '200px',
      height: 'auto',
    }),
    option: (base, state) => ({
      ...base,
      paddingLeft: '10px',
      fontSize: '14px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      backgroundColor: state.isSelected ? '#f3f4f6' : state.isFocused ? '#f9fafb' : base.backgroundColor,
      color: state.isSelected ? '#111827' : base.color,
    }),
    input: base => ({
      ...base,
      padding: 0,
      margin: 0,
    }),
  };

  // Add customStyle if cStyle is true
  // Use prop customStyles if provided, otherwise use hook customStyles
  const customStylesToUse = propCustomStyles || hookCustomStyles;
  const styles = cStyle ? {
    ...baseStyles,
    ...customStylesToUse // Assuming customStyle is an object
  } : baseStyles;
  // Components configuration
  const components = {
    IndicatorSeparator: null
  };
  
  // Hide dropdown indicator if requested
  if (hideDropdownIndicator) {
    components.DropdownIndicator = null;
  }
  
  // Hide multi-value tags from input when isMulti is true
  if (isMulti) {
    components.MultiValue = () => null;
    components.MultiValueContainer = () => null;
  }

  return (
    <div>
      <Select
        placeholder={`${placeHolderTitle}`}
        components={components}
        value={value}
        options={options}     
        onChange={(selectedOption)=>onChangeHandler(selectedOption)}
        isSearchable={isSearchable}
        isDisabled={disabled}
        filterOption={filterOption}
        menuIsOpen={menuIsOpen}
        onMenuOpen={onMenuOpen}
        onMenuClose={onMenuClose}
        onInputChange={onInputChange}
        styles={styles}
        isClearable={isClearable}
        isMulti={isMulti}
        menuPortalTarget={menuPortalTarget}
        menuPosition={menuPosition}
        menuPlacement={menuPlacement}
      />
    </div>
  )
}

export default SearchReactSelect