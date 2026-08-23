export const landingSupportArticleBySlugQuery = `*[
  _type == "landingSupportArticle" &&
  slug.current == $slug
][0]{
  "slug": slug.current,
  title,
  categoryLabel,
  excerpt,
  publishedAt,
  "dateModified": _updatedAt,
  readingMinutes,
  image,
  coverImageSrc,
  coverImageAlt,
  bodyHtml,
  seoTitle,
  seoDescription
}`;
