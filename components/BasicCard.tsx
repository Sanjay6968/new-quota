import NextImage from "next/image";
import styled from 'styled-components';

interface BasicCardProps {
  title: string;
  description: string;
  imageUrl: string;
}

export default function BasicCard({ title, description, imageUrl }: BasicCardProps) {
  return (
    <Card>
      <ImageWrapper>
      <NextImage
        src={imageUrl}
        width={128}
        height={128}
        alt={title}
        style={{
          maxWidth: "100%",
          height: "auto"
        }} />
        </ImageWrapper>
        <Content>
          <Title>{title}</Title>
          <Description>{description}</Description>
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
