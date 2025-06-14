import React from 'react';
import { OptionType } from '@/types/types';
import Select, { StylesConfig, OptionProps, components } from 'react-select';

interface MaterialDropdownProps {
  options: OptionType[];
  value: string;
  onChange: (value: string) => void;
}

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

const MaterialOption: React.FC<OptionProps<OptionType, false>> = (props) => (
  <components.Option {...props}>
    {props.children}
  </components.Option>
);

const MaterialDropdown: React.FC<MaterialDropdownProps> = ({ options, value, onChange }) => {
  const handleChange = (selectedOption: OptionType | null) => {
    if (selectedOption) {
      onChange(selectedOption.value);
    }
  };

  return (
    <Select
      options={options}
      styles={customStyles}
      components={{ Option: MaterialOption }}
      onChange={handleChange}
      value={options.find(option => option.value === value)}
      getOptionLabel={(option) => `${option.label}`}
    />
  );
};

const getMaterialOptions = (selectedTechnology: string): OptionType[] => {
  if (selectedTechnology === 'SLA') {
    return [
      { label: 'ABS Resin', value: 'ABS Resin' },
      { label: 'Rigid 110', value: 'Rigid 110' },
      { label: 'Transparent Resin', value: 'Transparent Resin' },
    ];
  } else if (selectedTechnology === 'DLP') {
    return [
      { label: 'Pro Black', value: 'Pro Black' },
      { label: 'Standard Resin', value: 'Standard Resin' },
      { label: 'Castable Resin', value: 'Castable Resin' },
      { label: 'Rubber Resin', value: 'Rubber Resin' },
    ];
  } else if (selectedTechnology === 'SLS') {
    return [
      { label: 'Nylon 11', value: 'Nylon 11' },
    ];
  } else if (selectedTechnology === 'MJF') {
    return [
      { label: 'PA 11', value: 'PA 11' },
    ];
  } else {
    return [
      { label: 'PLA', value: 'PLA' },
      { label: 'ABS', value: 'ABS' },
      { label: 'PETG', value: 'PETG' },
      { label: 'TPU', value: 'TPU' },
    ];
  }
};

export { MaterialDropdown, getMaterialOptions };
