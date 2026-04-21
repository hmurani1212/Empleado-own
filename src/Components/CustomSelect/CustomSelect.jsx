

import React from 'react';
import Select from 'react-select';

// Custom MenuList component to handle pagination
const MenuList = (props) => {
  const {
    children,
    onLoadMore,
    hasMore,
    loading,
    thinScrollbar = false,
    menuLoading = false,
    menuLoadingLabel = 'Loading...',
    menuDataVersion = '',
  } = props;
  
  const containerRef = React.useRef(null);
  const lastScrollTopRef = React.useRef(0);

  const handleScroll = (e) => {
    const { target } = e;
    lastScrollTopRef.current = target.scrollTop;
    if (target.scrollTop + target.offsetHeight === target.scrollHeight && hasMore && !loading && onLoadMore) {
      onLoadMore();
    }
  };

  React.useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;

    const desiredTop = lastScrollTopRef.current;
    const rafId = window.requestAnimationFrame(() => {
      if (!containerRef.current) return;
      containerRef.current.scrollTop = Math.min(desiredTop, containerRef.current.scrollHeight);
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [menuDataVersion, menuLoading, hasMore, loading]);

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
        ref={containerRef}
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
        {menuLoading && (
          <div
            style={{
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#4b5563',
              borderBottom: '1px solid #f3f4f6',
            }}
          >
            <div
              style={{
                width: '14px',
                height: '14px',
                border: '2px solid #3DA5F4',
                borderTopColor: 'transparent',
                borderRadius: '9999px',
                animation: 'customSelectSpin 0.9s linear infinite',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: '12px' }}>{menuLoadingLabel}</span>
            <style>
              {`
                @keyframes customSelectSpin {
                  to { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        )}
        {!menuLoading && children}
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
    menuPortalTarget,
    customStyles: propCustomStyles,
    isLoading,
    loadingMessage,
    noOptionsMessage: noOptionsMessageProp,
    /** When true (default), no spinner in the closed control — use `menuLoading` / `isLoading` for in-menu spinner only */
    hideControlLoadingIndicator = true,
    menuLoading = false,
    menuLoadingLabel = 'Loading...',
    components: userComponents = {},
    ...restProps // Capture any other props to pass through
  } = props

  /** Spinner only inside open menu: combine explicit menuLoading with legacy isLoading prop */
  const effectiveMenuLoading = Boolean(menuLoading) || Boolean(isLoading)
  const menuDataVersion = React.useMemo(() => {
    if (!Array.isArray(options)) return '';
    return options
      .map((option) => {
        const optionValue = option?.value ?? '';
        const optionLabel = option?.label ?? '';
        const parent = option?.parentDepartmentId ?? '';
        const isChild = option?.isChild ? '1' : '0';
        const isExpanded = option?.isExpanded ? '1' : '0';
        return `${optionValue}::${optionLabel}::${parent}::${isChild}::${isExpanded}`;
      })
      .join('|');
  }, [options]);
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
      backgroundColor: 'white',
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
      // Searchable selects need a visible caret so users can type to filter options
      ...(isSearchable
        ? { caretColor: 'auto', cursor: 'text' }
        : { caretColor: 'transparent', cursor: 'pointer' }),
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
      zIndex: 9999, // Ensures the dropdown menu appears above other elements
      width: '100%'
    }),
    menuList: (base) => ({
      ...base,
      zIndex: 9999, // Ensures the option list appears above other elements
      height:'200px',
      fontSize: `${optionFontSize}px`,
      width: '100%',
      padding: '0px',
      margin: '0px',
      boxSizing: 'border-box',
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  // Merge styles: baseStyles -> customStyles (if cStyle) -> propCustomStyles (from props)
  // Since these are functions, we need to handle them carefully
  let styles = baseStyles;
  
  if (cStyle && propCustomStyles) {
    // If both cStyle and propCustomStyles are provided, use propCustomStyles (from parent) as it takes precedence
    styles = {
      ...baseStyles,
      ...propCustomStyles,
      // Ensure menu and menuPortal always have high z-index
      menu: (base) => {
        const baseResult = baseStyles.menu(base);
        const customResult = propCustomStyles.menu ? propCustomStyles.menu(base) : {};
        return {
          ...baseResult,
          ...customResult,
          zIndex: customResult.zIndex || 9999,
        };
      },
      menuPortal: (base) => {
        const baseResult = baseStyles.menuPortal(base);
        const customResult = propCustomStyles.menuPortal ? propCustomStyles.menuPortal(base) : {};
        return {
          ...baseResult,
          ...customResult,
          zIndex: customResult.zIndex || 9999,
        };
      },
    };
  } else if (propCustomStyles) {
    // Only propCustomStyles provided
    styles = {
      ...baseStyles,
      ...propCustomStyles,
      menu: (base) => {
        const baseResult = baseStyles.menu(base);
        const customResult = propCustomStyles.menu ? propCustomStyles.menu(base) : {};
        return {
          ...baseResult,
          ...customResult,
          zIndex: customResult.zIndex || 9999,
        };
      },
      menuPortal: (base) => {
        const baseResult = baseStyles.menuPortal(base);
        const customResult = propCustomStyles.menuPortal ? propCustomStyles.menuPortal(base) : {};
        return {
          ...baseResult,
          ...customResult,
          zIndex: customResult.zIndex || 9999,
        };
      },
    };
  } else if (cStyle) {
    // Only cStyle provided, use default customStyles
    styles = {
      ...baseStyles,
      ...customStyles,
    };
  }

  const mergedComponents = React.useMemo(() => {
    const components = {
      ...userComponents,
      IndicatorSeparator: null,
      MenuList: (menuListProps) => (
        <MenuList
          {...menuListProps}
          onLoadMore={onLoadMore}
          hasMore={hasMore}
          loading={loading}
          thinScrollbar={thinScrollbar}
          menuLoading={effectiveMenuLoading}
          menuLoadingLabel={menuLoadingLabel}
          menuDataVersion={menuDataVersion}
        />
      ),
    };

    if (!hideControlLoadingIndicator) {
      components.LoadingIndicator = (indicatorProps) => {
        if (!indicatorProps.selectProps?.isLoading) return null;
        return (
          <div
            className="flex items-center pr-2 pl-1"
            aria-live="polite"
            aria-label="Loading options"
            {...(indicatorProps.innerProps || {})}
          >
            <span
              className="inline-block h-4 w-4 border-2 border-[#3DA5F4] border-t-transparent rounded-full animate-spin shrink-0"
              aria-hidden
            />
          </div>
        );
      };
    } else {
      components.LoadingIndicator = () => null;
    }

    return components;
  }, [
    userComponents,
    onLoadMore,
    hasMore,
    loading,
    thinScrollbar,
    effectiveMenuLoading,
    menuLoadingLabel,
    menuDataVersion,
    hideControlLoadingIndicator,
  ]);

  const resolvedNoOptionsMessage =
    typeof noOptionsMessageProp === 'function'
      ? noOptionsMessageProp
      : noOptionsMessageProp != null
        ? () => noOptionsMessageProp
        : () => 'No data found';
  
  return (
    <div>
      <Select
        placeholder={placeHolderTitle}
        components={mergedComponents}
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
        menuPortalTarget={menuPortalTarget}
        loadingMessage={loadingMessage}
        noOptionsMessage={resolvedNoOptionsMessage}
        {...restProps}
        isLoading={hideControlLoadingIndicator ? false : Boolean(isLoading)}
      />
    </div>
  )
}

export { MenuList };
export default CustomSelect;