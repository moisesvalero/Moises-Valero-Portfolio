export const landingDisenoWebAlcoyQuery = `coalesce(
  *[_type == "landingDisenoWebAlcoy" && _id == "landingDisenoWebAlcoy"][0],
  *[_type == "landingDisenoWebAlcoy"] | order(_updatedAt desc)[0]
){
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
  hero,
  services,
  maintenance,
  benefits,
  faq,
  finalCta,
  contactModal,
  localBusiness
}`;
