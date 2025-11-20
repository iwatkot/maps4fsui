import Script from 'next/script'

export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Maps4FS",
    "alternateName": "Maps4FS - Farming Simulator Map Generator",
    "description": "Create authentic Farming Simulator 22 & 25 map templates from real-world terrain data. Automatically generates fields, farmlands, forests, water planes, roads, and realistic height maps using OpenStreetMap and different DTM providers.",
    "url": "https://maps4fs.xyz",
    "sameAs": [
      "https://github.com/iwatkot/maps4fs",
      "https://discord.gg/wemVfUUFRA",
      "https://patreon.com/iwatkot",
      "https://buymeacoffee.com/iwatkot"
    ],
    "applicationCategory": "GameApplication",
    "operatingSystem": "Web Browser",
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
    "publisher": {
      "@type": "Organization",
      "name": "Maps4FS",
      "url": "https://maps4fs.xyz"
    },
    "keywords": [
      "farming simulator",
      "map generator",
      "real terrain",
      "farming simulator 22",
      "farming simulator 25", 
      "openstreetmap",
      "height map",
      "srtm",
      "giants editor",
      "free map generator"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "103",
      "bestRating": "5"
    },
    "featureList": [
      "Real-world terrain generation",
      "Automatic field generation", 
      "Forest and water plane creation",
      "Support for 2x2, 4x4, 8x8, 16x16 km maps",
      "OpenStreetMap data integration",
      "SRTM elevation data",
      "Custom scaling and rotation",
      "Giants Editor compatibility",
      "Background terrain generation",
      "Satellite image integration"
    ]
  };

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}
