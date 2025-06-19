import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import styled from 'styled-components'
import { EnvVars } from '@/env'
import fdmData from '@/utils/fdmData'
import { STLViewer } from '../../../components/stl-loader'
import { OptionType } from '@/types/types'
import { getMaterialOptions } from '@/components/MaterialDropdown'
import { colorOptions } from '@/components/ColorFinishDropdown'

const technologyOptions: OptionType[] = [
  { label: 'FDM', value: 'fdm' },
  { label: 'SLA', value: 'sla' },
  { label: 'SLS', value: 'sls' }
]

interface DropdownProps {
  label: string
  options: OptionType[]
  value: string
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void
  disabled?: boolean
}

interface SliderProps {
  label: string
  min: number
  max: number
}

interface CustomizationDetails {
  selectedTechnology: string
  selectedMaterial: string
  layerThickness: string
  filling: number
  colorFinish: string
  scale: number
  selectedPrinterOption: string
}

interface CustomizeDetailsProps {
  setActiveTab: React.Dispatch<React.SetStateAction<string>>
  setFurthestAccessibleTab: React.Dispatch<React.SetStateAction<string>>
  customizationDetails: CustomizationDetails
  onCustomizationChange: (newCustomizationDetails: CustomizationDetails) => void
  fileUrl: string | null
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
  const [dimensions, setDimensions] = useState({ length: '', breadth: '', height: '' })
  const [volume, setVolume] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // ✅ FIXED: this must be placed before return
  const getLabel = (value: string, options: OptionType[]): string =>
    options.find(option => option.value === value)?.label || value || '-'

  useEffect(() => {
    if (!fileUrl) return
    const container = document.getElementById('stl-viewer-container')
    if (!container) return
    container.innerHTML = ''
    const root = createRoot(container)
    root.render(
      <STLViewer
        fileUrl={fileUrl}
        onDimensionsCalculated={(dim: string) => {
          const [length, breadth, height] = dim.split(' x ')
          setDimensions({ length, breadth, height })
        }}
        onVolumeCalculated={(vol: string) => setVolume(vol)}
      />
    )
    return () => root.unmount()
  }, [fileUrl])

  const handleNextButtonClick = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const orderId = localStorage.getItem('orderId')
      if (!token || !orderId) throw new Error('Missing token or orderId')

      await axios.put(`${EnvVars.API}api/public/customization/`, {
        ...customizationDetails,
        orderId
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      await axios.post(`${EnvVars.API}api/public/add-dimensions`, {
        orderId,
        length: parseFloat(dimensions.length),
        breadth: parseFloat(dimensions.breadth),
        height: parseFloat(dimensions.height),
        volume: parseFloat(volume)
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      setActiveTab('Delivery Options')
      setFurthestAccessibleTab('Delivery Options')
    } catch (err) {
      console.error('Error submitting customization:', err)
    }
    setIsLoading(false)
  }

  return (
    <Container>
      <ViewerPanel>
        <div id="stl-viewer-container"></div>
        <DimInfo>
          <div>Dimensions: {dimensions.length} x {dimensions.breadth} x {dimensions.height} mm</div>
          <div>Volume: {volume} cc</div>
        </DimInfo>
      </ViewerPanel>

      <FormPanel>
        <Heading>Customize your Order</Heading>
        <SubText>
          Tailor your model specifications, adjust dimensions, choose materials,
          and explore finishing options to perfect your 3D print.
        </SubText>

        <Summary>
          <Line><Label>Technology</Label><Value>{getLabel(customizationDetails.selectedTechnology, technologyOptions)}</Value></Line>
          <Line><Label>Material</Label><Value>{getLabel(customizationDetails.selectedMaterial, getMaterialOptions(customizationDetails.selectedTechnology))}</Value></Line>
          <Line><Label>Layer Thickness</Label><Value>{customizationDetails.layerThickness || '-'}</Value></Line>
          <Line><Label>Printer</Label><Value>{customizationDetails.selectedPrinterOption || '-'}</Value></Line>
          <Line><Label>Infill</Label><Value>{typeof customizationDetails.filling === 'number' ? `${customizationDetails.filling} %` : '-'}</Value></Line>
          <Line><Label>Color and Finishes</Label><Value>{getLabel(customizationDetails.colorFinish, colorOptions.getColorFinishOptions(customizationDetails.selectedTechnology, customizationDetails.selectedMaterial))}</Value></Line>
        </Summary>

        <ButtonContainer>
          <NextButton onClick={handleNextButtonClick} disabled={isLoading}>
            {isLoading ? <Spinner /> : 'NEXT →'}
          </NextButton>
        </ButtonContainer>
      </FormPanel>
    </Container>
  )
}

export default CustomizeDetails
export { CustomizeDetails }
export type { CustomizationDetails, DropdownProps, SliderProps }

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 40px;
`
const ViewerPanel = styled.div`
  flex: 1;
  background: #eee;
`
const DimInfo = styled.div`
  padding: 10px;
  font-size: 14px;
  color: #222;
  background: #ccc;
`
const FormPanel = styled.div`
  flex: 1;
  background: #0a0a0f;
  padding: 2rem;
  color: white;
`
const Heading = styled.h1`
  font-size: 2rem;
  font-weight: bold;
`
const SubText = styled.p`
  font-size: 1rem;
  margin-bottom: 1rem;
`
const Summary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`
const Line = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`
const Label = styled.div`
  font-weight: bold;
`
const Value = styled.div`
  background: #111;
  padding: 10px 14px;
  border-radius: 4px;
  border: 1px solid #333;
`
const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`
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
`
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
`
