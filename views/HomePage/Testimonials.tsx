import NextImage from "next/image";
import React from 'react';
import styled from 'styled-components';

import { A11y, Autoplay, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import Container from '@/components/Container';
import Separator from '@/components/Separator';
import { media } from '@/utils/media';

const TESTIMONIALS = [
  {
    companyLogoUrl: '/testimonials/hb.webp',
    content: `Very good design skill set Raj has. I am very happy with their work.`,
    author: {
      name: 'Mahan SRK',
      title: 'Hackboats',
      avatarUrl: '/testimonials/mahan.webp',
    },
  },
  {
    companyLogoUrl: '/partners/3.webp',
    content: `Mekuva has delivered the parts and printer according to our satisfaction.`,
    author: {
      name: 'V. Vinothkrishnan',
      title: 'Scientist, Naval Physical & Oceanographic Lab,DRDO',
      avatarUrl: '/testimonials/placeholder.webp',
    },
  },
  {
    companyLogoUrl: '/testimonials/jarsh.webp',
    content: `Good Service and Products Delivered with High Precision and Finish.`,
    author: {
      name: 'Anand Kumar',
      title: 'Jarsh Innovations Pvt Ltd',
      avatarUrl: '/testimonials/anand-kumar.webp',
    },
  },
  {
    companyLogoUrl: '/testimonials/vir.webp',
    content: `Mekuva has the right blend of Engineering Team and machines, I appreciate the Mekuva team for their  Quick response and on-time delivery..`,
    author: {
      name: 'Adinarayana Peela',
      title: 'VIR INNOVATIONS PRIVATE LIMITED',
      avatarUrl: '/testimonials/placeholder.webp',
    },
  },
  {
    companyLogoUrl: '/testimonials/hc.webp',
    content: `Mekuva tech is providing very quality 3D printed parts so far. I recommend Mekuva Tech for all of our 3D printing prototyping works.`,
    author: {
      name: 'Narasimha Rao S',
      title: 'HC Robotics',
      avatarUrl: '/testimonials/placeholder.webp',
    },
  },
  {
    companyLogoUrl: '/testimonials/white.webp',
    content: `Instant solutions for Rapid prototypes and fast service provider for 3D printing`,
    author: {
      name: 'Ravi Chandra',
      title: 'Gravton Motors Private Limited',
      avatarUrl: '/testimonials/placeholder.webp',
    },
  },
];

export default function Testimonials() {
  return (
    <div>
      <Separator />
      <TestimonialsWrapper>
        <Swiper modules={[Navigation, Autoplay, A11y]} slidesPerView={1} autoplay={{ delay: 8000 }} centeredSlides navigation loop>
          {TESTIMONIALS.map((singleTestimonial, idx) => (
            <SwiperSlide key={idx}>
              <TestimonialCard>
                <ImageWrapper>
                  <NextImage
                    src={singleTestimonial.companyLogoUrl}
                    alt={`${singleTestimonial.author.name}'s company logo`}
                    width={200} // Set your desired width
                    height={200} // Set your desired height
                    style={{
                      maxWidth: "100%",
                      height: "auto"
                    }} />
                </ImageWrapper>
                <Content>“{singleTestimonial.content}”</Content>
                <AuthorContainer>
                  <AuthorImageContainer>
                    <NextImage
                      src={singleTestimonial.author.avatarUrl}
                      alt={singleTestimonial.author.name}
                      width={48} // Set your desired width
                      height={48} // Set your desired height
                      style={{
                        maxWidth: "100%",
                        height: "auto"
                      }} />
                  </AuthorImageContainer>
                  <AuthorContent>
                    <AuthorName>{singleTestimonial.author.name}</AuthorName>
                    <AuthorTitle>{singleTestimonial.author.title}</AuthorTitle>
                  </AuthorContent>
                </AuthorContainer>
              </TestimonialCard>
            </SwiperSlide>
          ))}
        </Swiper>
      </TestimonialsWrapper>
      <Separator />
    </div>
  );
}

const TestimonialsWrapper = styled(Container)`
  position: relative;

  .swiper-button-prev,
  .swiper-button-next {
    color: rgb(var(--secondary));

    ${media('<=desktop')} {
      display: none;
    }
  }

  .swiper-button-prev {
    color: rgb(var(--textSecondary));
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2027%2044'%3E%3Cpath%20d%3D'M0%2C22L22%2C0l2.1%2C2.1L4.2%2C22l19.9%2C19.9L22%2C44L0%2C22L0%2C22L0%2C22z'%20fill%3D'%23currentColor'%2F%3E%3C%2Fsvg%3E");
  }

  .swiper-button-next {
    color: rgb(var(--textSecondary));
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2027%2044'%3E%3Cpath%20d%3D'M27%2C22L27%2C22L5%2C44l-2.1-2.1L22.8%2C22L2.9%2C2.1L5%2C0L27%2C22L27%2C22z'%20fill%3D'%23currentColor'%2F%3E%3C%2Fsvg%3E");
  }
`;

const TestimonialCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  & > *:not(:first-child) {
    margin-top: 5rem;
  }
`;

const ImageWrapper = styled.div`
  width: 100px; // Set your desired width
  height: 100px; // Set your desired height
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Content = styled.blockquote`
  text-align: center;
  font-size: 2.2rem;
  font-weight: bold;
  font-style: italic;
  max-width: 60%;

  ${media('<=desktop')} {
    max-width: 100%;
  }
`;

const AuthorContainer = styled.div`
  display: flex;
  align-items: center;
`;

const AuthorContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 1.4rem;
`;

const AuthorTitle = styled.p`
  font-weight: bold;
`;

const AuthorName = styled.p`
  font-weight: normal;
`;

const AuthorImageContainer = styled.div`
  display: flex;
  border-radius: 10rem;
  margin-right: 1rem;
  overflow: hidden;
`;
