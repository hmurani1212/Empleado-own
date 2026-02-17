

import React from 'react';
import Select from 'react-select';

// Custom MenuList component to handle pagination
const MenuList = (props) => {
  const { children, onLoadMore, hasMore, loading, thinScrollbar = false } = props;
  
  const handleScroll = (e) => {
    const { target } = e;
    if (target.scrollTop + target.offsetHeight === target.scrollHeight && hasMore && !loading && onLoadMore) {
      onLoadMore();
    }
  };

  return (
    <>
      {thinScrollbar && (
        <style>
          {`
            .custom-select-thin-scrollbar::-webkit-scrollbar {
              width: 4px !important;
            }
            .custom-select-thin-scrollbar::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 2px;
            }
            .custom-select-thin-scrollbar::-webkit-scrollbar-thumb {
              background: #888;
              border-radius: 2px;
            }
            .custom-select-thin-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #555;
            }
            .custom-select-thin-scrollbar {
              scrollbar-width: thin !important;
              scrollbar-color: #888 #f1f1f1 !important;
            }
          `}
        </style>
      )}
      <div 
        onScroll={handleScroll} 
        className={thinScrollbar ? 'custom-select-thin-scrollbar' : ''}
        style={{ 
          maxHeight: '300px', 
          overflowY: 'auto', 
          width: '100%',
          boxSizing: 'border-box',
          paddingRight: '0px'
        }}
      >
        {children}
        {hasMore && (
          <div style={{ padding: '8px', textAlign: 'center', color: '#666' }}>
            {loading ? 'Loading...' : 'Scroll to load more'}
          </div>
        )}
      </div>
    </>
  );
};


const CustomSelect = (props) => {
  const { 
    isTrue,
    value, 
    placeHolderTitle, 
    onChangeHandler, 
    cStyle, 
    options, 
    onHandleSelectSearch, 
    searching=false, 
    disabled=false,
    isClearable=false,
    isSearchable=true,
    isMulti=false,
    onLoadMore=null,
    hasMore=false,
    loading=false,
    thinScrollbar=false,
    optionFontSize=12,
    filterOption,
  } = props
  // const { customStyles } = useEmployees()

  const customStyles = {
        option: (provided, state) => ({
            ...provided,
            paddingLeft: state.data?.isChild ? '20px' : '10px',
            fontSize: state.data?.isChild ? '12px' : '14px',
            color: state.isSelected ? '#111827' : (state.data?.isChild ? '#495057' : provided.color),
            backgroundColor: state.isSelected ? '#f3f4f6' : state.isFocused ? '#f9fafb' : provided.backgroundColor,
        }),
    };

    const baseStyles = {
    control: base => ({
      ...base,
      fontSize: 12,
      padding: '0 0px',
      boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)',
      outline: 'none',
      // border: '1px solid #B3B3B3',
      border: 'none',
      borderRadius: '10px',
      color: '#495057',
      width: isTrue === true ? '100%' : '100%',
    }),
    option: (base, state) => ({
      ...base,
      paddingLeft: '10px',
      fontSize: `${optionFontSize}px`,
      backgroundColor: state.isSelected ? '#f3f4f6' : state.isFocused ? '#f9fafb' : base.backgroundColor,
      color: state.isSelected ? '#111827' : base.color,
      ':active': {
        ...base[':active'],
        backgroundColor: '#e5e7eb',
        color: '#111827',
      },
    }),
    input: base => ({
      ...base,
      padding: 0,
      margin: 0,
      caretColor: 'transparent', // Hide the cursor
      cursor: 'pointer', // Show pointer cursor instead of text cursor
    }),
    singleValue: base => ({
      ...base,
      cursor: 'pointer', // Show pointer cursor for selected value
    }),
    placeholder: base => ({
      ...base,
      color: '#698592',
      cursor: 'pointer', // Show pointer cursor for placeholder
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999999, // Ensures the dropdown menu appears above other elements
      width: '100%'
    }),
    menuList: (base) => ({
      ...base,
      zIndex: 9999999, // Ensures the option list appears above other elements
      height:'200px',
      fontSize: `${optionFontSize}px`,
      width: '100%',
      padding: '0px',
      margin: '0px',
      boxSizing: 'border-box',
    }),
  };

  // Add customStyle if cStyle is true
  const styles = cStyle ? {
    ...baseStyles,
    ...customStyles // Assuming customStyle is an object
  } : baseStyles;
  return (
    <div>
      <Select
        placeholder={placeHolderTitle}
        components={{ 
          IndicatorSeparator: null,
          MenuList: (props) => <MenuList {...props} onLoadMore={onLoadMore} hasMore={hasMore} loading={loading} thinScrollbar={thinScrollbar} />
        }}
        value={value}
        options={options}     
        onChange={onChangeHandler}    
        onInputChange={onHandleSelectSearch} 
        styles={styles}
        isDisabled={disabled}
        isClearable={isClearable}
        isSearchable={isSearchable}
        isMulti={isMulti}
        filterOption={filterOption}
        noOptionsMessage={() => "No data found"}
      />
    </div>
  )
}

export default CustomSelect