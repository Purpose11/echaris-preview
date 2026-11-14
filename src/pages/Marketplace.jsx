import React from "react";
import { useNavigate } from "react-router-dom";

import { useCatalogCategories, useCatalogProducts } from "@/api/products/hooks";
import { normalizeCategoryList } from "@/api/products/products";
import {
  formatProductPrice,
  isProductFinancable,
  mapProductStockLabel,
  productCategoryLabel,
  productPrimaryImage,
} from "@/lib/products";
import { isAuthenticated } from "@/utils/authHelper";
import { normalizeError } from "@/utils/normalizeError";

import { Reveal } from "../components/Reveal.jsx";
import { Badge } from "../design-system/components/core/Badge.jsx";
import { Button } from "../design-system/components/core/Button.jsx";
import { Card } from "../design-system/components/core/Card.jsx";
import { Icon } from "../design-system/components/core/Icon.jsx";
import { EmptyState } from "../design-system/components/data/EmptyState.jsx";
import { Input } from "../design-system/components/forms/Input.jsx";
import { Pagination } from "../design-system/components/navigation/Pagination.jsx";

const SIZE = 7;

const STOCK_TONE = {
  "In stock": "success",
  "Low stock": "warning",
  "Out of stock": "danger",
  "Made to order": "neutral",
};

function financePath(productId, quantity = 1) {
  const base = `/dashboard/marketplace/finance/${productId}`;
  if (quantity > 1) return `${base}?quantity=${quantity}`;
  return base;
}

function startFinancing(navigate, productId, quantity = 1) {
  const path = financePath(productId, quantity);
  if (isAuthenticated()) {
    navigate(path);
    return;
  }
  navigate("/login", { state: { from: path } });
}

function ProductCard({ product, open, onFinance }) {
  const stock = mapProductStockLabel(product);
  const image = productPrimaryImage(product);
  const canFinance = isProductFinancable(product);

  return (
    <Card padding={0} interactive style={{ overflow: "hidden", height: "100%" }}>
      <div className="pc">
        <div className="pc-img">
          {image ? (
            <img
              src={image}
              alt={product.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--neutral-100)",
                color: "var(--text-muted)",
              }}
            >
              <Icon name="package" size={32} />
            </div>
          )}
          {stock ? (
            <div style={{ position: "absolute", top: 12, left: 12 }}>
              <Badge tone={STOCK_TONE[stock] || "neutral"}>{stock}</Badge>
            </div>
          ) : null}
        </div>
        <div className="pc-b" onClick={() => open(product)}>
          {productCategoryLabel(product) ? (
            <span className="micro">{productCategoryLabel(product)}</span>
          ) : null}
          <h3 className="pc-n">{product.name}</h3>
          <div className="pc-price">
            <span className="pc-v">{formatProductPrice(Number(product.price) || 0)}</span>
          </div>
          <div className="pc-a">
            <Button
              size="sm"
              fullWidth
              disabled={!canFinance}
              onClick={(e) => {
                e.stopPropagation();
                onFinance(product);
              }}
            >
              Start financing
            </Button>
            <Button
              size="sm"
              variant="ghost"
              fullWidth
              onClick={(e) => {
                e.stopPropagation();
                open(product);
              }}
            >
              View details
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function Row({ label, value }) {
  return (
    <div className="row">
      <span className="row-l">{label}</span>
      <span className="row-v">{value}</span>
    </div>
  );
}

function ProductDetail({ product, back, onFinance }) {
  const [qty, setQty] = React.useState(1);
  const unit = Number(product.price) || 0;
  const total = unit * qty;
  const stock = mapProductStockLabel(product);
  const image = productPrimaryImage(product);
  const category = productCategoryLabel(product);
  const canFinance = isProductFinancable(product);

  return (
    <section className="band" style={{ background: "var(--surface-card)" }}>
      <div className="wrap" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <button type="button" className="back" onClick={back}>
          <Icon name="arrow-left" size={16} />
          Back to marketplace
        </button>
        <div className="pd">
          <div className="pd-img anim-in anim-in-1">
            {image ? (
              <img
                src={image}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  borderRadius: 16,
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  minHeight: 320,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--neutral-100)",
                  borderRadius: 16,
                  color: "var(--text-muted)",
                }}
              >
                <Icon name="package" size={48} />
              </div>
            )}
          </div>
          <div className="pd-b anim-in anim-in-2">
            {category ? <span className="micro">{category}</span> : null}
            <h1 className="h1" style={{ fontSize: "var(--fs-h1)" }}>
              {product.name}
            </h1>
            <div className="pd-v">{formatProductPrice(unit)}</div>
            {product.description?.trim() ? (
              <p className="pd-d">{product.description.trim()}</p>
            ) : null}
            <div className="rows">
              <Row
                label="Availability"
                value={
                  stock ? (
                    <Badge tone={STOCK_TONE[stock] || "neutral"}>{stock}</Badge>
                  ) : (
                    "—"
                  )
                }
              />
              <Row label="Delivery options" value="Home delivery or pickup station" />
            </div>
            <div className="qty">
              <div>
                <div className="micro">Quantity</div>
                <div className="qty-n">
                  {qty} {qty === 1 ? "unit" : "units"} · {formatProductPrice(total)}
                </div>
              </div>
              <div className="qty-c">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={qty === 1}
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <Icon name="minus" size={16} />
                </button>
                <span className="qty-v" aria-live="polite">
                  {qty}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={qty === 99}
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                >
                  <Icon name="plus" size={16} />
                </button>
              </div>
            </div>
            <p
              className="ms-n"
              style={{ fontWeight: 600, color: "var(--brand-primary)" }}
            >
              Your products are released once accumulated performance returns reach 50% of
              the total value.
            </p>
            <div className="pc-a">
              <Button size="lg" variant="ghost" iconLeft="arrow-left" onClick={back}>
                Back to products
              </Button>
              <Button
                size="lg"
                disabled={!canFinance}
                onClick={() => onFinance(product, qty)}
                style={{ minWidth: 200 }}
              >
                Start financing
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Marketplace() {
  const navigate = useNavigate();
  const [categoryId, setCategoryId] = React.useState("all");
  const [sel, setSel] = React.useState(null);
  const [q, setQ] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [open2, setOpen2] = React.useState(false);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(q.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [q]);

  React.useEffect(() => {
    if (!open2) return;
    const close = (e) => {
      if (!e.target.closest(".filter")) setOpen2(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open2]);

  const categoriesQuery = useCatalogCategories();
  const catalogQuery = useCatalogProducts({
    page: 1,
    size: 100,
    search: debouncedSearch || undefined,
    categoryId: categoryId === "all" ? undefined : categoryId,
  });

  const categories = React.useMemo(
    () =>
      normalizeCategoryList(categoriesQuery.data?.data).filter(
        (c) => c.active !== false && Boolean(c.id) && Boolean(c.name?.trim()),
      ),
    [categoriesQuery.data],
  );

  const products = React.useMemo(
    () => catalogQuery.data?.data?.data ?? [],
    [catalogQuery.data],
  );

  const pageCount = Math.max(1, Math.ceil(products.length / SIZE));
  const pg = Math.min(page, pageCount);
  const rows = products.slice((pg - 1) * SIZE, pg * SIZE);

  const selectedCategoryLabel =
    categoryId === "all"
      ? "All products"
      : categories.find((c) => c.id === categoryId)?.name || "All products";

  const open = (product) => {
    setSel(product);
    window.scrollTo(0, 0);
  };

  const back = () => {
    setSel(null);
    window.scrollTo(0, 0);
  };

  const onFinance = (product, quantity = 1) => {
    startFinancing(navigate, product.id, quantity);
  };

  const pickCategory = (id) => {
    setCategoryId(id);
    setPage(1);
  };

  return (
    <div>
      {/* <section className="ab-hero-band">
        <div className="wrap ab-hero">
          <div className="ab-hero-l">
            <h1 className="ab-h1 anim-in anim-in-1">
              The ECharis <span className="ab-em">marketplace</span>
            </h1>
            <p className="ab-lead anim-in anim-in-2">
              Finance the products you want through a growth program, and take delivery
              once your performance returns reach the release milestone.
            </p>
          </div>
        </div>
      </section> */}

      {sel ? (
        <ProductDetail product={sel} back={back} onFinance={onFinance} />
      ) : (
        <React.Fragment>
          <section className="band" style={{ background: "var(--surface-card)" }}>
            <div
              className="wrap"
              style={{ display: "flex", flexDirection: "column", gap: 36 }}
            >
              <Reveal
                as="div"
                className="hw-in"
                style={{ alignItems: "center", textAlign: "center" }}
              >
                <h2 className="hw-h">
                  <span className="hw-em">Everything you can</span>
                  <br />
                  finance with your returns.
                </h2>
              </Reveal>

              <div className="mp-tools">
                <div className="mp-search">
                  <Input
                    value={q}
                    onChange={(ev) => setQ(ev.target.value)}
                    iconLeft="search"
                    placeholder="Search products"
                    aria-label="Search products"
                  />
                </div>
                <div className="filter">
                  <button
                    type="button"
                    className="fbtn"
                    aria-expanded={open2}
                    onClick={() => setOpen2(!open2)}
                  >
                    <Icon name="sliders-horizontal" size={16} />
                    <span>{selectedCategoryLabel}</span>
                    <Icon name={open2 ? "chevron-up" : "chevron-down"} size={16} />
                  </button>
                  {open2 && (
                    <div className="fmenu" role="listbox">
                      <span className="fmenu-h">Filter by category</span>
                      <button
                        type="button"
                        role="option"
                        aria-selected={categoryId === "all"}
                        className="fopt"
                        onClick={() => {
                          pickCategory("all");
                          setOpen2(false);
                        }}
                      >
                        <span>All products</span>
                        {categoryId === "all" && <Icon name="check" size={16} />}
                      </button>
                      {categories.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          role="option"
                          aria-selected={c.id === categoryId}
                          className="fopt"
                          onClick={() => {
                            pickCategory(c.id);
                            setOpen2(false);
                          }}
                        >
                          <span>{c.name}</span>
                          {c.id === categoryId && <Icon name="check" size={16} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {catalogQuery.isLoading ? (
                <Card padding={32}>
                  <p
                    style={{ margin: 0, textAlign: "center", color: "var(--text-muted)" }}
                  >
                    Loading marketplace products…
                  </p>
                </Card>
              ) : catalogQuery.isError ? (
                <Card padding={0}>
                  <EmptyState
                    icon="alert-circle"
                    title="Could not load products"
                    description={normalizeError(catalogQuery.error)}
                    action={
                      <Button onClick={() => void catalogQuery.refetch()}>
                        Try again
                      </Button>
                    }
                  />
                </Card>
              ) : rows.length ? (
                <Reveal as="div" className="pgrid reveal-group" delay={60}>
                  {rows.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      open={open}
                      onFinance={onFinance}
                    />
                  ))}
                </Reveal>
              ) : (
                <Card padding={0}>
                  <EmptyState
                    icon="search-x"
                    title="No products match your search"
                    description="Try a different product name, or clear the filter to see everything in the marketplace."
                  />
                </Card>
              )}

              {products.length > SIZE && (
                <div className="mp-pager">
                  <Pagination page={pg} pageCount={pageCount} onChange={setPage} />
                </div>
              )}
            </div>
          </section>
        </React.Fragment>
      )}
    </div>
  );
}
