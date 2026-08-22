import { useState, useEffect } from 'react';

export interface PublishedHomepageConfig {
  version: number;
  publishedAt: string | null;
  hero?: {
    title?: { text?: { AR?: string; FR?: string; EN?: string; ES?: string } };
    subtitle?: { text?: { AR?: string; FR?: string; EN?: string; ES?: string } };
  };
  theme?: {
    primaryColor?: string;
  };
}

export function usePublishedHomepage() {
  const [publishedConfig, setPublishedConfig] = useState<PublishedHomepageConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchPublishedConfig() {
      try {
        const response = await fetch('/api/v1/homepage/config');
        if (response.ok) {
          const data = await response.json();
          if (isMounted && data && data.publishedAt !== undefined) {
            setPublishedConfig(data);
          }
        }
      } catch (err) {
        console.warn('Public homepage config API unreachable; using default landing fallback.', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchPublishedConfig();
    return () => { isMounted = false; };
  }, []);

  return { publishedConfig, isLoading };
}
