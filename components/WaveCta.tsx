import NextLink from 'next/link';
import styled from 'styled-components';
import Button from '@/components/Button';
import ButtonGroup from '@/components/ButtonGroup';
import Container from '@/components/Container';
import SectionTitle from '@/components/SectionTitle';
import { media } from '@/utils/media';

export default function WaveCta() {
  const openNewTab = (url: string) => {
    const newTab = window.open(url, '_blank');
    if (newTab) {
      newTab.focus();
    }
  };

  return <>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
      <path
        fill="#0A121E"
        fillOpacity="1"
        d="M0,64L80,58.7C160,53,320,43,480,80C640,117,800,203,960,197.3C1120,192,1280,96,1360,48L1440,0L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
      ></path>
    </svg>
    <CtaWrapper>
      <Container>
        <Title>Discover Your Next Creation!</Title>
        <CustomButtonGroup>
          <Button onClick={() => openNewTab("https://store.mekuva.com")}>
            Visit Our Store ! <span>&rarr;</span>
          </Button>
          <NextLink href="/products" passHref legacyBehavior>
            <OutlinedButton transparent>
              Products <span>&rarr;</span>
            </OutlinedButton>
          </NextLink>
        </CustomButtonGroup>
      </Container>
    </CtaWrapper>
  </>;
}

const CtaWrapper = styled.div`
  background: rgb(var(--secondary));
  margin-top: -1rem;
  padding-bottom: 16rem;

  ${media('<=tablet')} {
    padding-top: 8rem;
  }
`;

const Title = styled(SectionTitle)`
  color: rgb(var(--textSecondary));
  margin-bottom: 4rem;
`;

const OutlinedButton = styled(Button)`
  border: 1px solid white;
  color: white;
`;

const CustomButtonGroup = styled(ButtonGroup)`
  justify-content: center;
`;
