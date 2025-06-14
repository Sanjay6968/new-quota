import NextLink from 'next/link';
import { LinkedinIcon, XIcon, WhatsappIcon } from 'react-share';
import styled from 'styled-components';
import Container from '@/components/Container';
import { media } from '@/utils/media';

type SingleFooterListItem = { title: string; href: string };
type FooterListItems = SingleFooterListItem[];
type SingleFooterList = { title: string; items: FooterListItems };
type FooterItems = SingleFooterList[];

const footerItems: FooterItems = [
  {
    title: 'Company',
    items: [
      { title: 'About Us', href: '/about' },
      { title: 'Our Team', href: '/team' },
      { title: 'Careers', href: '/careers' },
      { title: 'Privacy Policy', href: '/privacy-policy' },
    ],
  },
  {
    title: 'Products',
    items: [
      { title: '3D Printers', href: '/products' },
      { title: 'Services', href: '/#services' },
      { title: 'Consumables', href: 'products#consumables' },
      { title: 'Spares and Accessories', href: 'products#spares' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { title: 'Academy', href: '/academy' },
      { title: 'Documentation', href: '/coming-soon' },
      { title: 'Downloads', href: '/downloads' },
      { title: 'GPL Compliance', href: 'https://github.com/mekuva' },
    ],
  },
  {
    title: 'Support',
    items: [
      { title: 'Blog', href: '/blog' },
      { title: 'Contact', href: '/contact' },
      { title: 'FAQ', href: '/#faq' },
      { title: 'Help Center', href: '/contact' },
    ],
  },
];

export default function Footer() {
  return (
    <FooterWrapper id="footer">
      <Container>
        <ListContainer>
          {footerItems.map((singleItem) => (
            <FooterList key={singleItem.title} {...singleItem} />
          ))}
        </ListContainer>
        <BottomBar>
          <ShareBar>
            <NextLink
              href="https://twitter.com/MekuvaT"
              passHref
              target="_blank"
              legacyBehavior>

              <XIcon size={50} round={true} />

            </NextLink>

            <NextLink
              href="https://wa.me/message/FKW2KRFHUOVRJ1"
              passHref
              target="_blank"
              legacyBehavior>

              <WhatsappIcon size={50} round={true} />

            </NextLink>

            <NextLink
              href="https://in.linkedin.com/company/mekuva-technologies"
              passHref
              target="_blank"
              legacyBehavior>

              <LinkedinIcon size={50} round={true} />

            </NextLink>
          </ShareBar>

          <Copyright>&copy; 2024 Mekuva Technologies</Copyright>
        </BottomBar>
      </Container>
    </FooterWrapper>
  );
}
/* Maps: Add in Footer after </ShareBar>
<iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3805.5685198136807!2d78.43067382883606!3d17.480354100000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb916b197c25e7%3A0x33d6db49c5737f06!2sMEKUVA%20Technologies%20(POD3D)%20%7C%20Manufacturer%20of%203D%20Printer%20in%20India%20%7C%203D%20Printing%20Services%20%7C%20CAD%20Product%20Design%20%7C%20Materials!5e0!3m2!1sen!2sin!4v1694119162792!5m2!1sen!2sin"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
*/

function FooterList({ title, items }: SingleFooterList) {
  return (
    <ListWrapper>
      <ListHeader>{title}</ListHeader>
      {items.map((singleItem) => (
        <ListItem key={singleItem.href} {...singleItem} />
      ))}
    </ListWrapper>
  );
}

function ListItem({ title, href }: SingleFooterListItem) {
  return (
    <ListItemWrapper>
      <NextLink href={href} passHref legacyBehavior>
        {title}
      </NextLink>
    </ListItemWrapper>
  );
}

const FooterWrapper = styled.div`
  padding-top: 10rem;
  padding-bottom: 4rem;
  background: rgb(var(--secondary));
  color: rgb(var(--textSecondary));
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const ListHeader = styled.p`
  font-weight: bold;
  font-size: 2.25rem;
  margin-bottom: 2.5rem;
`;

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 5rem;
  margin-right: 5rem;

  & > *:not(:first-child) {
    margin-top: 1rem;
  }

  ${media('<=tablet')} {
    flex: 0 40%;
    margin-right: 1.5rem;
  }

  ${media('<=phone')} {
    flex: 0 100%;
    margin-right: 0rem;
  }
`;

const ListItemWrapper = styled.p`
  font-size: 1.6rem;

  a {
    text-decoration: none;
    color: rgba(var(--textSecondary), 0.75);
  }
`;

const ShareBar = styled.div`
  & > *:not(:first-child) {
    margin-left: 1rem;
  }
`;

const Copyright = styled.p`
  font-size: 1.5rem;
  margin-top: 0.5rem;
`;

const BottomBar = styled.div`
  margin-top: 6rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${media('<=tablet')} {
    flex-direction: column;
  }
`;
