// views/ContactPage/index.tsx
import React from 'react';
import styled from 'styled-components';
import FormSection from './FormSection';
import InformationSection from './InformationSection';
import { media } from '@/utils/media';

export default function ContactPage() {
  return (
    <Container>
      <Title>Contact Us</Title>
      <Content>
        <InformationSection />
        <FormSection />
      </Content>
    </Container>
  );
}

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 4rem;
  margin-bottom: 4rem;
  color: rgba(var(--text), 1);
`;

const Content = styled.div`
  display: flex;
  gap: 4rem;
  
  ${media('<=tablet')} {
    flex-direction: column;
    gap: 2rem;
  }
`;
