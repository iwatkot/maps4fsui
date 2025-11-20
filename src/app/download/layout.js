export const metadata = {
  title: "Download Windows App - Maps4FS",
  description: "Download the standalone Windows application for Maps4FS. Run the map generator locally on your machine with full offline access to all features. No installation required - portable executable for Farming Simulator 22 & 25 map creation.",
  keywords: [
    "maps4fs download",
    "maps4fs windows app",
    "farming simulator map generator download",
    "offline map generator",
    "portable app",
    "maps4fs standalone",
    "windows application",
    "farming simulator 22 download",
    "farming simulator 25 download",
    "map generation tool"
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
    url: "https://maps4fs.xyz/download",
    title: "Download Windows App - Maps4FS",
    description: "Download the standalone Windows application for Maps4FS. Run the map generator locally with full offline access. No installation required - portable executable.",
    siteName: "Maps4FS",
    images: [
      {
        url: "https://maps4fs.xyz/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Download Maps4FS Windows App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Download Windows App - Maps4FS",
    description: "Download the standalone Windows application for Maps4FS. Run the map generator locally with full offline access. No installation required.",
    images: ["https://maps4fs.xyz/og-image.jpg"],
    creator: "@iwatkot",
  },
  alternates: {
    canonical: "https://maps4fs.xyz/download",
  },
  other: {
    "theme-color": "#22c55e",
  },
};

export default function DownloadLayout({ children }) {
  return children;
}
