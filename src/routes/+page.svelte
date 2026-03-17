<script lang="ts">
  import Hero from '$lib/components/Hero.svelte';
  import SocialProof from '$lib/components/SocialProof.svelte';
  import Workflow from '$lib/components/Workflow.svelte';
  import ComponentGallery from '$lib/components/ComponentGallery.svelte';
  import UseCases from '$lib/components/UseCases.svelte';
  import Superpowers from '$lib/components/Superpowers.svelte';
  import Features from '$lib/components/Features.svelte';
  import Pricing from '$lib/components/Pricing.svelte';
  import Testimonials from '$lib/components/Testimonials.svelte';
  import DeepDetails from '$lib/components/DeepDetails.svelte';
  import FAQ from '$lib/components/FAQ.svelte';
  import Footer from '$lib/components/Footer.svelte';

  // 2. PRICING: Lógica del interruptor (Svelte 5 runes)
  let isYearly = $state(false);
  function toggleBilling() {
    isYearly = !isYearly;
  }

  // 3. FAQ: Lista de preguntas (Svelte 5 runes)
  let faqs = $state([
    {
      question: "¿Qué incluye NovaKit?",
      answer:
        "Incluye más de 50 componentes premium, animaciones listas para usar y soporte prioritario.",
      open: false
    },
    {
      question: "¿Puedo usarlo en proyectos comerciales?",
      answer:
        "Sí, la licencia Pro te permite usarlo en proyectos ilimitados para clientes.",
      open: false
    },
    {
      question: "¿Necesito experiencia previa con Svelte?",
      answer:
        "No. NovaKit está pensado como una guía práctica: puedes partir de los ejemplos y aprender Svelte paso a paso mientras adaptas la landing.",
      open: false
    },
    {
      question: "¿Puedo adaptar el diseño a mi marca?",
      answer:
        "Claro. Los estilos están organizados en tokens y componentes, así que puedes cambiar tipografías, colores y espaciados sin romper el layout.",
      open: false
    }
  ]);

  function toggleFaq(index: number) {
    const next = faqs.map((item, i) => {
      // Si es el que pulsamos, alternamos; los demás se cierran
      if (i === index) {
        return { ...item, open: !item.open };
      }
      return { ...item, open: false };
    });
    faqs = next;
  }
</script>

<Hero />
<SocialProof />
<Workflow />
<ComponentGallery />
<UseCases />
<Superpowers />
<Features />
<Pricing {isYearly} {toggleBilling} />
<Testimonials />
<DeepDetails />
<FAQ {faqs} {toggleFaq} />
<Footer />