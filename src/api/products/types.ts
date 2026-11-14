export type ProductStockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | string;

export interface ProductCategory {
  id: string;
  name: string;
  active?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  category?: ProductCategory | null;
  price: number;
  imageUrls?: string[] | null;
  stockQuantity?: number | null;
  madeToOrder?: boolean;
  active?: boolean;
  stockStatus?: ProductStockStatus | null;
}

export interface PageResult<T> {
  totalPage: number;
  numberOfElements: number;
  totalElements: number;
  data: T[];
}

export interface ListCatalogParams {
  page?: number;
  size?: number;
  categoryId?: string;
  search?: string;
}
