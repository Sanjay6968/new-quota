import NextLink from 'next/link';
import styled from 'styled-components';
import Button from '@/components/Button';
import ButtonGroup from '@/components/ButtonGroup';
import Container from '@/components/Container';
import UploadIllustration from '@/components/UploadIllustration';
import { media } from '@/utils/media';

export default function Print() {
  return (
    <HeroWrapper>
      <Contents>
        <Heading>Transform Your Imagination into a Reality with our 3D Printing Services</Heading>
        <Description>
          Discover a world of limitless possibilities through 3D printing. 
          Whether you have a unique product idea, a creative design, or a functional prototype in mind, 
          our advanced technology and materials empower you to turn your vision into tangible, high-quality objects. From concept to creation, we are here to help you 
          bring your ideas to life.
          <ul>
            <li>Quick 3D Printing Estimates</li>
            <li>Expert Design Advice</li>
            <li>Fast &amp; Free Nationwide Shipping</li>
            <li>Continuous Production</li>
            <li>Custom Prototypes</li>
            <li>Small-Batch Manufacturing</li>
          </ul>
        </Description>
        <CustomButtonGroup>
        <NextLink href="/orderprocess/upload/uploads">
          <Button>
            Upload Your Model <span>&rarr;</span>
          </Button>
        </NextLink>
        </CustomButtonGroup>
      </Contents>
      <ImageContainer>
        <UploadIllustration />
      </ImageContainer>
    </HeroWrapper>
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
  margin-top: 4rem;
  font-size: 3 rem;
`;

const ImageContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: flex-end;
  align-items: flex-start;

  svg {
    max-width: 45rem;
  }

  ${media('<=desktop')} {
    margin-top: 2rem;
    justify-content: center;
    svg {
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

const Heading = styled.h3`
  font-size: 4rem;
  line-height: 1.3;
  margin-bottom: 4rem;

  ${media('<=tablet')} {
    font-size: 4.6rem;
    margin-bottom: 2rem;
  }
`;