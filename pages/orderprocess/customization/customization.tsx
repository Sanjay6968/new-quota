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

// === Interfaces & Types ===

interface DropdownProps {
  label: string;
  options: OptionType[];
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}

interface SliderProps {
  label: string;
  min: number;
  max: number;
}

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
  onCustomizationChange: (newDetails: CustomizationDetails) => void;
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

// === UI Components ===

const Dropdown: React.FC<DropdownProps> = ({ label, options, value, onChange, disabled = false }) => (
  <DropdownContainer>
    <Label>{label}</Label>
    <Select value={value} onChange={onChange} disabled={disabled}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </Select>
  </DropdownContainer>
);

const Slider: React.FC<SliderProps & { defaultValue: number; onValueChange: (val: number) => void }> = ({ label, min, max, defaultValue, onValueChange }) => {
  const [value, setValue] = useState(defaultValue);
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = Math.max(min, Math.min(max, +e.target.value));
    setValue(v);
    onValueChange(v);
  };
  return (
    <SliderContainer>
      <Label>{label}</Label>
      <SliderWrapper>
        <input type="range" min={min} max={max} value={value} onChange={handle} />
        <ValueBox value={value} onChange={handle} />
        <PercentageSymbol>%</PercentageSymbol>
      </SliderWrapper>
    </SliderContainer>
  );
};

// === Main Component ===

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

  // STL viewer
  useEffect(() => {
    if (!fileUrl) return;
    const el = document.getElementById('stl-viewer-container');
    if (!el) return;
    el.innerHTML = '';
    const root = createRoot(el);
    root.render(<STLViewer fileUrl={fileUrl} onDimensionsCalculated={handleDimensionsCalculated} onVolumeCalculated={handleVolumeCalculated} />);
    return () => root.unmount();
  }, [fileUrl]);

  // Material options
  useEffect(() => {
    const opts = getMaterialOptions(selectedTechnology);
    setSelectedMaterial(opts[0]?.value || '');
  }, [selectedTechnology]);

  // Color finish options
  useEffect(() => {
    const opts = colorOptions.getColorFinishOptions(selectedTechnology, selectedMaterial);
    setColorOptionsState(opts);
    setColorFinish(opts.find(o => o.value === customizationDetails.colorFinish)?.value || opts[0]?.value || '');
  }, [selectedTechnology, selectedMaterial]);

  // Auto select printer by size
  useEffect(() => {
    const { length, breadth, height } = dimensions;
    if (length && breadth && height) {
      const maxDim = Math.max(+length, +breadth, +height);
      const p = maxDim <= 200 ? 'STD' : maxDim <= 400 ? 'MED' : 'LGE';
      setSelectedPrinterOption(p);
      onCustomizationChange({ ...customizationDetails, selectedPrinterOption: p });
    }
  }, [dimensions]);

  // Handlers
  const handleDimensionsCalculated = (dim: string) => {
    const [l, b, h] = dim.split(' x ').map(Number);
    setDimensions({ length: l + '', breadth: b + '', height: h + '' });
  };
  const handleVolumeCalculated = (v: string) => setVolume(v);

  const handleNextButtonClick = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('accessToken');
    const orderId = localStorage.getItem('orderId');
    if (!token || !orderId) return;
    const payload: CustomizationPayload = {
      technology: selectedTechnology,
      material: selectedMaterial,
      colorFinish,
      layerThickness,
      filling,
      scale: customizationDetails.scale,
      printerOption: selectedPrinterOption,
      orderId
    };
    try {
      await axios.put(`${EnvVars.API}api/public/customization/`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await axios.post(`${EnvVars.API}api/public/add-dimensions`, {
        orderId,
        length: +dimensions.length,
        breadth: +dimensions.breadth,
        height: +dimensions.height,
        volume: +volume
      }, { headers: { Authorization: `Bearer ${token}` } });
      setActiveTab('Delivery Options');
      setFurthestAccessibleTab('Delivery Options');
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

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

  return (
    <div>
      <ModalCustom isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>Material Properties</h2>
        <SubText>See material specs and costs.</SubText>
        <MaterialTable materials={fdmData.materials} />
      </ModalCustom>

      <Heading>Customize your Order</Heading>
      <SubText>Choose technology, material, finishing & settings</SubText>

      <DropdownContainer>
        <Label>Technology</Label>
        <TechnologyDropdown value={selectedTechnology} onChange={e => { setSelectedTechnology(e.target.value); onCustomizationChange({ ...customizationDetails, selectedTechnology: e.target.value }); }} />

        <Label>Material</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MaterialDropdown options={getMaterialOptions(selectedTechnology)} value={selectedMaterial} onChange={e => { setSelectedMaterial(e.target.value); onCustomizationChange({ ...customizationDetails, selectedMaterial: e.target.value }); }} />
          <InfoButton onClick={() => setIsModalOpen(true)}><InfoIcon /></InfoButton>
        </div>

        {!['SLA', 'SLS', 'DLP', 'MJF'].includes(selectedTechnology) && (
          <>
            <Dropdown label="Layer Thickness" options={layerThicknessOptions} value={layerThickness} onChange={e => { setLayerThickness(e.target.value); onCustomizationChange({ ...customizationDetails, layerThickness: e.target.value }); }} />
            <Dropdown label="Printer" options={printerOptions} value={selectedPrinterOption} disabled />
            <Slider label="Infill" min={1} max={100} defaultValue={filling} onValueChange={val => { setFilling(val); onCustomizationChange({ ...customizationDetails, filling: val }); }} />
          </>
        )}

        <Label>Color & Finish</Label>
        <ColorFinishDropdown options={colorOptionsState} value={colorFinish} onChange={e => { setColorFinish(e.target.value); onCustomizationChange({ ...customizationDetails, colorFinish: e.target.value }); }} />
      </DropdownContainer>

      <ButtonContainer>
        <NextButton disabled={isLoading} onClick={handleNextButtonClick}>
          {isLoading ? <Spinner /> : 'NEXT →'}
        </NextButton>
      </ButtonContainer>
    </div>
  );
};

// === Page Export ===

const CustomizationPage: React.FC = () => {
  const initial: CustomizationDetails = {
    selectedTechnology: 'FDM',
    selectedMaterial: 'PLA',
    layerThickness: 'NORMAL',
    filling: 20,
    colorFinish: '',
    scale: 100,
    selectedPrinterOption: 'STD',
  };
  const [details, setDetails] = useState(initial);
  const [activeTab, setActiveTab] = useState('Customization');
  const [furthestTab, setFurthestTab] = useState('Customization');
  const url = typeof window !== 'undefined' ? localStorage.getItem('modelFileUrl') : null;

  return (
    <CustomizeDetails
      setActiveTab={setActiveTab}
      setFurthestAccessibleTab={setFurthestTab}
      customizationDetails={details}
      onCustomizationChange={setDetails}
      fileUrl={url}
    />
  );
};

export default CustomizationPage;

// === Styled Components ===

const DropdownContainer = styled.div`
  display: flex; flex-direction: column; gap: 10px; max-width: 600px;
`;
const Label = styled.label` font-size: 1.8rem; font-weight: bold; color: #fff; `;
// ... rest of your styled components (Select, SliderContainer, etc.) continue below exactly as before...
