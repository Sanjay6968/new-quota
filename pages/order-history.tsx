import React, { useState, useEffect } from 'react';
import { EnvVars } from '@/env';
import axios from 'axios';
import Page from '@/components/Page';
import styled from 'styled-components';

const OrderHistoryPage = () => {
  interface Order {
    orderId: string;
    status: string;
    progress: string;
    printPrices?: {
      totalFinalAmount?: number;
    };
  }

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
  const fetchOrders = async () => {
    try {
      const response = await axios.get(EnvVars.API + 'api/public/customer/orders', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')},
        },
      });

      setOrders(response.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // If 404 with custom message
        setError(err.response.data.message || 'No orders found.');
      } else {
        // Other errors (e.g. 401, network)
        setError('Session Expired. Please sign in again.');
      }
    } finally {
      setLoading(false);
    }
  };

  fetchOrders();
}, []);

  return (
    <Page title="Order History">
      <Container>
        <Title>Order History</Title>

        {loading && <LoadingText>Loading...</LoadingText>}

        {error && <ErrorText>{error}</ErrorText>}

        {!loading && !error && orders.length === 0 && <NoOrders>No orders found.</NoOrders>}

        {!loading && !error && orders.length > 0 && (
          <Table>
            <thead>
              <tr>
                <Th>Order ID</Th>
                <Th>Status</Th>
                <Th>Progress</Th>
                <Th>Total Amount</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <Tr key={order.orderId}>
                  <Td>{order.orderId}</Td>
                  <Td>{order.status}</Td>
                  <Td>{order.progress}</Td>
                  <Td>{order.printPrices?.totalFinalAmount !== undefined && `₹${order.printPrices.totalFinalAmount.toLocaleString('en-IN')}`}</Td>
                  <Td>
                    <ActionButton onClick={() => handleOrderClick(order.orderId)}>View Details</ActionButton>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Container>
    </Page>
  );

  function handleOrderClick(orderId: string) {
    console.log('Viewing order details for:', orderId);
  }
};

export default OrderHistoryPage;

const Container = styled.div`
  width: 100%;
  max-width: 900px;
  margin: auto;
  padding: 2rem;
  font-family: 'Poppins', sans-serif;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 1.5rem;
`;

const LoadingText = styled.p`
  text-align: center;
  font-size: 1.8rem;
  color: #666;
`;

const ErrorText = styled.p`
  text-align: center;
  font-size: 1.8rem;
  color: red;
  font-weight: bold;
`;

const NoOrders = styled.p`
  text-align: center;
  font-size: 1.5rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
`;

const Th = styled.th`
  background-color: #0a121e;
  color: white;
  padding: 1rem;
  font-size: 1.4rem;
`;

const Tr = styled.tr`
  &:nth-child(even) {
    background-color: #f4f4f4;
  }
`;

const Td = styled.td`
  padding: 1rem;
  text-align: center;
  font-size: 1.3rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: 1.3rem;
  font-weight: bold;
  color: #0a121e;
  background-color: #fed700;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #e0a800;
  }
`;
