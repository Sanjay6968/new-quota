'use client';

import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import styled from 'styled-components';
import { EnvVars } from '@/env';
import ModalCustom from '@/components/ModalCustom';
import MaterialTable from '@/utils/MaterialTable';
import fdmData from '@/public/material-data-sheets/fdmData.json';
import { STLViewer } from '../../../components/stl-loader';
import { OptionType } from '@/types/types';
import { TechnologyDropdown } from '@/components/TechnologyDropdown';
import { ColorFinishDropdown, colorOptions } from '@/components/ColorFinishDropdown';
import { MaterialDropdown, getMaterialOptions } from '@/components/MaterialDropdown';

// Styled components (must be declared **before** use)
const DropdownContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 600px;
`;

const Label = styled.label`
  font-size: 1.8rem;
  font-weight: bold;
  font-family: 'Poppins', sans-serif;
  color: #fff;
`;

const Select = styled.select<{ disabled?: boolean }>`
  height: 48px;
  padding: 0 1em;
  font-size: 1.3rem;
  font-weight: 700;
  border: 1px solid #fff;
  border-radius: 5px;
  background-color: ${props => props.disabled ? '#4a5568' : '#0a121e'};
  color: #FFFFFF;
  appearance: none;
  opacity: ${props => props.disabled ? '0.7' : '1'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  option {
    background-color: #FFFFFF;
    color: #0a121e;
  }
`;

const SliderContainer = styled.div`
  margin-top: 10px;
`;

const SliderWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const ValueBox = styled.input.attrs<{ min?: number; max?: number }>(props => ({
  type: 'number',
  min: props.min,
  max: props.max
}))`
  width: 50px;
  height: 30px;
  margin-left: 10px;
  background-color: #fff;
  color: #000;
  border-radius: 5px;
  border: none;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
`;

const PercentageSymbol = styled.span`
  font-size: 1.8rem;
  font-weight: bold;
  margin-left: 5px;
`;

const InfoButton = styled.button`
  background: transparent;
  border: none;
  margin-left: 8px;
  cursor: pointer;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

const NextButton = styled.button`
  height: 50px;
  min-width: 120px;
  background-color: #FED700;
  color: #0A121E;
  font-weight: bold;
  font-size: 1.6rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover { background-color: #E0A800; }
  &:disabled { background-color: #E0A800; cursor: default; }
`;

const Spinner = styled.div`
  border: 2px solid transparent;
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  @keyframes spin {
    0% { transform: rotate(0); }
    100% { transform: rotate(360deg); }
  }
`;

const Heading = styled.h1`
  font-size: 3.5rem;
  font-weight: bold;
  font-family: 'Poppins', sans-serif;
  color: #fff;
  margin-bottom: 0.5em;
`;

const SubText = styled.p`
  font-size: 1.5rem;
  font-family: 'Poppins', sans-serif;
  color: #fff;
  opacity: 0.7;
  margin-bottom: 20px;
`;

// Generic Dropdown and Slider components
interface DropdownProps {
  label: string;
  options: OptionType[];
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ label, options, value, onChange, disabled = false }) => (
  <DropdownContainer>
    <Label>{label}</Label>
    <Select value={value} onChange={onChange} disabled={disabled}>
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </Select>
  </DropdownContainer>
);

interface SliderProps {
  label: string;
  min: number;
  max: number;
  defaultValue: number;
  onValueChange: (val: number) => void;
}

const Slider: React.FC<SliderProps> = ({ label, min, max, defaultValue, onValueChange }) => {
  const [value, setValue] = useState(defaultValue);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(min, Math.min(max, Number(e.target.value)));
    setValue(val);
    onValueChange(val);
  };
  return (
    <SliderContainer>
      <Label>{label}</Label>
      <SliderWrapper>
        <input type="range" min={min} max={max} value={value} onChange={handleChange} />
        <ValueBox value={value} onChange={handleChange} />
        <PercentageSymbol>%</PercentageSymbol>
      </SliderWrapper>
    </SliderContainer>
  );
};

// Main Customization component
interface CustomizationDetails {
  selectedTechnology: string;
  selectedMaterial: string;
  layerThickness: string;
  filling: number;
  colorFinish: string;
  scale: number;
  selectedPrinterOption: string;
}

interface CustomizeDetailsProps {
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  setFurthestAccessibleTab: React.Dispatch<React.SetStateAction<string>>;
  customizationDetails: CustomizationDetails;
  onCustomizationChange: (details: CustomizationDetails) => void;
  fileUrl: string | null;
}

const CustomizeDetails: React.FC<CustomizeDetailsProps> = ({
  setActiveTab, setFurthestAccessibleTab,
  customizationDetails, onCustomizationChange, fileUrl
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTechnology, setSelectedTechnology] = useState(customizationDetails.selectedTechnology);
  const [selectedMaterial, setSelectedMaterial] = useState(customizationDetails.selectedMaterial);
  const [layerThickness, setLayerThickness] = useState(customizationDetails.layerThickness);
  const [filling, setFilling] = useState(customizationDetails.filling);
  const [colorFinish, setColorFinish] = useState(customizationDetails.colorFinish);
  const [selectedPrinterOption, setSelectedPrinterOption] = useState(customizationDetails.selectedPrinterOption);
  const [dimensions, setDimensions] = useState({ length: '', breadth: '', height: '' });
  const [volume, setVolume] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [colorOptionsState, setColorOptionsState] = useState<OptionType[]>([]);

  useEffect(() => {
    if (!fileUrl) return;
    const el = document.getElementById('stl-viewer-container');
    if (!el) return;
    el.innerHTML = '';
    const root = createRoot(el);
    root.render(
      <STLViewer
        fileUrl={fileUrl}
        onDimensionsCalculated={dim => {
          const [l, b, h] = dim.split(' x ');
          setDimensions({ length: l, breadth: b, height: h });
        }}
        onVolumeCalculated={setVolume}
      />
    );
    return () => root.unmount();
  }, [fileUrl]);

  useEffect(() => {
    const matOpts = getMaterialOptions(selectedTechnology);
    setSelectedMaterial(matOpts[0]?.value || '');
  }, [selectedTechnology]);

  useEffect(() => {
    const opts = colorOptions.getColorFinishOptions(selectedTechnology, selectedMaterial);
    setColorOptionsState(opts);
    setColorFinish(opts.find(o => o.value === customizationDetails.colorFinish)?.value || opts[0]?.value || '');
  }, [selectedTechnology, selectedMaterial, customizationDetails.colorFinish]);

  useEffect(() => {
    const maxDim = Math.max(+dimensions.length, +dimensions.breadth, +dimensions.height);
    const pOpt = maxDim <= 200 ? 'STD' : maxDim <= 400 ? 'MED' : 'LGE';
    setSelectedPrinterOption(pOpt);
    onCustomizationChange({ ...customizationDetails, selectedPrinterOption: pOpt });
  }, [dimensions]);

  const layerThicknessOptions = [
    { label: 'Ultra Fine - 0.12mm', value: 'ULTRAFINE' },
    { label: 'Fine - 0.16mm', value: 'FINE' },
    { label: 'Normal - 0.2mm', value: 'NORMAL' },
    { label: 'Draft - 0.3mm', value: 'DRAFT' }
  ];

  const printerOptions = [
    { label: 'STANDARD 220x200x220mm', value: 'STD' },
    { label: 'MEDIUM 400x400x400mm', value: 'MED' },
    { label: 'LARGE 600x600x600mm', value: 'LGE' }
  ];

  const handleNext = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const orderId = localStorage.getItem('orderId');
      if (!token || !orderId) return;

      const payload = {
        technology: selectedTechnology,
        material: selectedMaterial,
        colorFinish,
        layerThickness,
        filling,
        scale: customizationDetails.scale,
        printerOption: selectedPrinterOption,
        orderId
      };

      await axios.put(`${EnvVars.API}api/public/customization/`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await axios.post(`${EnvVars.API}api/public/add-dimensions`, {
        orderId,
        length: +dimensions.length,
        breadth: +dimensions.breadth,
        height: +dimensions.height,
        volume: +volume
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setActiveTab('Delivery Options');
      setFurthestAccessibleTab('Delivery Options');
    } catch (error) {
      console.error('Submission failed', error);
    }
    setIsLoading(false);
  };

  return (
    <div>
      <ModalCustom isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>Material Properties</h2>
        <SubText>Details about materials, properties, and costs.</SubText>
        <MaterialTable materials={fdmData.materials} />
      </ModalCustom>

      <Heading>Customize your Order</Heading>
      <SubText>Tailor specs, dimensions, finishes & more.</SubText>

      <DropdownContainer>
        <Label>Technology</Label>
        <TechnologyDropdown value={selectedTechnology} onChange={e => {
          const val = (e.target as HTMLSelectElement).value;
          setSelectedTechnology(val);
          onCustomizationChange({ ...customizationDetails, selectedTechnology: val });
        }} />

        <Label>Material</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MaterialDropdown
            options={getMaterialOptions(selectedTechnology)}
            value={selectedMaterial}
            onChange={e => {
              const val = e.target.value;
              setSelectedMaterial(val);
              onCustomizationChange({ ...customizationDetails, selectedMaterial: val });
            }}
          />
          <InfoButton onClick={() => setIsModalOpen(true)}>
            <InfoIcon />
          </InfoButton>
        </div>

        {!['SLA', 'SLS', 'DLP', 'MJF'].includes(selectedTechnology) && (
          <>
            <Dropdown label="Layer Thickness" options={layerThicknessOptions} value={layerThickness}
              onChange={e => {
                const val = e.target.value;
                setLayerThickness(val);
                onCustomizationChange({ ...customizationDetails, layerThickness: val });
              }}
            />
            <Dropdown label="Printer" options={printerOptions} value={selectedPrinterOption} disabled />
            <Slider label="Infill" min={1} max={100} defaultValue={filling}
              onValueChange={val => {
                setFilling(val);
                onCustomizationChange({ ...customizationDetails, filling: val });
              }}
            />
          </>
        )}

        <Label>Color & Finish</Label>
        <ColorFinishDropdown options={colorOptionsState} value={colorFinish}
          onChange={e => {
            const val = e.target.value;
            setColorFinish(val);
            onCustomizationChange({ ...customizationDetails, colorFinish: val });
          }}
        />
      </DropdownContainer>

      <ButtonContainer>
        <NextButton onClick={handleNext} disabled={isLoading}>
          {isLoading ? <Spinner /> : 'NEXT →'}
        </NextButton>
      </ButtonContainer>

      <div id="stl-viewer-container" />
    </div>
  );
};

// Page-level component
const CustomizationPage = () => {
  const initialDetails: CustomizationDetails = {
    selectedTechnology: 'FDM',
    selectedMaterial: 'PLA',
    layerThickness: 'NORMAL',
    filling: 20,
    colorFinish: '',
    scale: 100,
    selectedPrinterOption: 'STD'
  };

  const [details, setDetails] = useState(initialDetails);
  const [activeTab, setActiveTab] = useState('Customization');
  const [furthestAccessibleTab, setFurthestAccessibleTab] = useState('Customization');

  return (
    <CustomizeDetails
      setActiveTab={setActiveTab}
      setFurthestAccessibleTab={setFurthestAccessibleTab}
      customizationDetails={details}
      onCustomizationChange={setDetails}
      fileUrl={typeof window !== 'undefined' ? localStorage.getItem('modelFileUrl') : null}
    />
  );
};

export default CustomizationPage;
