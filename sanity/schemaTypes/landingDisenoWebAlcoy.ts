import { defineField, defineType } from 'sanity';

const ctaFields = [
  defineField({ name: 'label', type: 'string', title: 'Texto del boton', validation: (rule) => rule.required() }),
  defineField({
    name: 'href',
    type: 'string',
    title: 'Enlace del boton',
    description: 'Acepta rutas relativas (/contacto, /#contacto) o URL absoluta (https://...).',
    validation: (rule) => rule.required()
  }),
  defineField({ name: 'secondaryLabel', type: 'string', title: 'Texto boton secundario (opcional)' }),
  defineField({
    name: 'secondaryHref',
    type: 'string',
    title: 'Enlace boton secundario (opcional)',
    description: 'Acepta rutas relativas o URL absoluta.'
  })
];

export const landingDisenoWebAlcoy = defineType({
  name: 'landingDisenoWebAlcoy',
  title: 'Landing SEO - Diseño web en Alcoy',
  type: 'document',
  initialValue: {
    internalTitle: 'Landing Diseño web en Alcoy',
    sectionOrder: ['hero', 'services', 'benefits', 'cases', 'faq', 'finalCta']
  },
  groups: [
    { name: 'panel', title: 'Panel', default: true },
    { name: 'seo', title: 'SEO' },
    { name: 'content', title: 'Contenido' },
    { name: 'schema', title: 'Schema local' }
  ],
  fields: [
    defineField({
      name: 'internalTitle',
      type: 'string',
      title: 'Nombre interno',
      readOnly: true,
      group: 'panel'
    }),
    defineField({
      name: 'sectionOrder',
      type: 'array',
      title: 'Orden de bloques',
      description: 'Puedes reordenar los bloques principales de la landing.',
      group: 'panel',
      of: [
        {
          type: 'string',
          options: {
            list: [
              { title: 'Hero', value: 'hero' },
              { title: 'Servicios', value: 'services' },
              { title: 'Beneficios', value: 'benefits' },
              { title: 'Casos / Proyectos', value: 'cases' },
              { title: 'FAQ', value: 'faq' },
              { title: 'CTA final', value: 'finalCta' }
            ]
          }
        }
      ],
      validation: (rule) => rule.min(1)
    }),
    defineField({
      name: 'seo',
      type: 'object',
      title: 'SEO on-page',
      group: 'seo',
      fields: [
        defineField({ name: 'title', type: 'string', title: 'Title', validation: (rule) => rule.required() }),
        defineField({
          name: 'description',
          type: 'text',
          title: 'Meta description',
          rows: 3,
          validation: (rule) => rule.required()
        }),
        defineField({ name: 'ogTitle', type: 'string', title: 'OG title', validation: (rule) => rule.required() }),
        defineField({
          name: 'ogDescription',
          type: 'text',
          title: 'OG description',
          rows: 3,
          validation: (rule) => rule.required()
        }),
        defineField({
          name: 'ogImage',
          type: 'image',
          title: 'OG image',
          options: { hotspot: true }
        }),
        defineField({
          name: 'ogImagePath',
          type: 'string',
          title: 'Fallback OG image (ruta o URL)',
          description:
            'Por defecto /og-image.png (archivo en /static del sitio). También puedes usar https://…',
          initialValue: '/og-image.png'
        }),
        defineField({
          name: 'canonicalPath',
          type: 'string',
          title: 'Canonical path',
          description: 'Ejemplo: /diseno-web-alcoy',
          validation: (rule) => rule.required()
        }),
        defineField({
          name: 'twitterCard',
          type: 'string',
          title: 'Twitter card',
          options: { list: ['summary', 'summary_large_image'] },
          initialValue: 'summary_large_image'
        })
      ]
    }),
    defineField({
      name: 'hero',
      type: 'object',
      title: 'Hero',
      group: 'content',
      fields: [
        defineField({ name: 'badge', type: 'string', title: 'Etiqueta superior' }),
        defineField({ name: 'title', type: 'string', title: 'Titulo H1', validation: (rule) => rule.required() }),
        defineField({
          name: 'subtitle',
          type: 'text',
          title: 'Subtitulo',
          rows: 3,
          validation: (rule) => rule.required()
        }),
        defineField({ name: 'visualTitle', type: 'string', title: 'Titulo visual (opcional)' }),
        defineField({
          name: 'visualDescription',
          type: 'text',
          title: 'Descripcion visual (opcional)',
          rows: 2
        }),
        defineField({
          name: 'visualImage',
          type: 'image',
          title: 'Imagen hero (opcional)',
          options: { hotspot: true }
        }),
        defineField({
          name: 'visualImageSrc',
          type: 'string',
          title: 'Ruta/URL imagen hero (fallback)',
          description: 'Ejemplo: /imagenes/mi-captura.avif'
        }),
        defineField({ name: 'visualImageAlt', type: 'string', title: 'Alt imagen hero (opcional)' }),
        defineField({
          name: 'splineUrl',
          type: 'string',
          title: 'URL Spline embed (opcional)',
          description: 'Si se rellena, se muestra un iframe en el hero.'
        }),
        defineField({
          name: 'cta',
          type: 'object',
          title: 'CTA hero',
          fields: ctaFields
        })
      ]
    }),
    defineField({
      name: 'services',
      type: 'object',
      title: 'Servicios',
      group: 'content',
      fields: [
        defineField({ name: 'heading', type: 'string', title: 'Titulo bloque' }),
        defineField({
          name: 'items',
          type: 'array',
          title: 'Items de servicio',
          of: [
            {
              type: 'object',
              fields: [
                defineField({ name: 'title', type: 'string', title: 'Titulo' }),
                defineField({ name: 'description', type: 'text', title: 'Descripcion', rows: 3 })
              ]
            }
          ]
        })
      ]
    }),
    defineField({
      name: 'benefits',
      type: 'object',
      title: 'Beneficios / resultados',
      group: 'content',
      fields: [
        defineField({ name: 'heading', type: 'string', title: 'Titulo bloque' }),
        defineField({
          name: 'items',
          type: 'array',
          title: 'Items de beneficios',
          of: [
            {
              type: 'object',
              fields: [
                defineField({ name: 'title', type: 'string', title: 'Titulo' }),
                defineField({ name: 'description', type: 'text', title: 'Descripcion', rows: 3 })
              ]
            }
          ]
        })
      ]
    }),
    defineField({
      name: 'cases',
      type: 'object',
      title: 'Casos / proyectos',
      group: 'content',
      fields: [
        defineField({ name: 'heading', type: 'string', title: 'Titulo bloque' }),
        defineField({
          name: 'items',
          type: 'array',
          title: 'Casos',
          of: [
            {
              type: 'object',
              fields: [
                defineField({ name: 'title', type: 'string', title: 'Titulo' }),
                defineField({ name: 'summary', type: 'text', title: 'Resumen', rows: 3 }),
                defineField({ name: 'outcome', type: 'text', title: 'Resultado', rows: 2 }),
                defineField({ name: 'href', type: 'string', title: 'Enlace (opcional)' }),
                defineField({ name: 'linkLabel', type: 'string', title: 'Texto enlace (opcional)' })
              ]
            }
          ]
        })
      ]
    }),
    defineField({
      name: 'faq',
      type: 'object',
      title: 'FAQ',
      group: 'content',
      fields: [
        defineField({ name: 'heading', type: 'string', title: 'Titulo bloque' }),
        defineField({
          name: 'items',
          type: 'array',
          title: 'Preguntas',
          of: [
            {
              type: 'object',
              fields: [
                defineField({ name: 'question', type: 'string', title: 'Pregunta' }),
                defineField({ name: 'answer', type: 'text', title: 'Respuesta', rows: 4 })
              ]
            }
          ]
        })
      ]
    }),
    defineField({
      name: 'finalCta',
      type: 'object',
      title: 'CTA final',
      group: 'content',
      fields: [
        defineField({ name: 'heading', type: 'string', title: 'Titulo bloque' }),
        defineField({ name: 'text', type: 'text', title: 'Texto bloque', rows: 3 }),
        defineField({
          name: 'cta',
          type: 'object',
          title: 'CTA final',
          fields: ctaFields
        })
      ]
    }),
    defineField({
      name: 'contactModal',
      type: 'object',
      title: 'Formulario modal de contacto',
      group: 'content',
      fields: [
        defineField({ name: 'triggerLabel', type: 'string', title: 'Texto boton abrir modal' }),
        defineField({ name: 'heading', type: 'string', title: 'Titulo modal' }),
        defineField({ name: 'text', type: 'text', title: 'Texto modal', rows: 3 }),
        defineField({ name: 'submitLabel', type: 'string', title: 'Texto boton enviar' }),
        defineField({ name: 'successMessage', type: 'string', title: 'Mensaje de exito' }),
        defineField({ name: 'privacyLabel', type: 'string', title: 'Texto checkbox privacidad' })
      ]
    }),
    defineField({
      name: 'localBusiness',
      type: 'object',
      title: 'Datos LocalBusiness / ProfessionalService',
      group: 'schema',
      fields: [
        defineField({ name: 'businessName', type: 'string', title: 'Nombre comercial' }),
        defineField({ name: 'serviceType', type: 'string', title: 'Tipo de servicio' }),
        defineField({
          name: 'areaServed',
          type: 'array',
          title: 'Areas atendidas',
          of: [{ type: 'string' }]
        }),
        defineField({ name: 'addressLocality', type: 'string', title: 'Ciudad' }),
        defineField({ name: 'addressRegion', type: 'string', title: 'Provincia/region' }),
        defineField({ name: 'addressCountry', type: 'string', title: 'Pais (codigo ISO o nombre)' }),
        defineField({ name: 'telephone', type: 'string', title: 'Telefono (opcional)' }),
        defineField({ name: 'email', type: 'string', title: 'Email (opcional)' }),
        defineField({ name: 'priceRange', type: 'string', title: 'Rango de precios (opcional)' })
      ]
    })
  ],
  preview: {
    select: { t: 'internalTitle' },
    prepare: ({ t }) => ({ title: t || 'Landing Diseño web en Alcoy' })
  }
});
