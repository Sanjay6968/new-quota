import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Button from '@/components/Button';

type FloatingButtonProps = {
  isClicked: boolean;
  isScrolled: boolean;
};

const FloatingButton = styled(Button)<FloatingButtonProps>`
  position: fixed;
  bottom: 40px;
  right: 20px;
  z-index: 100;
  transition: all 0.3s ease-in-out;
  transform: ${(props) => (props.isClicked || props.isScrolled) ? 'scale(0.5)' : 'scale(1)'};

  ${(props) => (props.isClicked || props.isScrolled) && `
    padding: 10px;
    div {
      width: 40px;
      height: 40px;
      background-image: url('/up-arrow.svg');
      background-size: cover;
    }
  `}
`;

export default function QuickLinkButton() {
  const [isClicked, setIsClicked] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleClick = () => {
    if (isClicked) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsClicked(false);
    } else {
      navigateToFooter();
      setIsClicked(true);
    }
  };

  const navigateToFooter = () => {
    const footerElement = document.getElementById('footer');
    if (footerElement) {
      footerElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > (document.body.offsetHeight - window.innerHeight) * 0.7;
      setIsScrolled(scrolled);

      if (window.scrollY === 0) {
        setIsClicked(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <FloatingButton onClick={handleClick} isClicked={isClicked} isScrolled={isScrolled}>
      {isClicked || isScrolled ? <div /> : 'Quick Links'}
    </FloatingButton>
  );
}
