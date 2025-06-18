import React from 'react';
import styled from 'styled-components';
import FormSection from './FormSection';
import InformationSection from './InformationSection';

export default function ContactPage() {
  return (
    <ContactWrapper>
      <InformationSection />
      <FormSection />
    </ContactWrapper>
  );
}

const ContactWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 3rem;
  padding: 4rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 2rem;
  }
`;
