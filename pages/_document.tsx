import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
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
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#374151" />
        
        {/* PWA Icons */}
        <link rel="icon" type="image/svg+xml" href="/icon-192x192.svg" />
        <link rel="apple-touch-icon" href="/icon-192x192.svg" />
        
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Fast Track Wash" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Fast Track Wash" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#374151" />
        
        {/* Viewport for mobile optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no, viewport-fit=cover" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}