import { defineField, defineType } from 'sanity';

/**
 * Crea en Studio un documento con _id fijo `portfolioSite` (Structure → New document →
 * usar "Custom ID" o importar JSON). La web lee solo ese id.
 */
export const portfolioSite = defineType({
  name: 'sitePortfolio',
  title: 'Sitio (portfolio)',
  type: 'document',
  fields: [
    defineField({
      name: 'header',
      type: 'object',
      fields: [
        { name: 'logoText', type: 'string', title: 'Marca / logo' },
        { name: 'logoHref', type: 'string', title: 'Enlace del logo', initialValue: '/' },
        {
          name: 'navItems',
          type: 'array',
          title: 'Menú',
          of: [
            {
              type: 'object',
              fields: [
                { name: 'label', type: 'string', title: 'Texto' },
                {
                  name: 'href',
                  type: 'string',
                  title: 'URL o ancla',
                  description: 'Ej. /#sobre. Si marcas «Abrir trayectoria», puede quedar en #.'
                },
                {
                  name: 'openCareerModal',
                  type: 'boolean',
                  title: 'Abrir modal Trayectoria',
                  description: 'Si está activo, no navega: abre el mismo modal que en el hero.',
                  initialValue: false
                }
              ],
              preview: { select: { t: 'label' }, prepare: ({ t }) => ({ title: t || 'Ítem' }) }
            }
          ]
        },
        { name: 'ctaLabel', type: 'string', title: 'Texto botón CTA (ej. Contacto)' },
        {
          name: 'ctaHref',
          type: 'string',
          title: 'Enlace CTA',
          description: 'Ej. /#contacto para scroll al chat, o https://… para externo.'
        }
      ]
    }),
    defineField({
      name: 'seo',
      type: 'object',
      fields: [
        { name: 'title', type: 'string', title: 'Title' },
        { name: 'description', type: 'text', title: 'Meta description' },
        { name: 'ogTitle', type: 'string', title: 'OG title' },
        { name: 'ogDescription', type: 'text', title: 'OG description' },
        {
          name: 'ogImage',
          type: 'url',
          title: 'OG image (URL absoluta o ruta /og-image.png)',
          description: 'Si es relativa, se antepondrá PUBLIC_SITE_URL en la web.'
        },
        {
          name: 'twitterCard',
          type: 'string',
          title: 'Twitter card',
          options: { list: ['summary', 'summary_large_image'] },
          initialValue: 'summary_large_image'
        }
      ]
    }),
    defineField({
      name: 'hero',
      type: 'object',
      fields: [
        {
          name: 'cvHref',
          type: 'string',
          title: 'Enlace botón «¿Hablamos?»',
          description: 'Ej. /#contacto para el chat, o https://… para otra URL.'
        },
        { name: 'label', type: 'string', title: 'Etiqueta superior' },
        { name: 'title', type: 'string', title: 'Título H1' },
        { name: 'subtitle', type: 'string', title: 'Subtítulo' },
        { name: 'bio', type: 'text', title: 'Bio' }
      ]
    }),
    defineField({
      name: 'about',
      type: 'object',
      fields: [
        { name: 'image', type: 'image', title: 'Foto', options: { hotspot: true } },
        { name: 'imageSrc', type: 'url', title: 'O URL imagen externa (si no subes archivo)' },
        { name: 'imageAlt', type: 'string', title: 'Alt imagen' },
        { name: 'meta', type: 'string', title: 'Meta sección' },
        { name: 'title', type: 'string', title: 'Título H2' },
        {
          name: 'aboutHtml',
          type: 'text',
          title: 'Cuerpo (HTML)',
          rows: 10,
          description: 'Párrafos con <p>, <strong>, enlaces… Solo contenido tuyo.'
        }
      ]
    }),
    defineField({
      name: 'services',
      type: 'object',
      title: 'Servicios',
      description: 'Meta, título e ítems con campos ES/EN. Si falta un idioma, la web usa el otro.',
      fields: [
        {
          name: 'meta',
          type: 'localeString',
          title: 'Meta sección'
        },
        {
          name: 'title',
          type: 'localeString',
          title: 'Título H2'
        },
        {
          name: 'items',
          type: 'array',
          title: 'Servicios',
          of: [
            {
              type: 'object',
              fields: [
                { name: 'icon', type: 'string', title: 'Emoji / icono (compartido)' },
                { name: 'title', type: 'localeString', title: 'Título' },
                { name: 'description', type: 'localeText', title: 'Descripción' }
              ],
              preview: {
                select: { t: 'title.es', media: 'icon' },
                prepare: ({ t }) => ({ title: t || 'Servicio' })
              }
            }
          ]
        }
      ]
    }),
    defineField({
      name: 'techStack',
      type: 'object',
      fields: [
        { name: 'meta', type: 'string' },
        { name: 'title', type: 'string' },
        {
          name: 'categories',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                { name: 'title', type: 'string', title: 'Nombre categoría' },
                {
                  name: 'icons',
                  type: 'array',
                  of: [
                    {
                      type: 'object',
                      fields: [
                        { name: 'iconImage', type: 'image', title: 'Icono (imagen)' },
                        { name: 'src', type: 'url', title: 'O URL del SVG/PNG' },
                        { name: 'alt', type: 'string' },
                        { name: 'title', type: 'string', title: 'Tooltip' }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }),
    defineField({
      name: 'quality',
      type: 'object',
      fields: [
        { name: 'meta', type: 'string' },
        { name: 'title', type: 'string' },
        {
          name: 'items',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                { name: 'icon', type: 'string' },
                { name: 'title', type: 'string' },
                { name: 'description', type: 'text' }
              ]
            }
          ]
        }
      ]
    }),
    defineField({
      name: 'projects',
      type: 'object',
      title: 'Proyectos destacados',
      description: 'Textos ES/EN; imagen, tags y URL de destino son compartidos.',
      fields: [
        { name: 'meta', type: 'localeString', title: 'Meta sección' },
        { name: 'title', type: 'localeString', title: 'Título H2' },
        {
          name: 'projects',
          type: 'array',
          title: 'Tarjetas',
          of: [
            {
              type: 'object',
              fields: [
                { name: 'sortOrder', type: 'number', title: 'Orden', initialValue: 0 },
                { name: 'thumbnail', type: 'image', title: 'Captura', options: { hotspot: true } },
                { name: 'imageSrc', type: 'url', title: 'O URL imagen externa' },
                { name: 'imageAlt', type: 'string' },
                { name: 'title', type: 'localeString', title: 'Título' },
                { name: 'description', type: 'localeText', title: 'Descripción' },
                { name: 'tags', type: 'array', of: [{ type: 'string' }], title: 'Tags (compartidos)' },
                {
                  name: 'linkLabel',
                  type: 'localeString',
                  title: 'Texto del enlace',
                  description: 'Ej. «Ver proyecto» / «View project»'
                },
                {
                  name: 'destinationUrl',
                  type: 'string',
                  title: 'Destino',
                  description: 'Interno: /proyectos/mi-slug · Externo: https://…'
                }
              ],
              preview: {
                select: { t: 'title.es', media: 'thumbnail' },
                prepare: ({ t, media }) => ({ title: t || 'Proyecto', media })
              }
            }
          ]
        }
      ]
    }),
    defineField({
      name: 'contact',
      type: 'object',
      fields: [
        { name: 'heading', type: 'string' },
        { name: 'subtitle', type: 'string' },
        { name: 'typebotSrc', type: 'url', title: 'URL iframe Typebot' },
        {
          name: 'whatsappLead',
          type: 'string',
          title: 'Texto sobre el botón WhatsApp',
          description: 'El número no va aquí: se configura en el servidor (WHATSAPP_E164).'
        },
        { name: 'whatsappButtonLabel', type: 'string', title: 'Texto del botón WhatsApp' },
        { name: 'iframeTitle', type: 'string' }
      ]
    }),
    defineField({
      name: 'footer',
      type: 'object',
      fields: [
        {
          name: 'copyrightTemplate',
          type: 'string',
          title: 'Copyright',
          description: 'Usa {{year}} para el año dinámico.',
          initialValue: 'Moisés Valero © {{year}} | Web Developer'
        },
        { name: 'githubHref', type: 'url' },
        { name: 'linkedinHref', type: 'url' },
        { name: 'emailHref', type: 'string', title: 'mailto:…' }
      ]
    })
  ],
  preview: {
    prepare: () => ({ title: 'Sitio (portfolio)' })
  }
});
