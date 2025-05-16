import { Metadata } from "next";
import Script from "next/script";

// Define website URL for canonical links
const siteUrl = "https://imagetosketch.abhinandan.pro";

// Define SEO metadata for the protected routes
export const metadata: Metadata = {
  title: "ImageToSketch Pro - Advanced Sketch Editor",
  description: "Access our premium sketch editor with advanced customization options. Transform your photos into professional-quality sketches with precise control over style, detail, and effects.",
  keywords: ["image to sketch pro", "advanced sketch editor", "professional sketch converter", "premium photo to sketch", "custom sketch settings", "high-quality sketch generator"],
  alternates: {
    canonical: "/app",
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/app`,
    title: "ImageToSketch Pro - Advanced Sketch Editor",
    description: "Access our premium sketch editor with advanced customization options. Transform your photos into professional-quality sketches with precise control over style, detail, and effects.",
    images: [
      {
        url: `${siteUrl}/og-image-app.jpg`,
        width: 1200,
        height: 630,
        alt: "ImageToSketch Pro Editor",
      },
    ],
  },
};

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      
      {/* Structured data for the app section */}
      <Script id="app-structured-data" type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "ImageToSketch Pro Editor",
            "applicationCategory": "DesignApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": "Advanced sketch customization, Multiple sketch styles, Batch processing, High-resolution output",
            "screenshot": "${siteUrl}/app-screenshot.jpg"
          }
        `}
      </Script>
    </>
  );
}