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

  interface OrderDetails {
    orderId: string;
    status: string;
    progress: string;
    customerInfo: {
      name: string;
      email: string;
      phone: string;
    };
    printPrices?: {
      totalFinalAmount?: number;
      [key: string]: any;
    };
    deliveryInstructions?: {
      deliveryType?: string;
      address?: string;
      [key: string]: any;
    };
    items?: any[];
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
  }

  interface StatusNote {
    status: string;
    note: string;
    noteId: string;
    createdAt: string;
    updatedAt: string;
  }

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [statusNotes, setStatusNotes] = useState<StatusNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(EnvVars.API + 'api/public/customer/orders', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        setOrders(response.data);
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          setError(err.response.data.message || 'No orders found.');
        } else {
          setError('Session Expired. Please sign in again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const fetchOrderDetails = async (orderId: string) => {
    setDetailsLoading(true);
    try {
      // Fetch order details
      const orderResponse = await axios.get(
        `${EnvVars.API}api/private/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (orderResponse.data.success) {
        setSelectedOrder(orderResponse.data.order);
      }

      // Fetch status notes
      const notesResponse = await axios.get(
        `${EnvVars.API}api/private/orders/status-notes/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (notesResponse.data.success) {
        setStatusNotes(notesResponse.data.statusNotes);
      }

    } catch (err: any) {
      console.error('Error fetching order details:', err);
      // You could show an error message here
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleOrderClick = (orderId: string) => {
    if (selectedOrder && selectedOrder.orderId === orderId) {
      // If same order is clicked, close the details
      setSelectedOrder(null);
      setStatusNotes([]);
    } else {
      // Fetch and show details for the clicked order
      fetchOrderDetails(orderId);
    }
  };

  const closeDetails = () => {
    setSelectedOrder(null);
    setStatusNotes([]);
  };

  return (
    <Page title="Order History">
      <Container>
        <Title>Order History</Title>

        {loading && <LoadingText>Loading...</LoadingText>}

        {error && <ErrorText>{error}</ErrorText>}

        {!loading && !error && orders.length === 0 && <NoOrders>No orders found.</NoOrders>}

        {!loading && !error && orders.length > 0 && (
          <>
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
                  <Tr key={order.orderId} isSelected={selectedOrder?.orderId === order.orderId}>
                    <Td>{order.orderId}</Td>
                    <Td>
                      <StatusBadge status={order.status}>
                        {order.status?.toUpperCase()}
                      </StatusBadge>
                    </Td>
                    <Td>{order.progress}</Td>
                    <Td>
                      {order.printPrices?.totalFinalAmount !== undefined &&
                        `₹${order.printPrices.totalFinalAmount.toLocaleString('en-IN')}`}
                    </Td>
                    <Td>
                      <ActionButton 
                        onClick={() => handleOrderClick(order.orderId)}
                        isSelected={selectedOrder?.orderId === order.orderId}
                      >
                        {selectedOrder?.orderId === order.orderId ? 'Hide Details' : 'View Details'}
                      </ActionButton>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>

            {/* Order Details Section */}
            {selectedOrder && (
              <DetailsContainer>
                <DetailsHeader>
                  <DetailsTitle>Order Details - {selectedOrder.orderId}</DetailsTitle>
                  <CloseButton onClick={closeDetails}>×</CloseButton>
                </DetailsHeader>

                {detailsLoading ? (
                  <LoadingText>Loading order details...</LoadingText>
                ) : (
                  <DetailsContent>
                    <Section>
                      <SectionTitle>Customer Information</SectionTitle>
                      <InfoGrid>
                        <InfoItem>
                          <Label>Name:</Label>
                          <Value>{selectedOrder.customerInfo.name}</Value>
                        </InfoItem>
                        <InfoItem>
                          <Label>Email:</Label>
                          <Value>{selectedOrder.customerInfo.email}</Value>
                        </InfoItem>
                        <InfoItem>
                          <Label>Phone:</Label>
                          <Value>{selectedOrder.customerInfo.phone}</Value>
                        </InfoItem>
                      </InfoGrid>
                    </Section>

                    {selectedOrder.printPrices && (
                      <Section>
                        <SectionTitle>Order Summary</SectionTitle>
                        <InfoGrid>
                          {selectedOrder.printPrices.totalFinalAmount && (
                            <InfoItem>
                              <Label>Total Amount:</Label>
                              <Value>₹{selectedOrder.printPrices.totalFinalAmount.toLocaleString('en-IN')}</Value>
                            </InfoItem>
                          )}
                          {selectedOrder.deliveryInstructions?.deliveryType && (
                            <InfoItem>
                              <Label>Delivery Type:</Label>
                              <Value>{selectedOrder.deliveryInstructions.deliveryType}</Value>
                            </InfoItem>
                          )}
                          {selectedOrder.progress && (
                            <InfoItem>
                              <Label>Progress:</Label>
                              <Value>{selectedOrder.progress}</Value>
                            </InfoItem>
                          )}
                        </InfoGrid>
                      </Section>
                    )}

                    {selectedOrder.deliveryInstructions?.address && (
                      <Section>
                        <SectionTitle>Delivery Information</SectionTitle>
                        <InfoItem>
                          <Label>Address:</Label>
                          <Value>{selectedOrder.deliveryInstructions.address}</Value>
                        </InfoItem>
                      </Section>
                    )}

                    {statusNotes.length > 0 && (
                      <Section>
                        <SectionTitle>Order Notes & Updates</SectionTitle>
                        <NotesContainer>
                          {statusNotes.map((note, index) => (
                            <NoteCard key={note.noteId || index}>
                              <NoteHeader>
                                <NoteStatus>{note.status?.toUpperCase()}</NoteStatus>
                                <NoteDate>
                                  {new Date(note.createdAt).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </NoteDate>
                              </NoteHeader>
                              <NoteText>{note.note}</NoteText>
                            </NoteCard>
                          ))}
                        </NotesContainer>
                      </Section>
                    )}

                    {selectedOrder.createdAt && (
                      <Section>
                        <SectionTitle>Order Timeline</SectionTitle>
                        <InfoItem>
                          <Label>Order Created:</Label>
                          <Value>
                            {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Value>
                        </InfoItem>
                      </Section>
                    )}
                  </DetailsContent>
                )}
              </DetailsContainer>
            )}
          </>
        )}
      </Container>
    </Page>
  );
};

export default OrderHistoryPage;

const Container = styled.div`
  width: 100%;
  max-width: 1200px;
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
  margin-bottom: 2rem;
`;

const Th = styled.th`
  background-color: #0a121e;
  color: white;
  padding: 1rem;
  font-size: 1.4rem;
`;

const Tr = styled.tr<{ isSelected?: boolean }>`
  &:nth-child(even) {
    background-color: #f4f4f4;
  }
  
  &:hover {
    background-color: #e8f4f8;
  }

  ${props => props.isSelected && `
    background-color: #e3f2fd !important;
    border-left: 4px solid #2196f3;
  `}
`;

const Td = styled.td`
  padding: 1rem;
  text-align: center;
  font-size: 1.3rem;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-weight: bold;
  font-size: 0.9rem;
  text-transform: uppercase;
  background-color: ${props => {
    switch (props.status?.toLowerCase()) {
      case 'confirmed': return '#d4edda';
      case 'pending': return '#fff3cd';
      case 'shipped': return '#d1ecf1';
      case 'cancelled': return '#f8d7da';
      case 'inproduction': return '#e2e3e5';
      default: return '#f8f9fa';
    }
  }};
  color: ${props => {
    switch (props.status?.toLowerCase()) {
      case 'confirmed': return '#155724';
      case 'pending': return '#856404';
      case 'shipped': return '#0c5460';
      case 'cancelled': return '#721c24';
      case 'inproduction': return '#383d41';
      default: return '#495057';
    }
  }};
`;

const ActionButton = styled.button<{ isSelected?: boolean }>`
  padding: 0.5rem 1rem;
  font-size: 1.3rem;
  font-weight: bold;
  color: ${props => props.isSelected ? '#fff' : '#0a121e'};
  background-color: ${props => props.isSelected ? '#007bff' : '#fed700'};
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${props => props.isSelected ? '#0056b3' : '#e0a800'};
    transform: translateY(-2px);
  }
`;

// Details Section Styles
const DetailsContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
  margin-top: 2rem;
  overflow: hidden;
  border: 2px solid #2196f3;
`;

const DetailsHeader = styled.div`
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DetailsTitle = styled.h2`
  font-size: 1.8rem;
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const DetailsContent = styled.div`
  padding: 2rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.4rem;
  color: #0a121e;
  margin-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.5rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const Label = styled.span`
  font-weight: 600;
  color: #495057;
  font-size: 1rem;
`;

const Value = styled.span`
  color: #0a121e;
  font-size: 1.1rem;
`;

const NotesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NoteCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  border-left: 4px solid #fed700;
`;

const NoteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const NoteStatus = styled.span`
  background: #0a121e;
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
`;

const NoteDate = styled.span`
  color: #6c757d;
  font-size: 0.9rem;
`;

const NoteText = styled.p`
  margin: 0;
  color: #495057;
  line-height: 1.5;
`;
