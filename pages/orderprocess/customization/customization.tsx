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

// Styles
const DropdownContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 600px;
`;
const Label = styled.label`font-weight: bold; font-size: 1.4rem;`;
const Heading = styled.h1`font-size: 2rem; color: #fff; margin-bottom: 1rem;`;
const SubText = styled.p`color: #fff; opacity: 0.8; margin: 0 0 1.5rem;`;
const ButtonContainer = styled.div`display: flex; justify-content: flex-end;`;
const NextButton = styled.button`
  background: #FED700; color: #0A121E; padding: 0.75rem 1.5rem;
  border: none; border-radius: 4px; font-weight: bold;
  &:disabled { background: #E0A800; cursor: not-allowed; }
`;
const Spinner = styled.div`
  border: 3px solid transparent;
  border-top: 3px solid white;
  border-radius: 50%;
  width: 24px; height: 24px;
  animation: spin 1s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;
const SliderContainer = styled.div``;
const SliderWrapper = styled.div`display: flex; align-items: center; gap: 0.5rem;`;
const ValueBox = styled.input.attrs({ type: 'number' })`
  width: 4rem; padding: 0.25rem; border-radius: 4px;
`;
const PercentageSymbol = styled.span`font-weight: bold;`;

// Slider component
const Slider: React.FC<{ label: string; min: number; max: number; defaultValue: number; onValueChange: (v: number) => void; }> = ({ label, min, max, defaultValue, onValueChange }) => {
  const [value, setValue] = useState(defaultValue);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = Number(e.target.value);
    v = Math.min(max, Math.max(min, v));
    setValue(v);
    onValueChange(v);
  };
  return (
    <SliderContainer>
      <Label>{label}</Label>
      <SliderWrapper>
        <input type="range" min={min} max={max} value={value} onChange={onChange} />
        <ValueBox value={value} onChange={onChange} />
        <PercentageSymbol>%</PercentageSymbol>
      </SliderWrapper>
    </SliderContainer>
  );
};

// Main customization component
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
    root.render(<STLViewer fileUrl={fileUrl} onDimensionsCalculated={dim => {
      const [l,b,h] = dim.split(' x ');
      setDimensions({ length: l, breadth: b, height: h });
    }} onVolumeCalculated={v => setVolume(v)} />);
    return () => root.unmount();
  }, [fileUrl]);

  useEffect(() => {
    const mats = getMaterialOptions(selectedTechnology);
    setSelectedMaterial(mats[0]?.value || '');
  }, [selectedTechnology]);

  useEffect(() => {
    const opts = colorOptions.getColorFinishOptions(selectedTechnology, selectedMaterial);
    setColorOptionsState(opts);
    setColorFinish(opts.find(o => o.value === customizationDetails.colorFinish)?.value ?? opts[0]?.value ?? '');
  }, [selectedTechnology, selectedMaterial]);

  useEffect(() => {
    const { length, breadth, height } = dimensions;
    if (length && breadth && height) {
      const maxDim = Math.max(+length, +breadth, +height);
      const printer = maxDim <= 200 ? 'STD' : maxDim <= 400 ? 'MED' : 'LGE';
      setSelectedPrinterOption(printer);
      onCustomizationChange({ ...customizationDetails, selectedPrinterOption: printer });
    }
  }, [dimensions]);

  const layerThicknessOptions = [
    { label: 'Ultra Fine - 0.12mm', value: 'ULTRAFINE' },
    { label: 'Fine - 0.16mm', value: 'FINE' },
    { label: 'Normal - 0.2mm', value: 'NORMAL' },
    { label: 'Draft - 0.3mm', value: 'DRAFT' }
  ];

  const handleNext = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('accessToken');
    const orderId = localStorage.getItem('orderId');
    if (!token || !orderId) { setIsLoading(false); return; }
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
      await axios.put(EnvVars.API + 'api/public/customization/', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await axios.post(EnvVars.API + 'api/public/add-dimensions', {
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
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  return (
    <div>
      <ModalCustom isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>Material Properties</h2>
        <SubText>Details, costs, etc.</SubText>
        <MaterialTable materials={(fdmData as any).materials} />
      </ModalCustom>

      <Heading>Customize Your Order</Heading>
      <SubText>Select tech, materials, infill</SubText>

      <DropdownContainer>
        <Label>Technology</Label>
        <TechnologyDropdown value={selectedTechnology} onChange={val => {
          setSelectedTechnology(val);
          onCustomizationChange({ ...customizationDetails, selectedTechnology: val });
        }} />

        <Label>Material</Label>
        <div style={{ display: 'flex', gap: '1rem'}}>
          <MaterialDropdown options={getMaterialOptions(selectedTechnology)} value={selectedMaterial} onChange={val => {
            setSelectedMaterial(val);
            onCustomizationChange({ ...customizationDetails, selectedMaterial: val });
          }} />

          <InfoButton onClick={() => setIsModalOpen(true)}>
            <InfoIcon />
          </InfoButton>
        </div>

        {!['SLA','SLS','DLP','MJF'].includes(selectedTechnology) && (
          <>
            <Label>Layer Thickness</Label>
            <select value={layerThickness} onChange={e => {
              setLayerThickness(e.target.value);
              onCustomizationChange({ ...customizationDetails, layerThickness: e.target.value });
            }}>
              {layerThicknessOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <Label>Infill %</Label>
            <Slider label="Infill" min={1} max={100} defaultValue={filling} onValueChange={v => {
              setFilling(v);
              onCustomizationChange({ ...customizationDetails, filling: v });
            }} />
          </>
        )}

        <Label>Color & Finish</Label>
        <ColorFinishDropdown options={colorOptionsState} value={colorFinish} onChange={val => {
          setColorFinish(val);
          onCustomizationChange({ ...customizationDetails, colorFinish: val });
        }} />
      </DropdownContainer>

      <ButtonContainer>
        <NextButton onClick={handleNext} disabled={isLoading}>
          {isLoading ? <Spinner /> : "NEXT →"}
        </NextButton>
      </ButtonContainer>
    </div>
  );
};

// Page entrypoint for Next.js
const CustomizationPage: React.FC = () => {
  const initialDetails: CustomizationDetails = {
    selectedTechnology: 'FDM',
    selectedMaterial: 'PLA',
    layerThickness: 'NORMAL',
    filling: 20,
    colorFinish: '',
    scale: 100,
    selectedPrinterOption: 'STD'
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
