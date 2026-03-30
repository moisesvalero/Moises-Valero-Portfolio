import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => {
  const canal = url.searchParams.get('canal') || 'general';
  const origen = url.searchParams.get('origen') || 'web';
  return { canal, origen };
};
