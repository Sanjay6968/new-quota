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

// Interfaces
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
  onCustomizationChange: (newCustomizationDetails: CustomizationDetails) => void;
  fileUrl: string | null;
}
type CustomizationPayload = {
  technology: string;
  material: string;
  colorFinish: string;
  layerThickness?: string;
  filling?: number;
  scale?: number;
  printerOption?: string;
  orderId: string;
};

// Styled components
const DropdownContainer = styled.div`display: flex; flex-direction: column; gap: 10px; width: 100%; max-width: 600px;`;
const Label = styled.label`font-size: 1.8rem; font-weight: bold; font-family: 'Poppins', sans-serif;`;
const Select = styled.select<{ disabled?: boolean }>`
  height: 48px; padding: 0 1em; font-size: 1.3rem; font-weight: 700;
  border: 1px solid #fff; border-radius: 5px;
  background-color: ${props => props.disabled ? '#4a5568' : '#0a121e'};
  color: #fff; appearance: none;
  opacity: ${props => props.disabled ? 0.7 : 1};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
`;
const InfoButton = styled.button`
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer; background: transparent; border: none; padding: 0;
`;
const InfoIcon = () => (
  <svg height="24" width="24" viewBox="0 0 24 24" fill="#fff">
    <path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0-9a1 1 0 0 1 1 1v4a1 1 0 0 1 -2 0v-4a1 1 0 0 1 1 -1zm0-4a1 1 0 1 1 0 2 1 1 0 0 1 0 -2z"/>
  </svg>
);
const ValueBox = styled.input.attrs({ type: 'number' })`
  width: 50px; height: 30px; margin-left: 10px;
  background: #fff; color: #000; border-radius: 5px; border: none;
  text-align: center; font-size: 1.5rem; font-weight: bold;
`;
const SliderWrapper = styled.div`display: flex; align-items: center;`;
const SliderContainer = styled.div`
  input[type="range"] {
    appearance: none; width: 100%; height: 22px; border-radius: 15px; cursor: pointer;
    &::-webkit-slider-thumb, &::-moz-range-thumb {
      width: 35px; height: 35px; border-radius: 50%; background: #fed700; cursor: pointer;
    }
  }
`;
const Heading = styled.h1`font-size: 3.5rem; font-weight: bold; color: #fff; margin-bottom: 0.5rem;`;
const SubText = styled.p`font-size: 1.5rem; color: #fff; opacity: 0.7; margin-bottom: 20px;`;
const ButtonContainer = styled.div`display: flex; justify-content: flex-end; margin-top: 20px;`;
const NextButton = styled.button`
  height: 50px; min-width: 120px; background: #FED700; color: #0A121E;
  font-weight: bold; font-size: 1.6rem; border: none; border-radius: 5px;
  cursor: pointer; padding: 0 2rem;
  &:hover { background: #E0A800; }
  &:disabled { background: #E0A800; cursor: default; }
`;
const Spinner = styled.div`
  border: 2px solid transparent; border-top: 2px solid #fff;
  border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

// Slider component
const Slider: React.FC<{ label: string; min: number; max: number; defaultValue: number; onValueChange: (v: number) => void; }> = ({ label, min, max, defaultValue, onValueChange }) => {
  const [value, setValue] = useState(defaultValue);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.min(max, Math.max(min, Number(e.target.value)));
    setValue(v);
    onValueChange(v);
  };
  return (
    <SliderContainer>
      <Label>{label}</Label>
      <SliderWrapper>
        <input type="range" min={min} max={max} value={value} onChange={handleChange} />
        <ValueBox value={value} onChange={handleChange} />
        <span style={{marginLeft:'5px', fontSize:'1.8rem', fontWeight:'bold'}}>%</span>
      </SliderWrapper>
    </SliderContainer>
  );
};

// Main CustomizeDetails
const CustomizeDetails: React.FC<CustomizeDetailsProps> = ({
  setActiveTab, setFurthestAccessibleTab, customizationDetails,
  onCustomizationChange, fileUrl
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

  // STL Viewer mount
  useEffect(() => {
    if (!fileUrl) return;
    const el = document.getElementById('stl-viewer-container');
    if (!el) return;
    el.innerHTML = '';
    const root = createRoot(el);
    root.render(
      <STLViewer fileUrl={fileUrl} onDimensionsCalculated={handleDimensionsCalculated} onVolumeCalculated={setVolume} />
    );
    return () => root.unmount();
  }, [fileUrl]);

  // update material & color data
  useEffect(() => {
    const mats = getMaterialOptions(selectedTechnology);
    setSelectedMaterial(mats[0]?.value || '');
  }, [selectedTechnology]);
  useEffect(() => {
    const opts = colorOptions.getColorFinishOptions(selectedTechnology, selectedMaterial);
    setColorOptionsState(opts);
    setColorFinish(opts.find(o => o.value === customizationDetails.colorFinish)?.value || opts[0]?.value || '');
  }, [selectedTechnology, selectedMaterial]);

  // auto set printer option based on dimensions
  useEffect(() => {
    const { length, breadth, height } = dimensions;
    if (+length && +breadth && +height) {
      const maxDim = Math.max(+length, +breadth, +height);
      const printer = maxDim <= 200 ? 'STD' : maxDim <= 400 ? 'MED' : 'LGE';
      setSelectedPrinterOption(printer);
      onCustomizationChange({ ...customizationDetails, selectedPrinterOption: printer });
    }
  }, [dimensions]);

  const handleDimensionsCalculated = (dim: string) => {
    const [l, b, h] = dim.split(' x ').map(Number);
    setDimensions({ length: l + '', breadth: b + '', height: h + '' });
  };

  const handleNext = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('accessToken');
    const orderId = localStorage.getItem('orderId');
    if (!token || !orderId) return setIsLoading(false);

    const payload: CustomizationPayload = {
      technology: selectedTechnology, material: selectedMaterial,
      colorFinish, layerThickness, filling, scale: customizationDetails.scale,
      printerOption: selectedPrinterOption, orderId
    };

    try {
      await axios.put(EnvVars.API + 'api/public/customization/', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await axios.post(EnvVars.API + 'api/public/add-dimensions', {
        orderId, length: +dimensions.length, breadth: +dimensions.breadth,
        height: +dimensions.height, volume: parseFloat(volume)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveTab('Delivery Options');
      setFurthestAccessibleTab('Delivery Options');
    } catch (e) {
      console.error('Error', e);
    } finally {
      setIsLoading(false);
    }
  };

  const layerOptions = [
    { label: 'Ultra Fine - 0.12mm', value: 'ULTRAFINE' },
    { label: 'Fine - 0.16mm', value: 'FINE' },
    { label: 'Normal - 0.2mm', value: 'NORMAL' },
    { label: 'Draft - 0.3mm', value: 'DRAFT' },
  ];

  return (
    <div>
      <ModalCustom isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>Material Properties</h2>
        <SubText>Details about materials, properties, and costs.</SubText>
        <MaterialTable materials={fdmData.materials} />
      </ModalCustom>

      <Heading>Customize your Order</Heading>
      <SubText>Adjust model specs, dimensions, materials, and finishes.</SubText>

      <DropdownContainer>
        <Label>Technology</Label>
        <TechnologyDropdown value={selectedTechnology} onChange={e => {
          const v = (e.target as HTMLSelectElement).value;
          setSelectedTechnology(v);
          onCustomizationChange({ ...customizationDetails, selectedTechnology: v });
        }} />

        <Label>Material</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MaterialDropdown
            options={getMaterialOptions(selectedTechnology)}
            value={selectedMaterial}
            onChange={e => {
              const v = (e.target as HTMLSelectElement).value;
              setSelectedMaterial(v);
              onCustomizationChange({ ...customizationDetails, selectedMaterial: v });
            }}
          />
          <InfoButton onClick={() => setIsModalOpen(true)}><InfoIcon /></InfoButton>
        </div>

        {!['SLA','SLS','DLP','MJF'].includes(selectedTechnology) && (
          <>
            <Label>Layer Thickness</Label>
            <Select value={layerThickness} onChange={e => {
              const v = e.target.value;
              setLayerThickness(v);
              onCustomizationChange({ ...customizationDetails, layerThickness: v });
            }}>
              {layerOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </Select>

            <Label>Printer</Label>
            <Select value={selectedPrinterOption} disabled>
              <option value={selectedPrinterOption}>
                {selectedPrinterOption === 'STD' ? 'STANDARD 220x200x220mm' :
                 selectedPrinterOption === 'MED' ? 'MEDIUM 400x400x400mm' : 'LARGE 600x600x600mm'}
              </option>
            </Select>

            <Slider label="Infill" min={1} max={100} defaultValue={filling} onValueChange={v => {
              setFilling(v);
              onCustomizationChange({ ...customizationDetails, filling: v });
            }} />
          </>
        )}

        <Label>Color & Finishes</Label>
        <ColorFinishDropdown options={colorOptionsState} value={colorFinish} onChange={e => {
          const v = (e.target as HTMLSelectElement).value;
          setColorFinish(v);
          onCustomizationChange({ ...customizationDetails, colorFinish: v });
        }} />
      </DropdownContainer>

      <ButtonContainer>
        <NextButton disabled={isLoading} onClick={handleNext}>
          {isLoading ? <Spinner /> : 'NEXT →'}
        </NextButton>
      </ButtonContainer>
    </div>
  );
};

// Outer page wrapper
const CustomizationPage = () => {
  const initialDetails: CustomizationDetails = {
    selectedTechnology: 'FDM', selectedMaterial: 'PLA',
    layerThickness: 'NORMAL', filling: 20,
    colorFinish: '', scale: 100, selectedPrinterOption: 'STD',
  };
  const [activeTab, setActiveTab] = useState('Customization');
  const [furthest, setFurthest] = useState('Customization');
  const fileUrl = typeof window !== 'undefined' ? localStorage.getItem('modelFileUrl') : null;

  return (
    <CustomizeDetails
      setActiveTab={setActiveTab}
      setFurthestAccessibleTab={setFurthest}
      customizationDetails={initialDetails}
      onCustomizationChange={() => {}}
      fileUrl={fileUrl}
    />
  );
};

export default CustomizationPage;
