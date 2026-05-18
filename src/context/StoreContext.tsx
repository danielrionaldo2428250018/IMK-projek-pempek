import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_SETTINGS, normalizeAppState, toProduct } from "../state/migrate";
import type { AppState, Category, OutletSettings, PaymentMethod, Product, Transaction } from "../types";

/** v4: tanpa stok; migrasi otomatis dari v3/v1. */
const STORAGE_KEY = "pempek_novi_store_v4";
const LEGACY_STORAGE_KEYS = ["pempek_novi_store_v3", "pempek_novi_store_v1"];

function uid(): string {
  return crypto.randomUUID();
}

function buildInitialState(): AppState {
  return {
    categories: [],
    products: [],
    transactions: [],
    settings: { ...DEFAULT_SETTINGS },
  };
}

function loadState(): AppState {
  const keys = [STORAGE_KEY, ...LEGACY_STORAGE_KEYS];
  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = normalizeAppState(JSON.parse(raw) as unknown);
      if (key !== STORAGE_KEY) {
        persist(parsed);
        localStorage.removeItem(key);
      }
      return parsed;
    } catch {
      /* coba key berikutnya */
    }
  }
  return buildInitialState();
}

function persist(state: AppState) {
  const clean = normalizeAppState(state);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
}

type StoreContextValue = {
  state: AppState;
  settings: OutletSettings;
  categories: Category[];
  products: Product[];
  transactions: Transaction[];
  getProduct: (id: string) => Product | undefined;
  getCategoryName: (id: string) => string;
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (id: string, p: Omit<Product, "id">) => void;
  deleteProduct: (id: string) => void;
  addCategory: (name: string) => string | null;
  updateSettings: (patch: Partial<OutletSettings>) => void;
  checkout: (cart: Map<string, number>, payment: PaymentMethod, discount: number) => Transaction | null;
  clearAllData: () => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState());

  useEffect(() => {
    persist(state);
  }, [state]);

  const getProduct = useCallback(
    (id: string) => state.products.find((p) => p.id === id),
    [state.products],
  );

  const getCategoryName = useCallback(
    (id: string) => state.categories.find((c) => c.id === id)?.name ?? "—",
    [state.categories],
  );

  const addProduct = useCallback((p: Omit<Product, "id">) => {
    const id = uid();
    setState((s) => ({
      ...s,
      products: [...s.products, toProduct(id, p)],
    }));
  }, []);

  const updateProduct = useCallback((id: string, p: Omit<Product, "id">) => {
    setState((s) => ({
      ...s,
      products: s.products.map((x) => (x.id === id ? toProduct(id, p) : x)),
    }));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      products: s.products.filter((x) => x.id !== id),
    }));
  }, []);

  const addCategory = useCallback((name: string): string | null => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const cid = uid();
    setState((s) => ({
      ...s,
      categories: [...s.categories, { id: cid, name: trimmed }],
    }));
    return cid;
  }, []);

  const updateSettings = useCallback((patch: Partial<OutletSettings>) => {
    setState((s) => ({
      ...s,
      settings: {
        ...s.settings,
        ...patch,
        taxPercent:
          typeof patch.taxPercent === "number"
            ? Math.min(100, Math.max(0, patch.taxPercent))
            : s.settings.taxPercent,
      },
    }));
  }, []);

  const checkout = useCallback((cart: Map<string, number>, payment: PaymentMethod, discountRaw: number) => {
    let tx: Transaction | null = null;
    setState((s) => {
      const items: Transaction["items"] = [];
      for (const p of s.products) {
        const qty = cart.get(p.id) ?? 0;
        if (qty <= 0) continue;
        items.push({
          productId: p.id,
          name: p.name,
          price: p.price,
          qty,
          unitCost: p.costPrice,
        });
      }
      if (!items.length) return s;

      const subtotal = items.reduce((acc, i) => acc + i.price * i.qty, 0);
      const discount = Math.min(Math.max(0, Math.floor(discountRaw)), subtotal);
      const afterDisc = subtotal - discount;
      const tax = Math.round((afterDisc * s.settings.taxPercent) / 100);
      const grandTotal = afterDisc + tax;

      tx = {
        id: uid(),
        createdAt: new Date().toISOString(),
        items,
        subtotal,
        discount,
        tax,
        grandTotal,
        payment,
      };

      return {
        ...s,
        transactions: [tx, ...s.transactions],
      };
    });
    return tx;
  }, []);

  const clearAllData = useCallback(() => {
    for (const key of LEGACY_STORAGE_KEYS) localStorage.removeItem(key);
    const fresh = buildInitialState();
    setState(fresh);
    persist(fresh);
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      state,
      settings: state.settings,
      categories: state.categories,
      products: state.products,
      transactions: state.transactions,
      getProduct,
      getCategoryName,
      addProduct,
      updateProduct,
      deleteProduct,
      addCategory,
      updateSettings,
      checkout,
      clearAllData,
    }),
    [
      state,
      getProduct,
      getCategoryName,
      addProduct,
      updateProduct,
      deleteProduct,
      addCategory,
      updateSettings,
      checkout,
      clearAllData,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore outside StoreProvider");
  return ctx;
}
