import type { SiteLocale } from '$lib/i18n/site-locale';

export type CareerModalCopy = {
  closeAria: string;
  title: string;
  profileTitle: string;
  profileHtml: string;
  expTitle: string;
  timeline: { range: string; role: string; descHtml: string; span?: boolean }[];
  stackTitle: string;
  stackLines: string[];
  pdfHide: string;
  pdfShow: string;
  pdfIframeTitle: string;
  pdfHintBefore: string;
  pdfHintLink: string;
};

const es: CareerModalCopy = {
  closeAria: 'Cerrar',
  title: 'Trayectoria Profesional — Moisés Valero',
  profileTitle: 'Perfil',
  profileHtml: `<p class="career-p">
            Cuento con el <strong>Certificado de Profesionalidad de Nivel 3 en Desarrollo Web</strong>
            (equivalente a formación de <strong>Grado Superior</strong>), que avala competencias
            actualizadas en desarrollo y entornos web profesionales.
          </p>`,
  expTitle: 'Experiencia',
  timeline: [
    {
      range: '2019 – 2022',
      role: 'Autónomo',
      descHtml:
        'Digitalización de negocios, gestión de proyectos técnicos y mantenimiento de sistemas.'
    },
    {
      range: '2012 – 2014',
      role: 'MutuaSAD',
      descHtml:
        'Administración WordPress, comercio electrónico (WooCommerce / PrestaShop) y soporte microinformático y de redes.'
    },
    {
      range: '2001 – 2026',
      role: 'Trayectoria adicional',
      descHtml: `Más de dos décadas aportando <strong>madurez profesional</strong> y
                <strong>capacidad de liderazgo</strong> como oficial especialista en entornos
                industriales y en <strong>carpintería técnica</strong>, con fuerte orientación a la
                calidad, la coordinación y la resolución de problemas complejos.`,
      span: true
    }
  ],
  stackTitle: 'Stack técnico',
  stackLines: [
    'WordPress <span class="career-tag-sub">Kadence · Elementor</span>',
    'SvelteKit',
    'SEO on-page',
    'IA generativa <span class="career-tag-sub">prompt engineering · automatización</span>'
  ],
  pdfHide: 'Ocultar CV en PDF',
  pdfShow: 'Ver CV original en PDF',
  pdfIframeTitle: 'CV de Moisés Valero (PDF)',
  pdfHintBefore: 'Si no se muestra el documento, ',
  pdfHintLink: 'ábrelo en una pestaña nueva'
};

const en: CareerModalCopy = {
  closeAria: 'Close',
  title: 'Professional background — Moisés Valero',
  profileTitle: 'Profile',
  profileHtml: `<p class="career-p">
            I hold a <strong>Level 3 Vocational Certificate in Web Development</strong>
            (equivalent to <strong>higher vocational training</strong>), covering up-to-date skills
            for professional web development environments.
          </p>`,
  expTitle: 'Experience',
  timeline: [
    {
      range: '2019 – 2022',
      role: 'Freelance',
      descHtml:
        'Business digitalisation, technical project management, and systems maintenance.'
    },
    {
      range: '2012 – 2014',
      role: 'MutuaSAD',
      descHtml:
        'WordPress administration, e-commerce (WooCommerce / PrestaShop), and IT and network support.'
    },
    {
      range: '2001 – 2026',
      role: 'Additional background',
      descHtml: `Over two decades bringing <strong>professional maturity</strong> and
                <strong>leadership</strong> as a specialist in industrial environments and
                <strong>technical woodworking</strong>, with a strong focus on quality, coordination,
                and solving complex problems.`,
      span: true
    }
  ],
  stackTitle: 'Technical stack',
  stackLines: [
    'WordPress <span class="career-tag-sub">Kadence · Elementor</span>',
    'SvelteKit',
    'On-page SEO',
    'Generative AI <span class="career-tag-sub">prompt engineering · automation</span>'
  ],
  pdfHide: 'Hide PDF résumé',
  pdfShow: 'View original PDF résumé',
  pdfIframeTitle: 'Moisés Valero résumé (PDF)',
  pdfHintBefore: 'If the document does not display, ',
  pdfHintLink: 'open it in a new tab'
};

export function getCareerModalCopy(locale: SiteLocale): CareerModalCopy {
  return locale === 'en' ? en : es;
}
