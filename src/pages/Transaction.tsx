import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { useToast } from "../context/ToastContext";
import type { PaymentMethod } from "../types";
import { formatIdr } from "../utils";

export default function Transaction() {
  const { products, categories, checkout, settings, getCategoryName } = useStore();
  const nav = useNavigate();
  const { push } = useToast();
  const searchRef = useRef<HTMLInputElement>(null);

  const [cart, setCart] = useState<Record<string, number>>({});
  const [payment, setPayment] = useState<PaymentMethod>("cash");
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [discountStr, setDiscountStr] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      const t = e.target as HTMLElement | null;
      if (t && ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryId && p.categoryId !== categoryId) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    });
  }, [products, query, categoryId]);

  const lines = useMemo(() => {
    return products
      .map((p) => ({ p, q: cart[p.id] ?? 0 }))
      .filter((x) => x.q > 0);
  }, [products, cart]);

  const subtotal = useMemo(() => lines.reduce((s, x) => s + x.p.price * x.q, 0), [lines]);
  const discount = Math.min(Math.max(0, Math.floor(Number(discountStr.replace(/\D/g, "")) || 0)), subtotal);
  const afterDisc = subtotal - discount;
  const tax = Math.round((afterDisc * settings.taxPercent) / 100);
  const grandPreview = afterDisc + tax;

  function setQty(pid: string, q: number) {
    setCart((c) => {
      const next = { ...c };
      if (q <= 0) delete next[pid];
      else next[pid] = q;
      return next;
    });
  }

  function bump(pid: string, delta: number) {
    const p = products.find((x) => x.id === pid);
    if (!p) return;
    const cur = cart[pid] ?? 0;
    const next = Math.max(0, Math.min(p.stock, cur + delta));
    setQty(pid, next);
  }

  function applyDiscPct(pct: number) {
    if (subtotal <= 0) return;
    setDiscountStr(String(Math.floor((subtotal * pct) / 100)));
  }

  function onPay() {
    const m = new Map<string, number>();
    for (const [k, v] of Object.entries(cart)) {
      if (v > 0) m.set(k, v);
    }
    const tx = checkout(m, payment, discount);
    if (!tx) {
      push("Keranjang kosong atau stok tidak mencukupi.", "error");
      return;
    }
    push("Transaksi berhasil.", "success");
    nav(`/struk/${tx.id}`, { replace: true });
  }

  return (
    <div className="page">
      <header style={{ marginBottom: "0.75rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.35rem", color: "var(--color-primary-dark)" }}>Transaksi</h1>
        <Link to="/riwayat" style={{ fontSize: "0.85rem", color: "var(--color-primary)" }}>
          Riwayat transaksi →
        </Link>
      </header>

      <div className="card" style={{ marginBottom: "0.75rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
        <div>
          <label className="label" htmlFor="sq">
            Cari produk / SKU <span style={{ fontWeight: 400, opacity: 0.85 }}>(tekan /)</span>
          </label>
          <input
            ref={searchRef}
            id="sq"
            className="input"
            placeholder="Contoh: lenjer, PK-"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="cf">
            Filter kategori
          </label>
          <select id="cf" className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Semua</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: "0.65rem",
          marginBottom: "1rem",
        }}
      >
        {filteredProducts.map((p) => {
          const q = cart[p.id] ?? 0;
          return (
            <div key={p.id} className="card" style={{ padding: "0.6rem" }}>
              <div
                style={{
                  aspectRatio: "1/1",
                  borderRadius: 12,
                  background: "#ddd",
                  backgroundImage: p.imageUrl ? `url(${p.imageUrl})` : undefined,
                  backgroundSize: "cover",
                  marginBottom: "0.45rem",
                }}
              />
              <div style={{ fontWeight: 700, fontSize: "0.82rem", lineHeight: 1.2 }}>{p.name}</div>
              {p.sku ? (
                <div style={{ fontSize: "0.68rem", color: "var(--color-muted)" }}>{p.sku}</div>
              ) : null}
              <div style={{ fontSize: "0.72rem", color: "var(--color-muted)" }}>{getCategoryName(p.categoryId)}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>{formatIdr(p.price)}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--color-muted)" }}>Stok: {p.stock}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.45rem" }}>
                <button type="button" className="btn btn--ghost" style={{ padding: "0.35rem 0.55rem" }} onClick={() => bump(p.id, -1)}>
                  −
                </button>
                <span style={{ fontWeight: 700 }}>{q}</span>
                <button type="button" className="btn btn--ghost" style={{ padding: "0.35rem 0.55rem" }} onClick={() => bump(p.id, 1)}>
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 ? (
        <p style={{ color: "var(--color-muted)", fontSize: "0.9rem" }}>Tidak ada produk yang cocok.</p>
      ) : null}

      <div className="card" style={{ marginBottom: "5rem" }}>
        <div style={{ fontWeight: 700, marginBottom: "0.65rem", color: "var(--color-primary-dark)" }}>Ringkasan</div>
        {lines.length === 0 ? (
          <p style={{ margin: 0, color: "var(--color-muted)", fontSize: "0.9rem" }}>Belum ada item.</p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {lines.map(({ p, q }) => (
              <li key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.35rem 0", fontSize: "0.9rem" }}>
                <span>
                  {p.name} × {q}
                </span>
                <span style={{ fontWeight: 600 }}>{formatIdr(p.price * q)}</span>
              </li>
            ))}
          </ul>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", fontSize: "0.9rem" }}>
          <span>Subtotal</span>
          <span style={{ fontWeight: 600 }}>{formatIdr(subtotal)}</span>
        </div>

        <div style={{ marginTop: "0.85rem" }}>
          <label className="label" htmlFor="disc">
            Diskon (Rp)
          </label>
          <input id="disc" className="input" inputMode="numeric" placeholder="0" value={discountStr} onChange={(e) => setDiscountStr(e.target.value)} />
          <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.4rem", flexWrap: "wrap" }}>
            <button type="button" className="btn btn--ghost" style={{ fontSize: "0.75rem", padding: "0.35rem 0.5rem" }} onClick={() => applyDiscPct(5)}>
              5%
            </button>
            <button type="button" className="btn btn--ghost" style={{ fontSize: "0.75rem", padding: "0.35rem 0.5rem" }} onClick={() => applyDiscPct(10)}>
              10%
            </button>
            <button type="button" className="btn btn--ghost" style={{ fontSize: "0.75rem", padding: "0.35rem 0.5rem" }} onClick={() => setDiscountStr("0")}>
              Hapus
            </button>
          </div>
        </div>

        {settings.taxPercent > 0 ? (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", fontSize: "0.9rem" }}>
            <span>Pajak ({settings.taxPercent}%)</span>
            <span style={{ fontWeight: 600 }}>{formatIdr(tax)}</span>
          </div>
        ) : null}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.65rem", fontWeight: 800, fontSize: "1.05rem" }}>
          <span>Total bayar</span>
          <span style={{ color: "var(--color-primary)" }}>{formatIdr(grandPreview)}</span>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <span className="label">Metode pembayaran</span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              className="btn"
              style={{
                flex: 1,
                background: payment === "cash" ? "var(--color-primary)" : "rgba(139,94,60,0.12)",
                color: payment === "cash" ? "#fff" : "var(--color-primary-dark)",
              }}
              onClick={() => setPayment("cash")}
            >
              Tunai
            </button>
            <button
              type="button"
              className="btn"
              style={{
                flex: 1,
                background: payment === "transfer" ? "var(--color-primary)" : "rgba(139,94,60,0.12)",
                color: payment === "transfer" ? "#fff" : "var(--color-primary-dark)",
              }}
              onClick={() => setPayment("transfer")}
            >
              Transfer
            </button>
          </div>
        </div>

        <button type="button" className="btn btn--primary btn--block" style={{ marginTop: "1rem" }} onClick={onPay} disabled={lines.length === 0}>
          Bayar
        </button>
      </div>
    </div>
  );
}
