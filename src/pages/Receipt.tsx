import { QRCodeSVG } from "qrcode.react";
import { Link, useParams } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { useToast } from "../context/ToastContext";
import { formatDate, formatIdr, orderIdDisplay } from "../utils";

export default function Receipt() {
  const { id } = useParams();
  const { transactions, settings } = useStore();
  const { push } = useToast();
  const tx = transactions.find((t) => t.id === id);

  const verifyUrl = typeof window !== "undefined" && id ? `${window.location.origin}/struk/${id}` : "";

  function doPrint() {
    window.print();
  }

  async function doShare() {
    if (!tx) return;
    const text = `Struk ${orderIdDisplay(tx.id)} — ${settings.outletName}\nTotal: ${formatIdr(tx.grandTotal)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Struk transaksi", text, url: verifyUrl });
      } else {
        await navigator.clipboard.writeText(`${text}\n${verifyUrl}`);
        push("Struk disalin ke clipboard.", "success");
      }
    } catch {
      /* user cancelled */
    }
  }

  if (!tx) {
    return (
      <div className="page">
        <p>Struk tidak ditemukan.</p>
        <Link to="/riwayat">Kembali ke riwayat</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="no-print" style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <Link to="/riwayat" className="btn btn--ghost">
          ← Riwayat
        </Link>
        <button type="button" className="btn btn--primary" onClick={doPrint}>
          Cetak
        </button>
        <button type="button" className="btn btn--ghost" onClick={doPrint}>
          Simpan PDF
        </button>
        <button type="button" className="btn btn--ghost" onClick={doShare}>
          Bagikan
        </button>
      </div>

      <div className="card receipt-print" style={{ maxWidth: 400, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--color-primary-dark)" }}>{settings.outletName}</div>
          <div style={{ fontSize: "0.8rem", color: "var(--color-muted)", marginTop: "0.25rem" }}>{settings.address}</div>
          <div style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>{settings.phone}</div>
        </div>
        <div style={{ fontSize: "0.85rem", marginBottom: "0.75rem", color: "var(--color-muted)" }}>
          <div>ID: #{orderIdDisplay(tx.id)}</div>
          <div>{formatDate(tx.createdAt)}</div>
          <div>Bayar: {tx.payment === "cash" ? "Tunai" : "Transfer"}</div>
        </div>
        <div style={{ borderTop: "1px dashed rgba(139,94,60,0.35)", borderBottom: "1px dashed rgba(139,94,60,0.35)", padding: "0.75rem 0" }}>
          {tx.items.map((i) => (
            <div key={i.productId + i.name} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem", fontSize: "0.9rem" }}>
              <span>
                {i.name} ({i.qty} × {formatIdr(i.price)})
              </span>
              <span style={{ fontWeight: 600 }}>{formatIdr(i.price * i.qty)}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "0.65rem", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Subtotal</span>
            <span>{formatIdr(tx.subtotal)}</span>
          </div>
          {tx.discount > 0 ? (
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-success)" }}>
              <span>Diskon</span>
              <span>−{formatIdr(tx.discount)}</span>
            </div>
          ) : null}
          {tx.tax > 0 ? (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Pajak</span>
              <span>{formatIdr(tx.tax)}</span>
            </div>
          ) : null}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.85rem", fontWeight: 800, fontSize: "1.05rem" }}>
          <span>Total</span>
          <span>{formatIdr(tx.grandTotal)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: "1.25rem" }}>
          <QRCodeSVG value={verifyUrl || tx.id} size={128} level="M" includeMargin />
        </div>
        <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--color-muted)", marginTop: "0.5rem" }}>Scan untuk verifikasi</p>
      </div>
    </div>
  );
}
