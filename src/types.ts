export type PaymentMethod = "cash" | "transfer";

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  /** Harga pokok / modal per unit (untuk estimasi margin & laba) */
  costPrice: number;
  stock: number;
  categoryId: string;
  description: string;
  imageUrl: string;
  /** Kode internal / barcode */
  sku: string;
}

export interface TransactionItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  /** HPP per unit saat transaksi (snapshot) */
  unitCost: number;
}

export interface Transaction {
  id: string;
  createdAt: string;
  items: TransactionItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  payment: PaymentMethod;
}

export interface OutletSettings {
  outletName: string;
  address: string;
  phone: string;
  /** Pajak tambahan % (mis. 11 untuk PPN), dihitung setelah diskon */
  taxPercent: number;
  /** Ambang peringatan stok menipis */
  lowStockThreshold: number;
  /** Nomor WhatsApp admin (hanya angka, min. 8 digit). Kosong = tautan bantuan dinonaktifkan sampai diisi di Profil */
  adminWhatsApp: string;
}

export interface AppState {
  categories: Category[];
  products: Product[];
  transactions: Transaction[];
  settings: OutletSettings;
}
