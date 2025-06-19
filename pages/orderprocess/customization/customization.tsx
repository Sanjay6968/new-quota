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

const DropdownContainer = styled.div``;
const Label = styled.label``;
const Select = styled.select``;
const ColorBox = styled.div<{ color: string }>`background-color: ${({ color }) => color};`;
const SliderWrapper = styled.div``;
const InfoButton = styled.div``;
const ValueBox = styled.input``;
const Heading = styled.h1``;
const SubText = styled.p``;
const PercentageSymbol = styled.span``;
const ButtonContainer = styled.div``;
const NextButton = styled.button``;
const Spinner = styled.div``;
const SliderContainer = styled.div``;

function CustomizeDetails({ setActiveTab, setFurthestAccessibleTab, customizationDetails, onCustomizationChange, fileUrl }: CustomizeDetailsProps) {
  const [selectedTechnology, setSelectedTechnology] = useState(customizationDetails.selectedTechnology);
  const [selectedMaterial, setSelectedMaterial] = useState(customizationDetails.selectedMaterial);
  const [layerThickness, setLayerThickness] = useState(customizationDetails.layerThickness);
  const [filling, setFilling] = useState(customizationDetails.filling);
  const [colorFinish, setColorFinish] = useState(customizationDetails.colorFinish);
  const [scale, setScale] = useState(customizationDetails.scale);
  const [selectedPrinterOption, setSelectedPrinterOption] = useState(customizationDetails.selectedPrinterOption);
  const [dimensions, setDimensions] = useState({ length: '', breadth: '', height: '' });
  const [volume, setVolume] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [colorOptionsState, setColorOptionsState] = useState<OptionType[]>([]);

  useEffect(() => {
    if (!fileUrl) return;
    const stlViewerContainer = document.getElementById('stl-viewer-container');
    if (!stlViewerContainer) return;
    stlViewerContainer.innerHTML = '';
    const root = createRoot(stlViewerContainer);
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
    setColorFinish(newColorOptions.find(option => option.value === customizationDetails.colorFinish)?.value || newColorOptions[0]?.value || '');
  }, [selectedTechnology, selectedMaterial]);

  useEffect(() => {
    if (dimensions.length && dimensions.breadth && dimensions.height) {
      const maxDim = Math.max(+dimensions.length, +dimensions.breadth, +dimensions.height);
      const printerOption = maxDim <= 200 ? 'STD' : maxDim <= 400 ? 'MED' : 'LGE';
      setSelectedPrinterOption(printerOption);
      onCustomizationChange({ ...customizationDetails, selectedPrinterOption: printerOption });
    }
  }, [dimensions]);

  const handleDimensionsCalculated = (dim: string) => {
    const [length, breadth, height] = dim.split(' x ').map(Number);
    setDimensions({ length, breadth, height });
  };

  const handleVolumeCalculated = (vol: string) => setVolume(vol);

  const handleNextButtonClick = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const orderId = localStorage.getItem('orderId');
      if (!token || !orderId) return;

      let customizationData = {
        technology: selectedTechnology,
        material: selectedMaterial,
        colorFinish,
        orderId,
        layerThickness,
        filling,
        scale,
        printerOption: selectedPrinterOption
      };

      await axios.put(`${EnvVars.API}api/public/customization/`, customizationData, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });

      const dimensionsData = { orderId, length: +dimensions.length, breadth: +dimensions.breadth, height: +dimensions.height, volume: +volume };
      await axios.post(`${EnvVars.API}api/public/add-dimensions`, dimensionsData, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });

      setActiveTab('Delivery Options');
      setFurthestAccessibleTab('Delivery Options');
    } catch (error) {
      console.error('Error submitting customization:', error);
    }
    setIsLoading(false);
  };

  return (
    <div>
      <Heading>Customize your Order</Heading>
      <SubText>Tailor your model specifications, adjust dimensions, choose materials, and explore finishing options to perfect your 3D print.</SubText>
      {/* Form and dropdowns here */}
      <ButtonContainer>
        <NextButton onClick={handleNextButtonClick} disabled={isLoading}>
          {isLoading ? <Spinner /> : 'NEXT →'}
        </NextButton>
      </ButtonContainer>
    </div>
  );
}

export default CustomizeDetails;
export { CustomizeDetails };
export type { CustomizationDetails, DropdownProps, SliderProps };
