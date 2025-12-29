import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product' | 'service';
  noIndex?: boolean;
}

const defaultMeta = {
  title: 'Pixelpalast | Photo Booth & 360° Video Booth für Events',
  description: 'Pixelpalast bietet professionelle Photo Booth, 360° Video Booth und Audio Gästebuch Services für Hochzeiten, Firmenevents und private Feiern in ganz Österreich.',
  keywords: 'Photo Booth, Fotobox, 360 Video Booth, Audio Gästebuch, Hochzeit, Firmenevent, Wien, Österreich, Event, Party',
  image: '/og-image.jpg',
  url: 'https://pixelpalast.at',
};

export function SEO({
  title,
  description = defaultMeta.description,
  keywords = defaultMeta.keywords,
  image = defaultMeta.image,
  url = defaultMeta.url,
  type = 'website',
  noIndex = false,
}: SEOProps) {
  const fullTitle = title 
    ? `${title} | Pixelpalast` 
    : defaultMeta.title;

  // Local Business Schema
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://pixelpalast.at/#business',
    name: 'Pixelpalast',
    description: 'Professionelle Photo Booth, 360° Video Booth und Audio Gästebuch Services für Events',
    url: 'https://pixelpalast.at',
    telephone: '+436602545493',
    email: 'office@pixelpalast.at',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Wildstraße 5',
      addressLocality: 'Korneuburg',
      postalCode: '2100',
      addressCountry: 'AT',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 48.3448,
      longitude: 16.3271,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Austria',
    },
    priceRange: '€€',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    sameAs: [
      'https://instagram.com/pixelpalast',
      'https://facebook.com/pixelpalast',
    ],
  };

  // Service Schema
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    provider: {
      '@type': 'LocalBusiness',
      name: 'Pixelpalast',
    },
    serviceType: 'Event Photography Services',
    areaServed: 'Austria',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Photo Booth Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Photo Booth',
            description: 'Klassische Fotobox mit Sofortdruck und digitaler Galerie',
          },
          priceSpecification: {
            '@type': 'PriceSpecification',
            price: '390',
            priceCurrency: 'EUR',
            minPrice: '390',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: '360° Video Booth',
            description: 'Spektakuläre 360-Grad-Videos mit Slow-Motion-Effekten',
          },
          priceSpecification: {
            '@type': 'PriceSpecification',
            price: '490',
            priceCurrency: 'EUR',
            minPrice: '490',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Audio Gästebuch',
            description: 'Persönliche Sprachnachrichten Ihrer Gäste',
          },
          priceSpecification: {
            '@type': 'PriceSpecification',
            price: '290',
            priceCurrency: 'EUR',
          },
        },
      ],
    },
  };

  // Website Schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Pixelpalast',
    url: 'https://pixelpalast.at',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://pixelpalast.at/suche?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://pixelpalast.at',
      },
    ],
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />
      
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Pixelpalast" />
      <meta property="og:locale" content="de_AT" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="author" content="Pixelpalast" />
      <meta name="geo.region" content="AT-3" />
      <meta name="geo.placename" content="Korneuburg" />
      <meta name="geo.position" content="48.3448;16.3271" />
      <meta name="ICBM" content="48.3448, 16.3271" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(localBusinessSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(serviceSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
    </Helmet>
  );
}

// FAQ Schema helper
export function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}
