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
    display: flex;
    align-items: center;
    gap: 10px;
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
  <svg height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#fff">
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
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  color: #000;
  border-radius: 5px;
  border: none;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
`;

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

const Slider: React.FC<SliderProps & { defaultValue: number, onValueChange: (value: number) => void }> = ({ label, min, max, defaultValue, onValueChange }) => {
  const [value, setValue] = useState(defaultValue);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = Number(event.target.value);
    if (inputValue > max) {
      inputValue = max;
    } else if (inputValue < min) {
      inputValue = min;
    }
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

function CustomizeDetails({ setActiveTab, setFurthestAccessibleTab, customizationDetails, onCustomizationChange, fileUrl }: CustomizeDetailsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTechnology, setSelectedTechnology] = useState(customizationDetails.selectedTechnology);
  const [selectedMaterial, setSelectedMaterial] = useState(customizationDetails.selectedMaterial);
  const [layerThickness, setLayerThickness] = useState(customizationDetails.layerThickness);
  const [filling, setFilling] = useState(customizationDetails.filling);
  const [colorFinish, setColorFinish] = useState(customizationDetails.colorFinish);
  const [scale, setScale] = useState(customizationDetails.scale);
  const [selectedPrinterOption, setSelectedPrinterOption] = useState(customizationDetails.selectedPrinterOption);
  const [dimensions, setDimensions] = useState<{ length: string | number; breadth: string | number; height: string | number}>({length: '', breadth: '', height: ''});
  const [volume, setVolume] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [colorOptionsState, setColorOptionsState] = useState<OptionType[]>([]);

  useEffect(() => {
    if (!fileUrl) return;
    
    const stlViewerContainer = document.getElementById('stl-viewer-container');
    if (!stlViewerContainer) return;
    
    stlViewerContainer.innerHTML = '';
    
    const root = createRoot(stlViewerContainer);
    root.render(
      <STLViewer 
        fileUrl={fileUrl} 
        onDimensionsCalculated={handleDimensionsCalculated} 
        onVolumeCalculated={handleVolumeCalculated} 
      />
    );
    
    return () => {
      root.unmount();
    };
  }, [fileUrl]);

  useEffect(() => {
    const materialOptions = getMaterialOptions(selectedTechnology);
    setSelectedMaterial(materialOptions[0]?.value || '');
  }, [selectedTechnology]);

  useEffect(() => {
    const newColorOptions = colorOptions.getColorFinishOptions(selectedTechnology, selectedMaterial);
    setColorOptionsState(newColorOptions);
    setColorFinish(newColorOptions.find(option => option.value === customizationDetails.colorFinish)?.value || newColorOptions[0]?.value || '');
  }, [selectedTechnology, selectedMaterial, customizationDetails.colorFinish]);

  // Auto-select printer option based on dimensions
  useEffect(() => {
    if (dimensions.length && dimensions.breadth && dimensions.height) {
      let printerOption = 'STD'; // Default to standard

      const length = parseFloat(String(dimensions.length));
      const breadth = parseFloat(String(dimensions.breadth));
      const height = parseFloat(String(dimensions.height));

      // Check if all dimensions are valid numbers
      if (!isNaN(length) && !isNaN(breadth) && !isNaN(height)) {
        // Sort dimensions to find the largest one
        const maxDimension = Math.max(length, breadth, height);

        if (maxDimension <= 200) {
          printerOption = 'STD'; // Standard printer for small models
        } else if (maxDimension <= 400) {
          printerOption = 'MED'; // Medium printer for medium-sized models
        } else {
          printerOption = 'LGE'; // Large printer for large models
        }
      }

      setSelectedPrinterOption(printerOption);
      onCustomizationChange({ ...customizationDetails, selectedPrinterOption: printerOption });
    }
  }, [dimensions]);

  const handleDimensionsCalculated = (newDimensions: string) => {
    const dimensionsArray = newDimensions.split(' x ');
    setDimensions({ 
      length: parseFloat(dimensionsArray[0]), 
      breadth: parseFloat(dimensionsArray[1]), 
      height: parseFloat(dimensionsArray[2])
    });
  };

  const handleVolumeCalculated = (newVolume: string) => {
    setVolume(newVolume);
  };

  const handleTechnologyChange = (newTechnology: string) => {
    setSelectedTechnology(newTechnology);
    onCustomizationChange({ ...customizationDetails, selectedTechnology: newTechnology });
  };

  const handleMaterialChange = (value: string) => {
    setSelectedMaterial(value);
    const newColorOptions = colorOptions.getColorFinishOptions(selectedTechnology, value);
    setColorOptionsState(newColorOptions);
    setColorFinish(newColorOptions.find(option => option.value === customizationDetails.colorFinish)?.value || newColorOptions[0]?.value || '');
    onCustomizationChange({ ...customizationDetails, selectedMaterial: value, colorFinish: newColorOptions.find(option => option.value === customizationDetails.colorFinish)?.value || newColorOptions[0]?.value || '' });
  };

  const handleColorFinishChange = (value: string) => {
    setColorFinish(value);
    onCustomizationChange({ ...customizationDetails, colorFinish: value });
  };

  const handleLayerThicknessChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLayerThickness(event.target.value);
    onCustomizationChange({ ...customizationDetails, layerThickness: event.target.value });
  };

  const handleFillingChange = (newFillingValue: number) => {
    setFilling(newFillingValue);
    onCustomizationChange({ ...customizationDetails, filling: newFillingValue });
  };

  const handleScaleChange = (newScaleValue: number) => {
    setScale(newScaleValue);
    onCustomizationChange({ ...customizationDetails, scale: newScaleValue });
  };

  const layerThicknessOptions = [
    { label: 'Ultra Fine - 0.12mm', value: 'ULTRAFINE' },
    { label: 'Fine - 0.16mm', value: 'FINE' },
    { label: 'Normal - 0.2mm', value: 'NORMAL' },
    { label: 'Draft - 0.3mm', value: 'DRAFT' },
  ];

  const printerOptions = [
    { label: 'STANDARD 220x200x220mm', value: 'STD' },
    { label: 'MEDIUM 400x400x400mm', value: 'MED' },
    { label: 'LARGE 600x600x600mm', value: 'LGE' },
  ];

  // Function to get printer label based on value
  const getPrinterLabel = (value: string): string => {
    const option = printerOptions.find(option => option.value === value);
    return option ? option.label : 'STANDARD 220x200x220mm';
  };

  const handleNextButtonClick = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const orderId = localStorage.getItem('orderId');

      if (!token || !orderId) {
        console.error('Authentication token or orderId is not available');
        return;
      }

      let customizationData: CustomizationPayload = {
        technology: selectedTechnology,
        material: selectedMaterial,
        colorFinish: colorFinish,
        orderId: orderId,
      };

      if (!['SLA', 'SLS', 'DLP', 'MJF'].includes(selectedTechnology)) {
        customizationData = {
          ...customizationData,
          layerThickness: layerThickness,
          filling: filling,
          scale: scale,
          printerOption: selectedPrinterOption,
        };
      }

      console.log(customizationData);
      const response = await axios.put(EnvVars.API + 'api/public/customization/', customizationData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        console.log('Customization data sent successfully');
        const dimensionsData = {
          orderId: orderId,
          length: parseFloat(String(dimensions.length)),
          breadth: parseFloat(String(dimensions.breadth)),
          height: parseFloat(String(dimensions.height)),
          volume: parseFloat(volume)
        };
        const dimensionsResponse = await axios.post(EnvVars.API + 'api/public/add-dimensions', dimensionsData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (dimensionsResponse.status === 201) {
          console.log('Dimensions data sent successfully');
          setActiveTab('Delivery Options');
          setFurthestAccessibleTab('Delivery Options');
        } else {
          console.log('Dimensions data submission failed', dimensionsResponse.data);
        }
        setActiveTab('Delivery Options');
        setFurthestAccessibleTab('Delivery Options');
      } else {
        console.log('Customization data submission failed', response.data);
      }
    } catch (error) {
      console.error('Error sending customization data', error);
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
      <SubText>Tailor your model specifications, adjust dimensions, choose materials, and explore finishing options to perfect your 3D print.</SubText>
      <DropdownContainer>
        <Label>Technology</Label>
        <TechnologyDropdown value={selectedTechnology} onChange={handleTechnologyChange} />
        <Label>Material</Label>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ flexGrow: 1 }}>
            <MaterialDropdown
              options={getMaterialOptions(selectedTechnology)}
              value={selectedMaterial}
              onChange={handleMaterialChange}
            />
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
            <Dropdown 
              label="Printer" 
              options={printerOptions} 
              value={selectedPrinterOption} 
              disabled={true} 
            />
            <Slider label="Infill" min={1} max={100} defaultValue={customizationDetails.filling} onValueChange={handleFillingChange} />
          </>
        )}
        <Label>Color and Finishes</Label>
        <ColorFinishDropdown options={colorOptionsState} value={colorFinish} onChange={handleColorFinishChange} />
      </DropdownContainer>
      <ButtonContainer>
        <NextButton type="button" onClick={handleNextButtonClick} disabled={isLoading}>
          {isLoading ?  <Spinner /> : "NEXT →"}
        </NextButton>
      </ButtonContainer>
    </div>
  );
}

export { CustomizeDetails };
export type { CustomizationDetails, DropdownProps, SliderProps };

const Heading = styled.h1`
  font-size: 3.5rem;
  font-weight: bold;
  font-family: 'Poppins', sans-serif;
  color: #fff;
  margin-bottom: 0.5em; // Space below the heading
`;

const SubText = styled.p`
  font-size: 1.5rem;
  font-family: 'Poppins', sans-serif;
  color: #fff;
  margin-top: 0;
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
  grid-column: 1 / -1;

  @media (max-width: 968px) {
    margin-right: 0;
  }
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
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 2rem;
  
  &:hover {
    background-color: #E0A800;
  }
  &:disabled {
    background-color: #E0A800;
    cursor: default;
  }

  @media (max-width: 768px) {
    width: 100%;
    font-size: 1.4rem;
  }
`;

const Spinner = styled.div`
  border: 2px solid transparent;
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  margin: 0;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SliderContainer = styled.div`
  input[type="range"] {
    -webkit-appearance: none; /* Override default CSS styles */
    appearance: none;
    width: 100%;
    height: 22px;
    border-radius: 15px;
    cursor: pointer;
    
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
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