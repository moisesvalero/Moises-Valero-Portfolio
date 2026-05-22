type RevealStage = 'title' | 'content';

type RevealOptions = {
  delay?: number;
  distance?: number;
  stage?: RevealStage;
  threshold?: number;
  rootMargin?: string;
  immediate?: boolean;
};

const STAGE_DELAY: Record<RevealStage, number> = {
  title: 0,
  content: 120
};

function normalizeOptions(value: RevealOptions | undefined) {
  return {
    delay: value?.delay,
    distance: value?.distance,
    stage: value?.stage ?? 'content',
    threshold: value?.threshold ?? 0.18,
    rootMargin: value?.rootMargin ?? '0px 0px -18% 0px',
    immediate: value?.immediate ?? false
  };
}

function applyAssemblyVars(node: HTMLElement, options: ReturnType<typeof normalizeOptions>) {
  const totalDelay = options.delay ?? STAGE_DELAY[options.stage];
  node.classList.remove('assembly-title', 'assembly-content');
  node.classList.add('assembly-item', `assembly-${options.stage}`);
  node.style.setProperty('--assembly-delay', `${totalDelay}ms`);
  if (typeof options.distance === 'number') {
    node.style.setProperty('--assembly-distance', `${options.distance}px`);
  } else {
    node.style.removeProperty('--assembly-distance');
  }
}

/**
 * Svelte action para reveal global con efecto de ensamblaje magnético.
 * Añade clases + variables CSS, y dispara la visibilidad al entrar en viewport.
 */
export function reveal(node: HTMLElement, options?: RevealOptions) {
  let config = normalizeOptions(options);
  applyAssemblyVars(node, config);

  if (config.immediate || typeof IntersectionObserver === 'undefined') {
    node.classList.add('is-visible');
    return {
      update(nextOptions?: RevealOptions) {
        config = normalizeOptions(nextOptions);
        applyAssemblyVars(node, config);
        if (config.immediate) node.classList.add('is-visible');
      },
      destroy() {}
    };
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      node.classList.add('is-visible');
      observer.unobserve(node);
    },
    {
      threshold: config.threshold,
      rootMargin: config.rootMargin
    }
  );

  observer.observe(node);

  return {
    update(nextOptions?: RevealOptions) {
      config = normalizeOptions(nextOptions);
      applyAssemblyVars(node, config);
    },
    destroy() {
      observer.disconnect();
    }
  };
}
