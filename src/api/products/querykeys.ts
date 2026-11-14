import type { ListCatalogParams } from "@/api/products/types";

export const productKeys = {
  all: ["products"] as const,
  catalogs: () => [...productKeys.all, "catalog"] as const,
  catalog: (params: ListCatalogParams = {}) =>
    [...productKeys.catalogs(), params] as const,
  catalogDetail: (id: string) => [...productKeys.all, "catalog-detail", id] as const,
  categories: () => [...productKeys.all, "categories"] as const,
};
