import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { useToast } from "../context/ToastContext";
import { marginPercent } from "../utils";

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const nav = useNavigate();
  const { push } = useToast();
  const { categories, getProduct, addProduct, updateProduct, addCategory } = useStore();

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [newCat, setNewCat] = useState("");

  useEffect(() => {
    if (!isEdit || !id) return;
    const p = getProduct(id);
    if (!p) return;
    setName(p.name);
    setSku(p.sku);
    setPrice(String(p.price));
    setCostPrice(String(p.costPrice));
    setCategoryId(p.categoryId);
    setDescription(p.description);
    setImageUrl(p.imageUrl);
  }, [isEdit, id, getProduct]);

  useEffect(() => {
    if (!categoryId && categories[0]) setCategoryId(categories[0].id);
  }, [categories, categoryId]);

  if (isEdit && id && !getProduct(id)) return <Navigate to="/produk/kelola" replace />;

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setImageUrl(String(r.result));
    r.readAsDataURL(f);
  }

  const prNum = Number(price.replace(/\D/g, "")) || 0;
  const costNum = Number(costPrice.replace(/\D/g, "")) || 0;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const pr = prNum;
    const cost = Math.max(0, Math.min(pr, costNum));
    if (!name.trim()) return;

    let cat = categoryId;
    if (newCat.trim()) {
      const nid = addCategory(newCat.trim());
      if (nid) cat = nid;
    }
    if (!cat) {
      push("Pilih kategori atau isi kolom kategori baru terlebih dahulu.", "error");
      return;
    }

    const payload = {
      name: name.trim(),
      sku: sku.trim(),
      price: pr,
      costPrice: cost,
      categoryId: cat,
      description: description.trim(),
      imageUrl: imageUrl.trim() || "https://picsum.photos/seed/placeholder/400/300",
    };

    if (isEdit && id) updateProduct(id, payload);
    else addProduct(payload);
    push(isEdit ? "Produk diperbarui." : "Produk ditambahkan.", "success");
    nav("/produk/kelola");
  }

  return (
    <div className="page">
      <h1 style={{ margin: "0 0 1rem", fontSize: "1.35rem", color: "var(--color-primary-dark)" }}>
        {isEdit ? "Edit Produk" : "Tambah Produk"}
      </h1>

      {categories.length === 0 ? (
        <div className="card" style={{ marginBottom: "1rem", background: "#fff8f0", border: "1px solid rgba(230,81,0,0.35)", fontSize: "0.88rem", lineHeight: 1.5 }}>
          Belum ada kategori. Isi kolom “Kategori baru” di form ini saat menyimpan produk pertama Anda.
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <span className="label">Gambar Produk</span>
          <div
            style={{
              border: "2px dashed rgba(139,94,60,0.35)",
              borderRadius: 14,
              padding: "1rem",
              textAlign: "center",
              background: "var(--color-cream-2)",
            }}
          >
            {imageUrl ? (
              <img src={imageUrl} alt="" style={{ maxWidth: "100%", maxHeight: 160, borderRadius: 12 }} />
            ) : (
              <span style={{ color: "var(--color-muted)", fontSize: "0.9rem" }}>Unggah gambar</span>
            )}
            <input type="file" accept="image/*" onChange={onFile} style={{ marginTop: "0.75rem" }} />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="nm">
            Nama Produk
          </label>
          <input id="nm" className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div>
          <label className="label" htmlFor="sku">
            SKU / kode barcode
          </label>
          <input id="sku" className="input" placeholder="Contoh: PK-KS-01" value={sku} onChange={(e) => setSku(e.target.value)} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div>
            <label className="label" htmlFor="hg">
              Harga jual (Rp)
            </label>
            <input id="hg" className="input" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="hp">
              HPP / modal (Rp)
            </label>
            <input id="hp" className="input" inputMode="numeric" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} required />
          </div>
        </div>
        {prNum > 0 ? (
          <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--color-muted)" }}>
            Estimasi margin kotor: <strong>{marginPercent(prNum, costNum)}%</strong>
          </p>
        ) : null}

        <div>
          <label className="label" htmlFor="cat">
            Kategori
          </label>
          <select id="cat" className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="ncat">
            Kategori baru (opsional)
          </label>
          <input
            id="ncat"
            className="input"
            placeholder="Isi untuk menambah kategori sekaligus"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="desc">
            Deskripsi
          </label>
          <textarea id="desc" className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <button type="submit" className="btn btn--primary btn--block">
          Simpan
        </button>
      </form>

      <Link to="/produk/kelola" style={{ display: "block", marginTop: "1rem", textAlign: "center", color: "var(--color-muted)" }}>
        Batal
      </Link>
    </div>
  );
}
