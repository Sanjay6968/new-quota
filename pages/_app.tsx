import 'swiper/css';
import 'swiper/css/bundle';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';

import { TrackingHeadScript } from "@phntms/next-gtm";
import { AppProps } from 'next/dist/shared/lib/router/router';
import dynamic from 'next/dynamic';
import { Poppins } from 'next/font/google';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { DefaultSeo } from 'next-seo';
import { ColorModeScript } from 'nextjs-color-mode';
import React, { PropsWithChildren } from 'react';

import Footer from '@/components/Footer';
import { GlobalStyle } from '@/components/GlobalStyles';
import Navbar from '@/components/Navbar';
import NavigationDrawer from '@/components/NavigationDrawer';
import WaveCta from '@/components/WaveCta';
import { NavItems } from '@/types';
import SEO from '../next-seo.config';

const poppins = Poppins({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
});

// TinaCMS import removed
// const TinaCMS = dynamic(() => import('tinacms'), { ssr: false });

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID || "";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const accessToken = localStorage.getItem('accessToken');
      setIsAuthenticated(!!accessToken);
    };

    checkAuth();

    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [router.pathname]);

  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.dispatchEvent(new Event('storage'));
    setIsAuthenticated(false);
    router.push('/dashboard/sign-in');
  };

  const navItems: NavItems = [
    { title: 'Gallery', href: 'https://mekuva.com/gallery' },
    { title: 'Contact', href: 'https://mekuva.com/contact' },
    { title: 'Track Order', href: '/tracking', target: '_blank' },
    { title: 'Order History', href: '/order-history' },
    isAuthenticated
      ? {
          title: 'Sign Out',
          href: '/dashboard/sign-in',
          onClick: handleSignOut,
          bordered: true,
        }
      : {
          title: 'Sign In',
          href: '/dashboard/sign-in',
          bordered: true,
        },
    {
      title: 'STORE',
      href: 'https://store.mekuva.com',
      outlined: true,
      target: '_blank',
    },
  ];

  const excludedRoutes = [
    '/dashboard/sign-in',
    '/dashboard/sign-up',
    '/dashboard/forgot-password',
  ];

  const isExcludedRoute = excludedRoutes.includes(router.pathname);

  return (
    <>
      <main className={poppins.className}>
        <Head>
          <link rel="icon" href="/favicon.png" sizes="any" />
        </Head>
        <ColorModeScript />
        <GlobalStyle />
        <TrackingHeadScript id={GA_TRACKING_ID} isGTM={true} />
        <DefaultSeo {...SEO} />
        <Providers navItems={navItems}>
          {!isExcludedRoute && <Navbar items={navItems} />}

          {/* Tina CMS is disabled below */}
          {/* 
          <TinaEditProvider
            editMode={
              <TinaCMS
                query={pageProps.query}
                variables={pageProps.variables}
                data={pageProps.data}
                isLocalClient={!process.env.NEXT_PUBLIC_TINA_CLIENT_ID}
                branch={process.env.NEXT_PUBLIC_EDIT_BRANCH}
                clientId={process.env.NEXT_PUBLIC_TINA_CLIENT_ID}
                {...pageProps}
              >
                {(livePageProps: any) => <Component {...livePageProps} />}
              </TinaCMS>
            }
          >
            <Component {...pageProps} />
          </TinaEditProvider>
          */}

          {/* Use standard render since Tina is not used */}
          <Component {...pageProps} />

          {!isExcludedRoute && <WaveCta />}
          {!isExcludedRoute && <Footer />}
        </Providers>
      </main>
    </>
  );
}

function Providers<T>({ children, navItems }: PropsWithChildren<T> & { navItems: NavItems }) {
  return <NavigationDrawer items={navItems}>{children}</NavigationDrawer>;
}

export default MyApp;
