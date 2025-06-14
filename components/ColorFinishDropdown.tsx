import React from 'react';
import Select, { components, StylesConfig, OptionProps } from 'react-select';
import { OptionType } from '@/types/types';

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
  option: (base, { data }) => ({
    ...base,
    fontSize: '1.3rem',
    color: '#0a121e',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px dotted #ccc',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
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

const ColorOption: React.FC<OptionProps<OptionType, false>> = (props) => (
  <components.Option {...props}>
    <div style={{
      marginRight: 10,
      width: 20,
      height: 20,
      backgroundColor: props.data.color,
      borderRadius: '50%',
      border: '1px solid #ccc',
      boxSizing: 'border-box',
      backgroundImage: props.data.value === 'Rainbow' ? props.data.color : 'none',
    }}></div>
    {props.children}
  </components.Option>
);

interface FDMColorsDropdownProps {
  options: OptionType[];
  value: string;
  onChange: (value: string) => void;
}

const ColorFinishDropdown: React.FC<FDMColorsDropdownProps> = ({ options, value, onChange }) => {
  const handleChange = (selectedOption: OptionType | null) => {
    if (selectedOption) {
      onChange(selectedOption.value);
    }
  };

  return (
    <Select
      options={options}
      styles={customStyles}
      components={{ Option: ColorOption }}
      onChange={handleChange}
      value={options.find(option => option.value === value)}
      getOptionLabel={(option) => `${option.label}`}
    />
  );
};

const colorOptions = {
  getColorFinishOptions: (technology: string, material: string): OptionType[] => {
    if (technology === 'MJF') {
      return [{ label: 'Grey', value: 'Grey', color: '#808080' }];
    }
    if (material === 'ABS Resin' || material === 'Rigid 110' || material === 'Standard Resin' || material === 'Nylon 11') {
      return [{ label: 'White', value: 'White', color: '#FFFFFF' }];
    }
    if (material === 'Transparent Resin') {
      return [
        { label: 'Fully Transparent', value: 'Fully Transparent', color: '#CCFFFF' },
        { label: 'Semi Transparent', value: 'Semi Transparent', color: '#99CCFF' },
      ];
    }
    if (technology === 'SLS') {
      return [{ label: 'White', value: 'White', color: '#FFFFFF' }];
    }
    if (material === 'Pro Black' || material === 'Rubber Resin') {
      return [{ label: 'Black', value: 'Black', color: '#000000' }];
    }
    if (material === 'Castable Resin') {
      return [{ label: 'Custom', value: 'Custom', color: '#FFD700' }];
    }
    return [
      { label: 'White', value: 'White', color: '#FFFFFF' },
      { label: 'Black', value: 'Black', color: '#000000' },
      { label: 'Grey', value: 'Grey', color: '#808080' },
      { label: 'Dark Grey', value: 'Dark Grey', color: '#A9A9A9' },
      { label: 'Silver', value: 'Silver', color: '#C0C0C0' },
      { label: 'Gold', value: 'Gold', color: '#FFD700' },
      { label: 'Skin', value: 'Skin', color: '#FFDAB9' },
      { label: 'Natural', value: 'Natural', color: '#F5DEB3' },
      { label: 'Brown', value: 'Brown', color: '#A52A2A' },
      { label: 'Pink', value: 'Pink', color: '#FFC0CB' },
      { label: 'Red', value: 'Red', color: '#FF0000' },
      { label: 'Orange', value: 'Orange', color: '#FFA500' },
      { label: 'Yellow', value: 'Yellow', color: '#FFFF00' },
      { label: 'Lime Green', value: 'Lime Green', color: '#32CD32' },
      { label: 'Green', value: 'Green', color: '#008000' },
      { label: 'Sky Blue', value: 'Sky Blue', color: '#87CEEB' },
      { label: 'Blue', value: 'Blue', color: '#0000FF' },
      { label: 'Purple', value: 'Purple', color: '#800080' },
      { label: 'Glow in Dark', value: 'Glow in Dark', color: '#FFFF00' },
      { label: 'Glitter Green', value: 'Glitter Green', color: '#008000' },
      { label: 'Rainbow', value: 'Rainbow', color: 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)' },
      { label: 'Carbon Fiber', value: 'Carbon Fiber', color: '#333333' },
    ];
  },
};

export { ColorFinishDropdown, colorOptions };
