## NovaKit SvelteKit Starter

Plantilla base para crear **páginas web modernas** (landings y pantallas de producto) con **SvelteKit 2 + Svelte 5 + TypeScript**.

- Una **home mínima** muy sencilla, pensada como **punto de partida limpio**.
- Una ruta de ejemplo con una **landing completa** para inspirarte y copiar secciones.
- Una colección de **piezas reutilizables de interfaz** (botones, secciones, tarjetas, etc.).

Está pensada para que **también alguien que nunca ha usado SvelteKit** pueda arrancar paso a paso, incluso si sueles apoyarte en IA para escribir el código.

---

## Inicio rápido en 10 pasos (nueva web con esta plantilla)

1. **Copia la plantilla** (Git clone o ZIP).
2. **Entra en la carpeta** del nuevo proyecto.
3. Ejecuta `npm install`.
4. Crea `.env` copiando `.env.example`.
5. En `.env`, define `PUBLIC_SITE_URL` (local o dominio final).
6. Ejecuta `npm run dev`.
7. Abre la URL local que te da la terminal.
8. Edita tu home en `src/routes/+page.svelte` y colores en `src/app.css`.
9. Despliega en Vercel y configura `PUBLIC_SITE_URL` con tu dominio real.
10. Verifica SEO en `/sitemap.xml` y `/robots.txt`.

Si algo falla, ejecuta `npm run check` y revisa el mensaje exacto.

---

## 1. Qué necesitas antes de empezar (nivel muy básico)

- **Node.js 18 o superior**  
  - Descarga desde la web oficial (`https://nodejs.org`) e instala con las opciones por defecto.
  - Después de instalar, en una terminal ejecuta:

    ```bash
    node -v
    npm -v
    ```

    Si ves dos versiones (por ejemplo `v20.x` y `10.x`), estás listo.

- **Git (opcional pero recomendado)**  
  - Sirve para clonar esta plantilla y versionar cambios.

No necesitas conocer Svelte ni SvelteKit de antemano: esta plantilla ya trae una estructura funcional.  
Si usas una IA (como ChatGPT, Cursor, etc.), puedes copiar y pegar partes de este README en tus preguntas para que te ayude con pasos concretos.

> Nota: en el resto del README se mencionan a veces palabras como "componente" o "propiedad". Si no te suenan, piensa en:
> - **Componente** = una pieza visual reutilizable (un botón, una tarjeta, una sección).
> - **Propiedad (prop)** = un dato que le pasas a esa pieza (por ejemplo, el texto de un botón).

---

## 2. Cómo crear un proyecto nuevo desde esta plantilla

Tienes dos formas típicas de usarla.

### Opción A: Clonar el repositorio (recomendada para desarrollo propio)

1. Abre una terminal.
2. Ve a la carpeta donde quieras guardar el proyecto:

   ```bash
   cd ruta/donde/guardar
   ```

3. Clona el repositorio (cambia la URL por la de tu repo si es distinta):

   ```bash
   git clone <URL_DE_ESTE_REPO> mi-nueva-app
   cd mi-nueva-app
   ```

4. Instala dependencias e inicia el servidor:

   ```bash
   npm install
   npm run dev
   ```

5. Abre el navegador en `http://localhost:5173` (o la URL que muestre la terminal).

### Opción B: Descargar ZIP

1. Descarga el ZIP del repositorio desde la interfaz de GitHub (o similar).
2. Descomprime el ZIP en una carpeta, por ejemplo `mi-nueva-app`.
3. Abre una terminal en esa carpeta:

   ```bash
   cd ruta/mi-nueva-app
   npm install
   npm run dev
   ```

Con esto ya tendrás la plantilla funcionando en local.

---

## 3. Comandos básicos que vas a usar

Todos se ejecutan desde la carpeta del proyecto.

- **Arrancar en desarrollo**:

  ```bash
  npm run dev
  ```

- **Abrir el navegador automáticamente**:

  ```bash
  npm run dev -- --open
  ```

- **Comprobar el proyecto (errores de tipos y Svelte)**:

  ```bash
  npm run check
  ```

- **Generar la build de producción**:

  ```bash
  npm run build
  ```

- **Probar la build de producción en local**:

  ```bash
  npm run preview
  ```

Si alguno de estos comandos falla con algo como `svelte-kit no se reconoce`, asegúrate de haber hecho `npm install` correctamente y de estar ejecutándolos dentro de la carpeta del proyecto.

---

## 4. Estructura del proyecto (visión rápida y sin tecnicismos)

No hace falta entender toda la estructura interna para empezar. Solo qué archivos tocar para ver cambios:

- `src/routes`
  - `+layout.svelte` – Layout principal (cabecera, navegación, cambio de idioma, estilos globales).
  - `+page.svelte` – **Home mínima del starter** (ejemplo sencillo con hero + features).
  - `examples/landing/+page.svelte` – **Landing completa de demostración** basada en NovaKit.

- `src/lib`
  - `components/ui` – **Componentes base reutilizables** (botones, secciones, hero genérico, etc.).
  - `components` – Componentes avanzados y específicos usados en la landing de ejemplo.
  - `examples/landing` – Exports agrupados de los componentes de landing de ejemplo.
  - `i18n` – Sistema simple de traducciones (ES/EN).
  - `reveal.ts` – Acción de Svelte para animaciones al hacer scroll.

Como regla simple que puedes recordar:

- `components/ui` → piezas genéricas que puedes reutilizar en muchos proyectos.
- `routes/+page.svelte` → tu **página principal** (home) actual.
- `routes/examples/landing` → página **solo de ejemplo** (no es obligatorio mantenerla en tu proyecto final).

---

## 5. Componentes base (`src/lib/components/ui`) explicados en simple

Piensa en estos componentes como **piezas de Lego** ya diseñadas (botones, secciones, tarjetas…).  
No necesitas saber cómo están hechos por dentro: solo **usarlos y cambiarles el texto**.

- **`Container.svelte`**  
  Contenedor centrado con `max-width` y padding horizontal responsivo.

- **`Section.svelte`**  
  Wrapper de sección con variantes de fondo:
  - `variant="default" | "muted" | "soft" | "surface"`

- **`Button.svelte`**  
  Botón reutilizable (lo que la gente hace clic).
  - Puedes cambiar el texto que se ve (por ejemplo de “Ver ejemplo completo” a “Empezar ahora”).  
  - Puede usarse como botón normal o como enlace (`href="/ruta"`).

- **`Heading.svelte`**  
  Títulos y subtítulos.
  - `level` controla si es un título grande (`1`) o más pequeño (`3`, `4`).  
  - `eyebrow` y `kicker` son textos pequeños arriba/abajo del título (opcionales).

- **`Text.svelte`**  
  Párrafos y textos secundarios (descripciones).

- **`Card.svelte`**  
  Tarjeta con borde y fondo. Útil para agrupar contenido (por ejemplo cada “feature”).

- **`Grid.svelte`**  
  Sirve para colocar varias tarjetas en forma de cuadrícula (2 columnas, 3 columnas, etc.).

- **`HeroSection.svelte`**  
  Es la “primera sección” típica de una landing: título grande, texto, y uno o dos botones.
  - Solo necesitas cambiar textos y enlaces para adaptarlo a tu proyecto.

- **`FeaturesSection.svelte`**  
  Sección con varias características/beneficios en columnas.
  - Cada elemento tiene icono (opcional), título y descripción.

---

## 6. Tu primer cambio: adaptar la home mínima (sin saber programar)

La home vive en `[src/routes/+page.svelte](src/routes/+page.svelte)` y usa solo componentes `ui`.  
Es el lugar más fácil para empezar y puedes editarla incluso si apenas sabes de código.

- **Paso 1 – Cambia el texto del hero (cabecera principal)**
  - Edita las props de `HeroSection`:
    - `eyebrow`: texto pequeño encima del título (por ejemplo, el tipo de producto).
    - `title`: el mensaje principal de tu producto.
    - `subtitle`: una frase corta explicando qué hace.

- **Paso 2 – Ajusta los botones (CTAs)**
  - Cambia `primaryLabel` y `secondaryLabel` para reflejar tus acciones (por ejemplo: “Empezar gratis”, “Ver documentación”).
  - Actualiza `primaryHref` y `secondaryHref` con las rutas reales que quieras usar.

- **Paso 3 – Actualiza las características (features)**
  - En el array `items` de `FeaturesSection`, edita:
    - `icon`: puedes usar emojis o dejarlo vacío.
    - `title`: el beneficio principal.
    - `description`: breve explicación.

Con solo estos tres pasos tendrás una primera versión de tu landing funcionando.  
Si no entiendes algún error de sintaxis (comas, llaves, etc.), copia el mensaje de error y el trozo de código y pide ayuda a tu IA de confianza.

---

## 7. Usar la landing de ejemplo completa (para inspirarte)

La ruta `[src/routes/examples/landing/+page.svelte](src/routes/examples/landing/+page.svelte)` monta la **landing completa original**:

- Hero avanzado con animaciones y Spline.
- Secciones de social proof, workflow, gallery, use cases, superpowers, pricing, testimonials, detalles y FAQ.

Puedes usarla para:

- Ver cómo se organiza una página más grande en SvelteKit.
- Copiar secciones concretas que te gusten a tus propias rutas.
- Tomar ideas de motion y composición.

Si tu proyecto final no debe mencionar NovaKit, tienes dos opciones:

1. Reutilizar solo los componentes de `components/ui` y construir tus pantallas encima.
2. Copiar componentes concretos desde `src/lib/components` a otra carpeta, cambiar textos/estilos y usarlos como base.

---

## 8. i18n y textos (traducciones, opcional)

Este apartado es un poco más técnico. Puedes ignorarlo al principio.  

El proyecto trae un sistema de traducciones simple **ES/EN**:

- `src/lib/i18n/index.js` – Store de idioma y helper `t` para traducir.
- `src/lib/i18n/en.json` y `src/lib/i18n/es.json` – Textos en inglés y español.

Cómo funciona, a muy alto nivel:

- En los componentes verás cosas como `{$t('hero.subtitle')}`.
- Esa clave se busca en los JSON de `en` y `es`.
- El idioma actual se gestiona con un store y un botón en el layout.

Para empezar, no necesitas tocar esto. Más adelante puedes:

- Añadir nuevas claves para tus propios textos.
- Traducir solo lo que quieras mantener en varios idiomas.

Si no quieres complicarte, puedes dejar los textos directamente escritos en los componentes de tu proyecto (como hiciste en la home) y olvidar este sistema hasta más adelante.

---

## 9. Cómo adaptar la plantilla a tu marca (sin romper nada)

1. **Colores y tipografía**  
   - Abre tus estilos globales (`app.css`).  
   - Busca variables como `--accent`, `--text-main`, `--text-secondary` y ajústalas a tu paleta.
   - Cambia la fuente base si lo necesitas (familia tipográfica, tamaños, etc.).

2. **Home**  
   - Adapta textos del hero y las features.
   - Elimina o añade secciones según lo que necesite tu producto.

3. **Secciones avanzadas (solo cuando ya estés cómodo)**  
   - Ve a `src/lib/components` y localiza la sección que te interese (pricing, FAQ, etc.).  
   - Copia el componente a otra carpeta (por ejemplo `src/lib/components/mi-proyecto`) y cambia textos y estilos ahí.  
   - Si no sabes qué tocar, copia el archivo y pide a la IA: “adapta este componente a mi producto sin cambiar su estructura básica”.

4. **Contenido y datos**  
   - Sustituye números, nombres de empresa y ejemplos por datos reales de tu producto (por ejemplo, tus precios reales, tu número de clientes, etc.).

---

## 10. Buenas prácticas sugeridas

- Usa `src/lib/components/ui` para todos los bloques base y compón sobre ellos.
- Mantén secciones muy específicas de cada proyecto en carpetas tipo `src/lib/components/tu-proyecto` o `src/lib/examples`.
- Evita meter textos de marketing dentro de los componentes base: pasa los textos mediante **props** o **i18n**.

Con esto tienes una base lista para construir **starters reutilizables** y landings de producto modernas sobre SvelteKit, incluso si es tu primera vez trabajando con este framework o si te apoyas en IA para escribir el código.

---

## 11. SEO automático incluido (listo para futuros proyectos)

La plantilla ya viene preparada con una base SEO reutilizable para que en cada proyecto solo cambies la URL pública.

### Variable de entorno obligatoria

Define en tu entorno (por ejemplo en Vercel):

- `PUBLIC_SITE_URL=https://tu-dominio.com`

Con esa variable, el proyecto genera metadatos y rutas SEO sin hardcodear dominio.

### Archivos SEO añadidos

- `src/routes/sitemap.xml/+server.js`  
  Genera sitemap dinámico usando `PUBLIC_SITE_URL`.

- `src/routes/robots.txt/+server.js`  
  Permite indexación y apunta al sitemap correcto.

- `src/lib/seo.js`  
  Store reutilizable para:
  - `title`
  - `description`
  - `ogTitle`
  - `ogDescription`
  - `ogImage`
  - `ogUrl`
  - `twitterCard`
  - `canonical`

- `src/app.html`  
  Deja el head base preparado para recibir SEO dinámico desde cada página.

- `src/routes/+page.svelte`  
  Incluye ejemplo real de uso del store (`setSeo(...)` + `<svelte:head>`).

### Uso rápido por página

1. Importa en la página:
   - `import { seo, setSeo } from '$lib/seo';`
2. Llama `setSeo({ ... })` con metadatos específicos de esa ruta.
3. Renderiza `<svelte:head>` leyendo valores desde `$seo`.

Así cada nueva página puede tener su SEO propio sin repetir lógica.

---

## 12. CMS para edición fácil tipo WordPress

Si quieres que clientes editen contenido sin tocar código, integra un CMS headless.

Opciones recomendadas:

- **Sanity**  
  Muy cómodo para clientes y equipos, plan gratuito para empezar.

- **Decap CMS**  
  Open source y gratis, ideal para contenido basado en Git (Markdown/JSON).

- **Directus / Strapi / Payload**  
  Open source, muy potentes si necesitas panel más avanzado.

### En qué te ayuda

- Editar textos, imágenes, SEO y páginas desde panel.
- Mantener frontend moderno (SvelteKit) sin depender de plugins de WP.
- Escalar proyectos con una misma base técnica.

---

## 13. Implementacion de hoy: analizador web para captacion

Resumen de lo que se ha implementado en la landing `src/routes/diseno-web-alcoy/+page.svelte` para captar leads con un analizador de velocidad.

### Objetivo de negocio

- Convertir visitas en leads cualificados con una accion de muy baja friccion.
- Ofrecer valor inmediato (analisis de URL) y cerrar con CTA a WhatsApp o email.

### Cambios funcionales principales

- En el hero, el CTA secundario abre un modal de **Analiza tu web gratis**.
- El usuario introduce una URL (con o sin `https://`) y se lanza analisis via API.
- Resultado con:
  - score de rendimiento
  - metricas simplificadas para no tecnicos
  - etiquetas de estado visuales (rapida/lenta, ligera/pesada, etc.)
- CTA dual tras resultado:
  - `WhatsApp ahora`
  - `Quiero propuesta por email`
- Captura de email opcional en el mismo modal para enviar informe.

### Endpoints API nuevos/actualizados

- `src/routes/api/pagespeed/analyze/+server.ts`
  - Llama a Google PageSpeed Insights.
  - Soporta estrategia `mobile` y `desktop`.
  - Fallback automatico (si falla mobile, intenta desktop desde frontend).
  - Cache por URL para ahorrar cuota.
  - Limites de uso por IP/hora y por dia.

- `src/routes/api/pagespeed/lead/+server.ts`
  - Envia email interno (owner) + email de informe al cliente.
  - Guarda lead en Sanity (si hay token de escritura).
  - Link de WhatsApp directo en email (`wa.me`) para mejor UX.
  - Anti-bot/anti-spam: honeypot + rate limit + cooldown por email.

- `src/routes/api/contact/form/+server.ts`
  - Se reforzo con rate limit por IP para reducir spam.

### Integracion con Sanity

- Nuevo schema de leads: `sanity/schemaTypes/analyzerLead.ts`.
- Nuevo bloque editable para textos del modal analizador:
  - tipo `analyzerModal` dentro de `landingDisenoWebAlcoy`.
- Se actualizaron:
  - `sanity/schemaTypes/landingDisenoWebAlcoy.ts`
  - `src/lib/types/landing-alcoy.ts`
  - `src/lib/data/landing-alcoy-defaults.ts`
  - `src/lib/server/sanity/groq-landing-alcoy.ts`
  - `src/lib/server/sanity/map-landing-alcoy.ts`

### Variables de entorno necesarias

Obligatorias para funcionamiento completo del analizador:

- `PAGESPEED_API_KEY`
- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL`

Recomendadas:

- `WHATSAPP_E164` (solo numeros, sin `+`)
- `PAGESPEED_MAX_CALLS_PER_DAY` (ej. `250`)
- `PAGESPEED_RATE_LIMIT_PER_HOUR` (ej. `15`)
- `PUBLIC_SITE_URL`

Para guardar leads en Sanity:

- `SANITY_PROJECT_ID`
- `SANITY_DATASET`
- `SANITY_API_VERSION`
- `SANITY_WRITE_TOKEN`

### Seguridad aplicada en esta iteracion

- Rate limit en endpoints de analisis y formularios.
- Honeypot en formularios de lead.
- Cooldown por email para prevenir envios repetitivos.
- Se evita devolver detalles internos de errores al cliente.

### Verificacion recomendada antes de desplegar

1. `npm run check`
2. `npm run build`
3. Probar en local:
   - analisis URL
   - envio informe por email
   - clic WhatsApp
4. Verificar en produccion:
   - recepcion de emails
   - guardado de lead en Sanity (si procede)

Nota: ajuste minimo para generar un nuevo commit manual.
