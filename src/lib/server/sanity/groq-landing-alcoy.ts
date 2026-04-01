const landingDisenoWebProjection = `{
  sectionOrder,
  seo{
    title,
    description,
    ogTitle,
    ogDescription,
    ogImage,
    ogImagePath,
    canonicalPath,
    twitterCard
  },
  hero{
    badge,
    title,
    subtitle,
    visualTitle,
    visualDescription,
    visualImage,
    visualImageSrc,
    visualImageAlt,
    splineUrl,
    cta,
    heroMarquee{
      kicker,
      items[]{
        _key,
        title,
        href,
        image,
        imageAlt
      }
    }
  },
  services,
  maintenance,
  benefits,
  faq,
  finalCta,
  analyzerModal,
  contactModal,
  localBusiness
}`;

export const landingDisenoWebAlcoyQuery = `coalesce(
  *[_type == "landingDisenoWebAlcoy" && _id == "landingDisenoWebAlcoy"][0],
  *[_type == "landingDisenoWebAlcoy"] | order(_updatedAt desc)[0]
)${landingDisenoWebProjection}`;

export const landingDisenoWebByIdQuery = `*[_type == "landingDisenoWebAlcoy" && _id == $documentId][0]${landingDisenoWebProjection}`;
