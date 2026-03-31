export const landingSupportArticlesQuery = `*[
  _type == "landingSupportArticle"
] | order(publishedAt desc, _updatedAt desc){
  "slug": slug.current,
  title,
  categoryLabel,
  excerpt,
  publishedAt,
  readingMinutes,
  image,
  coverImageSrc,
  coverImageAlt,
  seoTitle,
  seoDescription
}`;
