import type { SiteLocale } from '$lib/i18n/site-locale';

export type ChatbotPageCopy = {
  headTitle: string;
  headDescription: string;
  heroTag: string;
  heroTitleHtml: string;
  heroSub: string;
  stat1Num: string;
  stat1Label: string;
  stat2Num: string;
  stat2Label: string;
  stat3Num: string;
  stat3Label: string;
  stat4Label: string;
  imgMainAlt: string;
  retoTitle: string;
  retoP: string;
  hiceTitle: string;
  hiceP1: string;
  /** HTML seguro (solo contenido nuestro). */
  hiceHighlightHtml: string;
  flowTitle: string;
  flowL1: string;
  flowL2: string;
  flowL3: string;
  flowL4: string;
  flowL5: string;
  chatTitle: string;
  chatUser1: string;
  chatBot1: string;
  chatUser2: string;
  chatBot2: string;
  ctaTitle: string;
  ctaLead: string;
  ctaBtn: string;
  ctaBack: string;
};

const es: ChatbotPageCopy = {
  headTitle: 'Chatbot IA — Caso de Estudio | Moisés Valero',
  headDescription:
    'Asistente con Typebot, Llama 3.3 via Groq, Make.com y alertas Telegram. Caso de estudio del chatbot del portfolio.',
  heroTag: 'Proyecto en Producción · IA + Automatización',
  heroTitleHtml: 'Chatbot IA<br />Portfolio',
  heroSub:
    'Asistente conversacional con IA entrenado con mi perfil profesional y notificaciones en tiempo real vía Telegram.',
  stat1Num: '<1d',
  stat1Label: 'Desarrollo completo',
  stat2Num: 'IA',
  stat2Label: 'Llama 3.3 via Groq',
  stat3Num: 'Live',
  stat3Label: 'En producción ahora',
  stat4Label: 'Alertas Telegram',
  imgMainAlt: 'Chatbot IA en el portfolio',
  retoTitle: 'Un portfolio que responde por sí solo',
  retoP:
    'Añadir al portfolio un asistente inteligente capaz de responder preguntas sobre mi experiencia y habilidades, y notificarme en tiempo real cuando alguien interactúa con él — sin infraestructura compleja ni servicios de pago.',
  hiceTitle: 'IA conversacional + automatización real',
  hiceP1:
    'Desarrollé el chatbot con Typebot, integrando el modelo Llama 3.3 a través de la API de Groq para respuestas ultrarrápidas. Entrené el asistente con mi perfil profesional, CV y proyectos para que responda preguntas de reclutadores de forma autónoma.',
  hiceHighlightHtml:
    '<p><strong>Automatización:</strong> Cada conversación dispara un webhook en Make.com que envía el mensaje instantáneamente a un bot de Telegram — sé en tiempo real quién visita mi portfolio y qué pregunta.</p>',
  flowTitle: 'Flujo técnico completo',
  flowL1: 'Visitante<br />escribe',
  flowL2: 'Typebot<br />procesa',
  flowL3: 'Groq API<br />Llama 3.3',
  flowL4: 'Webhook<br />Make.com',
  flowL5: 'Telegram<br />notifica',
  chatTitle: 'Ejemplo de conversación real',
  chatUser1: '¿Tienes experiencia con WooCommerce?',
  chatBot1:
    'Sí, he desarrollado tiendas con WooCommerce incluyendo configuración de productos, pasarelas de pago como PayPal, y optimización de rendimiento. Puedes ver el proyecto Galería Nova en mi portfolio como ejemplo.',
  chatUser2: '¿Y con automatizaciones?',
  chatBot2:
    'Sí, este mismo chatbot es un ejemplo — integra Typebot, Groq API y Make.com para notificarme en Telegram cada vez que alguien escribe aquí.',
  ctaTitle: 'Pruébalo en vivo en mi portfolio',
  ctaLead: 'El chatbot está activo ahora mismo. Escríbele y te responderá al instante.',
  ctaBtn: 'Probar el Chatbot',
  ctaBack: '← Volver'
};

const en: ChatbotPageCopy = {
  headTitle: 'AI Chatbot — Case study | Moisés Valero',
  headDescription:
    'Assistant with Typebot, Llama 3.3 via Groq, Make.com, and Telegram alerts. Portfolio chatbot case study.',
  heroTag: 'Live project · AI + automation',
  heroTitleHtml: 'AI chatbot<br />Portfolio',
  heroSub:
    'Conversational AI trained on my professional profile with real-time notifications via Telegram.',
  stat1Num: '<1d',
  stat1Label: 'End-to-end build',
  stat2Num: 'AI',
  stat2Label: 'Llama 3.3 via Groq',
  stat3Num: 'Live',
  stat3Label: 'In production now',
  stat4Label: 'Telegram alerts',
  imgMainAlt: 'AI chatbot on the portfolio site',
  retoTitle: 'A portfolio that answers on its own',
  retoP:
    'Add a smart assistant that can answer questions about my experience and skills, and notify me in real time when someone uses it — without heavy infrastructure or paid services.',
  hiceTitle: 'Conversational AI + real automation',
  hiceP1:
    'I built the chatbot in Typebot, wiring Llama 3.3 through the Groq API for very fast replies. I trained it on my CV, profile, and projects so it can answer recruiter-style questions on its own.',
  hiceHighlightHtml:
    '<p><strong>Automation:</strong> Every conversation triggers a Make.com webhook that forwards the message instantly to a Telegram bot — I see who visits my portfolio and what they ask, in real time.</p>',
  flowTitle: 'Full technical flow',
  flowL1: 'Visitor<br />types',
  flowL2: 'Typebot<br />handles',
  flowL3: 'Groq API<br />Llama 3.3',
  flowL4: 'Webhook<br />Make.com',
  flowL5: 'Telegram<br />notifies',
  chatTitle: 'Sample conversation',
  chatUser1: 'Do you have experience with WooCommerce?',
  chatBot1:
    'Yes — I have built stores with WooCommerce including product setup, gateways like PayPal, and performance tuning. You can see the Galería Nova project in my portfolio as an example.',
  chatUser2: 'What about automation?',
  chatBot2:
    'This chatbot is one example — it combines Typebot, the Groq API, and Make.com to ping me on Telegram whenever someone writes here.',
  ctaTitle: 'Try it live on my portfolio',
  ctaLead: 'The chatbot is live right now. Open it and it will reply instantly.',
  ctaBtn: 'Open the chatbot',
  ctaBack: '← Back'
};

export function getChatbotPageCopy(locale: SiteLocale): ChatbotPageCopy {
  return locale === 'en' ? en : es;
}
