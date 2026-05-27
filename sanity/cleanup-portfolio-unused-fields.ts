import { getCliClient } from 'sanity/cli';

const client = getCliClient({ apiVersion: '2024-01-01' });
const DOC_ID = 'portfolioSite';

const unusedFields = [
	'checklistHome',
	'header.ctaLabel',
	'header.ctaHref',
	'services.title',
	'services.items',
	'techStack.categories',
	'quality',
	'contact.typebotSrc',
	'contact.iframeTitle',
	'contact.whatsappLead',
	'contact.whatsappButtonLabel',
	'contact.formLead',
	'contact.formButtonLabel'
];

await client.patch(DOC_ID).unset(unusedFields).commit();

console.log(`OK: cleaned ${unusedFields.length} unused portfolio fields from ${DOC_ID}`);
