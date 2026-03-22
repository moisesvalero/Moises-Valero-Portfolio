<script lang="ts">
  /** Lockup tipo referencia: MV + WEB DEVELOPER, sombra suave, centrado. */
  const MV_PATH =
    'M241.923 349.546c17.855-.08 40.638-.865 58.144-.038l83.455 139.276a7488 7488 0 0 0 80.436-135.335c14.793 25.929 28.822 52.915 43.348 79.151 5.921 10.694 16.383 29.46 20.708 40.183 1.053 2.612.511 30.203.531 35.185l.058 110.42-38.217.013c-7.196-.018-15.277-.379-22.329.052.418-13.672.131-28.236.073-41.939q.126-23.882.003-47.764l-.132-61.85a5128 5128 0 0 0-56.684 89.981c-8.128 13.05-20.927 31.736-27.712 44.87-4.271-6.107-8.743-14.087-12.685-20.593a4027 4027 0 0 0-21.434-35.033l-29.459-47.606c-6.378-10.173-13.505-20.856-19.471-31.179-.574 17.566-.08 36.853-.142 54.547a4809 4809 0 0 0-.09 96.458c-7.767-.555-18.274-.116-26.187-.016a757 757 0 0 1-31.962-.18c-.595-20.248-.102-44.09-.109-64.603l.094-134.947-.005-43.021c-.001-8.303.206-17.824-.232-26.032m475.245-.418c21.189-.571 45.561-.099 66.909.053l-54.598 105.598c-6.873 12.543-13.572 26.216-20.179 39a4326 4326 0 0 1-29.506 56.348l-21.904 41.426c-4.724 8.874-9.83 17.959-14.118 27.016-3.683.21-7.435.111-11.129.068L528.929 429.721c-13.862-25.307-31.495-54.656-43.94-80.187l44.015-.284c8.627-.065 18.293-.338 26.828.074l45.526 85.548c11.256 20.778 26.833 47.599 36.198 68.544 2.696-4.399 7.487-15.091 10.016-20.178a1938 1938 0 0 1 18.793-36.843c16.644-32.457 34.511-64.514 50.803-97.267';

  let {
    href,
    ariaLabel
  }: {
    href: string;
    ariaLabel: string;
  } = $props();
</script>

<a {href} class="header-brand" aria-label={ariaLabel}>
  <svg
    class="header-brand-mv"
    viewBox="168 268 632 292"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path fill="#1d1d1f" d={MV_PATH} />
  </svg>
  <span class="header-brand-tag">WEB DEVELOPER</span>
</a>

<style>
  .header-brand {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.28rem;
    text-decoration: none;
    color: inherit;
    flex-shrink: 0;
    filter:
      drop-shadow(0 1px 1px rgba(29, 29, 31, 0.06))
      drop-shadow(0 3px 8px rgba(29, 29, 31, 0.1));
  }

  .header-brand-mv {
    display: block;
    height: 42px;
    width: auto;
    aspect-ratio: 632 / 292;
    max-width: min(58vw, 236px);
  }

  .header-brand-tag {
    font-family: var(--font-sans);
    font-size: 0.5625rem;
    font-weight: 400;
    letter-spacing: 0.18em;
    line-height: 1;
    color: #1d1d1f;
    text-transform: uppercase;
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    .header-brand {
      gap: 0.22rem;
    }
    .header-brand-mv {
      height: 32px;
      max-width: min(50vw, 180px);
    }
    .header-brand-tag {
      font-size: 0.5rem;
      letter-spacing: 0.14em;
    }
  }
</style>
