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
    sectionOrder: ['hero', 'services', 'benefits', 'faq', 'finalCta']
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
        }),
        defineField({
          name: 'heroMarquee',
          type: 'object',
          title: 'Carrusel de proyectos (debajo del hero)',
          description:
            'Capturas que se muestran en la franja animada bajo el mockup. Sube imágenes nítidas (p. ej. 1200px de ancho o más).',
          fields: [
            defineField({
              name: 'kicker',
              type: 'string',
              title: 'Texto encima del carrusel',
              initialValue: 'Proyectos recientes · capturas reales'
            }),
            defineField({
              name: 'items',
              type: 'array',
              title: 'Proyectos',
              of: [
                {
                  type: 'object',
                  name: 'heroMarqueeItem',
                  fields: [
                    defineField({
                      name: 'title',
                      type: 'string',
                      title: 'Nombre del proyecto',
                      validation: (rule) => rule.required()
                    }),
                    defineField({
                      name: 'href',
                      type: 'url',
                      title: 'Enlace (web del proyecto)',
                      validation: (rule) => rule.required().uri({ scheme: ['http', 'https'] })
                    }),
                    defineField({
                      name: 'image',
                      type: 'image',
                      title: 'Captura de pantalla',
                      options: { hotspot: true },
                      validation: (rule) => rule.required()
                    }),
                    defineField({
                      name: 'imageAlt',
                      type: 'string',
                      title: 'Texto alternativo (accesibilidad)',
                      description: 'Opcional. Si lo dejas vacío, se usará el nombre del proyecto.'
                    })
                  ],
                  preview: {
                    select: { title: 'title', media: 'image' },
                    prepare: ({ title, media }) => ({
                      title: title || 'Proyecto',
                      media
                    })
                  }
                }
              ]
            })
          ]
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
          name: 'pricingFootnote',
          type: 'string',
          title: 'Nota de precios (opcional)',
          description: 'Ejemplo: Precios base (IVA no incluido)'
        }),
        defineField({
          name: 'items',
          type: 'array',
          title: 'Items de servicio',
          of: [
            {
              type: 'object',
              fields: [
                defineField({ name: 'title', type: 'string', title: 'Titulo' }),
                defineField({
                  name: 'offerBadge',
                  type: 'string',
                  title: 'Badge de oferta (opcional)',
                  description: 'Ejemplo: Oferta de lanzamiento'
                }),
                defineField({ name: 'subtitle', type: 'string', title: 'Subtitulo (opcional)' }),
                defineField({ name: 'summary', type: 'text', title: 'Resumen visible', rows: 3 }),
                defineField({ name: 'priceFrom', type: 'string', title: 'Precio' }),
                defineField({
                  name: 'hideFromLabel',
                  type: 'boolean',
                  title: 'Ocultar prefijo "Desde"',
                  initialValue: false
                }),
                defineField({ name: 'delivery', type: 'string', title: 'Entrega (opcional)' }),
                defineField({
                  name: 'details',
                  type: 'array',
                  title: 'Checklist del modal',
                  of: [{ type: 'string' }]
                }),
                defineField({ name: 'note', type: 'text', title: 'Nota modal (opcional)', rows: 3 }),
                defineField({
                  name: 'modalActionLabel',
                  type: 'string',
                  title: 'Texto boton modal (opcional)'
                }),
                defineField({
                  name: 'modalActionHref',
                  type: 'string',
                  title: 'Enlace boton modal (opcional)'
                })
              ]
            }
          ]
        })
      ]
    }),
    defineField({
      name: 'maintenance',
      type: 'object',
      title: 'Mantenimiento y soporte',
      group: 'content',
      fields: [
        defineField({ name: 'heading', type: 'string', title: 'Titulo bloque' }),
        defineField({
          name: 'footerLabel',
          type: 'string',
          title: 'Texto en footer (opcional)',
          description: 'Ejemplo: Mantenimiento',
          initialValue: 'Mantenimiento'
        }),
        defineField({ name: 'lead', type: 'text', title: 'Texto introductorio', rows: 3 }),
        defineField({
          name: 'pricingFootnote',
          type: 'string',
          title: 'Nota de precios (opcional)',
          description: 'Ejemplo: Precios base (IVA no incluido)'
        }),
        defineField({
          name: 'items',
          type: 'array',
          title: 'Tarjetas de mantenimiento',
          of: [
            {
              type: 'object',
              fields: [
                defineField({ name: 'title', type: 'string', title: 'Titulo' }),
                defineField({ name: 'price', type: 'string', title: 'Precio' }),
                defineField({
                  name: 'icon',
                  type: 'string',
                  title: 'Icono Material Symbols',
                  description: 'Ejemplo: construction, cloud_done'
                }),
                defineField({ name: 'detail', type: 'text', title: 'Texto corto', rows: 3 }),
                defineField({ name: 'modalTitle', type: 'string', title: 'Titulo del modal' }),
                defineField({
                  name: 'checklist',
                  type: 'array',
                  title: 'Checklist del modal',
                  of: [{ type: 'string' }]
                }),
                defineField({ name: 'note', type: 'text', title: 'Nota modal (opcional)', rows: 3 }),
                defineField({ name: 'actionLabel', type: 'string', title: 'Texto boton modal' }),
                defineField({
                  name: 'actionHref',
                  type: 'string',
                  title: 'Enlace boton modal (opcional)'
                })
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
          name: 'buttonLabel',
          type: 'string',
          title: 'Texto del boton (opcional)',
          description: 'Ejemplo: Contactar ahora'
        }),
        defineField({
          name: 'buttonUrl',
          type: 'string',
          title: 'Enlace del boton (opcional)',
          description: 'Acepta rutas relativas o URL absoluta.'
        }),
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
