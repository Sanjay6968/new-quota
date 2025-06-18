import { useState, useEffect } from 'react';
import styled from 'styled-components';

interface OTPVerificationProps {
  onVerify: (trackingDetails: any) => void;
  email: string;
  orderId: string;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({ onVerify, email, orderId }) => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [timer, setTimer] = useState<number>(180);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isOtpComplete, setIsOtpComplete] = useState<boolean>(false);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
      }, 1000);

      return () => clearInterval(countdown);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  useEffect(() => {
    setIsOtpComplete(otp.every((digit) => digit !== ''));
  }, [otp]);

  const formatTime = (time: number) => {
    const minutes = String(Math.floor(time / 60)).padStart(2, '0');
    const seconds = String(time % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        (document.getElementById(`otp-${index + 1}`) as HTMLInputElement).focus();
      }
    }
  };

  const handleKeyDown = (index: number) => (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && otp[index] === '') {
      if (index > 0) {
        const prevIndex = index - 1;
        const newOtp = [...otp];
        newOtp[prevIndex] = '';
        setOtp(newOtp);
        (document.getElementById(`otp-${prevIndex}`) as HTMLInputElement).focus();
      }
    }
  };

  const handleVerify = async () => {
    try {
      const response = await fetch('https://back.mekuva.com/api/public/customer/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, otp: otp.join('') }),
      });
  
      if (response.ok) {
        const trackingDetails = await response.json();
        onVerify({
          ...trackingDetails,
          items: [
            {
              id: orderId,
              quantity: trackingDetails.quantity,
              name: trackingDetails.originalFileName,
              thumbnail: trackingDetails.thumbnailUrl,
            },
          ],
        });
      } else {
        const errorData = await response.json();
        alert('Verification failed: ' + errorData.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during verification. Please try again.');
    }
  };  

  const handleResend = () => {
    // Implement the resend OTP request logic here
    console.log('Resend OTP requested');
    setTimer(180);
    setCanResend(false);
  };

  return (
    <OTPContainer>
      <OTPHeading>OTP Verification</OTPHeading>
      <OTPSubheading>Enter the code we've sent to {email}</OTPSubheading>
      <OTPInputWrapper>
        {otp.map((value, index) => (
          <OTPInput
            key={index}
            id={`otp-${index}`}
            type="text"
            maxLength={1}
            value={value}
            onChange={handleChange(index)}
            onKeyDown={handleKeyDown(index)}
          />
        ))}
      </OTPInputWrapper>
      <VerifyButton onClick={handleVerify} disabled={!isOtpComplete}>Verify</VerifyButton>
      {canResend ? (
        <ResendText onClick={handleResend}>Resend OTP</ResendText>
      ) : (
        <ResendText>Resend code in <strong>{formatTime(timer)}</strong></ResendText>
      )}
    </OTPContainer>
  );
};

const OTPContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
`;

const OTPHeading = styled.h2`
  font-family: 'Poppins', sans-serif;
  font-size: 2.0rem;
  font-weight: bold;
  color: #0a121e;
  text-align: center;
  margin-bottom: 10px;
`;

const OTPSubheading = styled.p`
  font-family: 'Poppins', sans-serif;
  font-size: 1.5rem;
  color: #0a121e;
  text-align: center;
  margin-bottom: 20px;
`;

const OTPInputWrapper = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const OTPInput = styled.input`
  width: 50px;
  height: 50px;
  text-align: center;
  font-size: 2.5rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f5f5f5;
`;

const VerifyButton = styled.button`
  background-color: #fed700;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 1.5rem;
  font-family: 'Poppins', sans-serif;
  font-weight: bold;
  color: #0a121e;
  cursor: pointer;

  &:hover {
    background-color: #e0a800;
  }

  &:disabled {
    background-color: #e0a800;
    cursor: not-allowed;
  }
`;

const ResendText = styled.p`
  font-family: 'Poppins', sans-serif;
  font-size: 1.5rem;
  color: #0a121e;
  text-align: center;
  margin-top: 20px;
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};

  strong {
    font-weight: bold;
  }
`;

export default OTPVerification;
