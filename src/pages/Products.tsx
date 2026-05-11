import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { formatIdr, marginPercent } from "../utils";

export default function Products() {
  const { products, categories, getCategoryName: catName } = useStore();
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryId && p.categoryId !== categoryId) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    });
  }, [products, query, categoryId]);

  return (
    <div className="page">
      <header style={{ marginBottom: "0.75rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.35rem", color: "var(--color-primary-dark)" }}>Produk</h1>
        <p style={{ margin: "0.35rem 0 0", color: "var(--color-muted)", fontSize: "0.9rem" }}>Katalog untuk transaksi</p>
      </header>

      <div className="card" style={{ marginBottom: "0.75rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
        <div>
          <label className="label" htmlFor="pq">
            Cari nama / SKU
          </label>
          <input id="pq" className="input" placeholder="Contoh: kapal, PK-" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="pc">
            Kategori
          </label>
          <select id="pc" className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
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
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "0.75rem",
        }}
      >
        {filtered.map((p) => (
          <article key={p.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                aspectRatio: "4/3",
                background: "#eee",
                backgroundImage: p.imageUrl ? `url(${p.imageUrl})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div style={{ padding: "0.65rem 0.75rem" }}>
              <div style={{ fontWeight: 700, fontSize: "0.88rem", lineHeight: 1.25 }}>{p.name}</div>
              {p.sku ? (
                <div style={{ fontSize: "0.68rem", color: "var(--color-muted)" }}>{p.sku}</div>
              ) : null}
              <div style={{ fontSize: "0.72rem", color: "var(--color-muted)", marginTop: "0.2rem" }}>{catName(p.categoryId)}</div>
              <div style={{ fontWeight: 700, color: "var(--color-primary)", marginTop: "0.35rem" }}>{formatIdr(p.price)}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--color-muted)" }}>Margin ±{marginPercent(p.price, p.costPrice)}%</div>
              <Link to={`/produk/${p.id}/edit`} className="btn btn--ghost" style={{ marginTop: "0.5rem", width: "100%", fontSize: "0.8rem", padding: "0.45rem" }}>
                Edit
              </Link>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 ? <p style={{ color: "var(--color-muted)" }}>Tidak ada produk yang cocok.</p> : null}

      <Link to="/produk/kelola" className="btn btn--primary btn--block" style={{ marginTop: "1rem" }}>
        Kelola Produk
      </Link>
    </div>
  );
}
