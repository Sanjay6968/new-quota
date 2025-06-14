import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { EnvVars } from '@/env';
import { STLViewer } from '../../../components/stl-loader';
import { CustomizeDetails, CustomizationDetails } from '../customization/customization';
import DeliveryDetails from '../delivery-details/delivery';
import CheckoutDetails from '../checkout/checkout';
import axiosInstance from '@/axiosInstance';
import Modal from '@/components/Modal';

interface TabProps {
  isActive: boolean;
}

interface CircleProps {
  isActive: boolean;
}

interface OptionType {
  label: string;
  value: string;
}

interface DropdownProps {
  label: string;
  options: OptionType[];
  value: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

interface PreviewBoxProps {
  isFileSelected: boolean;
}

type InputFieldProps = {
  label: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  onKeyPress?: React.KeyboardEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
  disabled?: boolean;
};

interface UploadDetailsProps {
  selectedFile: File | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
  setFileName: React.Dispatch<React.SetStateAction<string>>;
  fileUrl: string | null;
  setFurthestAccessibleTab: React.Dispatch<React.SetStateAction<string>>;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const DragDropContainer = styled.div`
  border: 2px dashed #b0b0b0;
  border-radius: 5px;
  padding: 20px;
  text-align: center;
  margin: 20px;
  margin-top: 30px;
  flex-grow: 1;
  display: flex;
  padding-top: 80px;
  padding-bottom: 80px;
  flex-direction: column;
  align-items: center;
  background-color: #0a121e;
  &:hover {
    background-color: #9da0a5;
    cursor: pointer;
  }
`;

export default function Upload() {
  const router = useRouter();
  const [sessionExpired, setSessionExpired] = useState(false);
  const tabOrder = ['Upload', 'Customize', 'Delivery Options', 'Checkout'];
  const [activeTab, setActiveTab] = useState('Upload');
  const [furthestAccessibleTab, setFurthestAccessibleTab] = useState('Upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileUrl = selectedFile ? URL.createObjectURL(selectedFile) : null;
  const [fileName, setFileName] = useState<string>('');
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  
  const [dimensions, setDimensions] = useState('');
  const handleDimensionsCalculated = (newDimensions: string) => {
    setDimensions(newDimensions);
  };
  
  const [volume, setVolume] = useState<string>('');
  const handleVolumeCalculated = (newVolume: string) => {
    setVolume(newVolume);
  };

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
  
    if (!accessToken || !refreshToken) {
      router.push('/dashboard/sign-up');
      return;
    }
  }, [router]);

  useEffect(() => {
    const handleSessionExpiration = () => {
      console.log('Session expired event triggered');
      setSessionExpired(true);
    };
    window.addEventListener('sessionExpired', handleSessionExpiration);

    return () => {
      window.removeEventListener('sessionExpired', handleSessionExpiration);
    };
  }, []);

  const [customizationDetails, setCustomizationDetails] = useState<CustomizationDetails>({
    selectedTechnology: 'FDM',
    selectedMaterial: 'PLA',
    layerThickness: 'NORMAL',
    filling: 15,
    colorFinish: 'White',
    scale: 100,
    selectedPrinterOption: 'STD',
  });
  
  const handleCustomizationChange = (newCustomizationDetails: CustomizationDetails) => {
    setCustomizationDetails(newCustomizationDetails);
  };
  
  const handleTabClick = (tabName: string) => {
    const tabIndex = tabOrder.indexOf(tabName);
    const furthestAccessibleTabIndex = tabOrder.indexOf(furthestAccessibleTab);
    const isFileSelected = selectedFile !== null;
  
    if (tabIndex <= furthestAccessibleTabIndex || (tabName === 'Customize' && isFileSelected)) {
      setActiveTab(tabName);
      if (tabIndex > furthestAccessibleTabIndex) {
        setFurthestAccessibleTab(tabName);
      }
    }
  };

  return (
    <MainContainer>
      {sessionExpired && (
        <Modal 
          title="Session Expired" 
          message="Your session has expired. Please sign in again." 
          onClose={() => router.push('/dashboard/sign-in')}
          buttonText="Sign In Again"
          />
      )}
      <UploadContainer>
      <PreviewBox isFileSelected={selectedFile !== null} dimensions={dimensions} volume={volume} >
          {selectedFile ? (
            <STLViewer fileUrl={fileUrl} onDimensionsCalculated={handleDimensionsCalculated} onVolumeCalculated={handleVolumeCalculated} />
          ) : (
            <>
              <Image src="/files.png" alt="Files Icon" />
              <PreviewUploadText>Upload your file to see the preview</PreviewUploadText>
            </>
          )}
        </PreviewBox>
      </UploadContainer>
      {activeTab === 'Checkout'}
      <TabbedContainer>
        <Tabs>
          {tabOrder.map((tabName, index) => (
            <Tab 
              key={tabName}
              isActive={activeTab === tabName} 
              onClick={() => handleTabClick(tabName)}
            >
              <Circle isActive={activeTab === tabName}>{index + 1}</Circle>
              {tabName}
            </Tab>
          ))}
        </Tabs>
        <Content>
          {activeTab === 'Upload' && (
            <UploadDetails 
              selectedFile={selectedFile} 
              setSelectedFile={setSelectedFile}
              setFileName={setFileName}
              fileUrl={fileUrl}
              setFurthestAccessibleTab={setFurthestAccessibleTab}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === 'Customize' && (
            <CustomizeDetails 
              setActiveTab={setActiveTab}
              setFurthestAccessibleTab={setFurthestAccessibleTab}
              customizationDetails={customizationDetails}
              onCustomizationChange={handleCustomizationChange}
              fileUrl={fileUrl}
            />
          )}
          {activeTab === 'Delivery Options' && (
            <DeliveryDetails
              setActiveTab={setActiveTab}
              setFurthestAccessibleTab={setFurthestAccessibleTab}
              pincode={pincode}
              setPincode={setPincode}
              shippingAddress={shippingAddress}
              setShippingAddress={setShippingAddress}
            />
          )}
          {activeTab === 'Checkout' && <CheckoutDetails fileName={fileName} shippingAddress={shippingAddress} amount={0}/>}
        </Content>
      </TabbedContainer>
    </MainContainer>
  );
}

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

function UploadDetails({ selectedFile, setSelectedFile, setFileName, fileUrl,setFurthestAccessibleTab, setActiveTab}: UploadDetailsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [borderColor, setBorderColor] = useState('#b0b0b0');

  const handleFileUpload = (file: File) => {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      console.error('Access token is missing!');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', file);
  
    axios.post(EnvVars.API + 'api/public/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${accessToken}`,
      }
    })
    .then(response => {
      if (response.status === 200) {
        const token = response.data.token;
        if (token) {
          localStorage.setItem('uploadToken', token);
          localStorage.setItem('orderId', response.data.orderId);
          console.log('File uploaded successfully and token stored');
          setErrorMessage(null);
          setBorderColor('#4caf50');
        }
      } else {
        handleError('Unexpected response from server.');
        console.log('File uploaded but no token received');
      }
    })
    .catch(error => {
      console.error('Error uploading file', error);
      if (error.response?.status === 422) {
        handleError("Invalid file format. Please upload a valid STL file.");
      } else {
        handleError("File upload failed. Please try again.");
      }
    });
  };  

  const handleError = (message: string) => {
    setErrorMessage(message);
    setIsErrorModalOpen(true);
    setBorderColor('#d9534f');
  };

  const handleDragDropContainerClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      setFileName(file.name);
      setErrorMessage(null);
      setBorderColor('#b0b0b0');
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      setFileName(file.name);
      setErrorMessage(null);
      setBorderColor('#b0b0b0');
      handleFileUpload(file);
    }
  };
  
  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  return (
    <UploadDetailsContainer>
      <Heading>Upload your 3D Model</Heading>
      <SubText>We accept various file formats, including .stl, and .step (.stp) each up to 100 MB in size</SubText>
      <DragDropContainer
        onClick={handleDragDropContainerClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <>
          <FileName>{selectedFile.name}</FileName>
          </>
        ) : (
          <>
            <Image src="/upload.png" alt="Upload Icon" />
            <UploadText>Drag and drop your file here, or click to select files</UploadText>
          </>
        )}
      </DragDropContainer>
      {isErrorModalOpen && (
        <Modal 
          title="Upload Error"
          message={errorMessage || ''}
          onClose={() => setIsErrorModalOpen(false)}
          buttonText="OK"
        />
      )}
      <input
        type="file"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".stl,.obj,.step,.stp,.3mf,.dxf,.zip"
      />
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {selectedFile && (
        <ButtonContainer>
          <NextButton
            onClick={() => {
              setActiveTab('Customize');
              setFurthestAccessibleTab('Customize');
            }}
          >
            NEXT →
          </NextButton>
        </ButtonContainer>
      )}
      {!selectedFile && (
        <CenterContainer>
          <SmallText>By uploading model I accept <Link href="/privacy-policy">Terms & Conditions</Link></SmallText>
        </CenterContainer>
      )}
    </UploadDetailsContainer>
  );
}

const FileName = styled.p`
  font-size: 1.5rem;
  color: #fff;
`;

const UploadDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;

const CenterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 50px;
  justify-content: center;
  flex-grow: 1;
`;

const SmallText = styled.p`
  font-size: 1.2rem;
  color: #fff;
  opacity: 0.7;
  margin-top: 170px;
`;

const Link = styled.a`
  color: #fed700;
  text-decoration: none;
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

const ErrorMessage = styled.p`
  color: #d9534f;
  font-size: 14px;
  margin-top: 10px;
  font-weight: bold;
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
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    width: 100%;
    font-size: 1.4rem;
  }
`;

// Styled-components for the main layout
const MainContainer = styled.div`
  display: flex;
  min-height: 100vh;
  padding: 20px 0;
  font-family: 'Poppins', sans-serif;
  position: relative;
  overflow-x: hidden;
  
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 10px;
  }
`;

const UploadContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #fbfbfd;
  box-sizing: border-box;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 10px;
    max-width: 100%;
  }
`;

const PreviewBox = styled.div<PreviewBoxProps & { dimensions: string; volume: string }>`
  position: relative;
  width: 100%;
  max-width: 500px;
  aspect-ratio: 3/4;
  background-color: #e0e0e0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: ${props => props.isFileSelected ? '1px solid #b0b0b0' : '2px dashed #b0b0b0'};
  margin: 0 auto 20px;
  box-sizing: border-box;
  padding: 20px;
  border-radius: 8px;
  overflow: hidden;

  &::after {
    content: ${props => props.isFileSelected ? `'Dimensions: ${props.dimensions} \\A Volume: ${props.volume}'` : 'none'};
    white-space: pre;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 10px;
    background-color: rgba(216, 216, 217, 0.9);
    font-size: 14px;
    text-align: center;
  }

  @media (max-width: 768px) {
    max-width: 100%;
    aspect-ratio: 1;
    margin: 10px auto;
    padding: 10px;
  }
`;

const Image = styled.img`
  max-width: 60%;
  height: auto;
  margin-bottom: 20px;
`;

const UploadText = styled.p`
  font-size: 1.2rem;
  color: #fff;
  opacity: 0.8;
  line-height: 1.6;
  text-align: center;
  width: 100%;
  max-width: 500px;
  @media (min-width: 768px) {
    font-size: 1.8rem;
  }
`;

const PreviewUploadText = styled(UploadText)`
  color: #333;
`;

const TabbedContainer = styled.div`
  flex: 3;
  display: flex;
  flex-direction: column;
  width: 100%;
  
  @media (max-width: 768px) {
    flex: none;
  }
`;

const Tabs = styled.div`
  display: flex;
  justify-content: space-between;
  background-color: transparent;
  color: white;
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  
  @media (max-width: 768px) {
    padding: 0 5px;
    gap: 5px;
  }
`;

const Tab = styled.div<TabProps>`
  flex: 1;
  min-width: max-content; // Prevent text wrapping
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  cursor: pointer;
  background-color: ${props => props.isActive ? '#0a121e' : '#fff'};
  color: ${props => props.isActive ? '#fff' : '#0a121e'};
  font-size: 1.2rem;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  border-radius: 5px 5px 0 0;
  gap: 10px;
  transition: background-color 0.3s, color 0.3s;
  white-space: nowrap; // Keep text in one line
  
  &:hover {
    background-color: ${props => props.isActive ? '#0a121e' : '#e0e0e0'};
    color: ${props => props.isActive ? '#fff' : '#0a121e'};
  }
  box-shadow: ${props => !props.isActive ? '0 1px 3px rgba(0, 0, 0, 0.2)' : 'none'};

  @media (max-width: 768px) {
    padding: 10px;
    font-size: 1rem;
  }
`;

const Content = styled.div`
  flex-grow: 1;
  background-color: #0a121e;
  padding: 20px;
  color: #fff;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const Circle = styled.span<CircleProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background-color: ${props => props.isActive ? '#fff' : '#0a121e'};
  color: ${props => props.isActive ? '#0a121e' : '#fff'};
  font-size: 1rem;
  font-weight: bold;

  @media (max-width: 768px) {
    width: 20px;
    height: 20px;
    font-size: 0.9rem;
  }
`;
