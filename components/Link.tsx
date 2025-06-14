import NextLink from 'next/link';
import { PropsWithChildren } from 'react';
import styled from 'styled-components';

export interface LinkProps {
  href: string;
}

export default function Link({ href, children }: PropsWithChildren<LinkProps>) {
  return (
    <NextLink href={href} passHref legacyBehavior>
      <Anchor>{children}</Anchor>
    </NextLink>
  );
}

const Anchor = styled.a`
  display: inline;
  width: fit-content;
  text-decoration: none;

  background: linear-gradient(rgb(var(--primary)), rgb(var(--primary)));
  background-position: 0% 100%;
  background-repeat: no-repeat;
  background-size: 100% 0px;
  transition: 100ms;
  transition-property: background-size, text-decoration, color;
  color: #257BF2;

  &:hover {
    background-size: 100% 100%;
    text-decoration: none;
    color: #0A121E;
  }

  &:active {
    color: #0A121E;
    background-size: 100% 100%;
  }
`;
