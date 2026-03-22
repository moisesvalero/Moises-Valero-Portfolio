import { defineField, defineType } from 'sanity';

/** Plantilla `/proyectos/[slug]` — alineado con `$lib/types/case-study.ts` y GROQ en `groq.ts`. */
export const caseStudy = defineType({
  name: 'caseStudy',
  title: 'Case study (plantilla)',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string' }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required()
    }),
    defineField({ name: 'seoDescription', type: 'text', title: 'SEO description' }),
    defineField({ name: 'heroTag', type: 'string' }),
    defineField({ name: 'heroDescription', type: 'text' }),
    defineField({ name: 'tags', type: 'array', of: [{ type: 'string' }] }),
    defineField({
      name: 'images',
      type: 'object',
      fields: [
        { name: 'principal', type: 'url' },
        { name: 'secondary1', type: 'url' },
        { name: 'secondary2', type: 'url' }
      ]
    }),
    defineField({
      name: 'metrics',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'value', type: 'string' },
            { name: 'label', type: 'string' }
          ]
        }
      ]
    }),
    defineField({
      name: 'reto',
      type: 'object',
      fields: [
        { name: 'title', type: 'string' },
        { name: 'bodyHtml', type: 'text', rows: 6 }
      ]
    }),
    defineField({
      name: 'hice',
      type: 'object',
      fields: [
        { name: 'title', type: 'string' },
        { name: 'bodyHtml', type: 'text', rows: 6 }
      ]
    }),
    defineField({
      name: 'resultado',
      type: 'object',
      fields: [
        { name: 'title', type: 'string' },
        { name: 'bodyHtml', type: 'text', rows: 6 }
      ]
    }),
    defineField({ name: 'stack', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'liveUrl', type: 'url' })
  ],
  preview: {
    select: { t: 'title', s: 'slug.current' },
    prepare: ({ t, s }) => ({ title: t || 'Case study', subtitle: s ? `/${s}` : '' })
  }
});
