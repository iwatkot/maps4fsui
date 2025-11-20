export const metadata = {
  title: "Get Help - Maps4FS Support Center",
  description: "Get help with Maps4FS map generation issues. Interactive support form to report bugs, troubleshoot problems, and get assistance with Farming Simulator map creation. Step-by-step guide to resolve DTM provider issues, generation errors, and technical problems.",
  keywords: [
    "maps4fs help",
    "farming simulator support", 
    "map generation troubleshooting",
    "maps4fs issues",
    "farming simulator map problems",
    "DTM provider help",
    "SRTM support",
    "map generation errors",
    "technical support",
    "bug reports",
    "farming simulator 22 help",
    "farming simulator 25 help",
    "openstreetmap issues",
    "height map problems"
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
    url: "https://maps4fs.xyz/help",
    title: "Get Help - Maps4FS Support Center",
    description: "Get help with Maps4FS map generation issues. Interactive support form to report bugs, troubleshoot problems, and get assistance with Farming Simulator map creation.",
    siteName: "Maps4FS",
    images: [
      {
        url: "https://maps4fs.xyz/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Maps4FS Help Center - Get support for map generation issues",
      },
    ],
  },
  twitter: {
    card: "summary_large_image", 
    title: "Get Help - Maps4FS Support Center",
    description: "Get help with Maps4FS map generation issues. Interactive support form to report bugs and troubleshoot Farming Simulator map creation problems.",
    images: ["https://maps4fs.xyz/og-image.jpg"],
    creator: "@iwatkot",
  },
  alternates: {
    canonical: "https://maps4fs.xyz/help",
  },
  other: {
    "theme-color": "#22c55e",
  },
};

export default function HelpLayout({ children }) {
  return children;
}