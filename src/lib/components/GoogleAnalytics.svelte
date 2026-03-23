<script lang="ts">
  /**
   * GA4 solo si existe PUBLIC_GA_MEASUREMENT_ID y el usuario eligió «Aceptar todas».
   * Añade en .env: PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   */
  import { browser } from '$app/environment';
  import { env } from '$env/dynamic/public';
  import { cookieConsent } from '$lib/cookie-consent';
  import { get } from 'svelte/store';
  import { onMount, onDestroy } from 'svelte';

  const measurementId =
    typeof env.PUBLIC_GA_MEASUREMENT_ID === 'string' ? env.PUBLIC_GA_MEASUREMENT_ID.trim() : '';

  function loadGa() {
    if (!browser || !measurementId) return;
    if (document.getElementById('script-ga4-loader')) return;

    const loader = document.createElement('script');
    loader.id = 'script-ga4-loader';
    loader.async = true;
    loader.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(loader);

    const inline = document.createElement('script');
    inline.id = 'script-ga4-inline';
    inline.textContent = [
      'window.dataLayer=window.dataLayer||[];',
      'function gtag(){dataLayer.push(arguments);}',
      'gtag("js", new Date());',
      `gtag("config","${measurementId}");`
    ].join('');
    document.head.appendChild(inline);
  }

  let unsub: () => void = () => {};

  onMount(() => {
    if (get(cookieConsent) === 'all') loadGa();
    unsub = cookieConsent.subscribe((v) => {
      if (v === 'all') loadGa();
    });
  });

  onDestroy(() => unsub());
</script>
