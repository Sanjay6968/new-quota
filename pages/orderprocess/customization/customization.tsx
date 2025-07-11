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

// ---------- Styled Components ----------
const Label = styled.label`
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 5px;
  color: white;
`;
const DropdownContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;
const Heading = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: white;
`;
const SubText = styled.p`
  font-size: 1.3rem;
  color: #ccc;
  margin-bottom: 20px;
`;
const ButtonContainer = styled.div`
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
`;
const NextButton = styled.button`
  background-color: #fed700;
  color: #0a121e;
  font-weight: bold;
  font-size: 1.6rem;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  &:disabled {
    background-color: #e0a800;
    cursor: default;
  }
`;
const Spinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
`;
const InfoButton = styled.div`
  cursor: pointer;
  margin-left: 10px;
`;
const InfoIcon = () => (
  <svg height="24" width="24" viewBox="0 0 24 24" fill="#fff">
    <path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0-9a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0v-4a1 1 0 0 1 1-1zm0-4a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
  </svg>
`);

// ---------- Slider ----------
const Slider = ({ label, min, max, defaultValue, onValueChange }: {
  label: string;
  min: number;
  max: number;
  defaultValue: number;
  onValueChange: (v: number) => void;
}) => {
  const [value, setValue] = useState(defaultValue);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = Math.max(min, Math.min(max, parseInt(e.target.value)));
    setValue(newVal);
    onValueChange(newVal);
  };
  return (
    <div>
      <Label>{label}</Label>
      <input type="range" min={min} max={max} value={value} onChange={handleChange} />
      <input type="number" value={value} onChange={handleChange} />
    </div>
  );
};

// ---------- Main Customization Component ----------
const CustomizeDetails: React.FC<CustomizeDetailsProps> = ({
  setActiveTab,
  setFurthestAccessibleTab,
  customizationDetails,
  onCustomizationChange,
  fileUrl
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
        onDimensionsCalculated={(dim) => {
          const [l, b, h] = dim.split(' x ').map(Number);
          setDimensions({ length: l.toString(), breadth: b.toString(), height: h.toString() });
        }}
        onVolumeCalculated={(v) => setVolume(v)}
      />
    );
    return () => root.unmount();
  }, [fileUrl]);

  useEffect(() => {
    const options = getMaterialOptions(selectedTechnology);
    setSelectedMaterial(options[0]?.value || '');
  }, [selectedTechnology]);

  useEffect(() => {
    const newColors = colorOptions.getColorFinishOptions(selectedTechnology, selectedMaterial);
    setColorOptionsState(newColors);
    setColorFinish(newColors[0]?.value || '');
  }, [selectedTechnology, selectedMaterial]);

  useEffect(() => {
    const { length, breadth, height } = dimensions;
    if (length && breadth && height) {
      const maxDim = Math.max(+length, +breadth, +height);
      const printer = maxDim <= 200 ? 'STD' : maxDim <= 400 ? 'MED' : 'LGE';
      setSelectedPrinterOption(printer);
    }
  }, [dimensions]);

  const handleNext = async () => {
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
    } catch (err) {
      console.error(err);
    }

    setIsLoading(false);
  };

  const layerThicknessOptions: OptionType[] = [
    { label: 'Ultra Fine - 0.12mm', value: 'ULTRAFINE' },
    { label: 'Fine - 0.16mm', value: 'FINE' },
    { label: 'Normal - 0.2mm', value: 'NORMAL' },
    { label: 'Draft - 0.3mm', value: 'DRAFT' },
  ];

  const printerOptions: OptionType[] = [
    { label: 'Standard (220mm)', value: 'STD' },
    { label: 'Medium (400mm)', value: 'MED' },
    { label: 'Large (600mm)', value: 'LGE' },
  ];

  return (
    <div>
      <ModalCustom isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>Material Properties</h2>
        <MaterialTable materials={fdmData.materials} />
      </ModalCustom>

      <Heading>Customize your Order</Heading>
      <SubText>Tailor specs, material, and printer settings</SubText>

      <DropdownContainer>
        <Label>Technology</Label>
        <TechnologyDropdown value={selectedTechnology} onChange={(v) => setSelectedTechnology(v)} />

        <Label>Material</Label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <MaterialDropdown
            options={getMaterialOptions(selectedTechnology)}
            value={selectedMaterial}
            onChange={(v) => setSelectedMaterial(v)}
          />
          <InfoButton onClick={() => setIsModalOpen(true)}>
            <InfoIcon />
          </InfoButton>
        </div>

        {!['SLA', 'SLS', 'DLP', 'MJF'].includes(selectedTechnology) && (
          <>
            <Label>Layer Thickness</Label>
            <select value={layerThickness} onChange={e => setLayerThickness(e.target.value)}>
              {layerThicknessOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <Label>Printer</Label>
            <select value={selectedPrinterOption} disabled>
              {printerOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <Slider label="Infill" min={1} max={100} defaultValue={filling} onValueChange={setFilling} />
          </>
        )}

        <Label>Color & Finish</Label>
        <ColorFinishDropdown options={colorOptionsState} value={colorFinish} onChange={setColorFinish} />
      </DropdownContainer>

      <ButtonContainer>
        <NextButton onClick={handleNext} disabled={isLoading}>
          {isLoading ? <Spinner /> : 'NEXT →'}
        </NextButton>
      </ButtonContainer>
    </div>
  );
};

export default function CustomizationPage() {
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
}
