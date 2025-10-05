'use client';

export default function HelpStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://maps4fs.xyz/#organization",
        "name": "Maps4FS",
        "url": "https://maps4fs.xyz",
        "logo": {
          "@type": "ImageObject",
          "url": "https://maps4fs.xyz/og-image.png",
          "width": 1200,
          "height": 630
        },
        "description": "Free, open-source tool for generating realistic Farming Simulator maps from real-world terrain data",
        "sameAs": [
          "https://github.com/iwatkot/maps4fs",
          "https://discord.gg/Sj5QKKyE42",
          "https://www.youtube.com/@iwatkot"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://maps4fs.xyz/#website",
        "url": "https://maps4fs.xyz",
        "name": "Maps4FS",
        "description": "Generate realistic Farming Simulator maps from real places",
        "publisher": {
          "@id": "https://maps4fs.xyz/#organization"
        },
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://maps4fs.xyz/help?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        ]
      },
      {
        "@type": "WebPage",
        "@id": "https://maps4fs.xyz/help/#webpage",
        "url": "https://maps4fs.xyz/help",
        "name": "Get Help - Maps4FS Support Center",
        "isPartOf": {
          "@id": "https://maps4fs.xyz/#website"
        },
        "about": {
          "@id": "https://maps4fs.xyz/#organization"
        },
        "description": "Get help with Maps4FS map generation issues. Interactive support form to report bugs, troubleshoot problems, and get assistance with Farming Simulator map creation.",
        "breadcrumb": {
          "@id": "https://maps4fs.xyz/help/#breadcrumb"
        },
        "mainEntity": {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How do I report a Maps4FS issue?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Use our interactive help form to diagnose your issue. The system will guide you through troubleshooting steps and help generate a detailed report for our Discord support channel."
              }
            },
            {
              "@type": "Question", 
              "name": "What DTM providers are supported?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Maps4FS officially supports SRTM30 DTM provider. For other providers like ASTER or Copernicus, please contact the pydtmdl library authors directly."
              }
            },
            {
              "@type": "Question",
              "name": "What information do I need to provide when reporting issues?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "You'll need your map coordinates, map size, game version, Maps4FS version, and the contents of generation_info.json, main_settings.json, and generation_settings.json files from your map output folder."
              }
            }
          ]
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://maps4fs.xyz/help/#breadcrumb",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Maps4FS",
            "item": "https://maps4fs.xyz"
          },
          {
            "@type": "ListItem", 
            "position": 2,
            "name": "Get Help",
            "item": "https://maps4fs.xyz/help"
          }
        ]
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://maps4fs.xyz/#software",
        "name": "Maps4FS",
        "applicationCategory": "GameApplication",
        "description": "Generate realistic Farming Simulator maps from real-world terrain data using OpenStreetMap and SRTM datasets",
        "operatingSystem": "Windows, macOS, Linux",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "author": {
          "@type": "Person",
          "name": "iwatkot",
          "url": "https://github.com/iwatkot"
        },
        "supportUrl": "https://maps4fs.xyz/help",
        "installUrl": "https://maps4fs.gitbook.io/docs/setup-and-installation/local_deployment"
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}