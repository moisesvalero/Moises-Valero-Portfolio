import { getCliClient } from 'sanity/cli';

const client = getCliClient({ apiVersion: '2024-01-01' });
const DOC_ID = 'portfolioSite';

const fields = [
  ['checklistHome'],
  ['header', 'ctaLabel'],
  ['header', 'ctaHref'],
  ['services', 'title'],
  ['services', 'items'],
  ['techStack', 'categories'],
  ['quality'],
  ['contact', 'typebotSrc'],
  ['contact', 'iframeTitle'],
  ['contact', 'whatsappLead'],
  ['contact', 'whatsappButtonLabel'],
  ['contact', 'formLead'],
  ['contact', 'formButtonLabel']
];

const doc = await client.fetch<Record<string, unknown> | null>('*[_id == $id][0]', { id: DOC_ID });

const hasPath = (source: unknown, path: string[]) => {
  let current = source;
  for (const key of path) {
    if (!current || typeof current !== 'object' || !(key in current)) return false;
    current = (current as Record<string, unknown>)[key];
  }
  return true;
};

const remaining = fields.filter((path) => hasPath(doc, path)).map((path) => path.join('.'));

if (remaining.length) {
  console.log(`Remaining unused fields: ${remaining.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log('OK: no audited unused portfolio fields remain in production');
}
