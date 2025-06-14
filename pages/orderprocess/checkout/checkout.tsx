import axios from 'axios';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { EnvVars } from '@/env';

export interface CheckoutDetailsProps {
  fileName: string;
  shippingAddress: string;
  amount: number;
}

const CheckoutDetails: React.FC<CheckoutDetailsProps> = ({ fileName, shippingAddress, amount }) => {
  const [gstin, setGstin] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [shippingPrice, setShippingPrice] = useState<number>(0);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [productionCost, setProductionCost] = useState<number>(0);
  const [postProductionCost, setPostProductionCost] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const token = localStorage.getItem('accessToken');
      const orderId = localStorage.getItem('orderId');
      if (!token) {
        console.error('No token found in localStorage');
        return;
      }
      if (!orderId) {
        console.error('No orderId found in localStorage');
        return;
      }
      try {
        const { data } = await axios.post(
          EnvVars.API + 'api/public/checkout',
          { quantity, orderId },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setProductionCost(Number(data.unitProductionPrice));
        setPostProductionCost(Number(data.unitPostProductionPrice));
        setShippingPrice(Number(data.shippingPrice));
        setSubtotal(Number(data.subtotal));
        setTax(Number(data.taxAmount));
        setTotal(Number(data.totalFinalAmount));
        setQuantity(Number(data.quantity));
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          console.error('Error fetching order details:', error.response.data);
        } else {
          console.error('Error fetching order details:', error);
        }
      }
    };
    fetchOrderDetails();
  }, [quantity]);

  const handleGstinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGstin(event.target.value);
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(Number(event.target.value));
    const newQuantity = Number(event.target.value);
    setQuantity(newQuantity);
    const newSubtotal = productionCost * newQuantity + postProductionCost;
    const newTax = newSubtotal * 0.18;
    const newTotal = newSubtotal + newTax;
    setSubtotal(newSubtotal);
    setTax(newTax);
    setTotal(newTotal);
  };

  const fetchPaymentDetails = async () => {
    try {
      const paymentDetailsUrl = EnvVars.API + 'api/public/payment-details-misc';
      const token = localStorage.getItem('accessToken');
      const orderId = localStorage.getItem('orderId');
      if (!token) {
        console.error('No token found in localStorage');
        return;
      }
      if (!orderId) {
        console.error('No orderId found in localStorage');
        return;
      }
      const { data: paymentDetails } = await axios.post(
        paymentDetailsUrl,
        { orderId },
        {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Payment Details:', paymentDetails);
      return paymentDetails;
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const paymentDetails = await fetchPaymentDetails();
      
      if (!paymentDetails?.amount) {
        throw new Error('Required payment details are missing');
      }
  
      const token = localStorage.getItem('accessToken');
      const orderId = localStorage.getItem('orderId');
  
      if (!token || !orderId) {
        throw new Error('Authentication information is missing');
      }
  
      const orderUrl = `${EnvVars.API}api/public/payment/checkout`;
      const orderData = {
        amount: paymentDetails.amount,
        orderId: orderId,
        currency: 'INR'
      };
  
      const { data: orderResponse } = await axios.post(orderUrl, orderData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!orderResponse?.order?.id) {
        throw new Error('Invalid order response from server');
      }
  
      initPayment(orderResponse.order, paymentDetails.key);
    } catch (error) {
      console.error('Error during payment initiation:', error);
      setIsLoading(false);
      if (error instanceof Error) {
        alert(error.message || 'Unable to initialize payment. Please try again.');
      } else {
        alert('Unable to initialize payment. Please try again.');
      }
    }
  };
  
  const handlePaymentVerification = async (response: { 
    razorpay_order_id: string; 
    razorpay_payment_id: string; 
    razorpay_signature: string 
  }) => {
    try {
      const orderId = localStorage.getItem('orderId');
      if (!orderId) {
        throw new Error('Order ID not found');
      }
  
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }
  
      const verifyUrl = `${EnvVars.API}api/public/paymentVerification?orderId=${orderId}`;
      
      const verificationData = {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      };
  
      console.log('Sending verification request:', {
        url: verifyUrl,
        data: verificationData,
        token: token
      });
  
      const { data: verificationResponse } = await axios.post(
        verifyUrl,
        verificationData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
  
      console.log('Verification Response:', verificationResponse);
  
      if (verificationResponse.success) {
        window.location.href = `/PaymentSuccess?orderId=${verificationResponse.orderId}`;
      } else {
        throw new Error(verificationResponse.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      alert('Payment verification failed. Please contact support if amount was deducted.');
    } finally {
      setIsLoading(false);
    }
  };

  const initPayment = (data: any, razorpayKey: string) => {
    const options = {
      key: razorpayKey,
      amount: data.amount,
      currency: data.currency || 'INR',
      name: 'Mekuva Technologies',
      description: 'Order Payment',
      image: data.image,
      order_id: data.id,
      handler: handlePaymentVerification,
      modal: {
        ondismiss: function() {
          setIsLoading(false);
        }
      },
      theme: {
        color: '#fed700'
      }
    };
  
    try {
      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (resp: any) {
        console.error('Payment failed:', resp.error);
        alert(`Payment failed: ${resp.error.description}`);
        setIsLoading(false);
      });
      rzp1.open();
    } catch (error) {
      console.error('Razorpay initialization error:', error);
      setIsLoading(false);
      alert('Unable to initialize payment. Please try again.');
    }
  };

  return (
    <CheckoutContainer>
      <FormSection>
        <Heading>Finalize Your Order</Heading>
        <SubText>You're almost there!</SubText>
        
        <FormGroup>
          <Label>Cart</Label>
          <CartItem>
            {fileName} <Quantity>x {quantity}</Quantity>
          </CartItem>
        </FormGroup>

        <FormGroup>
          <Label>Quantity</Label>
          <QuantityInput
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            min="1"
            max="100"
          />
        </FormGroup>

        <FormGroup>
          <Label>GSTIN (Optional)</Label>
          <Input
            type="text"
            placeholder="Enter GSTIN"
            value={gstin}
            onChange={handleGstinChange}
            maxLength={15}
          />
        </FormGroup>

        <FormGroup>
          <Label>Shipping Address</Label>
          <AddressBox>{shippingAddress}</AddressBox>
        </FormGroup>
      </FormSection>

      <SummarySection>
        <OrderSummary>
          <SummaryTitle>ORDER SUMMARY</SummaryTitle>
          <Divider />
          
          <SummaryRow>
            <SummaryLabel>PRODUCTION</SummaryLabel>
            <SummaryValue>₹ {productionCost.toFixed(2)}</SummaryValue>
          </SummaryRow>
          <SummaryRow>
            <SummaryLabel>POST-PRODUCTION</SummaryLabel>
            <SummaryValue>₹ {postProductionCost.toFixed(2)}</SummaryValue>
          </SummaryRow>
          <SummaryRow>
            <SummaryLabel>PRIORITY</SummaryLabel>
            <SummaryValue>Standard</SummaryValue>
          </SummaryRow>
          <SummaryRow>
            <SummaryLabel>QUANTITY</SummaryLabel>
            <SummaryValue>{quantity}</SummaryValue>
          </SummaryRow>
          <SummaryRow>
            <SummaryLabel>SHIPPING</SummaryLabel>
            <SummaryValue>₹ {shippingPrice}</SummaryValue>
          </SummaryRow>
          
          <Divider />
          <SummaryRow>
            <SummaryLabel>SUBTOTAL</SummaryLabel>
            <SummaryValue>₹ {subtotal.toFixed(2)}</SummaryValue>
          </SummaryRow>
          <SummaryRow>
            <SummaryLabel>TAX (IGST 18%)</SummaryLabel>
            <SummaryValue>₹ {tax.toFixed(2)}</SummaryValue>
          </SummaryRow>
          
          <Divider />
          <TotalRow>
            <TotalLabel>TOTAL</TotalLabel>
            <TotalValue>₹ {total.toFixed(2)}</TotalValue>
          </TotalRow>

          <CheckoutBox>
            <CheckoutLabel>Express Checkout</CheckoutLabel>
            <RazorpayButton onClick={handlePayment} disabled={isLoading}>
              <RazorpayLogo src="/Razorpay_logo.svg" alt="Razorpay" />
            </RazorpayButton>
            <CheckoutText>
              You will be redirected to Razorpay secure checkout 
              where you can complete your payment.
            </CheckoutText>
          </CheckoutBox>

          <Disclaimer>*Orders once placed cannot be cancelled/refunded</Disclaimer>
        </OrderSummary>
      </SummarySection>
    </CheckoutContainer>
  );
};

const CheckoutContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 40px;
  width: 100%;
  padding: 20px;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    padding: 16px;
  }
`;

const FormSection = styled.div`
  padding-right: 40px;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 968px) {
    padding-right: 0;
    border-right: none;
  }
`;

const SummarySection = styled.div`
  position: sticky;
  top: 20px;
  height: fit-content;
`;

const Heading = styled.h1`
  font-size: 3.2rem;
  font-weight: bold;
  margin-bottom: 8px;
  color: #fff;
`;

const SubText = styled.p`
  font-size: 1.6rem;
  opacity: 0.7;
  color: #fff;
  margin-bottom: 32px;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 12px;
  color: #fff;
`;

const Input = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 16px;
  background: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1.4rem;
  color: #000;
`;

const QuantityInput = styled(Input)`
  width: 80px;
  text-align: center;
`;

const AddressBox = styled.div`
  background: #0a121e;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 16px;
  min-height: 100px;
  font-size: 1.4rem;
  line-height: 1.5;
  color: #fff;
`;

const CartItem = styled.div`
  font-size: 1.5rem;
  color: #fff;
`;

const Quantity = styled.span`
  margin-left: 16px;
`;

const OrderSummary = styled.div`
  background: #0a121e;
  padding: 24px;
  border-radius: 8px;
  color: #fff;
`;

const SummaryTitle = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 16px;
`;

const Divider = styled.hr`
  border: none;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px 0;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 12px 0;
  font-size: 1.5rem;
`;

const SummaryLabel = styled.span`
  color: #fff;
`;

const SummaryValue = styled.span`
  color: #fff;
  text-align: right;
`;

const TotalRow = styled(SummaryRow)`
  margin-top: 16px;
`;

const TotalLabel = styled(SummaryLabel)`
  font-size: 1.8rem;
  font-weight: bold;
`;

const TotalValue = styled(SummaryValue)`
  font-size: 2rem;
  font-weight: bold;
`;

const CheckoutBox = styled.div`
  margin-top: 32px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  position: relative;
`;

const CheckoutLabel = styled.span`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: #0a121e;
  padding: 0 12px;
  font-size: 1.4rem;
`;

const RazorpayButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #fcd800;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RazorpayLogo = styled.img`
  height: 24px;
`;

const CheckoutText = styled.p`
  font-size: 1.2rem;
  text-align: center;
  margin-top: 16px;
  opacity: 0.7;
`;

const Disclaimer = styled.p`
  font-size: 1.2rem;
  opacity: 0.7;
  margin-top: 24px;
  text-align: left;
  color: #fff;
`;

export default CheckoutDetails;