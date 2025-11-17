import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StructuredData from "../components/StructuredData";
import SecurityWarningWrapper from "../components/SecurityWarningWrapper";
import WelcomeTooltip from "../components/WelcomeTooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Maps4FS - Generate Realistic Farming Simulator Maps from Real Places",
  description: "Create authentic Farming Simulator 22 & 25 map templates from real-world terrain data. Automatically generates fields, farmlands, forests, water planes, roads, and realistic height maps using OpenStreetMap and SRTM datasets. Supports 2x2, 4x4, 8x8, 16x16 km maps with custom scaling and rotation. Free, open-source tool with 100+ GitHub stars.",
  keywords: [
    "farming simulator",
    "map generator",
    "real terrain",
    "farming simulator 22",
    "farming simulator 25",
    "openstreetmap",
    "height map",
    "srtm",
    "map templates",
    "giants editor",
    "free map generator",
    "farming simulator maps",
    "realistic terrain",
    "satellite images",
    "procedural generation"
  ].join(", "),
  authors: [{ name: "iwatkot", url: "https://github.com/iwatkot" }],
  creator: "iwatkot",
  publisher: "Maps4FS",
  category: "Gaming Tools",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://maps4fs.xyz",
    title: "Maps4FS - Generate Realistic Farming Simulator Maps from Real Places",
    description: "Create authentic Farming Simulator 22 & 25 map templates from real-world terrain data. Automatically generates fields, farmlands, forests, water planes, roads, and realistic height maps using OpenStreetMap and SRTM datasets. Supports 2x2, 4x4, 8x8, 16x16 km maps with custom scaling and rotation. Free, open-source tool with 100+ GitHub stars.",
    siteName: "Maps4FS",
    images: [
      {
        url: "https://maps4fs.xyz/og-image.png",
        width: 1200,
        height: 630,
        alt: "Maps4FS - Real-world map generator for Farming Simulator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maps4FS - Generate Realistic Farming Simulator Maps from Real Places",
    description: "Create authentic Farming Simulator 22 & 25 map templates from real-world terrain data. Free, open-source tool with automated field, forest, and terrain generation.",
    images: ["https://maps4fs.xyz/og-image.png"],
    creator: "@iwatkot",
  },
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: "https://maps4fs.xyz",
  },
  other: {
    "theme-color": "#22c55e",
    "color-scheme": "light dark",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Maps4FS",
    "application-name": "Maps4FS",
    "msapplication-TileColor": "#22c55e",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Material Design Iconic Font */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/material-design-iconic-font/2.2.0/css/material-design-iconic-font.min.css"
          integrity="sha512-rRQtF4V2wtAvXsou4iUAs2kXHi3Lj9NE7xJR77DE7GHsxgY9RTWy93dzMXgDIG8ToiRTD45VsDNdTiUagOFeZA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#22c55e" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StructuredData />
        <WelcomeTooltip />
        <SecurityWarningWrapper>
          {children}
        </SecurityWarningWrapper>
      </body>
    </html>
  );
}
