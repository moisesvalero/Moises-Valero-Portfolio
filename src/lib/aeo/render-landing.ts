import type { LandingDisenoWebAlcoy } from '$lib/types/landing-alcoy';

export function renderLandingMarkdown(label: string, url: string, landing: LandingDisenoWebAlcoy): string {
	const lines: string[] = [];
	lines.push(`# ${label}`);
	lines.push(`URL: ${url}`);
	lines.push('');
	lines.push('## Hero');
	lines.push(landing.hero.badge);
	lines.push(`### ${landing.hero.title}`);
	lines.push(landing.hero.subtitle);
	if (landing.hero.visualTitle) lines.push(`> ${landing.hero.visualTitle}`);
	if (landing.hero.visualDescription) lines.push(landing.hero.visualDescription);
	lines.push('');
	lines.push(`## ${landing.services.heading}`);
	for (const s of landing.services.items) {
		lines.push(`### ${s.title}${s.priceFrom ? ` — desde ${s.priceFrom}` : ''}`);
		if (s.subtitle) lines.push(`*${s.subtitle}*`);
		lines.push(s.summary);
		if (s.delivery) lines.push(`Entrega: ${s.delivery}`);
		if (s.details?.length) {
			for (const d of s.details) lines.push(`- ${d}`);
		}
		if (s.note) lines.push(`> ${s.note}`);
		lines.push('');
	}
	if (landing.maintenance?.items?.length) {
		lines.push(`## ${landing.maintenance.heading}`);
		lines.push(landing.maintenance.lead);
		for (const m of landing.maintenance.items) {
			lines.push(`### ${m.title} — ${m.price}`);
			lines.push(m.detail);
			if (m.checklist?.length) {
				for (const c of m.checklist) lines.push(`- ${c}`);
			}
			if (m.note) lines.push(`> ${m.note}`);
			lines.push('');
		}
	}
	if (landing.benefits?.items?.length) {
		lines.push(`## ${landing.benefits.heading}`);
		for (const b of landing.benefits.items) {
			lines.push(`### ${b.title}`);
			lines.push(b.description);
			lines.push('');
		}
	}
	if (landing.faq?.items?.length) {
		lines.push(`## ${landing.faq.heading}`);
		for (const q of landing.faq.items) {
			lines.push(`### ${q.question}`);
			lines.push(q.answer);
			lines.push('');
		}
	}
	lines.push(`## ${landing.finalCta.heading}`);
	lines.push(landing.finalCta.text);
	lines.push(`CTA: ${landing.finalCta.cta.label} — ${landing.finalCta.cta.href}`);
	if (landing.localBusiness) {
		lines.push('');
		lines.push('## Entidad (LocalBusiness)');
		lines.push(`- Nombre: ${landing.localBusiness.businessName}`);
		lines.push(`- Servicio: ${landing.localBusiness.serviceType}`);
		lines.push(`- Zona: ${landing.localBusiness.areaServed.join(', ')}`);
		lines.push(
			`- Dirección: ${landing.localBusiness.addressLocality}, ${landing.localBusiness.addressRegion} (${landing.localBusiness.addressCountry})`
		);
		if (landing.localBusiness.telephone) lines.push(`- Teléfono: ${landing.localBusiness.telephone}`);
		if (landing.localBusiness.email) lines.push(`- Email: ${landing.localBusiness.email}`);
	}
	return lines.join('\n');
}
