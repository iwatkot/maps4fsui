export const metadata = {
  title: "User Survey - Maps4FS",
  description: "Share your feedback and help improve Maps4FS. Quick survey about your experience with the Farming Simulator map generator. Your input helps shape future features and improvements.",
  keywords: [
    "maps4fs survey",
    "user feedback",
    "maps4fs feedback",
    "farming simulator feedback",
    "map generator survey",
    "user experience"
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
    url: "https://maps4fs.xyz/survey",
    title: "User Survey - Maps4FS",
    description: "Share your feedback and help improve Maps4FS. Quick survey about your experience with the Farming Simulator map generator.",
    siteName: "Maps4FS",
    images: [
      {
        url: "https://maps4fs.xyz/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Maps4FS User Survey",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "User Survey - Maps4FS",
    description: "Share your feedback and help improve Maps4FS. Quick survey about your experience with the Farming Simulator map generator.",
    images: ["https://maps4fs.xyz/og-image.jpg"],
    creator: "@iwatkot",
  },
  alternates: {
    canonical: "https://maps4fs.xyz/survey",
  },
  other: {
    "theme-color": "#22c55e",
  },
};

export default function SurveyLayout({ children }) {
  return children;
}
