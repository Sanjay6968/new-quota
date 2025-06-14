import NextLink from 'next/link';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Button from '@/components/Button';
import ButtonGroup from '@/components/ButtonGroup';
import Container from '@/components/Container';
import OverTitle from '@/components/OverTitle';
import QuickLinkButton from '../HomePage/QuickLinkButton';
import { media } from '@/utils/media';

export default function Hero() {
  const openNewTab = (url: string) => {
    const newTab = window.open(url, '_blank');
    if (newTab) {
      newTab.focus();
    }
  };
  
  const navigateToFooter = () => {
    const footerElement = document.getElementById('footer');
    if (footerElement) {
      footerElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
    <HeroWrapper>
      <Contents>
        <CustomOverTitle>leading industrial 3D printer manufacturer</CustomOverTitle>
        <Heading>Enabling You to Prototype Faster and Better</Heading>
        <Description>
          We provide the most reliable 3D printing services, every time. Our expert engineers provide professional 3D printing, manufacturing, and design services that have been hired by entrepreneurs, Startups, and big companies.
        </Description>
        <CustomButtonGroup>
          <Button onClick={() => openNewTab('https://store.mekuva.com')}>
            Buy Now <span>&rarr;</span>
          </Button>
          <NextLink href="/products" passHref legacyBehavior>
            <Button transparent>
              Products <span>&rarr;</span>
            </Button>
          </NextLink>
        </CustomButtonGroup>
      </Contents>
      <VideoContainer>
      <video width="600" height="400" autoPlay loop muted>
      <source src="/akar.webm" type="video/webm" />
        Your browser does not support the video tag.
      </video>
    </VideoContainer>
    </HeroWrapper>
    <QuickLinkButton />
  </>
  );
}

const HeroWrapper = styled(Container)`
  display: flex;
  padding-top: 5rem;

  ${media('<=desktop')} {
    padding-top: 1rem;
    flex-direction: column;
    align-items: center;
  }
`;

const Contents = styled.div`
  flex: 1;
  max-width: 60rem;

  ${media('<=desktop')} {
    max-width: 100%;
  }
`;

const CustomButtonGroup = styled(ButtonGroup)`
  --font: 'Poppins', sans-serif;
  margin-top: 4rem;
`;

const VideoContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: flex-end;
  align-items: flex-start;

  video {
    max-width: 56rem;
  }

  ${media('<=desktop')} {
    margin-top: 2rem;
    justify-content: center;

    video {
      max-width: 80%;
    }
  }
`;

const Description = styled.p`
  font-size: 1.8rem;
  opacity: 0.8;
  line-height: 1.6;

  ${media('<=desktop')} {
    font-size: 1.5rem;
  }
`;

const CustomOverTitle = styled(OverTitle)`
  margin-bottom: 2rem;
`;

const Heading = styled.h1`
  font-size: 7.2rem;
  font-weight: bold;
  line-height: 1.1;
  margin-bottom: 4rem;
  letter-spacing: -0.03em;

  ${media('<=tablet')} {
    font-size: 4.6rem;
    margin-bottom: 2rem;
  }
`;
