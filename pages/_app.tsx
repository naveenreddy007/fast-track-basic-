import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Head from 'next/head';

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { locale } = router;

  useEffect(() => {
    // Set document direction based on locale
    if (typeof document !== 'undefined') {
      document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = locale || 'en';
    }
  }, [locale]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#10b981" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Parallax Background */}
      <div className="parallax-bg">
        <div className="parallax-element"></div>
        <div className="parallax-element"></div>
        <div className="parallax-element"></div>
      </div>
      
      <Component {...pageProps} />
    </>
  );
}

export default appWithTranslation(App);