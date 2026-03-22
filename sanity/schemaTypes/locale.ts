import { defineType } from 'sanity';

/**
 * Campos duplicados ES/EN a nivel de esquema (sin plugin de document i18n).
 * En GROQ llegan como `{ es, en }`; la web elige idioma con cookie + `fetch` + `depends`.
 */
export const localeString = defineType({
  name: 'localeString',
  title: 'Texto (ES / EN)',
  type: 'object',
  fields: [
    { name: 'es', type: 'string', title: 'Español' },
    { name: 'en', type: 'string', title: 'English' }
  ],
  preview: {
    select: { es: 'es', en: 'en' },
    prepare({ es, en }) {
      return { title: [es, en].filter(Boolean).join(' · ') || 'Vacío' };
    }
  }
});

export const localeText = defineType({
  name: 'localeText',
  title: 'Texto largo (ES / EN)',
  type: 'object',
  fields: [
    { name: 'es', type: 'text', title: 'Español', rows: 5 },
    { name: 'en', type: 'text', title: 'English', rows: 5 }
  ],
  preview: {
    select: { es: 'es', en: 'en' },
    prepare({ es, en }) {
      const t = (es || en || '').slice(0, 60);
      return { title: t ? `${t}…` : 'Vacío' };
    }
  }
});
