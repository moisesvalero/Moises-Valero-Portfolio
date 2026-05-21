import { defineField, defineType } from 'sanity';

export const landingSupportArticle = defineType({
  name: 'landingSupportArticle',
  title: 'Articulo del blog',
  type: 'document',
  initialValue: {
    categoryLabel: 'Guia tecnica',
    publishedAt: new Date().toISOString(),
    showOnBlog: false
  },
  groups: [
    { name: 'editorial', title: 'Editorial', default: true },
    { name: 'content', title: 'Contenido' },
    { name: 'featured', title: 'Destacados' },
    { name: 'seo', title: 'SEO' },
    { name: 'cta', title: 'CTA' }
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Titulo',
      description: 'Encabezado principal del articulo.',
      validation: (rule) => rule.required().min(20).max(90),
      group: 'editorial'
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      description: 'Genera la URL: /blog/[slug]',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
      group: 'editorial'
    }),
    defineField({
      name: 'categoryLabel',
      type: 'string',
      title: 'Etiqueta superior',
      initialValue: 'Guia tecnica',
      group: 'editorial'
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
      rows: 3,
      title: 'Resumen corto',
      description: 'Se usa para introduccion y metadatos.',
      validation: (rule) => rule.required().min(80).max(220),
      group: 'editorial'
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      title: 'Fecha de publicacion',
      validation: (rule) => rule.required(),
      group: 'editorial'
    }),
    defineField({
      name: 'readingMinutes',
      type: 'number',
      title: 'Tiempo lectura (min)',
      initialValue: 4,
      validation: (rule) => rule.min(1).max(30),
      group: 'editorial'
    }),
    defineField({
      name: 'showOnBlog',
      type: 'boolean',
      title: 'Recomendar en /blog',
      description: 'Muestra este articulo en el bloque "Guias recomendadas" de la portada del blog.',
      initialValue: false,
      group: 'featured'
    }),
    defineField({
      name: 'featuredOrder',
      type: 'number',
      title: 'Orden recomendado',
      description:
        'Opcional. Numeros mas bajos salen antes en las guias recomendadas. Si lo dejas vacio, se ordena por fecha de publicacion.',
      validation: (rule) => rule.min(0).integer(),
      group: 'featured'
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Imagen portada (subida en Sanity)',
      options: { hotspot: true },
      group: 'content'
    }),
    defineField({
      name: 'coverImageSrc',
      type: 'string',
      title: 'Imagen portada (ruta o URL)',
      description: 'Fallback opcional si no subes imagen en Sanity.',
      group: 'content'
    }),
    defineField({
      name: 'coverImageAlt',
      type: 'string',
      title: 'Alt de la portada',
      group: 'content'
    }),
    defineField({
      name: 'bodyHtml',
      type: 'text',
      title: 'Contenido (HTML)',
      rows: 24,
      description: 'Usa HTML simple (<h2>, <p>, <ul>, <strong>).',
      validation: (rule) => rule.required().min(300),
      group: 'content'
    }),
    defineField({
      name: 'ctaTitle',
      type: 'string',
      title: 'Titulo CTA final',
      initialValue: 'Quieres mejorar tu web en Alcoy?',
      group: 'cta'
    }),
    defineField({
      name: 'ctaText',
      type: 'text',
      rows: 2,
      title: 'Texto CTA final',
      initialValue: 'Te ayudo a acelerar tu web, reforzar seguridad y mejorar conversion local.',
      group: 'cta'
    }),
    defineField({
      name: 'ctaPrimaryLabel',
      type: 'string',
      title: 'Texto boton principal',
      initialValue: 'Pedir una revision',
      group: 'cta'
    }),
    defineField({
      name: 'ctaPrimaryHref',
      type: 'string',
      title: 'URL boton principal',
      initialValue: '/api/contact/whatsapp',
      group: 'cta'
    }),
    defineField({
      name: 'ctaSecondaryLabel',
      type: 'string',
      title: 'Texto boton secundario',
      initialValue: 'Volver a la web',
      group: 'cta'
    }),
    defineField({
      name: 'ctaSecondaryHref',
      type: 'string',
      title: 'URL boton secundario',
      initialValue: '/diseno-web-alcoy',
      group: 'cta'
    }),
    defineField({
      name: 'seoTitle',
      type: 'string',
      title: 'SEO title',
      description: 'Si lo dejas vacio, se usa el titulo del articulo.',
      validation: (rule) => rule.max(70),
      group: 'seo'
    }),
    defineField({
      name: 'seoDescription',
      type: 'text',
      title: 'SEO description',
      rows: 3,
      description: 'Si lo dejas vacio, se usa el resumen.',
      validation: (rule) => rule.max(170),
      group: 'seo'
    })
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
      publishedAt: 'publishedAt',
      showOnBlog: 'showOnBlog'
    },
    prepare: ({ title, slug, publishedAt, showOnBlog }) => ({
      title: title || 'Articulo del blog',
      subtitle: `${slug ? `/blog/${slug}` : ''}${publishedAt ? ` - ${publishedAt.slice(0, 10)}` : ''}${
        showOnBlog === true ? ' - Recomendado en blog' : ''
      }`
    })
  }
});
