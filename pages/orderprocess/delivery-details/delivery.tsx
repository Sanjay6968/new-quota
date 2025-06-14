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
    </div>
  );
}

export default DeliveryDetails;

// Styled Components (unchanged — same as your version)
const Heading = styled.h1`...`;
const SubText = styled.p`...`;
const DropdownContainer = styled.div`...`;
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
const Label = styled.label`...`;
const Select = styled.select`...`;
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
const Textarea = styled.textarea`...`;
const Input = styled.input`...`;
const FormContainer = styled.div`...`;
const DeliveryOptionsContainer = styled.div`...`;
const ContactInfoContainer = styled.div`...`;
const ValidationMessage = styled.p`...`;
const ButtonContainer = styled.div`...`;
const NextButton = styled.button`...`;
const Spinner = styled.div`...`;
