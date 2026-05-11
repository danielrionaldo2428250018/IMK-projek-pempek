import type { Transaction } from "./types";

const idr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatIdr(n: number): string {
  return idr.format(n);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function startOfWeekMonday(d: Date): Date {
  const x = startOfDay(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  return x;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function orderIdDisplay(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

/** Estimasi laba kotor dari transaksi (harga jual − HPP per baris). */
export function transactionProfit(tx: Transaction): number {
  return tx.items.reduce((s, i) => s + (i.price - i.unitCost) * i.qty, 0);
}

export function marginPercent(price: number, cost: number): number {
  if (price <= 0) return 0;
  return Math.round(((price - cost) / price) * 1000) / 10;
}

function escapeCsvCell(v: string): string {
  if (/[",\r\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

/** Nomor ke format wa.me (hanya digit). Mengembalikan null jika nomor belum diisi / terlalu pendek. */
export function whatsappChatUrl(digits: string, prefilledMessage?: string): string | null {
  const n = digits.replace(/\D/g, "");
  if (n.length < 8) return null;
  const base = `https://wa.me/${n}`;
  if (!prefilledMessage?.trim()) return base;
  return `${base}?text=${encodeURIComponent(prefilledMessage.trim())}`;
}

export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const body = rows.map((r) => r.map((c) => escapeCsvCell(String(c))).join(",")).join("\r\n");
  const blob = new Blob(["\ufeff" + body], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.click();
  URL.revokeObjectURL(url);
}
