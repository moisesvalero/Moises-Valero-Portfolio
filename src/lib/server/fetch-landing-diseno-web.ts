import { env as publicEnv } from '$env/dynamic/public';
import { landingDisenoWebDefaults } from '$lib/data/landing-diseno-web-defaults';
import type { LandingDisenoWebAlcoy } from '$lib/types/landing-alcoy';
import { getSanityProjectConfig, getSanityServerClient } from './sanity/get-server-client';
import { landingDisenoWebByIdQuery } from './sanity/groq-landing-alcoy';
import { mapLandingDisenoWebAlcoy } from './sanity/map-landing-alcoy';

function defaultBaseUrl(): string {
  return new URL(publicEnv.PUBLIC_SITE_URL || 'https://moisesvalero.es').toString().replace(/\/$/, '');
}

export async function fetchLandingDisenoWeb(): Promise<LandingDisenoWebAlcoy> {
  const baseUrl = defaultBaseUrl();
  const client = getSanityServerClient();
  const cfg = getSanityProjectConfig();
  if (!client || !cfg) {
    return mapLandingDisenoWebAlcoy(null, landingDisenoWebDefaults, {
      projectId: '',
      dataset: '',
      baseUrl
    });
  }

  try {
    const raw = await client.fetch<Record<string, unknown> | null>(landingDisenoWebByIdQuery, {
      documentId: 'landingDisenoWeb'
    });
    return mapLandingDisenoWebAlcoy(raw, landingDisenoWebDefaults, {
      projectId: cfg.projectId,
      dataset: cfg.dataset,
      baseUrl
    });
  } catch (error) {
    console.warn('[landing-diseno-web] Sanity unavailable, using local defaults.', error);
    return mapLandingDisenoWebAlcoy(null, landingDisenoWebDefaults, {
      projectId: cfg.projectId,
      dataset: cfg.dataset,
      baseUrl
    });
  }
}
