import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { EnvVars } from '@/env';
import styled from 'styled-components';
import Toast from '@/components/Toast'; // Import the Toast component

const AccountVerification = ({ email }: { email: string }) => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOtpComplete, setIsOtpComplete] = useState<boolean>(false);
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success' as 'success' | 'error'
  });
  const router = useRouter();

  useEffect(() => {
    setIsOtpComplete(otp.every((digit) => digit !== '')); // Checks if all fields are filled
  }, [otp]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({
      visible: true,
      message,
      type
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const sendOtp = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${EnvVars.API}api/public/customer/request-verification-otp`, { email });
      setOtpSent(true);
      setIsLoading(false);
      showToast('OTP sent to your email!', 'success');
    } catch (error) {
      setIsLoading(false);
      setErrorMessage('Failed to send OTP. Please try again.');
      showToast('Failed to send OTP. Please try again.', 'error');
    }
  };

  const verifyOtp = async () => {
    try {
      if (!isOtpComplete) return; // Prevent verification if OTP is incomplete
      setIsLoading(true);
      const response = await axios.post(`${EnvVars.API}api/public/customer/verify-otp`, { email, otp: otp.join('') });
      setOtpVerified(true);
      setIsLoading(false);
      showToast('Account verified successfully!', 'success');
      
      // Redirect after toast is shown
      setTimeout(() => {
        router.push('/#services'); // Redirect to dashboard after verification
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      setErrorMessage('Invalid OTP or OTP expired. Please try again.');
      showToast('Invalid OTP or OTP expired. Please try again.', 'error');
    }
  };

  const handleChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        // Focus on the next input field
        (document.getElementById(`otp-${index + 1}`) as HTMLInputElement).focus();
      }
    }
  };

  const handleKeyDown = (index: number) => (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && otp[index] === '') {
      if (index > 0) {
        const newOtp = [...otp];
        const prevIndex = index - 1;
        newOtp[prevIndex] = '';
        setOtp(newOtp);
        (document.getElementById(`otp-${prevIndex}`) as HTMLInputElement).focus();
      }
    }
  };

  return (
    <OtpVerificationContainer>
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.visible} 
        onClose={hideToast}
      />
      
      {!otpSent ? (
        <>
        <Subtitle>We will send you an OTP to this email address</Subtitle>
        <h2>{email}</h2>
        <SendOtpButton onClick={sendOtp} disabled={isLoading}>
          {isLoading ? 'Sending OTP...' : 'Send OTP'}
        </SendOtpButton>
        </>
      ) : !otpVerified ? (
        <>
        <Subtitle>Enter the code sent to <h3>{email}</h3></Subtitle>
        <OtpForm>
          <OtpInputWrapper>
            {otp.map((value, index) => (
              <OtpInput
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={value}
                onChange={handleChange(index)}
                onKeyDown={handleKeyDown(index)}
              />
            ))}
          </OtpInputWrapper>
          <PrimaryButton onClick={verifyOtp} disabled={!isOtpComplete || isLoading}>
            {isLoading ? 'Verifying OTP...' : 'Verify OTP'}
          </PrimaryButton>
        </OtpForm>
        </>
      ) : (
        <SuccessMessage>Account verified successfully! You can now proceed.</SuccessMessage>
      )}
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
    </OtpVerificationContainer>
  );
};

const OtpVerificationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
`;

const OtpInputWrapper = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
`;

const OtpInput = styled.input`
  width: 50px;
  height: 50px;
  text-align: center;
  font-size: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
`;

const PrimaryButton = styled.button`
  width: 100%;
  padding: 10px 16px;
  background-color: #fed700;
  color: #0a121e;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;

  &:disabled {
    background-color: #d3d3d3;
    cursor: not-allowed;
  }
`;

const SendOtpButton = styled.button`
  padding: 10px 20px;
  background-color: #fed700;
  color: #0a121e;
  font-size: 16px;
  font-weight: bold;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  margin-top: 16px;

  &:disabled {
    background-color: #d3d3d3;
    cursor: not-allowed;
  }
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
`;

const OtpForm = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SuccessMessage = styled.p`
  color: #0a121e;
  font-size: 16px;
`;

const ErrorMessage = styled.p`
  color: #d9534f;
  font-size: 14px;
`;

export default AccountVerification;