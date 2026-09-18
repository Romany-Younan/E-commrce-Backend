export interface IHeroSlide {
  _id: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  image: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
}
