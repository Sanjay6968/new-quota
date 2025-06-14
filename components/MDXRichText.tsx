import styled from 'styled-components';
import { media } from '@/utils/media';
import ArticleImage from './ArticleImage';
import Code from './Code';
import Link from './Link';
import Quote from './Quote';

// Placeholder props (you can update this when integrating another markdown renderer)
export default function RichText(props: { content: any }) {
  // TODO: Replace this with your actual rendering logic (e.g., using react-markdown)
  return (
    <Container>
      {/* Replace this with actual render logic */}
      <p style={{ color: 'gray', fontStyle: 'italic' }}>
        Rich text renderer is not implemented. Please integrate a markdown renderer here.
      </p>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  section:not(:last-child) {
    margin-bottom: 3.8rem;
  }

  a {
    word-break: break-word;
  }

  ${media('<=desktop')} {
    .remark-highlight {
      width: 100%;
      overflow-x: auto;
    }
  }

  & > section,
  .footnotes {
    /* Optional content-visibility */
  }

  ol,
  ul {
    font-size: 1.8rem;
    line-height: 2.7rem;
    margin: 0;
    padding-left: 2.4rem;

    li {
      & > * {
        vertical-align: top;
      }
    }

    &:not(:last-child) {
      margin-bottom: 2.7rem;
    }
  }
`;

const Paragraph = styled.p`
  font-size: 1.8rem;
  line-height: 2.7rem;
  hanging-punctuation: first;

  &:not(:last-child) {
    margin-bottom: 2.7rem;
  }

  & + ul,
  & + li {
    margin-top: -1.5rem !important;
  }
`;

const SecondHeading = styled.h2`
  font-size: 2.5rem;
  line-height: 3.75rem;
  margin-bottom: 3.75rem;
`;

const ThirdHeading = styled.h3`
  font-size: 2.2rem;
  line-height: 3.4rem;
  margin-bottom: 3.4rem;
`;

const Break = styled.br`
  display: block;
  content: '';
  margin: 0;
  height: 3rem;
`;

const TextHighlight = styled.code`
  display: inline-block;
  padding: 0 0.6rem;
  color: rgb(var(--textSecondary));
  border-radius: 0.4rem;
  background-color: rgba(var(--primary), 0.8);
  font-size: 1.6rem;
  font-family: inherit;
`;

// This is still useful if you plug in a Markdown or MDX renderer
const components = {
  h2: SecondHeading,
  h3: ThirdHeading,
  p: Paragraph,
  br: Break,
  inlineCode: TextHighlight,
  Image: ArticleImage,
  Link,
  Code,
  Quote,
  ArticleImage,
};
