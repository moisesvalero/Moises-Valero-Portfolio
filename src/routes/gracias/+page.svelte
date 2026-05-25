<script lang="ts">
  let { data } = $props<{ data: { canal: string; origen: string } }>();

  const isWhatsapp = $derived(data.canal === 'whatsapp');
  const title = $derived(isWhatsapp ? 'Perfecto, seguimos por WhatsApp' : 'Gracias, hemos recibido tu solicitud');
  const subtitle = $derived(
    isWhatsapp
      ? 'Pulsa el boton para abrir WhatsApp y seguimos con tu propuesta.'
      : 'Te escribiremos por email con una propuesta adaptada a tu web.'
  );
</script>

<svelte:head>
  <title>Gracias | Moisés Valero</title>
  <meta name="robots" content="noindex,nofollow" />
</svelte:head>

<main class="min-h-screen bg-slate-50 px-6 py-16">
  <section class="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 md:p-12 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
    <span class="inline-flex rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
      Gracias
    </span>
    <h1 class="mt-5 text-3xl md:text-4xl font-extrabold text-slate-900">{title}</h1>
    <p class="mt-3 text-slate-600">{subtitle}</p>

    <div class="mt-8 grid gap-3 sm:grid-cols-2">
      {#if isWhatsapp}
        <a
          href="/api/contact/whatsapp"
          class="inline-flex items-center justify-center rounded-xl bg-[#006c49] px-5 py-3 font-semibold text-white no-underline hover:opacity-95"
        >
          Abrir WhatsApp
        </a>
      {:else}
        <a
          href="/#contacto"
          class="inline-flex items-center justify-center rounded-xl bg-[#006c49] px-5 py-3 font-semibold text-white no-underline hover:opacity-95"
        >
          Volver al contacto
        </a>
      {/if}
      <a
        href="/"
        class="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-800 no-underline hover:bg-slate-100"
      >
        Volver al inicio
      </a>
    </div>

    <div class="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p class="text-sm text-slate-700">
        <strong>Siguiente paso:</strong> te respondemos con una propuesta clara y sin tecnicismos.
      </p>
      <p class="mt-1 text-xs text-slate-500">Origen: {data.origen} · Canal: {data.canal}</p>
    </div>
  </section>
</main>
