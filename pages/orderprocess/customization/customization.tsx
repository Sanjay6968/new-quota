// ⬇️ This component now displays a summary and full customization form with label mappings
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import styled from 'styled-components';
import { EnvVars } from '@/env';
import ModalCustom from '@/components/ModalCustom';
import MaterialTable from '@/utils/MaterialTable';
import fdmData from '@/utils/fdmData';
import { STLViewer } from '../../../components/stl-loader';
import { OptionType } from '@/types/types';
import { colorOptions } from '@/components/ColorFinishDropdown';
import { getMaterialOptions } from '@/components/MaterialDropdown';

// ✅ Option 2: Define technology options locally
const technologyOptions: OptionType[] = [
  { label: 'FDM', value: 'fdm' },
  { label: 'SLA', value: 'sla' },
  { label: 'SLS', value: 'sls' }
];

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

function CustomizeDetails({
  setActiveTab = () => {},
  setFurthestAccessibleTab = () => {},
  customizationDetails = {
    selectedTechnology: '',
    selectedMaterial: '',
    layerThickness: '',
    filling: 0,
    colorFinish: '',
    scale: 1,
    selectedPrinterOption: ''
  },
  onCustomizationChange = () => {},
  fileUrl = null
}: Partial<CustomizeDetailsProps>) {
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Helper must go here (not inside JSX!)
  const getLabel = (value: string, options: OptionType[]): string =>
    options.find(option => option.value === value)?.label || value || '-';

  const handleNextButtonClick = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const orderId = localStorage.getItem('orderId');

      if (!token || !orderId) throw new Error('Missing token or orderId');

      const customizationData = {
        ...customizationDetails,
        orderId
      };

      await axios.put(`${EnvVars.API}api/public/customization/`, customizationData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      setActiveTab('Delivery Options');
      setFurthestAccessibleTab('Delivery Options');
    } catch (err) {
      console.error('Error submitting customization:', err);
    }
    setIsLoading(false);
  };

  return (
    <div>
      <Heading>Customize your Order</Heading>
      <SubText>
        Tailor your model specifications, adjust dimensions, choose materials, and explore finishing options to
        perfect your 3D print.
      </SubText>

      <Summary>
        <Line>
          <Label>Technology:</Label> {getLabel(customizationDetails.selectedTechnology, technologyOptions)}
        </Line>
        <Line>
          <Label>Material:</Label> {getLabel(customizationDetails.selectedMaterial, getMaterialOptions(customizationDetails.selectedTechnology))}
        </Line>
        <Line>
          <Label>Layer Thickness:</Label> {customizationDetails.layerThickness || '-'}
        </Line>
        <Line>
          <Label>Printer:</Label> {customizationDetails.selectedPrinterOption || '-'}
        </Line>
        <Line>
          <Label>Infill:</Label> {typeof customizationDetails.filling === 'number' ? `${customizationDetails.filling} %` : '-'}
        </Line>
        <Line>
          <Label>Color and Finishes:</Label> {getLabel(customizationDetails.colorFinish, colorOptions.getColorFinishOptions(customizationDetails.selectedTechnology, customizationDetails.selectedMaterial))}
        </Line>
      </Summary>

      <div id="stl-viewer-container" style={{ marginTop: '20px' }}></div>

      <ButtonContainer>
        <NextButton onClick={handleNextButtonClick} disabled={isLoading}>
          {isLoading ? <Spinner /> : 'NEXT →'}
        </NextButton>
      </ButtonContainer>
    </div>
  );
}

// ✅ Styled Components
const Heading = styled.h1`
  font-size: 2rem;
  font-weight: bold;
`;
const SubText = styled.p`
  font-size: 1rem;
  margin-bottom: 1rem;
`;
const Summary = styled.div`
  background: #f6f6f6;
  border-radius: 8px;
  padding: 1rem;
  max-width: 500px;
  line-height: 2;
`;
const Line = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
`;
const Label = styled.span`
  font-weight: bold;
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

export default CustomizeDetails;
export { CustomizeDetails };
export type { CustomizationDetails, DropdownProps, SliderProps };
