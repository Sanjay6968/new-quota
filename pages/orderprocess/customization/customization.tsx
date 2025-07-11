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

// Reusable UI Components
const DropdownContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: 600px;
  flex-direction: column;
  gap: 10px;
`;

const Label = styled.label`
  font-size: 1.8rem;
  font-weight: bold;
  font-family: 'Poppins', sans-serif;
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

const ColorBox = styled.div<{ color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 3px;
  background-color: ${({ color }) => color};
  margin-right: 8px;
  display: inline-block;
`;

const SliderWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const InfoButton = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: transparent;
  border: none;
  padding: 0;
`;

const InfoIcon = () => (
  <svg height="24" width="24" viewBox="0 0 24 24" fill="#fff">
    <path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0-9a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0v-4a1 1 0 0 1 1-1zm0-4a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
  </svg>
);

const ValueBox = styled.input.attrs(props => ({
  type: 'number',
  min: props.min,
  max: props.max,
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

const Slider: React.FC<SliderProps & { defaultValue: number, onValueChange: (value: number) => void }> = ({ label, min, max, defaultValue, onValueChange }) => {
  const [value, setValue] = useState(defaultValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = Number(e.target.value);
    input = Math.min(max, Math.max(min, input));
    setValue(input);
    onValueChange(input);
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

const CustomizeDetails: React.FC<CustomizeDetailsProps> = ({ setActiveTab, setFurthestAccessibleTab, customizationDetails, onCustomizationChange, fileUrl }) => {
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
    const el = document.getElementById('stl-viewer-container');
    if (!el) return;
    el.innerHTML = '';
    const root = createRoot(el);
    root.render(<STLViewer fileUrl={fileUrl} onDimensionsCalculated={handleDimensionsCalculated} onVolumeCalculated={handleVolumeCalculated} />);
    return () => root.unmount();
  }, [fileUrl]);

  useEffect(() => {
    const materialOptions = getMaterialOptions(selectedTechnology);
    setSelectedMaterial(materialOptions[0]?.value || '');
  }, [selectedTechnology]);

  useEffect(() => {
    const newColorOptions = colorOptions.getColorFinishOptions(selectedTechnology, selectedMaterial);
    setColorOptionsState(newColorOptions);
    setColorFinish(newColorOptions.find(o => o.value === customizationDetails.colorFinish)?.value || newColorOptions[0]?.value || '');
  }, [selectedTechnology, selectedMaterial, customizationDetails.colorFinish]);

  useEffect(() => {
    const { length, breadth, height } = dimensions;
    if (length && breadth && height) {
      const maxDim = Math.max(+length, +breadth, +height);
      const printer = maxDim <= 200 ? 'STD' : maxDim <= 400 ? 'MED' : 'LGE';
      setSelectedPrinterOption(printer);
      onCustomizationChange({ ...customizationDetails, selectedPrinterOption: printer });
    }
  }, [dimensions]);

  const handleDimensionsCalculated = (dim: string) => {
    const [l, b, h] = dim.split(' x ').map(Number);
    setDimensions({ length: l.toString(), breadth: b.toString(), height: h.toString() });
  };

  const handleVolumeCalculated = (v: string) => setVolume(v);

  const handleNextButtonClick = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('accessToken');
    const orderId = localStorage.getItem('orderId');
    if (!token || !orderId) return;

    const customizationData: CustomizationPayload = {
      technology: selectedTechnology,
      material: selectedMaterial,
      colorFinish,
      layerThickness,
      filling,
      scale,
      printerOption: selectedPrinterOption,
      orderId
    };

    try {
      await axios.put(EnvVars.API + 'api/public/customization/', customizationData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      await axios.post(EnvVars.API + 'api/public/add-dimensions', {
        orderId,
        length: parseFloat(dimensions.length),
        breadth: parseFloat(dimensions.breadth),
        height: parseFloat(dimensions.height),
        volume: parseFloat(volume)
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setActiveTab('Delivery Options');
      setFurthestAccessibleTab('Delivery Options');
    } catch (err) {
      console.error('Submission failed', err);
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
        <SubText>Details about materials, properties, and costs.</SubText>
        <MaterialTable materials={fdmData.materials} />
      </ModalCustom>

      <Heading>Customize your Order</Heading>
      <SubText>Tailor model specs, adjust dimensions, materials, and finishing options.</SubText>

      <DropdownContainer>
        <Label>Technology</Label>
        <TechnologyDropdown value={selectedTechnology} onChange={handleTechnologyChange} />

        <Label>Material</Label>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ flexGrow: 1 }}>
            <MaterialDropdown options={getMaterialOptions(selectedTechnology)} value={selectedMaterial} onChange={handleMaterialChange} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <h2 style={{ whiteSpace: "nowrap", margin: 0 }}>Material Selection</h2>
            <InfoButton onClick={() => setIsModalOpen(true)}>
              <InfoIcon />
            </InfoButton>
          </div>
        </div>

        {!['SLA', 'SLS', 'DLP', 'MJF'].includes(selectedTechnology) && (
          <>
            <Dropdown label="Layer Thickness" options={layerThicknessOptions} value={layerThickness} onChange={handleLayerThicknessChange} />
            <Dropdown label="Printer" options={printerOptions} value={selectedPrinterOption} disabled />
            <Slider label="Infill" min={1} max={100} defaultValue={filling} onValueChange={setFilling} />
          </>
        )}

        <Label>Color and Finishes</Label>
        <ColorFinishDropdown options={colorOptionsState} value={colorFinish} onChange={handleColorFinishChange} />
      </DropdownContainer>

      <ButtonContainer>
        <NextButton onClick={handleNextButtonClick} disabled={isLoading}>
          {isLoading ? <Spinner /> : "NEXT →"}
        </NextButton>
      </ButtonContainer>
    </div>
  );
};

// Export default React component for Next.js
const CustomizationPage = () => {
  const initialDetails: CustomizationDetails = {
    selectedTechnology: 'FDM',
    selectedMaterial: 'PLA',
    layerThickness: 'NORMAL',
    filling: 20,
    colorFinish: '',
    scale: 100,
    selectedPrinterOption: 'STD',
  };

  const [activeTab, setActiveTab] = useState('Customization');
  const [furthestAccessibleTab, setFurthestAccessibleTab] = useState('Customization');

  return (
    <CustomizeDetails
      setActiveTab={setActiveTab}
      setFurthestAccessibleTab={setFurthestAccessibleTab}
      customizationDetails={initialDetails}
      onCustomizationChange={() => {}}
      fileUrl={typeof window !== 'undefined' ? localStorage.getItem('modelFileUrl') : null}
    />
  );
};

export default CustomizationPage;

// Extra styles
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

const PercentageSymbol = styled.span`
  font-size: 1.8rem;
  font-weight: bold;
  margin-left: 5px;
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
  transition: background-color 0.3s ease;
  padding: 0 2rem;

  &:hover {
    background-color: #E0A800;
  }

  &:disabled {
    background-color: #E0A800;
    cursor: default;
  }
`;

const Spinner = styled.div`
  border: 2px solid transparent;
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SliderContainer = styled.div`
  input[type="range"] {
    appearance: none;
    width: 100%;
    height: 22px;
    border-radius: 15px;
    cursor: pointer;

    &::-webkit-slider-thumb {
      appearance: none;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      background: #fed700;
      cursor: pointer;
    }

    &::-moz-range-thumb {
      width: 25px;
      height: 25px;
      border-radius: 50%;
      background: #fed700;
      cursor: pointer;
    }
  }
`;
