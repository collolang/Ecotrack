// src/components/SEO.jsx
// Reusable per-route SEO tag manager, built on react-helmet-async.
// Drop <SEO .../> at the top of any page component to control that
// route's <title>, meta description, canonical URL, and indexing.

import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'EcoTrack';
const SITE_URL = 'https://eco-frontend-eight.vercel.app'; 
const DEFAULT_DESCRIPTION =
  'EcoTrack helps small and medium businesses monitor, measure, and reduce their environmental impact with real-time Scope 1, 2 & 3 emissions tracking.';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

/**
 * @param {string} title - Page-specific title. Rendered as "Title — EcoTrack".
 * @param {string} [description] - Page-specific meta description (falls back to the site default).
 * @param {string} [path] - Route path used to build the canonical URL, e.g. "/" or "/auth".
 * @param {boolean} [noindex] - Set true for private/authenticated pages (dashboard, data entry, etc).
 * @param {object} [jsonLd] - Optional structured data object to inject as JSON-LD.
 */
export default function SEO({ title, description, path = '/', noindex = false, jsonLd }) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Carbon Footprint Tracker for SMEs`;
  const metaDescription = description || DEFAULT_DESCRIPTION;
  const canonical = `${SITE_URL}${path === '/' ? '' : path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={canonical} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={DEFAULT_IMAGE} />

      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={DEFAULT_IMAGE} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
https://github.com/collolang/Eco-Frontend