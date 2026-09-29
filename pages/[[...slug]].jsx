import { StrictMode } from "react";
import dynamic from "next/dynamic";
import Head from "next/head";

// The UI is a react-router single page app, so it is rendered on the client
// only and Next.js serves it for every non-API route.
const App = dynamic(() => import("../src/App.jsx"), { ssr: false });

export default function SpaPage() {
  return (
    <>
      <Head>
        <title>BITACADEMIA - Birla Institute of Technology, Mesra</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <StrictMode>
        <App />
      </StrictMode>
    </>
  );
}
