import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Tajawal:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="description" content="Premium car wash service in Kuwait - Fast Track Wash" />
        <meta name="keywords" content="car wash, Kuwait, mobile car wash, premium service, غسيل سيارات, الكويت" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Fast Track Wash - Premium Car Wash Service in Kuwait" />
        <meta property="og:description" content="Professional car washing service that comes to you. Experience the convenience of premium car care in Kuwait." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Fast Track Wash - Premium Car Wash Service in Kuwait" />
        <meta name="twitter:description" content="Professional car washing service that comes to you. Experience the convenience of premium car care in Kuwait." />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}