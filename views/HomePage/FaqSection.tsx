import styled from 'styled-components';
import Accordion from '@/components/Accordion';
import SectionTitle from '@/components/SectionTitle';
import Container from '@/components/Container';
import { useState } from 'react';

export default function FaqSection() {
  const [openedAccordion, setOpenedAccordion] = useState<string | null>(null);

  const handleAccordionClick = (title: string) => {
    if (openedAccordion === title) {
      setOpenedAccordion(null);
    } else {
      setOpenedAccordion(title);
    }
  };

  return (
    <Container id = "faq">
    <Wrapper>
      <SectionTitle>Frequently Asked Questions</SectionTitle>

      <Accordion 
        title="What is a 3D printer and how does it work ?"
        isOpen = {openedAccordion === "What is a 3D printer and how does it work ?"}
        onTitleClick={handleAccordionClick}
      >
      A 3d printer is a machine that creates 3-dimensional objects by addition of materials in a layer-by-layer fashion. 
      It is based on the process of additive manufacturing. 3d printer works by taking in the 3d model designed in any modeling software, 
      which is then sliced using special slicing software’s into layers which are readable by 3d printers. Know the printer starts printing 
      as the design is provided in a layer-by-layer fashion till the object is completely printed which is then post processed to ensure 
      objects quality and stability.
      </Accordion>

      <Accordion 
        title="What types of 3d printers do you manufacture?"
        isOpen = {openedAccordion === "What types of 3d printers do you manufacture?"}
        onTitleClick={handleAccordionClick}
      >
        Currently our focus is on FDM based 3D printers. We offer wide range of industrial 3d printers ideal for heavy duty applications 
        and for industrial automation. Each type of printer offers specific features and capabilities to meet diverse customer needs.
      </Accordion>

      <Accordion 
        title="Do you offer customized 3d printer solutions?"
        isOpen = {openedAccordion === "Do you offer customized 3d printer solutions?"}
        onTitleClick={handleAccordionClick}
      >
      Yes, we offer customized 3D printer solutions to meet your specific requirements. Whether you need modifications to our existing models
       or a completely tailored 3D printing solution, our team can work with you to create a printer that fits your unique needs. 
       Please contact our sales or customer support team at <a href='mailto:contactus@mekuva.com'>contactus@mekuva.com </a>
         or <a href='tel:+918686700666'>(+91)8686700666</a> to discuss your customization options in more detail.
      </Accordion>
      
      <Accordion
        title="How do I request a quote for a 3d printer?"
        isOpen = {openedAccordion === "How do I request a quote for a 3d printer?"}
        onTitleClick={handleAccordionClick}
      >
      Visit our online store to view precise pricing details for all printer models.
       If you are interested in bulk or corporate purchases, kindly reach out to us via email with your specific needs and inquiries.
      </Accordion>

      <Accordion 
        title="How big can I print using your printers?"
        isOpen = {openedAccordion === "How big can I print using your printers?"}
        onTitleClick={handleAccordionClick}
      >
      Our diverse model lineup includes various build area/volume options. 
      These sizes vary from a minimum of 200mm to a maximum of 1000mm, providing a broad spectrum of choices to meet your needs.
      </Accordion>

      <Accordion 
        title="What software are compatible with your 3d printers?"
        isOpen = {openedAccordion === "What software are compatible with your 3d printers?"}
        onTitleClick={handleAccordionClick}
      >
      Our slicing software, Mekuva Slicer, is the officially supported tool for generating gcodes tailored to our printers. 
      While you have the option to use other slicers, please note that we do not offer support for any alternatives.
      </Accordion>
    </Wrapper>
    </Container>
  );
}

const Wrapper = styled.div`
  margin: 0 auto;
  max-width: 1200px;
  padding: 0 20px;

  & > *:not(:first-child) {
    margin-top: 3rem;
  }
`;
