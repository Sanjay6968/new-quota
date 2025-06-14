import NextLink from 'next/link';
import React from 'react';
import styled from 'styled-components';
import Button from '@/components/Button';
import ButtonGroup from '@/components/ButtonGroup';
import Container from '@/components/Container';
import OverTitle from '@/components/OverTitle';
import SectionTitle from '@/components/SectionTitle';
import { media } from '@/utils/media';
  
export default function Cta() {
  const openNewTab = (url: string) => {
    const newTab = window.open(url, '_blank');
    if (newTab) {
      newTab.focus();
    }
  };

  return (
    <CtaWrapper>
      <Container>
        <Stack>
          <SectionTitle>Experience Hassle-Free 3D Printing with Our Expert Services</SectionTitle>
          <Description>
            Connect for fast quotes, prompt and reliable services.
          </Description>
          <ButtonGroup>
              <Button onClick={() => openNewTab('https://store.mekuva.com')}>
                Buy Now <span>&rarr;</span>
              </Button>
              <OutlinedButton transparent onClick={() => openNewTab('/brochure.pdf')}>
                Download Brochure <span>&rarr;</span>
              </OutlinedButton>
          </ButtonGroup>
        </Stack>
      </Container>
    </CtaWrapper>
  );
}

const Description = styled.div`
  font-size: 1.8rem;
  color: rgba(var(--textSecondary), 0.8);
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12.5rem 0;
  color: rgb(var(--textSecondary));
  text-align: center;
  align-items: center;
  justify-content: center;

  & > *:not(:first-child) {
    max-width: 80%;
    margin-top: 4rem;
  }

  ${media('<=tablet')} {
    text-align: center;

    & > *:not(:first-child) {
      max-width: 100%;
      margin-top: 2rem;
    }
  }
`;

const OutlinedButton = styled(Button)`
  border: 1px solid white;
  color: white;
`;

const CtaWrapper = styled.div`
  background: rgb(var(--secondary));
`;
