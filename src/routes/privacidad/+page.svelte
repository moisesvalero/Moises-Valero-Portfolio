<script lang="ts">
  import { locale } from '$lib/i18n/index.js';
</script>

<svelte:head>
  {#if $locale === 'en'}
    <title>Privacy policy | Moisés Valero</title>
    <meta
      name="description"
      content="Privacy policy for moisesvalero.es: Google Analytics, cookies, contact and your rights under GDPR."
    />
  {:else}
    <title>Política de privacidad | Moisés Valero</title>
    <meta
      name="description"
      content="Política de privacidad de moisesvalero.es: Google Analytics, cookies, contacto y derechos RGPD."
    />
  {/if}
</svelte:head>

<main class="legal-doc" id="contenido">
  {#if $locale === 'en'}
    <article class="legal-inner">
      <h1>Privacy policy</h1>
      <p class="legal-updated">Version dated 22 March 2026</p>

      <p class="legal-disclaimer">
        This notice is prepared in accordance with Regulation (EU) 2016/679 (GDPR) and applicable
        national law. It is for information purposes and does not replace individual legal advice.
      </p>

      <h2>1. Data controller</h2>
      <p>
        <strong>Identity:</strong> Moisés Valero.<br />
        <strong>Website:</strong> <a href="https://moisesvalero.es">moisesvalero.es</a><br />
        <strong>Contact (privacy):</strong>
        <a href="mailto:info@moisesvalero.es">info@moisesvalero.es</a>
      </p>
      <p>
        There is no obligation to appoint a Data Protection Officer (DPO) unless legally required. For
        any query regarding processing, use the contact email above.
      </p>

      <h2>2. Purposes, legal bases and categories of data</h2>

      <h3>2.1 Operation of the website and technical security</h3>
      <p>
        <strong>Purpose:</strong> deliver content, maintain security and stability, manage language
        preference (cookie), and record cookie consent (local storage).<br />
        <strong>Categories:</strong> technical data (IP address, user agent, date/time of request),
        language preference, consent status.<br />
        <strong>Legal basis:</strong> Art. 6(1)(f) GDPR (legitimate interest in operating a secure and
        functional site); where consent is required for specific tools, Art. 6(1)(a) GDPR.
      </p>

      <h3>2.2 Google Analytics 4 (only if you accept all cookies)</h3>
      <p>
        <strong>Purpose:</strong> statistical analysis of traffic and use of the site (aggregated and
        pseudonymous metrics).<br />
        <strong>Provider:</strong> Google Ireland Limited / Google LLC, as applicable — see
        <a href="https://policies.google.com/privacy" rel="noopener noreferrer" target="_blank"
          >Google Privacy Policy</a
        >.<br />
        <strong>Categories:</strong> online identifiers, usage data, device data, approximate location,
        events collected by GA4.<br />
        <strong>Legal basis:</strong> Art. 6(1)(a) GDPR — consent via the cookie banner.
      </p>

      <h3>2.3 Typebot chat embed (only if you accept all cookies)</h3>
      <p>
        <strong>Purpose:</strong> provide an optional conversational assistant.<br />
        <strong>Categories:</strong> messages and technical data processed by Typebot and its
        subprocessors under their terms.<br />
        <strong>Legal basis:</strong> Art. 6(1)(a) GDPR — consent.
      </p>

      <h3>2.4 WhatsApp button</h3>
      <p>
        <strong>Purpose:</strong> redirect you to WhatsApp to start a conversation.<br />
        <strong>Categories:</strong> no message content is processed on this site before you leave;
        Meta/WhatsApp applies its own policy once you open the app or web client.<br />
        <strong>Legal basis:</strong> Art. 6(1)(b) or (f) GDPR as applicable (pre-contractual / legitimate
        interest in responding to contact requests).
      </p>

      <h3>2.5 Email contact</h3>
      <p>
        If you email us, we process your address and message content to deal with your request.<br />
        <strong>Legal basis:</strong> Art. 6(1)(b) and/or (f) GDPR.
      </p>

      <h2>3. Retention</h2>
      <p>
        Data are kept only as long as necessary for each purpose: for example, analytics data according
        to Google’s retention settings; correspondence for the time needed to handle your request and any
        legal obligations; technical logs according to hosting policy.
      </p>

      <h2>4. Recipients and subprocessors</h2>
      <p>
        Depending on the service used, data may be accessed by: <strong>hosting / infrastructure</strong>
        providers, <strong>Google</strong> (Analytics), <strong>Typebot</strong> (chat), and
        <strong>Meta</strong> (WhatsApp) when you use their services. Each acts under its own terms as
        processor or independent controller as described in their documentation.
      </p>

      <h2>5. International transfers</h2>
      <p>
        Providers may process data outside the EEA. Where required, transfers are based on appropriate
        safeguards under Chapter V GDPR (e.g. Standard Contractual Clauses). Information is available in
        the providers’ privacy documentation.
      </p>

      <h2>6. Your rights</h2>
      <p>Subject to conditions in the GDPR, you may have the right to:</p>
      <ul>
        <li>Access your personal data (Art. 15)</li>
        <li>Rectification (Art. 16)</li>
        <li>Erasure (“right to be forgotten”) (Art. 17)</li>
        <li>Restriction of processing (Art. 18)</li>
        <li>Data portability (Art. 20)</li>
        <li>Object to processing based on legitimate interests (Art. 21)</li>
        <li>Withdraw consent at any time, without affecting lawfulness of processing before withdrawal
          (Art. 7(3))</li>
      </ul>
      <p>
        To exercise your rights, contact <a href="mailto:info@moisesvalero.es">info@moisesvalero.es</a>.
        You may also lodge a complaint with a supervisory authority; in Spain, the
        <a href="https://www.aepd.es" rel="noopener noreferrer" target="_blank">AEPD</a>.
      </p>

      <h2>7. Automated decisions and profiling</h2>
      <p>
        We do not use automated decision-making, including profiling, which produces legal or similarly
        significant effects on you, in connection with the processing described here.
      </p>

      <h2>8. Minors</h2>
      <p>
        This site is not directed at children under 14. If you believe a minor has provided data, please
        contact us so we can delete it where appropriate.
      </p>

      <h2>9. Security</h2>
      <p>
        We implement appropriate technical and organisational measures proportionate to the risk, including
        HTTPS, access control on systems we control, and supplier selection. No system is 100% secure.
      </p>

      <h2>10. Changes</h2>
      <p>
        We may update this policy. The date at the top will be revised accordingly. Significant changes
        may be highlighted via the site.
      </p>
    </article>
  {:else}
    <article class="legal-inner">
      <h1>Política de privacidad</h1>
      <p class="legal-updated">Versión con fecha 22 de marzo de 2026</p>

      <p class="legal-disclaimer">
        El presente texto se elabora de conformidad con el Reglamento (UE) 2016/679 (RGPD) y la normativa
        española de desarrollo (entre otras, Ley Orgánica 3/2018, de Protección de Datos Personales y
        garantía de los derechos digitales — LOPDGDD). Tiene carácter informativo y no sustituye
        asesoramiento jurídico particular.
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <p>
        <strong>Identidad:</strong> Moisés Valero.<br />
        <strong>Sitio web:</strong> <a href="https://moisesvalero.es">moisesvalero.es</a><br />
        <strong>Correo de contacto (privacidad):</strong>
        <a href="mailto:info@moisesvalero.es">info@moisesvalero.es</a>
      </p>
      <p>
        No resulta obligatorio el nombramiento de Delegado de Protección de Datos (DPD/DPO) salvo que la
        normativa aplicable lo exija en su caso concreto. Para ejercicios de derechos o consultas sobre
        tratamientos, utilice el correo indicado.
      </p>

      <h2>2. Finalidades, bases jurídicas y categorías de datos</h2>

      <h3>2.1 Funcionamiento del sitio web y seguridad técnica</h3>
      <p>
        <strong>Finalidad:</strong> permitir la navegación, mantener la seguridad y disponibilidad,
        gestionar la preferencia de idioma (cookie) y registrar el consentimiento de cookies
        (almacenamiento local del navegador).<br />
        <strong>Categorías de datos:</strong> datos técnicos (dirección IP, agente de usuario, fecha y hora
        de la solicitud), preferencia lingüística, estado de consentimiento.<br />
        <strong>Base jurídica:</strong> art. 6.1.f RGPD (interés legítimo en la explotación segura y
        funcional del sitio); cuando una herramienta concreta exija consentimiento, art. 6.1.a RGPD.
      </p>

      <h3>2.2 Google Analytics 4 (solo si acepta todas las cookies)</h3>
      <p>
        <strong>Finalidad:</strong> elaborar estadísticas agregadas sobre visitas y uso del sitio
        (métricas de audiencia de carácter pseudonimizado).<br />
        <strong>Encargado / co-responsable según supuesto:</strong> Google Ireland Limited / Google LLC,
        según corresponda — véase
        <a href="https://policies.google.com/privacy?hl=es" rel="noopener noreferrer" target="_blank"
          >Política de privacidad de Google</a
        >.<br />
        <strong>Categorías:</strong> identificadores en línea, datos de uso, datos del dispositivo,
        localización aproximada, eventos recogidos por GA4.<br />
        <strong>Base jurídica:</strong> art. 6.1.a RGPD — consentimiento prestado mediante el banner de
        cookies.
      </p>

      <h3>2.3 Incorporación de chat Typebot (solo si acepta todas las cookies)</h3>
      <p>
        <strong>Finalidad:</strong> prestar asistente conversacional opcional.<br />
        <strong>Categorías:</strong> contenido del diálogo y datos técnicos tratados por Typebot y
        subencargados conforme a sus condiciones.<br />
        <strong>Base jurídica:</strong> art. 6.1.a RGPD — consentimiento.
      </p>

      <h3>2.4 Botón de WhatsApp</h3>
      <p>
        <strong>Finalidad:</strong> derivar al usuario a la aplicación o cliente web de WhatsApp para
        iniciar una conversación.<br />
        <strong>Categorías:</strong> en este sitio no se trata el contenido del chat antes de la salida;
        Meta/WhatsApp aplica su propia política al abrir su servicio.<br />
        <strong>Base jurídica:</strong> art. 6.1.b y/o 6.1.f RGPD (medidas precontractuales / interés
        legítimo en atender solicitudes de contacto), según el caso.
      </p>

      <h3>2.5 Contacto por correo electrónico</h3>
      <p>
        Si nos escribe por email, trataremos su dirección y el contenido del mensaje para atender su
        solicitud.<br />
        <strong>Base jurídica:</strong> art. 6.1.b y/o 6.1.f RGPD.
      </p>

      <h2>3. Plazos de conservación</h2>
      <p>
        Los datos se conservan el tiempo necesario para cada finalidad: por ejemplo, datos analíticos
        según la configuración de retención de Google; la correspondencia, el tiempo preciso para dar
        respuesta y el plazo legal de prescripción u obligación aplicable; registros técnicos del
        alojamiento según política del proveedor.
      </p>

      <h2>4. Destinatarios y encargados del tratamiento</h2>
      <p>
        Según el servicio utilizado, pueden acceder a datos: proveedores de <strong>alojamiento e
        infraestructura</strong>, <strong>Google</strong> (Analytics), <strong>Typebot</strong> (chat) y
        <strong>Meta</strong> (WhatsApp) cuando usted utilice su plataforma. Cada uno actúa conforme a su
        política como encargado o responsable independiente según corresponda.
      </p>

      <h2>5. Transferencias internacionales</h2>
      <p>
        Algunos proveedores pueden tratar datos fuera del Espacio Económico Europeo. Cuando proceda, las
        transferencias se amparan en las garantías del Capítulo V del RGPD (p. ej. cláusulas contractuales
        tipo). La información detallada figura en la documentación de privacidad de cada proveedor.
      </p>

      <h2>6. Derechos de las personas interesadas</h2>
      <p>Conforme al RGPD y la LOPDGDD, usted puede ejercer, entre otros, los derechos de:</p>
      <ul>
        <li><strong>Acceso</strong> (art. 15 RGPD)</li>
        <li><strong>Rectificación</strong> (art. 16)</li>
        <li><strong>Supresión</strong> (art. 17)</li>
        <li><strong>Limitación</strong> del tratamiento (art. 18)</li>
        <li><strong>Portabilidad</strong> (art. 20)</li>
        <li><strong>Oposición</strong> (art. 21), en particular frente a tratamientos basados en el
          interés legítimo</li>
        <li>
          <strong>Retirar el consentimiento</strong> en cualquier momento, sin efecto retroactivo sobre la
          licitud del tratamiento previo (art. 7.3 RGPD)
        </li>
      </ul>
      <p>
        Para ejercerlos, escriba a
        <a href="mailto:info@moisesvalero.es">info@moisesvalero.es</a> indicando el derecho que desea
        ejercer y, si procede, copia de documento identificativo. También puede presentar reclamación ante
        la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" rel="noopener noreferrer" target="_blank">www.aepd.es</a>).
      </p>

      <h2>7. Decisiones automatizadas y elaboración de perfiles</h2>
      <p>
        No adoptamos decisiones basadas únicamente en el tratamiento automatizado, incluida la
        elaboración de perfiles, que produzcan efectos jurídicos o le afecten significativamente de modo
        similar, en relación con los tratamientos descritos.
      </p>

      <h2>8. Menores de edad</h2>
      <p>
        Este sitio no está dirigido a menores de 14 años. Si detecta que un menor nos ha facilitado datos,
        rogamos nos lo comunique para proceder a su supresión cuando corresponda.
      </p>

      <h2>9. Medidas de seguridad</h2>
      <p>
        Aplicamos medidas técnicas y organizativas adecuadas al riesgo (p. ej. uso de HTTPS, control de
        accesos en los sistemas bajo nuestra esfera, selección de proveedores). Ningún sistema es
        invulnerable.
      </p>

      <h2>10. Modificaciones</h2>
      <p>
        Podremos actualizar esta política. La fecha superior reflejará la versión vigente. Los cambios
        relevantes podrán anunciarse en el sitio.
      </p>
    </article>
  {/if}
</main>

<style>
  .legal-doc {
    min-height: 60vh;
    padding: 120px 24px 80px;
    max-width: 760px;
    margin: 0 auto;
    font-family: var(--font-sans, 'Inter', system-ui, sans-serif);
  }

  .legal-inner h1 {
    font-size: clamp(28px, 4vw, 36px);
    font-weight: 800;
    color: #1d1d1f;
    margin: 0 0 8px;
    letter-spacing: -0.03em;
  }

  .legal-updated {
    color: #86868b;
    font-size: 13px;
    margin: 0 0 16px;
  }

  .legal-disclaimer {
    background: #f5f5f7;
    border: 1px solid #e8e8ed;
    border-radius: 12px;
    padding: 14px 16px;
    font-size: 13px;
    line-height: 1.55;
    color: #424245;
    margin: 0 0 28px;
  }

  .legal-inner h2 {
    font-size: 18px;
    font-weight: 700;
    color: #1d1d1f;
    margin: 32px 0 12px;
  }

  .legal-inner h3 {
    font-size: 15px;
    font-weight: 700;
    color: #1d1d1f;
    margin: 20px 0 10px;
  }

  .legal-inner p,
  .legal-inner li {
    font-size: 15px;
    line-height: 1.65;
    color: #424245;
    margin: 0 0 12px;
  }

  .legal-inner ul {
    margin: 0 0 12px;
    padding-left: 1.25rem;
  }

  .legal-inner a {
    color: #0071e3;
    font-weight: 600;
    text-decoration: none;
    word-break: break-word;
  }

  .legal-inner a:hover {
    text-decoration: underline;
  }
</style>
