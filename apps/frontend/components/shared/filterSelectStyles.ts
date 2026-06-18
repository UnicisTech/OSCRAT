import type { StylesConfig } from '@atlaskit/select';

// Design tokens as hex literals — react-select's `styles` API is plain JS and
// can't resolve Tailwind classes. Keep these in sync with tailwind.config.js.
const LINE = '#BDBDBD'; // line.DEFAULT — control border
const LINE_STRONG = '#9E9E9E'; // line.strong — hover border
const PRIMARY = '#1976D2'; // primary — focus border
const CONTENT = '#212121'; // content.DEFAULT — value text
const CONTENT_MUTED = '#757575'; // content.muted — placeholder
const ICON = '#9E9E9E'; // content.placeholder — chevron / calendar / clear
const ICON_HOVER = '#616161'; // content.secondary — indicator hover
const SURFACE_MUTED = '#F5F5F5'; // surface.muted — option hover
const INFO_SUBTLE = '#E3F2FD'; // info.subtle — selected option bg
const INFO_EMPHASIS = '#0D47A1'; // info.emphasis — selected option text
const SHADOW_8 =
  '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)';

/**
 * Shared react-select styling (Atlaskit Select / DatePicker) matching the Figma
 * filter-input spec: a 32px control with a 1px #BDBDBD border, 4px radius, B2
 * text and a #9E9E9E indicator. Applied to every Atlaskit filter dropdown so
 * the Audit Log, Version Log and Tasks filters look identical.
 *
 * A generic factory because react-select's `StylesConfig` is invariant in its
 * option type — each consumer instantiates it for its own option shape.
 */
export const getFilterSelectStyles = <Option>(): StylesConfig<
  Option,
  false
> => ({
  control: (base, state) => ({
    ...base,
    minHeight: 32,
    height: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderColor: state.isFocused ? PRIMARY : LINE,
    boxShadow: 'none',
    fontSize: 14,
    cursor: 'pointer',
    '&:hover': { borderColor: state.isFocused ? PRIMARY : LINE_STRONG },
  }),
  valueContainer: (base) => ({ ...base, padding: '0 8px' }),
  placeholder: (base) => ({ ...base, color: CONTENT_MUTED }),
  singleValue: (base) => ({ ...base, color: CONTENT }),
  input: (base) => ({ ...base, margin: 0, padding: 0, color: CONTENT }),
  indicatorsContainer: (base) => ({ ...base, height: 32 }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: '0 6px',
    color: ICON,
    '&:hover': { color: ICON_HOVER },
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: '0 4px',
    color: ICON,
    '&:hover': { color: ICON_HOVER },
  }),
  menu: (base) => ({
    ...base,
    marginTop: 4,
    borderRadius: 4,
    border: `1px solid ${LINE}`,
    boxShadow: SHADOW_8,
    overflow: 'hidden',
    zIndex: 20,
  }),
  menuList: (base) => ({ ...base, paddingTop: 0, paddingBottom: 0 }),
  option: (base, state) => ({
    ...base,
    fontSize: 14,
    padding: '8px 12px',
    cursor: 'pointer',
    color: state.isSelected ? INFO_EMPHASIS : CONTENT,
    backgroundColor: state.isSelected
      ? INFO_SUBTLE
      : state.isFocused
        ? SURFACE_MUTED
        : '#FFFFFF',
    '&:active': { backgroundColor: INFO_SUBTLE },
  }),
});
