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

function DeliveryDetails({
  setActiveTab,
  setFurthestAccessibleTab,
  pincode,
  setPincode,
  shippingAddress,
  setShippingAddress,
}: DeliveryDetailsProps) {
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
    setIsLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const orderId = localStorage.getItem('orderId');

      if (!token || !orderId) {
        alert('Missing token or order ID');
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

      if (response.status === 200 || response.status === 201) {
        setActiveTab('Checkout');
        setFurthestAccessibleTab('Checkout');
      } else {
        alert('Unexpected response status: ' + response.status);
      }
    } catch (error: any) {
      if (error.response) {
        alert('Error: ' + error.response.data.error);
      } else if (error.request) {
        alert('No response from server');
      } else {
        alert('Error: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
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
            onChange={() => {}}
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
            {isLoading ? <Spinner /> : 'NEXT →'}
          </NextButton>
        </ButtonContainer>
      </FormContainer>
    </Container>
  );
}

export default DeliveryDetails;

// Styled Components with proper CSS
const Container = styled.div`
  min-height: 100vh;
  background-color: #1a2332;
  color: white;
  padding: 20px;
  font-family: Arial, sans-serif;
`;

const Heading = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: white;
`;

const SubText = styled.p`
  font-size: 1rem;
  color: #b0bec5;
  margin-bottom: 30px;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  max-width: 800px;
`;

const DeliveryOptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ContactInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const DropdownContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: white;
`;

const Select = styled.select`
  padding: 12px;
  border: 1px solid #455a64;
  border-radius: 4px;
  background-color: #263238;
  color: white;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #64b5f6;
  }
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #455a64;
  border-radius: 4px;
  background-color: #263238;
  color: white;
  font-size: 1rem;
  
  &::placeholder {
    color: #78909c;
  }
  
  &:focus {
    outline: none;
    border-color: #64b5f6;
  }
  
  &:disabled {
    background-color: #37474f;
    cursor: not-allowed;
  }
`;

const Textarea = styled.textarea`
  padding: 12px;
  border: 1px solid #455a64;
  border-radius: 4px;
  background-color: #263238;
  color: white;
  font-size: 1rem;
  min-height: 80px;
  resize: vertical;
  
  &::placeholder {
    color: #78909c;
  }
  
  &:focus {
    outline: none;
    border-color: #64b5f6;
  }
  
  &:disabled {
    background-color: #37474f;
    cursor: not-allowed;
  }
`;

const ValidationMessage = styled.p`
  color: #f44336;
  font-size: 0.875rem;
  margin: 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-top: 20px;
`;

const NextButton = styled.button`
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #45a049;
  }
  
  &:disabled {
    background-color: #666;
    cursor: not-allowed;
  }
`;

const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Dropdown: React.FC<DropdownProps> = ({ label, options, value, onChange }) => (
  <DropdownContainer>
    <Label>{label}</Label>
    <Select value={value} onChange={onChange}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  </DropdownContainer>
);

const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, onKeyPress, placeholder, disabled }) => {
  const isDisabled = label === 'Shipping Method' ? true : disabled;
  return label === 'Shipping Address' ? (
    <DropdownContainer>
      <Label>{label}</Label>
      <Textarea value={value} onChange={onChange} placeholder={placeholder} onKeyPress={onKeyPress} disabled={isDisabled} required />
    </DropdownContainer>
  ) : (
    <DropdownContainer>
      <Label>{label}</Label>
      <Input type="text" value={value} onChange={onChange} placeholder={placeholder} disabled={isDisabled} required />
    </DropdownContainer>
  );
};
