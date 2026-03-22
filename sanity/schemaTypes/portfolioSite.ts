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
                { name: 'href', type: 'string', title: 'URL o ancla', description: 'Ej. /#sobre' }
              ],
              preview: { select: { t: 'label' }, prepare: ({ t }) => ({ title: t || 'Ítem' }) }
            }
          ]
        },
        { name: 'ctaLabel', type: 'string', title: 'Texto botón CTA' },
        { name: 'ctaHref', type: 'url', title: 'URL CTA' }
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
                { name: 'icon', type: 'string', title: 'Emoji / icono' },
                { name: 'title', type: 'string' },
                { name: 'description', type: 'text' }
              ]
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
      fields: [
        { name: 'meta', type: 'string' },
        { name: 'title', type: 'string' },
        {
          name: 'projects',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                { name: 'sortOrder', type: 'number', title: 'Orden', initialValue: 0 },
                { name: 'thumbnail', type: 'image', title: 'Captura', options: { hotspot: true } },
                { name: 'imageSrc', type: 'url', title: 'O URL imagen externa' },
                { name: 'imageAlt', type: 'string' },
                { name: 'title', type: 'string' },
                { name: 'description', type: 'text' },
                { name: 'tags', type: 'array', of: [{ type: 'string' }] },
                { name: 'linkLabel', type: 'string', initialValue: 'Ver Proyecto' },
                {
                  name: 'destinationUrl',
                  type: 'string',
                  title: 'Destino',
                  description: 'Interno: /proyectos/mi-slug · Externo: https://…'
                }
              ],
              preview: {
                select: { t: 'title', media: 'thumbnail' },
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
        { name: 'linkedinHref', type: 'url' },
        { name: 'linkedinLead', type: 'string' },
        { name: 'linkedinButtonLabel', type: 'string' },
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
