export type LandingSupportArticle = {
	slug: string;
	title: string;
	categoryLabel: string;
	excerpt: string;
	publishedAt: string;
	dateModified?: string;
	readingMinutes: number;
	coverImageSrc: string;
	coverImageAlt: string;
	bodyHtml: string;
	seoTitle: string;
	seoDescription: string;
	showOnBlog?: boolean;
	featuredOrder?: number;
};
