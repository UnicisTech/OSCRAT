import { useEffect } from 'react';
import { init } from '@socialgouv/matomo-next';
import env from '@/lib/env';

// The SDK registers router listeners, so initialize it once per page load.
let initialized = false;

export default function MatomoAnalytics() {
  useEffect(() => {
    if (
      initialized ||
      !env.matomo.enabled ||
      !env.matomo.url ||
      !env.matomo.siteId
    ) {
      return;
    }

    init({
      url: env.matomo.url.replace(/\/+$/, ''),
      siteId: env.matomo.siteId,
    });
    initialized = true;
  }, []);

  return null;
}
