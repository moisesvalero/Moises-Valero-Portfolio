import { env as publicEnv } from '$env/dynamic/public';
import { landingAlcoyDefaults } from '$lib/data/landing-alcoy-defaults';
import type { LandingDisenoWebAlcoy } from '$lib/types/landing-alcoy';
import { getSanityProjectConfig, getSanityServerClient } from './sanity/get-server-client';
import { landingDisenoWebAlcoyQuery } from './sanity/groq-landing-alcoy';
import { mapLandingDisenoWebAlcoy } from './sanity/map-landing-alcoy';

function defaultBaseUrl(): string {
  return new URL(publicEnv.PUBLIC_SITE_URL || 'https://moisesvalero.es').toString().replace(/\/$/, '');
}

export async function fetchLandingDisenoWebAlcoy(): Promise<LandingDisenoWebAlcoy> {
  const baseUrl = defaultBaseUrl();
  const client = getSanityServerClient();
  const cfg = getSanityProjectConfig();
  if (!client || !cfg) {
    return mapLandingDisenoWebAlcoy(null, landingAlcoyDefaults, {
      projectId: '',
      dataset: '',
      baseUrl
    });
  }

  try {
    const raw = await client.fetch<Record<string, unknown> | null>(landingDisenoWebAlcoyQuery);
    return mapLandingDisenoWebAlcoy(raw, landingAlcoyDefaults, {
      projectId: cfg.projectId,
      dataset: cfg.dataset,
      baseUrl
    });
  } catch (error) {
    console.warn('[landing-alcoy] Sanity unavailable, using local defaults.', error);
    return mapLandingDisenoWebAlcoy(null, landingAlcoyDefaults, {
      projectId: cfg.projectId,
      dataset: cfg.dataset,
      baseUrl
    });
  }
}
