import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list';
import { defineField, defineType } from 'sanity';

/** Plantilla `/proyectos/[slug]` — alineado con `$lib/types/case-study.ts` y GROQ en `groq.ts`. */
export const caseStudy = defineType({
	name: 'caseStudy',
	title: 'Proyecto',
	type: 'document',
	orderings: [orderRankOrdering],
	initialValue: {
		estadoInterno: 'borrador',
		panelHelp:
			'1) Completa General. 2) Rellena Contenido e Imagenes. 3) Revisa SEO y enlace final. 4) Marca el checklist y pulsa Publish. 5) Ordena proyectos arrastrando en el menu Proyectos (afecta home y /proyectos).',
		heroTag: 'Caso de estudio',
		checklistPublicacion: {
			tituloYSlug: false,
			contenidoPrincipal: false,
			imagenesCargadas: false,
			seoCompletado: false
		}
	},
	groups: [
		{ name: 'panel', title: '🚦 Guia rapida', default: true },
		{ name: 'general', title: '🧩 General' },
		{ name: 'contenido', title: '✍️ Contenido' },
		{ name: 'imagenes', title: '🖼️ Imagenes' },
		{ name: 'seo', title: '📈 SEO y enlace final' }
	],
	fields: [
		orderRankField({ type: 'caseStudy' }),
		defineField({
			name: 'panelHelp',
			type: 'text',
			title: 'Como usar este formulario',
			readOnly: true,
			rows: 4,
			group: 'panel',
			initialValue:
				'1) Completa General. 2) Rellena Contenido e Imagenes. 3) Revisa SEO y enlace final. 4) Marca el checklist y pulsa Publish. 5) Ordena proyectos arrastrando en el menu Proyectos (afecta home y /proyectos).'
		}),
		defineField({
			name: 'estadoInterno',
			type: 'string',
			title: 'Estado del proyecto',
			description: 'Solo organizacion interna (no se muestra en la web).',
			initialValue: 'borrador',
			options: {
				list: [
					{ title: 'Borrador', value: 'borrador' },
					{ title: 'En revision', value: 'revision' },
					{ title: 'Listo para publicar', value: 'listo' }
				],
				layout: 'radio'
			},
			group: 'panel'
		}),
		defineField({
			name: 'showOnHome',
			type: 'boolean',
			title: 'Mostrar en portada',
			description: 'Si esta activo, este proyecto aparece automaticamente en la home.',
			initialValue: true,
			group: 'panel'
		}),
		defineField({
			name: 'homeSortOrder',
			type: 'number',
			title: 'Orden legacy (obsoleto)',
			description: 'Ya no se usa. Ordena desde el menu Proyectos con drag and drop.',
			hidden: true,
			readOnly: true
		}),
		defineField({
			name: 'homeLayoutTier',
			type: 'string',
			title: 'Peso visual en portada',
			description:
				'Controla como se presenta el proyecto en la home. Usa "Caso principal" solo para el proyecto mas fuerte.',
			initialValue: 'standard',
			options: {
				list: [
					{ title: 'Caso principal', value: 'hero' },
					{ title: 'Destacado secundario', value: 'spotlight' },
					{ title: 'Tarjeta compacta', value: 'standard' }
				],
				layout: 'radio'
			},
			group: 'panel'
		}),
		defineField({
			name: 'homeEyebrow',
			type: 'localeString',
			title: 'Etiqueta corta en portada',
			description: 'Ej. Producto full-stack, E-commerce real, IA aplicada.',
			group: 'panel'
		}),
		defineField({
			name: 'homeProofLine',
			type: 'localeText',
			title: 'Frase de valor para portada',
			description:
				'Una frase afilada para reclutadores: que demuestra este proyecto y por que merece abrirse.',
			group: 'panel'
		}),
		defineField({
			name: 'homeValueTags',
			type: 'array',
			title: 'Tags de valor profesional',
			description:
				'No solo tecnologias: Producto real, APIs, Pagos, IA aplicada, Automatizacion...',
			of: [{ type: 'string' }],
			group: 'panel'
		}),
		defineField({
			name: 'homeRole',
			type: 'localeString',
			title: 'Rol en portada',
			description: 'Ej. Diseno + frontend + integraciones.',
			group: 'panel'
		}),
		defineField({
			name: 'homeYear',
			type: 'string',
			title: 'Ano / periodo en portada',
			description: 'Ej. 2026.',
			group: 'panel'
		}),
		defineField({
			name: 'homeComplexity',
			type: 'string',
			title: 'Complejidad en portada',
			options: {
				list: [
					{ title: 'Media', value: 'Media' },
					{ title: 'Alta', value: 'Alta' },
					{ title: 'Muy alta', value: 'Muy alta' }
				],
				layout: 'radio'
			},
			group: 'panel'
		}),
		defineField({
			name: 'checklistPublicacion',
			type: 'object',
			title: 'Checklist de publicacion',
			description: 'Marca todo antes de publicar.',
			group: 'panel',
			fields: [
				{ name: 'tituloYSlug', type: 'boolean', title: 'Titulo y slug completos' },
				{ name: 'contenidoPrincipal', type: 'boolean', title: 'Contenido principal completado' },
				{ name: 'imagenesCargadas', type: 'boolean', title: 'Imagenes principales añadidas' },
				{ name: 'seoCompletado', type: 'boolean', title: 'Meta description y URL final revisadas' }
			]
		}),
		defineField({
			name: 'title',
			type: 'string',
			title: 'Nombre del proyecto',
			description: 'Ejemplo: V-Shield',
			options: { placeholder: 'Ejemplo: V-Shield' },
			group: 'general',
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'titleEn',
			type: 'string',
			title: 'Nombre del proyecto (EN)',
			description: 'Opcional. Si lo rellenas, se usa cuando el sitio está en inglés.',
			group: 'general'
		}),
		defineField({
			name: 'slug',
			type: 'slug',
			title: 'URL interna',
			description: 'Se usa para crear la URL: /proyectos/tu-slug',
			group: 'general',
			options: { source: 'title', maxLength: 96 },
			validation: (Rule) => Rule.required()
		}),
		defineField({
			name: 'heroTag',
			type: 'string',
			title: 'Etiqueta superior',
			description: 'Ejemplo: Caso de estudio',
			group: 'contenido'
		}),
		defineField({
			name: 'heroTagEn',
			type: 'string',
			title: 'Etiqueta superior (EN)',
			description: 'Opcional para versión inglesa.',
			group: 'contenido'
		}),
		defineField({
			name: 'heroDescription',
			type: 'text',
			title: 'Descripcion corta principal',
			rows: 3,
			options: { placeholder: 'Resumen rapido del proyecto y su objetivo principal.' },
			group: 'contenido'
		}),
		defineField({
			name: 'heroDescriptionEn',
			type: 'text',
			title: 'Descripcion corta principal (EN)',
			rows: 3,
			options: { placeholder: 'Optional English summary.' },
			group: 'contenido'
		}),
		defineField({
			name: 'tags',
			type: 'array',
			title: 'Tecnologias (chips)',
			description: 'Anade una tecnologia por item: SvelteKit, WordPress, SEO...',
			of: [{ type: 'string' }],
			group: 'contenido'
		}),
		defineField({
			name: 'tagsEn',
			type: 'array',
			title: 'Tecnologias (chips) (EN)',
			description: 'Opcional para la versión inglesa.',
			of: [{ type: 'string' }],
			group: 'contenido'
		}),
		defineField({
			name: 'images',
			type: 'object',
			title: 'Imagenes del proyecto',
			group: 'imagenes',
			fields: [
				{
					name: 'cardImage',
					type: 'image',
					title: 'Imagen de tarjeta en portfolio',
					description:
						'Opcional. Se usa en las tarjetas de la home y en /proyectos. Si lo dejas vacio, se usa la imagen principal.',
					options: { hotspot: true }
				},
				{
					name: 'cardImagePath',
					type: 'string',
					title: 'Imagen de tarjeta (ruta fallback)',
					description:
						'Ruta en /imagenes/... para portada y archivo. Prioridad sobre imagen principal si no subes cardImage en Sanity.'
				},
				{
					name: 'principalImage',
					type: 'image',
					title: 'Imagen principal (subida en Sanity)',
					options: { hotspot: true }
				},
				{
					name: 'secondary1Image',
					type: 'image',
					title: 'Imagen secundaria 1 (subida en Sanity)',
					options: { hotspot: true }
				},
				{
					name: 'secondary2Image',
					type: 'image',
					title: 'Imagen secundaria 2 (subida en Sanity)',
					options: { hotspot: true }
				},
				{
					name: 'principal',
					type: 'string',
					title: 'Imagen principal (ruta o URL fallback)',
					description: 'Opcional. Se usa solo si no subes la imagen en Sanity.'
				},
				{
					name: 'secondary1',
					type: 'string',
					title: 'Imagen secundaria 1 (ruta o URL fallback)',
					description: 'Opcional. Se usa solo si no subes la imagen en Sanity.'
				},
				{
					name: 'secondary2',
					type: 'string',
					title: 'Imagen secundaria 2 (ruta o URL fallback)',
					description: 'Opcional. Se usa solo si no subes la imagen en Sanity.'
				}
			]
		}),
		defineField({
			name: 'metrics',
			type: 'array',
			title: 'Metricas / resultados rapidos',
			description: 'Bloques tipo "90+ / PageSpeed movil".',
			group: 'contenido',
			of: [
				{
					type: 'object',
					title: 'Metrica',
					fields: [
						{ name: 'value', type: 'string', title: 'Valor' },
						{ name: 'label', type: 'string', title: 'Texto' }
					]
				}
			]
		}),
		defineField({
			name: 'metricsEn',
			type: 'array',
			title: 'Metricas / resultados rapidos (EN)',
			description: 'Opcional para versión inglesa.',
			group: 'contenido',
			of: [
				{
					type: 'object',
					title: 'Metrica EN',
					fields: [
						{ name: 'value', type: 'string', title: 'Valor' },
						{ name: 'label', type: 'string', title: 'Texto' }
					]
				}
			]
		}),
		defineField({
			name: 'reto',
			type: 'object',
			title: 'Bloque: El reto',
			group: 'contenido',
			fields: [
				{ name: 'title', type: 'string', title: 'Titulo del bloque' },
				{ name: 'bodyHtml', type: 'text', title: 'Texto (acepta HTML basico)', rows: 6 }
			]
		}),
		defineField({
			name: 'retoEn',
			type: 'object',
			title: 'Bloque: El reto (EN)',
			group: 'contenido',
			fields: [
				{ name: 'title', type: 'string', title: 'Titulo del bloque (EN)' },
				{ name: 'bodyHtml', type: 'text', title: 'Texto EN (acepta HTML basico)', rows: 6 }
			]
		}),
		defineField({
			name: 'hice',
			type: 'object',
			title: 'Bloque: Lo que hice',
			group: 'contenido',
			fields: [
				{ name: 'title', type: 'string', title: 'Titulo del bloque' },
				{ name: 'bodyHtml', type: 'text', title: 'Texto (acepta HTML basico)', rows: 6 }
			]
		}),
		defineField({
			name: 'hiceEn',
			type: 'object',
			title: 'Bloque: Lo que hice (EN)',
			group: 'contenido',
			fields: [
				{ name: 'title', type: 'string', title: 'Titulo del bloque (EN)' },
				{ name: 'bodyHtml', type: 'text', title: 'Texto EN (acepta HTML basico)', rows: 6 }
			]
		}),
		defineField({
			name: 'resultado',
			type: 'object',
			title: 'Bloque: Resultado',
			group: 'contenido',
			fields: [
				{ name: 'title', type: 'string', title: 'Titulo del bloque' },
				{ name: 'bodyHtml', type: 'text', title: 'Texto (acepta HTML basico)', rows: 6 }
			]
		}),
		defineField({
			name: 'resultadoEn',
			type: 'object',
			title: 'Bloque: Resultado (EN)',
			group: 'contenido',
			fields: [
				{ name: 'title', type: 'string', title: 'Titulo del bloque (EN)' },
				{ name: 'bodyHtml', type: 'text', title: 'Texto EN (acepta HTML basico)', rows: 6 }
			]
		}),
		defineField({
			name: 'stack',
			type: 'array',
			title: 'Stack tecnico final',
			of: [{ type: 'string' }],
			group: 'contenido'
		}),
		defineField({
			name: 'stackEn',
			type: 'array',
			title: 'Stack tecnico final (EN)',
			of: [{ type: 'string' }],
			group: 'contenido'
		}),
		defineField({
			name: 'seoDescription',
			type: 'text',
			title: 'Meta description (SEO)',
			rows: 3,
			options: { placeholder: 'Descripcion corta para Google (aprox. 140-160 caracteres).' },
			group: 'seo'
		}),
		defineField({
			name: 'seoDescriptionEn',
			type: 'text',
			title: 'Meta description (EN)',
			rows: 3,
			options: { placeholder: 'Optional English description.' },
			group: 'seo'
		}),
		defineField({
			name: 'liveUrl',
			type: 'url',
			title: 'URL del proyecto online (boton final)',
			group: 'seo'
		}),
		defineField({
			name: 'repoUrl',
			type: 'url',
			title: 'URL del repositorio GitHub (boton final opcional)',
			description: 'Si lo rellenas, aparece un boton junto a "Volver" y "Ver proyecto en vivo".',
			group: 'seo'
		})
	],
	preview: {
		select: { t: 'title', s: 'slug.current' },
		prepare: ({ t, s }) => ({ title: t || 'Proyecto', subtitle: s ? `/${s}` : '' })
	}
});
