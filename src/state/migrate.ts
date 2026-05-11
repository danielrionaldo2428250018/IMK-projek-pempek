import type { AppState, OutletSettings, Product, Transaction, TransactionItem } from "../types";

const DEFAULT_SETTINGS: OutletSettings = {
  outletName: "Pempek Novi",
  address: "Jl. Contoh No. 123, Palembang",
  phone: "+62 812-3456-7890",
  taxPercent: 0,
  lowStockThreshold: 10,
  adminWhatsApp: "",
};

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

export function normalizeProduct(row: Record<string, unknown>): Product {
  const price = Number(row.price) || 0;
  const cost =
    typeof row.costPrice === "number" && !Number.isNaN(row.costPrice)
      ? row.costPrice
      : Math.max(0, Math.round(price * 0.55));
  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    price,
    costPrice: Math.max(0, cost),
    stock: Number(row.stock) || 0,
    categoryId: String(row.categoryId ?? ""),
    description: String(row.description ?? ""),
    imageUrl: String(row.imageUrl ?? ""),
    sku: typeof row.sku === "string" ? row.sku : "",
  };
}

function normalizeItem(
  row: Record<string, unknown>,
  productsById: Map<string, Product>,
): TransactionItem {
  const productId = String(row.productId ?? "");
  const price = Number(row.price) || 0;
  const qty = Number(row.qty) || 0;
  const unitCost =
    typeof row.unitCost === "number" && !Number.isNaN(row.unitCost)
      ? row.unitCost
      : productsById.get(productId)?.costPrice ?? 0;
  return {
    productId,
    name: String(row.name ?? ""),
    price,
    qty,
    unitCost: Math.max(0, unitCost),
  };
}

function normalizeTransaction(row: Record<string, unknown>, productsById: Map<string, Product>): Transaction {
  const itemsRaw = Array.isArray(row.items) ? row.items : [];
  const items = itemsRaw.map((it) => normalizeItem(asRecord(it), productsById));

  const subtotalFromItems = items.reduce((s, i) => s + i.price * i.qty, 0);
  const legacyTotal = typeof row.total === "number" ? row.total : undefined;

  const subtotal =
    typeof row.subtotal === "number" && !Number.isNaN(row.subtotal) ? row.subtotal : subtotalFromItems;

  const discountRaw =
    typeof row.discount === "number" && !Number.isNaN(row.discount) ? Math.max(0, row.discount) : 0;
  const discount = Math.min(subtotal, discountRaw);

  const tax = typeof row.tax === "number" && !Number.isNaN(row.tax) ? Math.max(0, row.tax) : 0;

  let grandTotal: number;
  if (typeof row.grandTotal === "number" && !Number.isNaN(row.grandTotal)) {
    grandTotal = row.grandTotal;
  } else if (legacyTotal !== undefined) {
    grandTotal = legacyTotal;
  } else {
    grandTotal = Math.max(0, subtotal - discount + tax);
  }

  return {
    id: String(row.id ?? ""),
    createdAt: String(row.createdAt ?? new Date().toISOString()),
    items,
    subtotal,
    discount,
    tax,
    grandTotal,
    payment: row.payment === "transfer" ? "transfer" : "cash",
  };
}

function normalizeSettings(row: unknown): OutletSettings {
  const r = asRecord(row);
  return {
    outletName: typeof r.outletName === "string" && r.outletName.trim() ? r.outletName : DEFAULT_SETTINGS.outletName,
    address: typeof r.address === "string" ? r.address : DEFAULT_SETTINGS.address,
    phone: typeof r.phone === "string" ? r.phone : DEFAULT_SETTINGS.phone,
    taxPercent:
      typeof r.taxPercent === "number" && !Number.isNaN(r.taxPercent)
        ? Math.min(100, Math.max(0, r.taxPercent))
        : DEFAULT_SETTINGS.taxPercent,
    lowStockThreshold:
      typeof r.lowStockThreshold === "number" && !Number.isNaN(r.lowStockThreshold)
        ? Math.max(0, Math.floor(r.lowStockThreshold))
        : DEFAULT_SETTINGS.lowStockThreshold,
    adminWhatsApp:
      typeof r.adminWhatsApp === "string" ? r.adminWhatsApp.replace(/\D/g, "") : DEFAULT_SETTINGS.adminWhatsApp,
  };
}

/** Menyatukan data lama (tanpa settings/HPP) ke bentuk AppState terbaru */
export function normalizeAppState(raw: unknown): AppState {
  const root = asRecord(raw);
  const categories = Array.isArray(root.categories)
    ? (root.categories as unknown[])
        .map((c) => {
          const r = asRecord(c);
          return { id: String(r.id ?? ""), name: String(r.name ?? "") };
        })
        .filter((c) => c.id)
    : [];
  const productsRaw = Array.isArray(root.products) ? root.products.map((p) => normalizeProduct(asRecord(p))) : [];
  const productsById = new Map(productsRaw.map((p) => [p.id, p]));

  const transactionsRaw = Array.isArray(root.transactions) ? root.transactions : [];
  const transactions = transactionsRaw.map((t) => normalizeTransaction(asRecord(t), productsById));

  const settings = normalizeSettings(root.settings);

  return {
    categories,
    products: productsRaw,
    transactions,
    settings,
  };
}

export { DEFAULT_SETTINGS };
