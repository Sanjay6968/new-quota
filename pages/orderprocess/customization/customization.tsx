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

// Styled components
const DropdownContainer = styled.div`...`; // (your styles)
const Label = styled.label`...`;
const Heading = styled.h1`...`;
const SubText = styled.p`...`;
const ButtonContainer = styled.div`...`;
const NextButton = styled.button`...`;
const Spinner = styled.div`...`;
const SliderContainer = styled.div`...`;
const SliderWrapper = styled.div`...`;
const PercentageSymbol = styled.span`...`;
const ValueBox = styled.input.attrs(props => ({
  type: 'number',
  min: props.min,
  max: props.max
}))`...`;
const InfoButton = styled.div`...`;
const InfoIcon = () => (<svg>…</svg>);

const Slider: React.FC<{ label: string; min: number; max: number; defaultValue: number; onValueChange: (v: number) => void }> = ({
  label, min, max, defaultValue, onValueChange
}) => {
  const [value, setValue] = useState(defaultValue);
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.min(max, Math.max(min, Number(e.target.value)));
    setValue(v);
    onValueChange(v);
  };
  return (
    <div style={{ marginBottom: '1rem' }}>
      <Label>{label}</Label>
      <SliderWrapper>
        <input type="range" min={min} max={max} value={value} onChange={handle}/>
        <ValueBox value={value} onChange={handle}/>
        <PercentageSymbol>%</PercentageSymbol>
      </SliderWrapper>
    </div>
  );
};

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
      <STLViewer fileUrl={fileUrl} onDimensionsCalculated={handleDimensions} onVolumeCalculated={v => setVolume(v)} />
    );
    return () => root.unmount();
  }, [fileUrl]);

  useEffect(() => {
    const matOpts = getMaterialOptions(selectedTechnology);
    if (matOpts.length > 0) setSelectedMaterial(matOpts[0].value);
  }, [selectedTechnology]);

  useEffect(() => {
    const c = colorOptions.getColorFinishOptions(selectedTechnology, selectedMaterial);
    setColorOptionsState(c);
    if (c.length > 0) setColorFinish(c[0].value);
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

  const handleDimensions = (d: string) => {
    const [l, b, h] = d.split(' x ');
    setDimensions({ length: l, breadth: b, height: h });
  };

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
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const layerThicknessOptions = [ /* as before */ ];
  const printerOptions = [ /* as before */ ];

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
        <TechnologyDropdown
          value={selectedTechnology}
          onChange={(val: string) => {
            setSelectedTechnology(val);
            onCustomizationChange({ ...customizationDetails, selectedTechnology: val });
          }}
        />

        <Label>Material</Label>
        <MaterialDropdown
          options={getMaterialOptions(selectedTechnology)}
          value={selectedMaterial}
          onChange={(val: string) => {
            setSelectedMaterial(val);
            onCustomizationChange({ ...customizationDetails, selectedMaterial: val });
          }}
        />

        {!['SLA', 'SLS', 'DLP', 'MJF'].includes(selectedTechnology) && (
          <>
            <Label>Layer Thickness</Label>
            <select
              value={layerThickness}
              onChange={e => {
                setLayerThickness(e.target.value);
                onCustomizationChange({ ...customizationDetails, layerThickness: e.target.value });
              }}
            >
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

            <Slider label="Infill" min={1} max={100} defaultValue={filling} onValueChange={val => {
              setFilling(val);
              onCustomizationChange({ ...customizationDetails, filling: val });
            }} />
          </>
        )}

        <Label>Color and Finishes</Label>
        <ColorFinishDropdown
          options={colorOptionsState}
          value={colorFinish}
          onChange={(val: string) => {
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
    selectedPrinterOption: 'STD'
  };

  const [activeTab, setActiveTab] = useState('Customization');
  const [furthestAccessibleTab, setFurthestAccessibleTab] = useState('Customization');

  return (
    <CustomizeDetails
      setActiveTab={setActiveTab}
      setFurthestAccessibleTab={setFurthestAccessibleTab}
      customizationDetails={initialDetails}
      onCustomizationChange={() => {/* update wrapper state here if needed */}}
      fileUrl={typeof window !== 'undefined' ? localStorage.getItem('modelFileUrl') : null}
    />
  );
}
