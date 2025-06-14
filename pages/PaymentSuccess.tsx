import { useEffect, useState } from "react";
import styled from "styled-components";
import Page from "@/components/Page";
import RichText from "@/components/RichText";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/router";
import { EnvVars } from "@/env";

export default function PaymentSuccessPage() {
  const [orderId, setOrderId] = useState("");
  const [isValidOrder, setIsValidOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const orderId = urlParams.get("orderId");
    console.log("orderId", orderId);
    if (orderId) {
      setOrderId(orderId);
      verifyOrderId(orderId);
    }
  }, []);

  const verifyOrderId = async (orderId: string) => {
    try {
      const response = await axios.get(
        EnvVars.API + `api/public/verify-order/${orderId}`
      );
      if (response.data.success) {
        setIsValidOrder(true);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Error verifying order ID");
    }
  };

  if (error) {
    return (
      <Page title="Order Not Found">
        <ErrorContainer>
          <h1>Error</h1>
          <p>{error}</p>
          <button onClick={() => router.push("/")}>Go to Home</button>
        </ErrorContainer>
      </Page>
    );
  }

  return isValidOrder ? (
    <Page title="Order Successful">
      <SuccessContainer>
        <SuccessContent>
          <RichText>
            <Image
              src="/payment-success.gif"
              alt="payment-success"
              width={100}
              height={100}
            />
            <h1>Order Success!</h1>
            <p>Your order has been successfully placed.</p>
            <p>
              <strong>Order ID:</strong> {orderId}
            </p>
            <p>
              Thank you for choosing Mekuva Technologies. We are excited to work
              with you and bring your ideas to form. Please check your email for
              order confirmation and further details.
            </p>
            <p>
              If you have any questions or need further assistance, please do
              not hesitate to{" "}
              <a
                href={`mailto:contactus@mekuva.com?subject=Order%20Inquiry%20-%20Order%20ID%20${orderId}`}
              >
                contact us
              </a>
              .
            </p>
          </RichText>
        </SuccessContent>
      </SuccessContainer>
    </Page>
  ) : (
    <Page title="Loading...">
      <LoadingContainer>
        <p>Loading...</p>
      </LoadingContainer>
    </Page>
  );
}

const SuccessContainer = styled.div`
  max-width: 90rem;
  margin: auto;
  display: flex;
  justify-content: center;
  overflow-x: auto;
`;

const SuccessContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ErrorContainer = styled.div`
  max-width: 90rem;
  margin: auto;
  text-align: center;
`;

const LoadingContainer = styled.div`
  max-width: 90rem;
  margin: auto;
  text-align: center;
`;
