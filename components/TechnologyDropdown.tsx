import React from 'react';
import Select, { StylesConfig, OptionProps, components } from 'react-select';
import { OptionType } from '@/types/types';

interface TechnologyDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const technologyOptions: OptionType[] = [
  { label: 'FDM', value: 'FDM' },
  { label: 'SLA', value: 'SLA' },
  { label: 'SLS', value: 'SLS' },
  { label: 'DLP', value: 'DLP' },
  { label: 'MJF', value: 'MJF' },
];

const customStyles: StylesConfig<OptionType, false> = {
  control: (base) => ({
    ...base,
    backgroundColor: '#0a121e',
    borderColor: '#fff',
    minHeight: '48px',
    fontSize: '1.3rem',
    fontWeight: 700,
    borderRadius: '5px',
    color: '#FFFFFF',
  }),
  option: (base) => ({
    ...base,
    fontSize: '1.3rem',
    color: '#0a121e',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px dotted #ccc',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#FFFFFF',
  }),
  input: (base) => ({
    ...base,
    color: '#FFFFFF',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
};

const TechnologyOption: React.FC<OptionProps<OptionType, false>> = (props) => (
  <components.Option {...props}>
    {props.children}
  </components.Option>
);

const TechnologyDropdown: React.FC<TechnologyDropdownProps> = ({ value, onChange }) => {
  const handleChange = (selectedOption: OptionType | null) => {
    if (selectedOption) {
      onChange(selectedOption.value);
    }
  };

  return (
    <Select
      options={technologyOptions}
      styles={customStyles}
      components={{ Option: TechnologyOption }}
      onChange={handleChange}
      value={technologyOptions.find(option => option.value === value)}
      getOptionLabel={(option) => `${option.label}`}
    />
  );
};

export { TechnologyDropdown };
