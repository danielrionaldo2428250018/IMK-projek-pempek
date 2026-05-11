import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { formatDate, formatIdr, orderIdDisplay } from "../utils";

export default function TransactionHistory() {
  const { transactions } = useStore();

  return (
    <div className="page">
      <header style={{ marginBottom: "1rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.35rem", color: "var(--color-primary-dark)" }}>Riwayat Transaksi</h1>
        <Link to="/transaksi" style={{ fontSize: "0.85rem", color: "var(--color-primary)" }}>
          ← Transaksi baru
        </Link>
      </header>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {transactions.length === 0 ? (
          <p style={{ padding: "1rem", margin: 0, color: "var(--color-muted)" }}>Belum ada riwayat.</p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {transactions.map((tx) => (
              <li
                key={tx.id}
                style={{
                  padding: "0.85rem 1rem",
                  borderBottom: "1px solid rgba(139,94,60,0.08)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>#{orderIdDisplay(tx.id)}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>{formatDate(tx.createdAt)}</div>
                    {tx.discount > 0 || tx.tax > 0 ? (
                      <div style={{ fontSize: "0.72rem", color: "var(--color-muted)" }}>
                        {tx.discount > 0 ? `Diskon ${formatIdr(tx.discount)}` : null}
                        {tx.discount > 0 && tx.tax > 0 ? " · " : null}
                        {tx.tax > 0 ? `Pajak ${formatIdr(tx.tax)}` : null}
                      </div>
                    ) : null}
                  </div>
                  <div style={{ fontWeight: 800, color: "var(--color-primary)" }}>{formatIdr(tx.grandTotal)}</div>
                </div>
                <Link to={`/struk/${tx.id}`} className="btn btn--ghost" style={{ alignSelf: "flex-start", fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}>
                  Lihat Struk
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
