import { env } from '$env/dynamic/public';
import { fetchLandingDisenoWebAlcoy } from '$lib/server/fetch-landing-alcoy';
import { fetchLandingDisenoWeb } from '$lib/server/fetch-landing-diseno-web';
import { fetchLandingSupportArticles } from '$lib/server/fetch-landing-support-articles';
import type { LandingDisenoWebAlcoy } from '$lib/types/landing-alcoy';
import type { RequestHandler } from './$types';

const DEFAULT_SITE_URL = 'http://localhost:5173';

const normalizeBaseUrl = (url: string | undefined): string => {
  try {
    const parsed = new URL((url ?? '').trim() || DEFAULT_SITE_URL);
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return new URL(DEFAULT_SITE_URL).toString().replace(/\/$/, '');
  }
};

const stripHtml = (input: string): string =>
  input
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\/p\s*>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const renderLanding = (label: string, url: string, landing: LandingDisenoWebAlcoy): string => {
  const lines: string[] = [];
  lines.push(`# ${label}`);
  lines.push(`URL: ${url}`);
  lines.push('');
  lines.push(`## Hero`);
  lines.push(`${landing.hero.badge}`);
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
    lines.push(`## Entidad (LocalBusiness)`);
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
};

export const GET: RequestHandler = async () => {
  const baseUrl = normalizeBaseUrl(env.PUBLIC_SITE_URL);

  const [alcoy, disenoWeb, articles] = await Promise.all([
    fetchLandingDisenoWebAlcoy().catch(() => null),
    fetchLandingDisenoWeb().catch(() => null),
    fetchLandingSupportArticles().catch(() => [])
  ]);

  const sections: string[] = [];

  sections.push(
    [
      '# moisesvalero.es — Contenido completo para LLMs',
      '',
      '> Volcado en Markdown de las páginas principales para que asistentes IA y buscadores generativos puedan citar el sitio sin parsear HTML.',
      `> Última generación: ${new Date().toISOString()}`,
      `> Sitio: ${baseUrl}`,
      ''
    ].join('\n')
  );

  if (disenoWeb) {
    sections.push(renderLanding('Diseño web profesional (nacional)', `${baseUrl}/diseno-web`, disenoWeb));
  }
  if (alcoy) {
    sections.push(renderLanding('Diseño web en Alcoy', `${baseUrl}/diseno-web-alcoy`, alcoy));
  }

  if (articles.length) {
    const articleLines: string[] = ['# Artículos de apoyo'];
    for (const article of articles) {
      articleLines.push('');
      articleLines.push(`## ${article.title}`);
      articleLines.push(`URL: ${baseUrl}/diseno-web-alcoy/${article.slug}`);
      if (article.publishedAt) articleLines.push(`Publicado: ${article.publishedAt}`);
      if (article.excerpt) articleLines.push('');
      if (article.excerpt) articleLines.push(stripHtml(article.excerpt));
    }
    sections.push(articleLines.join('\n'));
  }

  sections.push(
    [
      '# Contacto',
      '',
      `- Formulario: ${baseUrl}/#contacto`,
      `- WhatsApp: ${baseUrl}/api/contact/whatsapp`,
      '- Email: info@moisesvalero.es',
      ''
    ].join('\n')
  );

  const body = sections.join('\n\n---\n\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'max-age=0, s-maxage=3600'
    }
  });
};
