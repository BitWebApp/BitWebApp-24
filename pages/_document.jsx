import { Html, Head, Main, NextScript } from "next/document";

const GA_ID = "G-7GZH64XV14";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          rel="icon"
          type="image/png"
          href="/static/images/Birla_Institute_of_Technology_Mesra.png"
        />

        {/* SEO Meta Tags */}
        <meta
          name="description"
          content="BITACADEMIA is the official academic portal of Birla Institute of Technology, Mesra. Find academic resources, course materials, and more."
        />
        <meta
          name="keywords"
          content="BIT Mesra, Birla Institute of Technology, BITACADEMIA, academic portal, course materials, academic resources"
        />
        <meta name="author" content="Birla Institute of Technology, Mesra" />

        {/* Open Graph Meta Tags for social media */}
        <meta
          property="og:title"
          content="BITACADEMIA - Birla Institute of Technology, Mesra"
        />
        <meta
          property="og:description"
          content="Explore BITACADEMIA, the academic portal of Birla Institute of Technology, Mesra, for all your academic needs."
        />
        <meta
          property="og:image"
          content="/static/images/Birla_Institute_of_Technology_Mesra.png"
        />
        <meta property="og:url" content="https://www.bitmesra.ac.in" />
        <meta property="og:type" content="website" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="BITACADEMIA - Birla Institute of Technology, Mesra"
        />
        <meta
          name="twitter:description"
          content="Visit BITACADEMIA for the latest academic resources from Birla Institute of Technology, Mesra."
        />
        <meta
          name="twitter:image"
          content="/static/images/Birla_Institute_of_Technology_Mesra.png"
        />

        {/* Google tag (gtag.js) */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
