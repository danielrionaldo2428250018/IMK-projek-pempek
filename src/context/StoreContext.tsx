import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_SETTINGS, normalizeAppState } from "../state/migrate";
import type { AppState, Category, OutletSettings, PaymentMethod, Product, Transaction } from "../types";

/** Versi baru: data awal kosong; data lama (v1) tidak dibaca otomatis. */
const STORAGE_KEY = "pempek_novi_store_v3";

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
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      return normalizeAppState(parsed);
    }
  } catch {
    /* ignore */
  }
  return buildInitialState();
}

function persist(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
    setState((s) => ({
      ...s,
      products: [...s.products, { ...p, id: uid() }],
    }));
  }, []);

  const updateProduct = useCallback((id: string, p: Omit<Product, "id">) => {
    setState((s) => ({
      ...s,
      products: s.products.map((x) => (x.id === id ? { ...p, id } : x)),
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
        lowStockThreshold:
          typeof patch.lowStockThreshold === "number"
            ? Math.max(0, Math.floor(patch.lowStockThreshold))
            : s.settings.lowStockThreshold,
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
        if (qty > p.stock) return s;
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

      const nextProducts = s.products.map((p) => {
        const qty = cart.get(p.id) ?? 0;
        if (qty <= 0) return p;
        return { ...p, stock: p.stock - qty };
      });

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
        products: nextProducts,
        transactions: [tx, ...s.transactions],
      };
    });
    return tx;
  }, []);

  const clearAllData = useCallback(() => {
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
