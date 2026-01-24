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
  category: {
    id: string;
    name: string;
  };
  images: ProductImage[];
  isFeatured: boolean;
  isArchived: boolean;
  isLive: boolean;
  createdAt: string | Date;
  isNew?: boolean;
  packItems?: {
    item: Product;
    quantity: number;
  }[];
  _count?: {
    packItems: number;
  };
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountedPrice?: number | null;
  image: string;
  quantity: number;
  stock: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: {
    name: string;
  };
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  fullName: string;
  phoneNumber: string;
  governorate: string;
  city: string;
  detailedAddress: string;
  totalPrice: number;
  status: string;
  createdAt: string | Date;
  items: OrderItem[];
}
