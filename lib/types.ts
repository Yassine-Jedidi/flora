export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProductImage {
  id: string;
  url: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  discountedPrice: number | null;
  stock: number;
  categoryId: string;
  category: Category;
  images: ProductImage[];
  isFeatured: boolean;
  isArchived: boolean;
  createdAt: string | Date;
  isNew?: boolean;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountedPrice?: number;
  image: string;
  quantity: number;
}
