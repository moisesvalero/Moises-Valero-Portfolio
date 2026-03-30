import { createClient, type SanityClient } from '@sanity/client';
import { env } from '$env/dynamic/private';

const DEFAULT_API_VERSION = '2024-01-01';

/** Cliente de lectura en servidor; `null` si faltan `SANITY_PROJECT_ID` / `SANITY_DATASET`. */
export function getSanityServerClient(): SanityClient | null {
  const projectId = env.SANITY_PROJECT_ID?.trim();
  const dataset = env.SANITY_DATASET?.trim();
  if (!projectId || !dataset) {
    return null;
  }

  return createClient({
    projectId,
    dataset,
    apiVersion: env.SANITY_API_VERSION?.trim() || DEFAULT_API_VERSION,
    useCdn: true,
    token: env.SANITY_READ_TOKEN?.trim() || undefined,
    perspective: 'published'
  });
}

export function getSanityProjectConfig(): { projectId: string; dataset: string } | null {
  const projectId = env.SANITY_PROJECT_ID?.trim();
  const dataset = env.SANITY_DATASET?.trim();
  if (!projectId || !dataset) {
    return null;
  }
  return { projectId, dataset };
}

/** Cliente de escritura en servidor; `null` si faltan variables o token de escritura. */
export function getSanityWriteClient(): SanityClient | null {
  const projectId = env.SANITY_PROJECT_ID?.trim();
  const dataset = env.SANITY_DATASET?.trim();
  const writeToken = env.SANITY_WRITE_TOKEN?.trim();
  if (!projectId || !dataset || !writeToken) {
    return null;
  }

  return createClient({
    projectId,
    dataset,
    apiVersion: env.SANITY_API_VERSION?.trim() || DEFAULT_API_VERSION,
    useCdn: false,
    token: writeToken,
    perspective: 'published'
  });
}
