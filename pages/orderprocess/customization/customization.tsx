import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import styled from 'styled-components';
import { EnvVars } from '@/env';
import ModalCustom from '@/components/ModalCustom';
import dynamic from 'next/dynamic';
import { OptionType } from '@/types/types';
import { TechnologyDropdown } from '@/components/TechnologyDropdown';
import { ColorFinishDropdown, colorOptions } from '@/components/ColorFinishDropdown';
import { MaterialDropdown, getMaterialOptions } from '@/components/MaterialDropdown';

const MaterialTable = dynamic(() => import('@/utils/MaterialTable'), {
  ssr: false,
  loading: () => <div>Loading material table...</div>,
});

const STLViewer = dynamic(() => import('@/components/stl-loader').then(mod => mod.STLViewer), {
  ssr: false,
  loading: () => <div>Loading 3D Viewer...</div>,
});

// ✅ Type definition for external use
export type CustomizationDetails = {
  selectedTechnology: string;
  selectedMaterial: string;
  layerThickness: string;
  filling: number;
  colorFinish: string;
  scale: number;
  selectedPrinterOption: string;
};

export const CustomizeDetails = ({
  customizationDetails,
  onCustomizationChange,
  fileUrl,
  setActiveTab,
  setFurthestAccessibleTab
}: {
  customizationDetails: CustomizationDetails;
  onCustomizationChange: (val: CustomizationDetails) => void;
  fileUrl: string | null;
  setActiveTab?: (tab: string) => void;
  setFurthestAccessibleTab?: (tab: string) => void;
}) => {
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
  const [fdmData, setFdmData] = useState<any>(null);

  useEffect(() => {
    import('@/utils/fdmData').then(mod => setFdmData(mod.default));
  }, []);

  useEffect(() => {
    if (!fileUrl) return;
    const container = document.getElementById('stl-viewer-container');
    if (!container) return;
    container.innerHTML = '';
    const root = createRoot(container);
    root.render(
      <STLViewer
        fileUrl={fileUrl}
        onDimensionsCalculated={handleDimensionsCalculated}
        onVolumeCalculated={handleVolumeCalculated}
      />
    );
    return () => root.unmount();
  }, [fileUrl]);

  useEffect(() => {
    const options = getMaterialOptions(selectedTechnology);
    setSelectedMaterial(options[0]?.value || '');
  }, [selectedTechnology]);

  useEffect(() => {
    const newColorOptions = colorOptions.getColorFinishOptions(selectedTechnology, selectedMaterial);
    setColorOptionsState(newColorOptions);
    setColorFinish(
      newColorOptions.find(option => option.value === customizationDetails.colorFinish)?.value ||
      newColorOptions[0]?.value ||
      ''
    );
  }, [selectedTechnology, selectedMaterial, customizationDetails.colorFinish]);

  const handleDimensionsCalculated = (newDimensions: string) => {
    const dimensionsArray = newDimensions.split(' x ');
    setDimensions({
      length: dimensionsArray[0],
      breadth: dimensionsArray[1],
      height: dimensionsArray[2]
    });
  };

  const handleVolumeCalculated = (newVolume: string) => setVolume(newVolume);

  const handleTechnologyChange = (tech: string) => {
    setSelectedTechnology(tech);
    onCustomizationChange({ ...customizationDetails, selectedTechnology: tech });
  };

  const handleMaterialChange = (val: string) => {
    setSelectedMaterial(val);
    const newOptions = colorOptions.getColorFinishOptions(selectedTechnology, val);
    setColorOptionsState(newOptions);
    const defaultColor =
      newOptions.find(option => option.value === customizationDetails.colorFinish)?.value ||
      newOptions[0]?.value ||
      '';
    setColorFinish(defaultColor);
    onCustomizationChange({ ...customizationDetails, selectedMaterial: val, colorFinish: defaultColor });
  };

  const handleColorFinishChange = (val: string) => {
    setColorFinish(val);
    onCustomizationChange({ ...customizationDetails, colorFinish: val });
  };

  const handleLayerThicknessChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLayerThickness(e.target.value);
    onCustomizationChange({ ...customizationDetails, layerThickness: e.target.value });
  };

  const handleFillingChange = (val: number) => {
    setFilling(val);
    onCustomizationChange({ ...customizationDetails, filling: val });
  };

  return (
    <div>
      <ModalCustom isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>Material Properties</h2>
        <p>Details about materials and costs.</p>
        {isModalOpen && fdmData && <MaterialTable materials={fdmData.materials} />}
      </ModalCustom>
    </div>
  );
};

export default function CustomizationPageWrapper() {
  const [customizationDetails, setCustomizationDetails] = useState<CustomizationDetails>({
    selectedTechnology: 'FDM',
    selectedMaterial: 'PLA',
    layerThickness: 'NORMAL',
    filling: 20,
    colorFinish: 'Natural',
    scale: 100,
    selectedPrinterOption: 'STD'
  });
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Customize');
  const [furthestAccessibleTab, setFurthestAccessibleTab] = useState('Customize');

  const handleCustomizationChange = (newDetails: CustomizationDetails) => {
    setCustomizationDetails(newDetails);
  };

  return (
    <CustomizeDetails
      customizationDetails={customizationDetails}
      onCustomizationChange={handleCustomizationChange}
      fileUrl={fileUrl}
      setActiveTab={setActiveTab}
      setFurthestAccessibleTab={setFurthestAccessibleTab}
    />
  );
}
