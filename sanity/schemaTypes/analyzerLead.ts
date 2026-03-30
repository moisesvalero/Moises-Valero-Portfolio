import { defineField, defineType } from 'sanity';

export const analyzerLead = defineType({
  name: 'analyzerLead',
  title: 'Leads analizador web',
  type: 'document',
  fields: [
    defineField({ name: 'email', type: 'string', title: 'Email', validation: (rule) => rule.required() }),
    defineField({ name: 'url', type: 'url', title: 'URL analizada' }),
    defineField({ name: 'score', type: 'number', title: 'Score movil' }),
    defineField({
      name: 'severity',
      type: 'string',
      title: 'Severidad',
      options: { list: ['slow', 'needs_improvement', 'fast'] }
    }),
    defineField({ name: 'fcp', type: 'string', title: 'FCP' }),
    defineField({ name: 'lcp', type: 'string', title: 'LCP' }),
    defineField({ name: 'imageWeight', type: 'string', title: 'Peso total de imagenes' }),
    defineField({ name: 'pageWeight', type: 'string', title: 'Peso total de la pagina' }),
    defineField({ name: 'source', type: 'string', title: 'Origen', initialValue: 'landing-diseno-web-alcoy' }),
    defineField({ name: 'createdAt', type: 'datetime', title: 'Fecha de captura' })
  ],
  preview: {
    select: { title: 'email', subtitle: 'url', score: 'score' },
    prepare: ({ title, subtitle, score }) => ({
      title: title || 'Lead sin email',
      subtitle: `${subtitle || 'Sin URL'} · Score ${typeof score === 'number' ? score : '-'}`
    })
  }
});
