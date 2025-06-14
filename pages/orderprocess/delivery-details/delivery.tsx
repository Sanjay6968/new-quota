import axios from 'axios';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { EnvVars } from '@/env';

export interface DeliveryDetailsProps {
    setActiveTab: React.Dispatch<React.SetStateAction<string>>;
    setFurthestAccessibleTab: React.Dispatch<React.SetStateAction<string>>;
    pincode: string;
    setPincode: React.Dispatch<React.SetStateAction<string>>;
    shippingAddress: string;
    setShippingAddress: React.Dispatch<React.SetStateAction<string>>;
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

type InputFieldProps = {
    label: string;
    value: string;
    onChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
    onKeyPress?: React.KeyboardEventHandler<HTMLTextAreaElement>;
    placeholder?: string;
    disabled?: boolean;
};

const expertAssistanceOptions = [
  { label: 'Required', value: 'Required' },
  { label: 'Not Required', value: 'Not Required' },
];

const priorityOptions = [
  { label: 'Standard', value: 'Standard' },
  { label: 'Express', value: 'Express' },
];

function DeliveryDetails({ setActiveTab, setFurthestAccessibleTab, pincode, setPincode, shippingAddress, setShippingAddress }: DeliveryDetailsProps) {
    const [address, setAddress] = useState(shippingAddress);
    const [addressValidation, setAddressValidation] = useState('');
    const [pincodeValidation, setPincodeValidation] = useState('');
    const [nameValidation, setNameValidation] = useState('');
    const [emailValidation, setEmailValidation] = useState('');
    const [phoneValidation, setPhoneValidation] = useState('');
    const [expertAssistance, setExpertAssistance] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [deliveryType, setDeliveryType] = useState('Standard');
    const [shippingMethod, setShippingMethod] = useState('');
    const [isLoading, setIsLoading] = useState(false);
  
    useEffect(() => {
      if (deliveryType === 'Standard') {
        setShippingMethod('DTDC');
      } else if (deliveryType === 'Express') {
        setShippingMethod('BlueDart Express Air');
      }
    }, [deliveryType]);
  
    const handlePincodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const pincode = event.target.value;
      if (!Number.isNaN(Number(pincode)) && pincode.length <= 6) {
        setPincode(pincode);
      }
    };  
  
    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newName = event.target.value;
      if (/^[A-Za-z\s]*$/.test(newName)) {
        setName(newName);
        setNameValidation('');
      } else {
        setNameValidation('Name must contain only letters and spaces');
      }
    };
  
    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newEmail = event.target.value;
      setEmail(newEmail);
      if (newEmail.includes('@')) {
        setEmailValidation('');
      } else {
        setEmailValidation('Enter a valid email address');
      }
    };
  
    const handlePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newPhone = event.target.value;
      if (newPhone.length <= 10 && /^\d*$/.test(newPhone)) {
        setPhone(newPhone);
        setPhoneValidation('');
      } else {
        setPhoneValidation('Enter a valid phone number');
      }
    };
  
    const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newAddress = event.target.value;
      setAddress(newAddress);
      setShippingAddress(newAddress);
    };
  
    const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const lines = (event.target as HTMLTextAreaElement).value.split('\n');
      if (lines.length >= 5 && event.key === 'Enter') {
        event.preventDefault();
      }
    };
  
    const handleNextClick = async () => {
      setIsLoading(true); // Assume setIsLoading updates the component's loading state
    
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.error('Authentication token is not available');
          alert('Authentication token is not available');
          setIsLoading(false);
          return;
        }

        const orderId = localStorage.getItem('orderId');

        if (!orderId) {
          console.error('Order ID is missing');
          alert('Order ID is not available');
          setIsLoading(false);
          return;
        }

        const requestData = {
          orderId,
          expertAssistance,
          name,
          email,
          phone,
          deliveryType,
          address,
          pincode,
          shippingMethod,
        };
    
        const response = await axios.post(`${EnvVars.API}api/public/deliveryOptions`, requestData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
    
        console.log('HTTP Response:', response);
    
        if (response.status === 200 || response.status === 201) {
          setActiveTab('Checkout');
          setFurthestAccessibleTab('Checkout');
        } else {
          console.error('Unexpected successful response', response);
          alert('Received unexpected response status: ' + response.status);
        }
      } catch (error) {
        if ((error as any).response) {

            console.error('Error Response:', (error as any).response);
            alert('Error: ' + (error as any).response.data.error);
        } else if ((error as any).request) {
            console.error('Error Request:', (error as any).request);
            alert('No response from server');
        } else {
            console.error('Error Message:', (error as any).message);
            alert('Error: ' + (error as any).message);
        }
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <div>
        <Heading>Preferred Delivery Options</Heading>
        <SubText>Choose the shipping option that best suits your needs and preferences.</SubText>
        <FormContainer>
          <DeliveryOptionsContainer>
            <Dropdown 
              label="Expert Assistance" 
              options={expertAssistanceOptions} 
              value={expertAssistance} 
              onChange={(e) => setExpertAssistance(e.target.value)} 
            />
            <Dropdown 
              label="Priority" 
              options={priorityOptions} 
              value={deliveryType} 
              onChange={(e) => setDeliveryType(e.target.value)}
            />
            <InputField 
              label="Shipping Address" 
              value={address} 
              onChange={handleAddressChange} 
              onKeyPress={handleKeyPress} 
              placeholder="Enter shipping address" 
            />
            {addressValidation && <ValidationMessage>{addressValidation}</ValidationMessage>}
            <InputField 
              label="Pincode" 
              value={pincode} 
              onChange={handlePincodeChange} 
              placeholder="Enter pincode" 
            />
            {pincodeValidation && <ValidationMessage>{pincodeValidation}</ValidationMessage>}
            <InputField 
              label="Shipping Method" 
              value={shippingMethod} 
              onChange={(e) => {}} 
              disabled={true}
            />
          </DeliveryOptionsContainer>
    
          <ContactInfoContainer>
            <InputField 
              label="Name" 
              value={name} 
              onChange={handleNameChange} 
              placeholder="Enter your name" 
            />
            {nameValidation && <ValidationMessage>{nameValidation}</ValidationMessage>}
            <InputField 
              label="Email" 
              value={email} 
              onChange={handleEmailChange} 
              placeholder="Enter your email" 
            />
            {emailValidation && <ValidationMessage>{emailValidation}</ValidationMessage>}
            <InputField 
              label="Phone Number" 
              value={phone} 
              onChange={handlePhoneNumberChange} 
              placeholder="Enter your phone number" 
            />
            {phoneValidation && <ValidationMessage>{phoneValidation}</ValidationMessage>}
          </ContactInfoContainer>
    
          <ButtonContainer>
            <NextButton type="button" onClick={handleNextClick} disabled={isLoading}>
              {isLoading ? <Spinner /> : "NEXT →"}
            </NextButton>
          </ButtonContainer>
        </FormContainer>
      </div>
    );
}
export { DeliveryDetails };

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

const DropdownContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: 600px;
  flex-direction: column;
  gap: 10px;
`;

const Dropdown: React.FC<DropdownProps> = ({ label, options, value, onChange }) => (
  <DropdownContainer>
    <Label>{label}</Label>
    <Select value={value} onChange={onChange}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </Select>
  </DropdownContainer>
);

const Label = styled.label`
  font-size: 1.8rem;
  font-weight: bold;
  font-family: 'Poppins', sans-serif;
`;

const Select = styled.select`
  height: 48px;
  padding: 0 1em;
  font-size: 1.3rem;
  font-weight: 700;
  border: 1px solid #fff;
  border-radius: 5px;
  background-color: #0a121e;
  color: #FFFFFF;
  option {
    background-color: #FFFFFF;
    color: #0a121e;
  }
`;

const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, onKeyPress, placeholder, disabled}) => {
  const isDisabled = label === "Shipping Method" ? true : disabled;
  if (label === "Shipping Address") {
    return (
      <DropdownContainer>
        <Label>{label}</Label>
        <Textarea value={value} onChange={onChange} placeholder={placeholder} onKeyPress={onKeyPress} disabled = {isDisabled} required />
      </DropdownContainer>
    );
  } else {
    return (
      <DropdownContainer>
        <Label>{label}</Label>
        <Input type="text" value={value} onChange={onChange} placeholder={placeholder} disabled = {isDisabled} required />
      </DropdownContainer>
    );
  }
};

const Textarea = styled.textarea`
  height: 100px; // Fixed height
  padding: 0 1em;
  font-size: 1.3rem;
  line-height: 1.5; // Typical line-height for readable text, adjust as needed.
  font-weight: 700;
  border: 1px solid #fff;
  border-radius: 5px;
  background-color: #fff;
  color: #000;
  resize: none; // Change to none if you don't want users to resize the textarea.
  overflow: auto; // Ensures the textarea doesn't add a horizontal scrollbar.
`;

const Input = styled.input`
  height: 48px;
  padding: 0 1em;
  font-size: 1.3rem;
  font-weight: 700;
  border: 1px solid #fff;
  border-radius: 5px;
  background-color: #fff;
  color: #000;
`;

const FormContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const DeliveryOptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 600px;

  @media (max-width: 968px) {
    max-width: 100%;
  }
`;

const ContactInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 600px;
  align-self: flex-start;
  background-color: #0a121e;
  padding: 20px;
  border-radius: 5px;

  @media (max-width: 968px) {
    max-width: 100%;
    padding: 0;
  }
`;

const ValidationMessage = styled.p`
  color: #ff3333;
  font-size: 1.2rem;
  margin-top: 5px;
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