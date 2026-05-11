import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { useToast } from "../context/ToastContext";
import { formatIdr, marginPercent } from "../utils";

export default function ManageProducts() {
  const { products, categories, deleteProduct } = useStore();
  const { push } = useToast();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  }, [products, query]);

  return (
    <div className="page">
      <header style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.35rem", color: "var(--color-primary-dark)" }}>Kelola Produk</h1>
          <p style={{ margin: "0.35rem 0 0", color: "var(--color-muted)", fontSize: "0.9rem" }}>
            {categories.length} kategori · {products.length} produk
          </p>
        </div>
        <Link to="/produk/baru" className="btn btn--primary" style={{ flexShrink: 0 }}>
          + Baru
        </Link>
      </header>

      <div className="card" style={{ marginBottom: "0.75rem" }}>
        <label className="label" htmlFor="mq">
          Cari nama / SKU
        </label>
        <input id="mq" className="input" placeholder="Filter daftar…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {filtered.map((p) => (
            <li
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                borderBottom: "1px solid rgba(139,94,60,0.08)",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: "#ddd",
                  backgroundImage: p.imageUrl ? `url(${p.imageUrl})` : undefined,
                  backgroundSize: "cover",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700 }}>{p.name}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>
                  {p.sku ? `${p.sku} · ` : null}Stok {p.stock} · {formatIdr(p.price)} · margin ±{marginPercent(p.price, p.costPrice)}%
                </div>
              </div>
              <Link to={`/produk/${p.id}/edit`} className="btn btn--ghost" style={{ padding: "0.45rem 0.6rem" }} aria-label="Edit">
                ✎
              </Link>
              <button
                type="button"
                className="btn btn--danger"
                style={{ padding: "0.45rem 0.6rem" }}
                aria-label="Hapus"
                onClick={() => {
                  if (confirm(`Hapus produk "${p.name}"?`)) {
                    deleteProduct(p.id);
                    push("Produk dihapus.", "success");
                  }
                }}
              >
                🗑
              </button>
            </li>
          ))}
        </ul>
        {filtered.length === 0 ? <p style={{ padding: "1rem", margin: 0, color: "var(--color-muted)" }}>Tidak ada hasil.</p> : null}
      </div>

      <Link to="/produk" className="btn btn--ghost btn--block" style={{ marginTop: "1rem" }}>
        ← Katalog Produk
      </Link>
    </div>
  );
}
