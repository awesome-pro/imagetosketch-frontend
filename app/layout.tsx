import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FileUploadProvider } from "@/contexts/file-upload-context";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Optimize font loading
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // Optimize font loading
});

// Define website URL for canonical links
const siteUrl = "https://imagetosketch.abhinandan.pro";

// Define SEO metadata
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: "%s | ImageToSketch - Transform Photos into Artistic Sketches",
    default: "ImageToSketch - Transform Photos into Artistic Sketches with AI",
  },
  description: "Turn your ordinary photos into extraordinary pencil sketches with our advanced AI technology. Fast, simple, and stunning results in seconds.",
  keywords: ["image to sketch", "photo to sketch", "AI sketch converter", "pencil sketch from photo", "sketch generator", "artistic sketch", "photo transformation", "digital sketching", "AI art", "sketch filter"],
  authors: [{ name: "Abhinandan", url: "https://abhinandan.pro" }],
  creator: "Abhinandan",
  publisher: "ImageToSketch",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      'en-US': '/en-US',
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "ImageToSketch - Transform Photos into Artistic Sketches with AI",
    description: "Turn your ordinary photos into extraordinary pencil sketches with our advanced AI technology. Fast, simple, and stunning results in seconds.",
    siteName: "ImageToSketch",
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "ImageToSketch - Transform Photos into Artistic Sketches",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ImageToSketch - Transform Photos into Artistic Sketches with AI",
    description: "Turn your ordinary photos into extraordinary pencil sketches with our advanced AI technology. Fast, simple, and stunning results in seconds.",
    images: [`${siteUrl}/twitter-image.jpg`],
    creator: "@abhinandan",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification tokens here when available
    google: "google-site-verification-token",
    yandex: "yandex-verification-token",
  },
  category: "technology",
};

// Define viewport settings
export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#ffffff" }, { media: "(prefers-color-scheme: dark)", color: "#111111" }],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        {/* Preconnect to domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FileUploadProvider>
          {children}
        </FileUploadProvider>
        <Toaster />
        
        {/* Structured data for rich results */}
        <Script id="schema-structured-data" type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "ImageToSketch",
              "url": "${siteUrl}",
              "description": "Turn your ordinary photos into extraordinary pencil sketches with our advanced AI technology.",
              "applicationCategory": "MultimediaApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "creator": {
                "@type": "Person",
                "name": "Abhinandan"
              }
            }
          `}
        </Script>
        
        {/* Google Analytics can be added here */}
      </body>
    </html>
  );
}
