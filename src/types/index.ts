export interface ArticleItem {
  id: string;
  itemNumber: number;
  title: string;
  description: string;
  imageUrl: string;
  imagePrompt: string;
  imageAiProvider?: string;
  imageAiModel?: string;
  imageCropPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  textAiProvider?: string;
  textAiModel?: string;
  amazonKeyword: string;
  amazonSearchUrl: string;
  directAmazonUrl?: string;
  ctaText: string;
  estimatedPrice?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  metaDescription: string;
  category: string;
  tags: string[];
  items: ArticleItem[];
  createdAt: string;
  status: 'draft' | 'published';
  wpPostId?: number;
  wpPostUrl?: string;
  publishedAt?: string;
  textAiProvider?: string;
  textAiModel?: string;
}

export interface Settings {
  wpSiteUrl: string;
  wpUsername: string;
  wpAppPassword: string;
  amazonTag: string;
}

export interface PinterestPinData {
  title: string;
  subtitle: string;
  brandText: string;
  images: string[];
  template: 'hero' | 'split' | 'triple';
  backgroundColor: string;
  textColor: string;
  badgeColor: string;
  overlayOpacity: number;
}
