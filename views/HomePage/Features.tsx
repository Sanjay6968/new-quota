import React from 'react';
import styled from 'styled-components';
import AutofitGrid from '@/components/AutofitGrid';
import BasicCard from '@/components/BasicCard';
import Container from '@/components/Container';
import OverTitle from '@/components/OverTitle';
import SectionTitle from '@/components/SectionTitle';
import { media } from '@/utils/media';

const FEATURES = [
  {
    imageUrl: '/grid-icons/design-im.svg',
    title: 'Design for Injection Molding (Plastic Part Design)',
    description:
      "We can replicate your existing part or design a new one from scratch. You'll receive a CAD file of your part, prepared for the injection molding process",
  },
  {
    imageUrl: '/grid-icons/design.svg',
    title: 'Product Design',
    description:
      'We guide you from concept to completion, providing expert assistance at every stage of the product design process',
  },
  {
    imageUrl: '/grid-icons/3d-printing.svg',
    title: '3D Printing Services',
    description:
      'Professional 3D printing solutions to ensure your parts can be printed in high quality using your chosen material',
  },
  {
    imageUrl: '/grid-icons/laser.svg',
    title: 'Laser Cutting, Water Jet Machining, and CNC EDM Wire Cutting',
    description:
      'We provide 2D cutting services for a wide range of materials, including acrylic, polycarbonate (PC), stainless steel, mild steel (MS), and aluminium',
  },
  {
    imageUrl: '/grid-icons/cnc.svg',
    title: 'CNC Milling, Lathe, and Sheet Metal Bending Operations',
    description:
      'Precision manufacturing for parts requiring high tolerance, precise fitting, and superior finish to ensure 100% functional performance',
  },
  {
    imageUrl: '/grid-icons/injection-molding.svg',
    title: 'Injection Molding and Plastic Part Production',
    description:
      'Professional 3D printing solutions to ensure your parts can be printed in high quality using your chosen material, including advanced SLA/DLP techniques',
  },
  {
    imageUrl: '/grid-icons/3d-scan.svg',
    title: '3D Scanning',
    description:
      'We provide scanning services for your part, delivering CAD models in various major file formats. We also offer full-color 3D models of your objects',
  },
  {
    imageUrl: '/grid-icons/casting.svg',
    title: 'Vacuum Casting',
    description:
      'We offer specialized Vacuum Casting services for high-quality, accurate, and durable parts in small batches',
  },
  {
    imageUrl: '/grid-icons/file-repair.svg',
    title: 'File Repair',
    description:
      'With our File Repair expertise you can expect faster project turnaround times and we ensure that your models meet design standards',
  },
];
``
export default function Features() {
  return (
    <Container id = "services">
      <Content>
        <OverTitle>services</OverTitle>
        <SectionTitle>Our Services</SectionTitle>
      </Content>
      <CustomAutofitGrid>
        {FEATURES.map((singleFeature, idx) => (
          <BasicCard key={singleFeature.title} {...singleFeature} />
        ))}
      </CustomAutofitGrid>
    </Container>
  );
}

const CustomAutofitGrid = styled(AutofitGrid)`
  --autofit-grid-item-size: 40rem;

  ${media('<=tablet')} {
    --autofit-grid-item-size: 30rem;
  }

  ${media('<=phone')} {
    --autofit-grid-item-size: 100%;
  }
`;

const Content = styled.div`
  & > *:not(:first-child) {
    margin-top: 1rem;
  }
  text-align: center;
  padding-bottom: 4rem;
`;