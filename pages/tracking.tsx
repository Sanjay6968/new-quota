import { useState, PropsWithChildren } from 'react';
import styled from 'styled-components';
import Page from '@/components/Page';
import ProgressSteps from '@/components/ProgressSteps';
import OTPVerification from '@/components/OTPVerification';

type ButtonProps = PropsWithChildren<{ transparent?: boolean }>;

const TrackingPage: React.FC = () => {
  const [orderId, setOrderId] = useState<string>('');
  const [submittedOrderId, setSubmittedOrderId] = useState<string>('');
  const [showOTPVerification, setShowOTPVerification] = useState<boolean>(false);
  const [showOrderStatus, setShowOrderStatus] = useState<boolean>(false);
  const [showOrderIdInput, setShowOrderIdInput] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [trackingDetails, setTrackingDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOrderId(event.target.value.toUpperCase());
  };

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/public/requestOtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubmittedOrderId(orderId);
        setShowOTPVerification(true);
        setShowOrderIdInput(false);
        setEmail(data.email);
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData.message);
        setShowOrderStatus(false);
        setShowOTPVerification(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setShowOrderStatus(false);
      setShowOTPVerification(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = (trackingDetails: any) => {
    setTrackingDetails(trackingDetails);
    setShowOrderStatus(true);
    setShowOTPVerification(false);
    setShowOrderIdInput(false);
  };

  return (
    <Page title="Track Your Order">
      {isLoading ? (
        <LoadingScreen>Loading, please wait...</LoadingScreen>
      ) : (
        <TrackingContainer>
          <TrackingContent>
            {showOrderIdInput && (
              <>
                <Label htmlFor="order-tracking">Order ID</Label>
                <form onSubmit={handleSearch}>
                  <InputWrapper>
                    <Input
                      id="order-tracking"
                      type="text"
                      placeholder="Enter your order ID"
                      value={orderId}
                      onChange={handleInputChange}
                    />
                    <SearchButton type="submit">Search</SearchButton>
                  </InputWrapper>
                </form>
              </>
            )}
            {showOTPVerification && <OTPVerification email={email} orderId={submittedOrderId} onVerify={handleVerifyOTP} />}
            {showOrderStatus && trackingDetails && (
              <OrderContainer>
                <OrderStatusContainer>
                  <OrderStatusHeading>ORDER STATUS</OrderStatusHeading>
                  <OrderID>{`#${submittedOrderId.toUpperCase()}`}</OrderID>
                  <PrintInvoice>
                    <PrintIcon>
                      <svg fill="#000000" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="20" height="20" viewBox="0 -10 100 100" enable-background="new 0 0 100 100" xmlSpace="preserve">
                        <g>
                          <path d="M90.443,35.141c-0.064-0.953-0.849-1.708-1.818-1.708H75.511v0h0V11.857c0-1.012-0.819-1.83-1.83-1.83H26.319
                          c-1.011,0-1.83,0.818-1.83,1.83v21.576h0H11.377c0,0-0.002,0-0.002,0c-0.969,0-1.754,0.755-1.818,1.708H9.545V71.91
                          c0,1.01,0.819,1.829,1.83,1.829v0h13.114V58.425h0h4.987h41.047h4.987h0v15.314h13.114c1.011,0,1.83-0.819,1.83-1.829V35.141
                          H90.443z M70.524,41.631H29.476V16.844c0-1.012,0.819-1.83,1.83-1.83h0h37.387c1.011,0,1.83,0.818,1.83,1.83V41.631z"/>
                          <path d="M29.602,88.143c0,1.012,0.819,1.83,1.83,1.83h37.136c1.011,0,1.83-0.818,1.83-1.83v-24.64H29.602V88.143z"/>
                        </g>
                      </svg>
                    </PrintIcon> Print Invoice
                  </PrintInvoice>
                  <ProgressSteps currentStep={trackingDetails.status}/>
                  <DeliveryDetails>
                    <DeliveryAddress>
                      <strong>Delivery Address</strong> <br />
                      {trackingDetails.address}
                    </DeliveryAddress>
                    <EstimatedCompletion>
                      <strong>Estimated Completion</strong> <br />
                      {trackingDetails.estimatedCompletionRange}
                    </EstimatedCompletion>
                  </DeliveryDetails>
                </OrderStatusContainer>
                <OrderItemsContainer>
                  <OrderItemsHeading>ORDER ITEMS</OrderItemsHeading>
                  {trackingDetails.items && trackingDetails.items.map((item: any) => (
                    <OrderItem key={item.id}>
                      <OrderItemID>{`#${item.id.toUpperCase()}`}</OrderItemID>
                      <OrderItemQuantity>{`${item.quantity} units`}</OrderItemQuantity>
                      <OrderItemName>{item.name}</OrderItemName>
                      <OrderItemThumbnail src={item.thumbnail} alt="image" />
                    </OrderItem>
                  ))}
                </OrderItemsContainer>
              </OrderContainer>
            )}
          </TrackingContent>
        </TrackingContainer>
      )}
    </Page>
  );
};

const TrackingContainer = styled.div`
  width: 100%;
  padding: 0 1rem;
  margin: auto;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
`;

const Label = styled.label`
  font-size: 1.8rem;
  font-weight: bold;
  font-family: 'Poppins', sans-serif;
  text-align: center;
  margin-bottom: 1rem;
`;

const TrackingContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
`;

const InputWrapper = styled.div`
  display: flex;
  width: 100%;
  max-width: 800px;
  margin-top: 10px;
  gap: 1rem;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0;
  }
`;

const Input = styled.input`
  height: 48px;
  width: 100%;
  padding: 0 1em;
  font-size: 1.3rem;
  font-weight: 700;
  border: 1px solid #0a121e;
  border-radius: 5px;
  background-color: #fff;
  color: #0a121e;
`;

const SearchButton = styled.button<ButtonProps>`
  display: inline-block;
  text-align: center;
  height: 48px;
  padding: 0 2em;
  font-size: 1.2rem;
  color: #0a121e;
  font-family: 'Poppins', sans-serif;
  font-weight: bold;
  background-color: #fed700;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #e0a800;
  }

  @media (max-width: 600px) {
    margin-top: 10px;
  }
`;

const OrderContainer = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #f4f4f4;
  border-radius: 5px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  box-sizing: border-box;
`;

const OrderStatusContainer = styled.div`
  width: 100%;
`;

const OrderStatusHeading = styled.h2`
  font-family: 'Poppins', sans-serif;
  color: rgba(10, 18, 30, 0.5);
  text-align: left;
  font-weight: normal;
`;

const OrderID = styled.div`
  font-family: 'Poppins', sans-serif;
  color: #0a121e;
  margin-top: 0.5rem;
  font-size: 1.5rem;
  font-weight: 550;
`;

const PrintInvoice = styled.div`
  font-family: 'Poppins', sans-serif;
  color: #0a121e;
  margin-top: 3rem;
  font-size: 1.3rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const PrintIcon = styled.span`
  margin-right: 0.5rem;
`;

const DeliveryDetails = styled.div`
  margin-top: 5rem;
  background-color: #0a121e;
  color: #ffffff;
  padding: 1.5rem;
  border-radius: 8px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  box-sizing: border-box;
  font-size: 1.4rem;
`;

const DeliveryAddress = styled.div`
  margin-bottom: 1rem;
  flex: 1;

  strong {
    display: block;
    margin-bottom: -0.5rem;
  }
`;

const EstimatedCompletion = styled.div`
  flex: 1;
  text-align: right;

  strong {
    display: block;
    margin-bottom: -0.5rem;
  }
`;

const OrderItemsContainer = styled.div`
  margin-top: 2rem;
  width: 100%;
`;

const OrderItemsHeading = styled.h2`
  font-family: 'Poppins', sans-serif;
  color: rgba(10, 18, 30, 0.5);
  text-align: left;
  font-weight: normal;
  margin-top: 5rem;
`;

const OrderItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-top: 1rem;
  width: 100%;
  font-size: 1.4rem;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const OrderItemID = styled.div`
  flex: 1;
  font-weight: bold;
  font-family: 'Poppins', sans-serif;

  @media (max-width: 600px) {
    margin-bottom: 0.5rem;
  }
`;

const OrderItemQuantity = styled.div`
  flex: 1;
  font-family: 'Poppins', sans-serif;

  @media (max-width: 600px) {
    margin-bottom: 0.5rem;
  }
`;

const OrderItemName = styled.div`
  flex: 2;
  font-family: 'Poppins', sans-serif;

  @media (max-width: 600px) {
    margin-bottom: 0.5rem;
  }
`;

const OrderItemThumbnail = styled.img`
  flex: 1;
  max-width: 100px;
  max-height: 100px;
  border-radius: 5px;

  @media (max-width: 600px) {
    align-self: center;
  }
`;

const LoadingScreen = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 2rem;
  font-family: 'Poppins', sans-serif;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.8);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 9999;
`;

export default TrackingPage;
