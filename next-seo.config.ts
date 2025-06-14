import { DefaultSeoProps } from 'next-seo';

const config: DefaultSeoProps = {
  description: 'Mekuva Technologies is a leading manufacturer of industrial 3D printers and services.',
  defaultTitle: 'Mekuva Technologies',
  canonical: 'https://mekuva.com',
  additionalLinkTags: [
    {
        rel: 'icon',
        href: 'https://mekuva.com/favicon.png'
    },
  ],
  
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mekuva.com',
    title: 'Mekuva Technologies',
    siteName: 'Mekuva Technologies',
    description: 'Mekuva Technologies is a leading manufacturer of industrial 3D printers and services.',
    images: [
        {
          url: 'https://mekuva.com/favicon.png',
          width: 1330,
          height: 1330,
          alt: 'Mekuva Technologies',
        },
    ],
},
  twitter: {
    handle: '@MekuvaT',
    site: '@MekuvaT',
    cardType: 'summary_large_image',
  },
};

export default config;