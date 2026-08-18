import { useEffect } from 'react';

export interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath?: string; // e.g. '/' or '/journal' or '/journal/article-slug'
  ogType?: 'website' | 'article';
  publishedDate?: string;
  articleCategory?: string;
  breadcrumbs?: Array<{ name: string; path: string }>;
}

const DOMAIN = 'https://yallavtc.com';

export function SEOHead({
  title,
  description,
  canonicalPath = '/',
  ogType = 'website',
  publishedDate,
  articleCategory,
  breadcrumbs,
}: SEOHeadProps) {
  useEffect(() => {
    // 1. Update Title
    const fullTitle = title.includes('Yalla VTC') ? title : `${title} — Yalla VTC`;
    document.title = fullTitle;

    // Helper to set meta content
    const setMeta = (selector: string, content: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (selector.startsWith('meta[name=')) {
          const name = selector.match(/name="([^"]+)"/)?.[1];
          if (name) el.setAttribute('name', name);
        } else if (selector.startsWith('meta[property=')) {
          const property = selector.match(/property="([^"]+)"/)?.[1];
          if (property) el.setAttribute('property', property);
        }
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Meta Description
    setMeta('meta[name="description"]', description);

    // 3. Canonical Tag
    const canonicalUrl = `${DOMAIN}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 4. Open Graph Tags
    setMeta('meta[property="og:title"]', fullTitle);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:url"]', canonicalUrl);
    setMeta('meta[property="og:type"]', ogType);
    setMeta('meta[property="og:site_name"]', 'Yalla VTC');

    // Twitter Card Tags
    setMeta('meta[name="twitter:card"]', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', fullTitle);
    setMeta('meta[name="twitter:description"]', description);

    // 5. JSON-LD Structured Data
    const scriptsToRemove = document.querySelectorAll('script[data-seo-jsonld="true"]');
    scriptsToRemove.forEach((s) => s.remove());

    // Schema 1: BreadcrumbList
    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbListSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((b, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: b.name,
          item: `${DOMAIN}${b.path.startsWith('/') ? b.path : `/${b.path}`}`,
        })),
      };

      const scriptB = document.createElement('script');
      scriptB.type = 'application/ld+json';
      scriptB.setAttribute('data-seo-jsonld', 'true');
      scriptB.textContent = JSON.stringify(breadcrumbListSchema);
      document.head.appendChild(scriptB);
    }

    // Schema 2: Article Schema
    if (ogType === 'article') {
      const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description: description,
        url: canonicalUrl,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Yalla VTC',
          url: DOMAIN,
          logo: {
            '@type': 'ImageObject',
            url: `${DOMAIN}/favicon.svg`,
          },
        },
        ...(publishedDate ? { datePublished: publishedDate } : {}),
        ...(articleCategory ? { articleSection: articleCategory } : {}),
      };

      const scriptA = document.createElement('script');
      scriptA.type = 'application/ld+json';
      scriptA.setAttribute('data-seo-jsonld', 'true');
      scriptA.textContent = JSON.stringify(articleSchema);
      document.head.appendChild(scriptA);
    }
  }, [title, description, canonicalPath, ogType, publishedDate, articleCategory, breadcrumbs]);

  return null;
}
