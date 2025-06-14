import NextImage from "next/image";
import styled from 'styled-components';
import { PropsWithChildren } from 'react';
type ButtonProps = PropsWithChildren<{ transparent?: boolean }>;

interface BasicCardProps {
  title: string;
  description?: string;
  imageUrl: string;
  brochureLink?: string;
}

export default function BasicCard({ title, description, imageUrl, brochureLink }: BasicCardProps) {
  return (
    <Card>
      <ImageWrapper>
      <NextImage
        src={imageUrl}
        width={256}
        height={256}
        alt={title}
        style={{
          maxWidth: "100%",
          height: "auto"
        }} />
        </ImageWrapper>
        <Content>
          <Title>{title}</Title>
          <Description>{description}</Description>
          {brochureLink && (
          <a href={brochureLink} target="_blank" rel="noopener noreferrer">
            <Button>Brochure</Button>
          </a>
        )}
      </Content>
    </Card>
  );
}

const Card = styled.div`
  display: flex;
  padding: 3rem;
  background: rgb(var(--cardBackground));
  box-shadow: var(--shadow-md);
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  width: 100%;
  border-radius: 0.6rem;
  color: rgb(var(--text));
  font-size: 1.6rem;
  height: 100%;

  & > *:not(:first-child) {
    margin-top: 1rem;
  }
`;

const Button = styled.a<ButtonProps>`
  border: none;
  background: none;
  display: inline-block;
  text-decoration: none;
  text-align: center;
  background: ${(p) => (p.transparent ? 'transparent' : 'rgb(var(--primary))')};
  padding: 0.8rem 1.5rem;
  font-size: 1.2rem;
  color: ${(p) => (p.transparent ? '#0A121E' : '#0A121E')};
  text-transform: uppercase;
  font: 'Poppins', sans-serif;
  font-weight: bold;
  border-radius: 0.4rem;
  border: ${(p) => (p.transparent ? 'none' : '2px solid rgb(var(--primary))')};
  transition: transform 0.3s;
  backface-visibility: hidden;
  will-change: transform;
  cursor: pointer;

  span {
    margin-left: 2rem;
  }

  &:hover {
    transform: scale(1.025);
  }
`;

const ImageWrapper = styled.div`
  flex: 1; /* Take up available vertical space equally */
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1; /* Take up available vertical space equally */
`;

const Title = styled.div`
  font-weight: bold;
`;

const Description = styled.div`
  opacity: 0.6;
`;
