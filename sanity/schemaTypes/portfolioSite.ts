import { defineField, defineType } from 'sanity';

/**
 * Crea en Studio un documento con _id fijo `portfolioSite` (Structure → New document →
 * usar "Custom ID" o importar JSON). La web lee solo ese id.
 */
export const portfolioSite = defineType({
  name: 'sitePortfolio',
  title: 'Sitio (contenido global)',
  type: 'document',
  initialValue: {
    title: 'Web principal',
    panelHelp:
      'Edita por pestañas, guarda cambios y pulsa Publish. Si algo no lo usas, dejalo vacio. Este panel controla textos globales de toda la web.'
  },
  groups: [
    { name: 'panel', title: '🚦 Guia rapida', default: true },
    { name: 'home', title: '🏠 Inicio' },
    { name: 'servicios', title: '🛠️ Servicios y stack' },
    { name: 'proyectos', title: '🧱 Proyectos destacados' },
    { name: 'contacto', title: '💬 Contacto y footer' },
    { name: 'seo', title: '📈 SEO' }
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Nombre interno',
      description: 'Solo para identificar este documento en el panel.',
      readOnly: true,
      group: 'panel'
    }),
    defineField({
      name: 'panelHelp',
      type: 'text',
      title: 'Como usar este panel',
      initialValue:
        'Edita por pestañas, guarda cambios y pulsa Publish. Si algo no lo usas, dejalo vacio. Este panel controla textos globales de toda la web.',
      readOnly: true,
      rows: 4,
      group: 'panel'
    }),
    defineField({
      name: 'checklistHome',
      type: 'object',
      title: 'Checklist rapido (opcional)',
      description: 'Te ayuda a no olvidar nada antes de publicar.',
      group: 'panel',
      fields: [
        { name: 'heroRevisado', type: 'boolean', title: 'Hero revisado (titulo y subtitulo)' },
        { name: 'serviciosRevisados', type: 'boolean', title: 'Servicios revisados' },
        { name: 'contactoRevisado', type: 'boolean', title: 'Contacto revisado' },
        { name: 'seoRevisado', type: 'boolean', title: 'SEO basico revisado' }
      ]
    }),
    defineField({
      name: 'header',
      type: 'object',
      title: 'Cabecera (menu)',
      description: 'Logo, menu y boton principal.',
      group: 'home',
      fields: [
        { name: 'logoText', type: 'localeString', title: 'Marca / logo' },
        { name: 'logoHref', type: 'string', title: 'Enlace del logo', initialValue: '/' },
        {
          name: 'navItems',
          type: 'array',
          title: 'Menú',
          of: [
            {
              type: 'object',
              fields: [
                { name: 'label', type: 'localeString', title: 'Texto' },
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
              preview: {
                select: { t: 'label.es' },
                prepare: ({ t }) => ({ title: t || 'Ítem' })
              }
            }
          ]
        },
        { name: 'ctaLabel', type: 'localeString', title: 'Texto botón CTA (ej. Contacto)' },
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
      title: 'SEO global de la home',
      group: 'seo',
      fields: [
        { name: 'title', type: 'string', title: 'Title' },
        { name: 'description', type: 'text', title: 'Meta description' },
        { name: 'ogTitle', type: 'string', title: 'OG title' },
        { name: 'ogDescription', type: 'text', title: 'OG description' },
        defineField({
          name: 'ogImage',
          type: 'string',
          title: 'OG image (URL absoluta o ruta /og-image.png)',
          description:
            'Archivo recomendado en el sitio: /og-image.png (sube la imagen a /static/og-image.png). Si es relativa, se antepondrá PUBLIC_SITE_URL.',
          initialValue: '/og-image.png'
        }),
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
      title: 'Bloque principal (hero)',
      group: 'home',
      fields: [
        {
          name: 'cvHref',
          type: 'string',
          title: 'Enlace botón «Ver CV»',
          description: 'Recomendado: /api/cv (descarga el PDF). No uses /#contacto para este botón.',
          initialValue: '/api/cv'
        },
        { name: 'label', type: 'localeString', title: 'Etiqueta superior' },
        { name: 'title', type: 'localeString', title: 'Título H1' },
        { name: 'subtitle', type: 'localeString', title: 'Subtítulo' },
        { name: 'bio', type: 'localeText', title: 'Bio' },
        { name: 'ctaPrimaryLabel', type: 'localeString', title: 'Texto botón «Ver CV»' },
        { name: 'careerCtaLabel', type: 'localeString', title: 'Texto botón «Trayectoria»' }
      ]
    }),
    defineField({
      name: 'about',
      type: 'object',
      title: 'Seccion Sobre mi',
      group: 'home',
      fields: [
        {
          name: 'image',
          type: 'image',
          title: 'Foto (recomendado)',
          description:
            'Sube aquí la imagen para servirla desde el CDN de Sanity con tamaño y formato óptimos (WebP/AVIF). Tiene prioridad sobre «Ruta o URL».',
          options: { hotspot: true }
        },
        {
          name: 'imageSrc',
          type: 'string',
          title: 'Ruta o URL imagen (fallback)',
          description:
            'Solo si no hay imagen subida. Archivos locales (/imagenes/…) o URL absolutas no pasan por el pipeline de Sanity.'
        },
        { name: 'imageAlt', type: 'localeString', title: 'Alt imagen' },
        { name: 'meta', type: 'localeString', title: 'Meta sección' },
        { name: 'title', type: 'localeString', title: 'Título H2' },
        {
          name: 'aboutHtml',
          type: 'localeText',
          title: 'Cuerpo (HTML)',
          description: 'Párrafos con <p>, <strong>, enlaces… Solo contenido tuyo.'
        }
      ]
    }),
    defineField({
      name: 'services',
      type: 'object',
      title: 'Servicios',
      description: 'Meta, título e ítems con campos ES/EN. Si falta un idioma, la web usa el otro.',
      group: 'servicios',
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
      title: 'Stack tecnologico',
      group: 'servicios',
      fields: [
        { name: 'meta', type: 'localeString', title: 'Meta sección' },
        { name: 'title', type: 'localeString', title: 'Título H2' },
        {
          name: 'categories',
          type: 'array',
          title: 'Categorías (referencia / archivo)',
          description:
            'La web muestra el stack definido en código (devicons del repo). Estos datos son solo archivo: no edites iconos aquí salvo que más adelante conectemos esta sección.',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'title',
                  type: 'string',
                  title: 'Nombre categoría (archivo)',
                  readOnly: true
                },
                {
                  name: 'icons',
                  type: 'array',
                  readOnly: true,
                  of: [
                    {
                      type: 'object',
                      fields: [
                        { name: 'iconImage', type: 'image', title: 'Icono (imagen)' },
                        { name: 'src', type: 'string', title: 'Ruta o URL del SVG/PNG' },
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
      title: 'Bloque de calidad / beneficios',
      group: 'servicios',
      fields: [
        { name: 'meta', type: 'localeString', title: 'Meta sección' },
        { name: 'title', type: 'localeString', title: 'Título H2' },
        {
          name: 'items',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                { name: 'icon', type: 'string' },
                { name: 'title', type: 'localeString', title: 'Título' },
                { name: 'description', type: 'localeText', title: 'Descripción' }
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
      group: 'proyectos',
      fields: [
        { name: 'meta', type: 'localeString', title: 'Meta sección' },
        { name: 'title', type: 'localeString', title: 'Título H2' },
        {
          name: 'intro',
          type: 'localeText',
          title: 'Intro corta',
          description: 'Texto breve bajo el titulo para explicar el criterio de seleccion.'
        },
        {
          name: 'maxHomeProjects',
          type: 'number',
          title: 'Maximo de proyectos en portada',
          description: 'La home mantiene una seleccion curada. Usa 4 como limite recomendado.',
          initialValue: 4
        },
        {
          name: 'archiveLinkLabel',
          type: 'localeString',
          title: 'Texto enlace archivo',
          description: 'Ej. Ver todos los proyectos.'
        },
        {
          name: 'archiveHref',
          type: 'string',
          title: 'URL archivo de proyectos',
          description: 'Ej. /proyectos. Si se deja vacio, no se muestra enlace.'
        },
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
                { name: 'imageSrc', type: 'string', title: 'Ruta o URL imagen externa' },
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
      title: 'Seccion de contacto',
      group: 'contacto',
      fields: [
        { name: 'heading', type: 'localeString', title: 'Título H2' },
        { name: 'subtitle', type: 'localeString', title: 'Subtítulo' },
        { name: 'typebotSrc', type: 'url', title: 'URL iframe Typebot' },
        {
          name: 'whatsappLead',
          type: 'localeString',
          title: 'Texto sobre el botón WhatsApp',
          description: 'El número no va aquí: se gestiona en el endpoint /api/contact/whatsapp.'
        },
        { name: 'whatsappButtonLabel', type: 'localeString', title: 'Texto del botón WhatsApp' },
        { name: 'formLead', type: 'localeString', title: 'Texto sobre el botón formulario' },
        { name: 'formButtonLabel', type: 'localeString', title: 'Texto del botón formulario' },
        { name: 'formModalHeading', type: 'localeString', title: 'Título modal formulario' },
        { name: 'formModalText', type: 'localeString', title: 'Texto modal formulario' },
        { name: 'formModalSubmitLabel', type: 'localeString', title: 'Texto botón enviar formulario' },
        { name: 'formModalPrivacyLabel', type: 'localeString', title: 'Texto privacidad formulario' },
        {
          name: 'formModalSuccessMessage',
          type: 'localeString',
          title: 'Mensaje éxito formulario'
        },
        { name: 'iframeTitle', type: 'localeString', title: 'Título accesible del iframe' }
      ]
    }),
    defineField({
      name: 'footer',
      type: 'object',
      title: 'Footer',
      group: 'contacto',
      fields: [
        {
          name: 'copyrightTemplate',
          type: 'localeText',
          title: 'Copyright',
          description: 'Usa {{year}} para el año dinámico.'
        },
        { name: 'githubHref', type: 'url' },
        { name: 'linkedinHref', type: 'url' },
        { name: 'maltHref', type: 'url', title: 'Malt (perfil)' },
        { name: 'emailHref', type: 'string', title: 'mailto:…' }
      ]
    }),
    defineField({
      name: 'careerModal',
      type: 'object',
      title: 'Modal de trayectoria + CV',
      description: 'Contenido del modal que se abre al pulsar «Trayectoria».',
      group: 'contacto',
      fields: [
        {
          name: 'pdfFile',
          type: 'file',
          title: 'Archivo CV (PDF)',
          description: 'Sube aquí el CV en PDF desde el panel. La web usará este archivo automáticamente.',
          options: {
            accept: 'application/pdf'
          }
        },
        {
          name: 'pdfHref',
          type: 'string',
          title: 'Ruta o URL del CV (PDF)',
          description:
            'Opcional como respaldo manual. Si has subido "Archivo CV (PDF)", la web prioriza ese archivo.'
        },
        { name: 'closeAria', type: 'localeString', title: 'Etiqueta cerrar (accesibilidad)' },
        { name: 'title', type: 'localeString', title: 'Título del modal' },
        { name: 'profileTitle', type: 'localeString', title: 'Título bloque perfil' },
        {
          name: 'profileHtml',
          type: 'localeText',
          title: 'Texto perfil (HTML permitido)',
          description: 'Puedes usar <p>, <strong> y enlaces.'
        },
        { name: 'expTitle', type: 'localeString', title: 'Título bloque experiencia' },
        {
          name: 'timeline',
          type: 'array',
          title: 'Línea de tiempo',
          of: [
            {
              type: 'object',
              fields: [
                { name: 'range', type: 'string', title: 'Rango (ej. 2019 - 2022)' },
                { name: 'role', type: 'localeString', title: 'Rol / Empresa' },
                {
                  name: 'descHtml',
                  type: 'localeText',
                  title: 'Descripción (HTML permitido)'
                },
                { name: 'span', type: 'boolean', title: 'Destacar este bloque' }
              ]
            }
          ]
        },
        { name: 'stackTitle', type: 'localeString', title: 'Título stack' },
        { name: 'pdfHide', type: 'localeString', title: 'Texto botón ocultar PDF' },
        { name: 'pdfShow', type: 'localeString', title: 'Texto botón ver PDF' },
        { name: 'pdfIframeTitle', type: 'localeString', title: 'Título iframe PDF' },
        { name: 'pdfHintBefore', type: 'localeString', title: 'Texto antes del enlace' },
        { name: 'pdfHintLink', type: 'localeString', title: 'Texto del enlace' }
      ]
    })
  ],
  preview: {
    select: { t: 'title' },
    prepare: ({ t }) => ({ title: t || 'Web principal' })
  }
});
