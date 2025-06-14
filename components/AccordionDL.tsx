import { PropsWithChildren } from 'react';
import styled from 'styled-components';
import { media } from '@/utils/media';
import Collapse from './Collapse';
import RichText from './RichText';

interface AccordionProps {
  title: string | JSX.Element;
  releaseNotes?: string;
  isOpen?: boolean;
  onTitleClick: (title: string | JSX.Element) => void;
}


AccordionDL.defaultProps = {
  isOpen: false,
};

export default function AccordionDL({
  title,
  releaseNotes, // New prop
  isOpen,
  onTitleClick,
  children,
}: PropsWithChildren<AccordionProps>) {
  return (
    <AccordionWrapper onClick={() => onTitleClick(title)}>
      <TitleWrapper>
        <TitleContainer>
          <Title>{title}</Title>
          {releaseNotes && <ReleaseNotes>{releaseNotes}</ReleaseNotes>} 
        </TitleContainer>
        <Icon isActive={!!isOpen}>
          <svg
            viewBox="0 0 24 24"
            focusable="false"
            className="chakra-icon chakra-accordion__icon css-j2ph2z"
            aria-hidden="true"
            preserveAspectRatio="none"
          >
            <path fill="currentColor" d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"></path>
          </svg>
        </Icon>
      </TitleWrapper>
      <Collapse isOpen={isOpen} duration={300}>
        <Description>
          <RichText>{children}</RichText>
        </Description>
      </Collapse>
    </AccordionWrapper>
  );
}

const Title = styled.h3`
  font-size: 2rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 90%;
`;

const ReleaseNotes = styled.span`
  margin-left: 1.5rem;
  color: gray;
  font-size: 1.9rem;
`;

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Icon = styled.div<{ isActive: boolean }>`
  width: 2.4rem;
  transition: transform 0.3s;
  transform: rotateZ(${(p) => (p.isActive ? 180 : 0)}deg);
`;

const Description = styled.div`
  margin-top: 2.5rem;
  font-size: 1.6rem;
  font-weight: normal;
`;

const AccordionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2rem 1.5rem;
  background: rgb(var(--cardBackground));
  box-shadow: var(--shadow-md);
  cursor: pointer;
  border-radius: 0.6rem;
  transition: opacity 0.2s;

  ${media('<=desktop')} {
    width: 100%;
  }
`;
