import { type ApiResponse, coreApi } from "@/api/api";
import type {
  ListCatalogParams,
  PageResult,
  Product,
  ProductCategory,
} from "@/api/products/types";

export type CategoryListPayload = ProductCategory[] | { data?: ProductCategory[] | null };

export function normalizeCategoryList(
  payload: CategoryListPayload | null | undefined,
): ProductCategory[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload.data) ? payload.data : [];
}

export async function listCatalogProducts(
  params: ListCatalogParams = {},
): Promise<ApiResponse<PageResult<Product>>> {
  const { data } = await coreApi.get<ApiResponse<PageResult<Product>>>(
    "/product/private/catalog",
    {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 20,
        ...(params.categoryId ? { categoryId: params.categoryId } : {}),
        ...(params.search?.trim() ? { search: params.search.trim() } : {}),
      },
    },
  );
  return data;
}

export async function getCatalogProduct(
  productId: string,
): Promise<ApiResponse<Product>> {
  const { data } = await coreApi.get<ApiResponse<Product>>(
    `/product/private/catalog/${productId}`,
  );
  return data;
}

export async function listCatalogCategories(): Promise<ApiResponse<CategoryListPayload>> {
  const { data } = await coreApi.get<ApiResponse<CategoryListPayload>>(
    "/product/private/catalog/categories",
  );
  return data;
}
