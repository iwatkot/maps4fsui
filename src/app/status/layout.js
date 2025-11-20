export const metadata = {
  title: "Server Status - Maps4FS",
  description: "Check the real-time status of Maps4FS backend servers and monitor map generation queue. View server health, processing status, and system availability for Farming Simulator map generation.",
  keywords: [
    "maps4fs status",
    "server status",
    "backend health",
    "queue status",
    "map generation status",
    "system availability",
    "server monitoring",
    "maps4fs uptime"
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
    url: "https://maps4fs.xyz/status",
    title: "Server Status - Maps4FS",
    description: "Check the real-time status of Maps4FS backend servers and monitor map generation queue. View server health and system availability.",
    siteName: "Maps4FS",
    images: [
      {
        url: "https://maps4fs.xyz/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Maps4FS Server Status",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Server Status - Maps4FS",
    description: "Check the real-time status of Maps4FS backend servers and monitor map generation queue.",
    images: ["https://maps4fs.xyz/og-image.jpg"],
    creator: "@iwatkot",
  },
  alternates: {
    canonical: "https://maps4fs.xyz/status",
  },
  other: {
    "theme-color": "#22c55e",
  },
};

export default function StatusLayout({ children }) {
  return children;
}
