import NextImage from "next/image";
import React from 'react';
import styled from 'styled-components';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import Container from '@/components/Container';
import { media } from '@/utils/media';

const TOTAL_PARTNERS = 27; // Set the total number of partners

export default function Partners() {
  return (
    <PartnersWrapper>
      <Title>trusted by</Title>
      <Swiper
        modules={[Autoplay]}
        slidesPerView={6}
        spaceBetween={30}
        loop={true}
        autoplay={{ delay: 0, disableOnInteraction: false, pauseOnMouseEnter: false, waitForTransition: true, stopOnLastSlide: false }}
        speed={3000}
        breakpoints={{
          320: { slidesPerView: 2 },
          768: { slidesPerView: 4 },
          1025: { slidesPerView: 6 },
        }}
        className="swiper-wrapper"
      >
        {Array.from({ length: TOTAL_PARTNERS }, (_, index) => (
          <SwiperSlide key={index}>
            <ImageWrapper>
              <NextImage
                src={`/partners/${index + 1}.webp`}
                alt={`Partner ${index + 1}`}
                width={128}
                height={128}
                sizes="100vw"
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "contain"
                }} />
            </ImageWrapper>
          </SwiperSlide>
        ))}
      </Swiper>
    </PartnersWrapper>
  );
}

const Title = styled.h3`
  font-size: 1.3rem;
  letter-spacing: 0.02em;
  line-height: 1; // Adjust line-height for better alignment
  text-transform: uppercase;
  margin-bottom: 2rem;
  text-align: center;
  opacity: 0.8;

  ${media('<=desktop')} {
    line-height: 1.5;
  }
`;

const PartnersWrapper = styled(Container)`
  .swiper-wrapper {
    will-change: transform;
    transition-timing-function: linear;
    margin-top: 0.5rem;
    user-select: none;
  }

  .swiper-slide {
    opacity: 0.8;
    transition: opacity 0.2s;

    &:hover {
      opacity: 1;
    }
  }
`;

const ImageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 128px; // Set a fixed height for the image container
  width: 128px; // Set a fixed width for the image container

  img {
    max-width: 100%;
    height: auto;
  }
};

`;
