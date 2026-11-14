import { useQuery } from "@tanstack/react-query";

import {
  getCatalogProduct,
  listCatalogCategories,
  listCatalogProducts,
} from "@/api/products/products";
import { productKeys } from "@/api/products/querykeys";
import type { ListCatalogParams } from "@/api/products/types";

/** Catalog is browsable on the public site (API key) and in the dashboard (Bearer). */
export function useCatalogProducts(params: ListCatalogParams = {}) {
  return useQuery({
    queryKey: productKeys.catalog(params),
    queryFn: () => listCatalogProducts(params),
  });
}

export function useCatalogProduct(productId: string | undefined) {
  return useQuery({
    queryKey: productKeys.catalogDetail(productId ?? ""),
    queryFn: () => getCatalogProduct(productId as string),
    enabled: Boolean(productId),
  });
}

export function useCatalogCategories() {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: () => listCatalogCategories(),
  });
}
