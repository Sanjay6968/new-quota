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
interface DropdownProps {
  label: string;
  options: OptionType[];
  value: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
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

// ---- COMPONENTS ---- //

const Dropdown: React.FC<DropdownProps> = ({ label, options, value, onChange, disabled = false }) => (
  <DropdownContainer>
    <Label>{label}</Label>
    <Select value={value} onChange={onChange} disabled={disabled}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.color && <ColorBox color={option.color} />}
          {option.label}
        </option>
      ))}
    </Select>
  </DropdownContainer>
);

const Slider: React.FC<SliderProps & { defaultValue: number; onValueChange: (value: number) => void }> = ({
  label,
  min,
  max,
  defaultValue,
  onValueChange,
}) => {
  const [value, setValue] = useState(defaultValue);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = Number(event.target.value);
    if (inputValue > max) inputValue = max;
    else if (inputValue < min) inputValue = min;
    setValue(inputValue);
    onValueChange(inputValue);
  };

  return (
    <SliderContainer>
      <Label>{label}</Label>
      <SliderWrapper>
        <input type="range" min={min} max={max} value={value} onChange={handleChange} />
        <ValueBox type="number" min={min} max={max} value={value} onChange={handleChange} />
        <PercentageSymbol>%</PercentageSymbol>
      </SliderWrapper>
    </SliderContainer>
  );
};

// ---- MAIN CustomizeDetails Component ---- //

function CustomizeDetails({
  setActiveTab,
  setFurthestAccessibleTab,
  customizationDetails,
  onCustomizationChange,
  fileUrl,
}: CustomizeDetailsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTechnology, setSelectedTechnology] = useState(customizationDetails.selectedTechnology);
  const [selectedMaterial, setSelectedMaterial] = useState(customizationDetails.selectedMaterial);
  const [layerThickness, setLayerThickness] = useState(customizationDetails.layerThickness);
  const [filling, setFilling] = useState(customizationDetails.filling);
  const [colorFinish, setColorFinish] = useState(customizationDetails.colorFinish);
  const [scale, setScale] = useState(customizationDetails.scale);
  const [selectedPrinterOption, setSelectedPrinterOption] = useState(customizationDetails.selectedPrinterOption);
  const [dimensions, setDimensions] = useState({ length: '', breadth: '', height: '' });
  const [volume, setVolume] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [colorOptionsState, setColorOptionsState] = useState<OptionType[]>([]);

  useEffect(() => {
    if (!fileUrl) return;
    const container = document.getElementById('stl-viewer-container');
    if (!container) return;
    container.innerHTML = '';
    const root = createRoot(container);
    root.render(<STLViewer fileUrl={fileUrl} onDimensionsCalculated={handleDimensionsCalculated} onVolumeCalculated={handleVolumeCalculated} />);
    return () => root.unmount();
  }, [fileUrl]);

  useEffect(() => {
    const options = getMaterialOptions(selectedTechnology);
    setSelectedMaterial(options[0]?.value || '');
  }, [selectedTechnology]);

  useEffect(() => {
    const options = colorOptions.getColorFinishOptions(selectedTechnology, selectedMaterial);
    setColorOptionsState(options);
    setColorFinish(options[0]?.value || '');
  }, [selectedTechnology, selectedMaterial]);

  useEffect(() => {
    const { length, breadth, height } = dimensions;
    if (length && breadth && height) {
      const max = Math.max(+length, +breadth, +height);
      const printer = max <= 200 ? 'STD' : max <= 400 ? 'MED' : 'LGE';
      setSelectedPrinterOption(printer);
      onCustomizationChange({ ...customizationDetails, selectedPrinterOption: printer });
    }
  }, [dimensions]);

  const handleDimensionsCalculated = (dims: string) => {
    const [l, b, h] = dims.split(' x ').map(parseFloat);
    setDimensions({ length: l.toString(), breadth: b.toString(), height: h.toString() });
  };

  const handleVolumeCalculated = (vol: string) => setVolume(vol);

  const handleNext = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const orderId = localStorage.getItem('orderId');
      if (!token || !orderId) return;

      const payload: CustomizationPayload = {
        technology: selectedTechnology,
        material: selectedMaterial,
        colorFinish,
        layerThickness,
        filling,
        scale,
        printerOption: selectedPrinterOption,
        orderId,
      };

      await axios.put(EnvVars.API + 'api/public/customization/', payload, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });

      await axios.post(
        EnvVars.API + 'api/public/add-dimensions',
        {
          orderId,
          length: +dimensions.length,
          breadth: +dimensions.breadth,
          height: +dimensions.height,
          volume: +volume,
        },
        {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        }
      );

      setActiveTab('Delivery Options');
      setFurthestAccessibleTab('Delivery Options');
    } catch (err) {
      console.error('Error submitting data', err);
    }
    setIsLoading(false);
  };

  return (
    <div>
      <ModalCustom isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>Material Properties</h2>
        <SubText>Here you can find details about different materials, their properties, and costs.</SubText>
        <MaterialTable materials={fdmData.materials} />
      </ModalCustom>
      <Heading>Customize your Order</Heading>
      <SubText>Choose your technology, material, thickness, and other customizations.</SubText>
      <div id="stl-viewer-container" style={{ height: '300px' }} />
      <DropdownContainer>
        <TechnologyDropdown value={selectedTechnology} onChange={(v) => { setSelectedTechnology(v); onCustomizationChange({ ...customizationDetails, selectedTechnology: v }); }} />
        <MaterialDropdown
          options={getMaterialOptions(selectedTechnology)}
          value={selectedMaterial}
          onChange={(v) => {
            setSelectedMaterial(v);
            const options = colorOptions.getColorFinishOptions(selectedTechnology, v);
            setColorOptionsState(options);
            const defaultColor = options[0]?.value || '';
            setColorFinish(defaultColor);
            onCustomizationChange({ ...customizationDetails, selectedMaterial: v, colorFinish: defaultColor });
          }}
        />
        <Dropdown label="Layer Thickness" value={layerThickness} options={[
          { label: 'Ultra Fine - 0.12mm', value: 'ULTRAFINE' },
          { label: 'Fine - 0.16mm', value: 'FINE' },
          { label: 'Normal - 0.2mm', value: 'NORMAL' },
          { label: 'Draft - 0.3mm', value: 'DRAFT' },
        ]} onChange={(e) => { setLayerThickness(e.target.value); onCustomizationChange({ ...customizationDetails, layerThickness: e.target.value }); }} />
        <Slider label="Infill" min={1} max={100} defaultValue={filling} onValueChange={(val) => { setFilling(val); onCustomizationChange({ ...customizationDetails, filling: val }); }} />
        <ColorFinishDropdown options={colorOptionsState} value={colorFinish} onChange={(val) => { setColorFinish(val); onCustomizationChange({ ...customizationDetails, colorFinish: val }); }} />
      </DropdownContainer>
      <ButtonContainer>
        <NextButton onClick={handleNext} disabled={isLoading}>
          {isLoading ? <Spinner /> : 'NEXT →'}
        </NextButton>
      </ButtonContainer>
    </div>
  );
}

// ---- MAIN UPLOAD PAGE COMPONENT ---- //

export default function UploadPage() {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Customization');
  const [furthestAccessibleTab, setFurthestAccessibleTab] = useState('Customization');
  const [customizationDetails, setCustomizationDetails] = useState<CustomizationDetails>({
    selectedTechnology: '',
    selectedMaterial: '',
    layerThickness: '',
    filling: 20,
    colorFinish: '',
    scale: 1,
    selectedPrinterOption: '',
  });

  return (
    <PageWrapper>
      <CustomizeDetails
        fileUrl={fileUrl}
        customizationDetails={customizationDetails}
        onCustomizationChange={setCustomizationDetails}
        setActiveTab={setActiveTab}
        setFurthestAccessibleTab={setFurthestAccessibleTab}
      />
    </PageWrapper>
  );
}

// ---- STYLES ---- //
const PageWrapper = styled.div`
  padding: 2rem;
  background-color: #0a121e;
  min-height: 100vh;
`;

const DropdownContainer = styled.div`display: flex; flex-direction: column; gap: 10px; width: 100%; max-width: 600px;`;
const Label = styled.label`font-size: 1.8rem; font-weight: bold; font-family: 'Poppins', sans-serif;`;
const Select = styled.select<{ disabled?: boolean }>`padding: 0.5rem; font-size: 1.2rem;`;
const ColorBox = styled.span<{ color: string }>`display: inline-block; width: 16px; height: 16px; background: ${({ color }) => color}; margin-right: 8px;`;
const Heading = styled.h1`font-size: 3.5rem; color: white;`;
const SubText = styled.p`font-size: 1.4rem; color: white; opacity: 0.7;`;
const PercentageSymbol = styled.span`margin-left: 5px; font-weight: bold;`;
const SliderContainer = styled.div``;
const SliderWrapper = styled.div`display: flex; align-items: center;`;
const ValueBox = styled.input`width: 50px; margin-left: 10px;`;
const ButtonContainer = styled.div`margin-top: 20px; display: flex; justify-content: flex-end;`;
const NextButton = styled.button`background: #FED700; padding: 1rem 2rem; font-weight: bold; border: none; cursor: pointer;`;
const Spinner = styled.div`border: 3px solid white; border-top: 3px solid transparent; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; @keyframes spin { 0% { transform: rotate(0); } 100% { transform: rotate(360deg); } }`;

