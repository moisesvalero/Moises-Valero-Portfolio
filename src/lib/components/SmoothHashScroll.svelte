<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';

	/** Misma idea que tu widget WP: compensar header fijo (px). */
	const OFFSET = 90;

	function scrollToId(id: string) {
		const el = document.getElementById(id);
		if (!el) return false;
		const y = el.getBoundingClientRect().top + window.scrollY - OFFSET;
		window.scrollTo({ top: y, behavior: 'smooth' });
		return true;
	}

	onMount(() => {
		const onClick = (e: MouseEvent) => {
			const target = e.target;
			if (!(target instanceof Element)) return;

			const link = target.closest('a[href*="#"]');
			if (!(link instanceof HTMLAnchorElement)) return;

			let href = link.getAttribute('href');
			if (!href) return;

			if (/^https?:\/\//i.test(href)) {
				try {
					const u = new URL(href);
					if (u.origin !== window.location.origin) return;
					href = `${u.pathname}${u.hash}`;
				} catch {
					return;
				}
			}

			const hashIdx = href.indexOf('#');
			if (hashIdx === -1) return;

			const targetId = href.slice(hashIdx + 1);
			if (!targetId) return;

			const pathPart = href.slice(0, hashIdx);
			if (pathPart !== '' && pathPart !== '#') {
				const normalized = (pathPart.replace(/\/$/, '') || '/') as string;
				const current = (window.location.pathname.replace(/\/$/, '') || '/') as string;
				if (normalized !== current) return;
			}

			if (scrollToId(targetId)) {
				e.preventDefault();
			}
		};

		document.addEventListener('click', onClick, { capture: true, passive: false });
		return () => document.removeEventListener('click', onClick, { capture: true });
	});

	/** Si llegas a la home con hash (p. ej. desde otro sitio o `/#proyectos`), hacer scroll tras la navegación. */
	afterNavigate(() => {
		const id = window.location.hash.slice(1);
		if (!id) return;
		requestAnimationFrame(() => scrollToId(id));
	});
</script>
