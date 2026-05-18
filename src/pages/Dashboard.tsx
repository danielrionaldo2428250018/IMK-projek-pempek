import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { formatIdr, startOfDay, transactionProfit } from "../utils";

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function last6MonthLabels(): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 5; i >= 0; i--) {
    const x = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push(monthKey(x));
  }
  return out;
}

export default function Dashboard() {
  const { transactions, products } = useStore();
  const { logout, username } = useAuth();

  const now = new Date();
  const t0 = startOfDay(now).getTime();
  const t1 = t0 - 86400000;

  let todayRev = 0;
  let todayCount = 0;
  let yestRev = 0;
  let todayProfit = 0;
  for (const tx of transactions) {
    const ts = new Date(tx.createdAt).getTime();
    if (ts >= t0) {
      todayRev += tx.grandTotal;
      todayCount += 1;
      todayProfit += transactionProfit(tx);
    } else if (ts >= t1 && ts < t0) {
      yestRev += tx.grandTotal;
    }
  }

  const pct =
    yestRev > 0 ? Math.round(((todayRev - yestRev) / yestRev) * 100) : todayRev > 0 ? 100 : 0;

  const labels = last6MonthLabels();
  const byMonthOmzet = new Map<string, number>();
  const byMonthProfit = new Map<string, number>();
  for (const k of labels) {
    byMonthOmzet.set(k, 0);
    byMonthProfit.set(k, 0);
  }
  for (const tx of transactions) {
    const k = monthKey(new Date(tx.createdAt));
    if (byMonthOmzet.has(k)) {
      byMonthOmzet.set(k, (byMonthOmzet.get(k) ?? 0) + tx.grandTotal);
      byMonthProfit.set(k, (byMonthProfit.get(k) ?? 0) + transactionProfit(tx));
    }
  }
  const chartData = labels.map((k) => ({
    name: k.slice(5),
    omzet: byMonthOmzet.get(k) ?? 0,
    laba: byMonthProfit.get(k) ?? 0,
  }));

  const recent = transactions.slice(0, 6);

  return (
    <div className="page">
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.35rem", color: "var(--color-primary-dark)" }}>Dashboard</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Link to="/bantuan" className="btn btn--ghost" style={{ padding: "0.45rem 0.65rem", fontSize: "0.85rem" }} title="Bantuan">
            ?
          </Link>
          <Link to="/profil" className="btn btn--ghost" style={{ padding: "0.45rem 0.65rem", fontSize: "0.85rem" }} title="Profil">
            ●
          </Link>
          <span style={{ fontSize: "0.8rem", color: "var(--color-muted)", display: "none" }} className="show-desktop-user">
            {username}
          </span>
          <button
            type="button"
            className="btn btn--ghost show-mobile-logout"
            onClick={() => {
              if (confirm("Keluar dari aplikasi?")) logout();
            }}
            aria-label="Keluar"
          >
            ⎋
          </button>
        </div>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        <div className="card">
          <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", fontWeight: 600 }}>Pendapatan Hari Ini</div>
          <div style={{ fontSize: "1.15rem", fontWeight: 700, marginTop: "0.35rem" }}>{formatIdr(todayRev)}</div>
          <div style={{ fontSize: "0.8rem", color: "var(--color-success)", marginTop: "0.25rem" }}>
            {pct >= 0 ? "+" : ""}
            {pct}% vs kemarin
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", fontWeight: 600 }}>Total Transaksi</div>
          <div style={{ fontSize: "1.35rem", fontWeight: 700, marginTop: "0.35rem" }}>{todayCount}</div>
          <div style={{ fontSize: "0.8rem", color: "var(--color-muted)", marginTop: "0.25rem" }}>Hari ini</div>
        </div>
        <div className="card">
          <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", fontWeight: 600 }}>Laba kotor (est.)</div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "0.35rem", color: "var(--color-success)" }}>{formatIdr(todayProfit)}</div>
          <div style={{ fontSize: "0.8rem", color: "var(--color-muted)", marginTop: "0.25rem" }}>Hari ini</div>
        </div>
        <div className="card">
          <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", fontWeight: 600 }}>Total produk</div>
          <div style={{ fontSize: "1.35rem", fontWeight: 700, marginTop: "0.35rem" }}>{products.length}</div>
          <div style={{ fontSize: "0.8rem", color: "var(--color-muted)", marginTop: "0.25rem" }}>Terdaftar di sistem</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <div style={{ fontWeight: 700, marginBottom: "0.75rem", color: "var(--color-primary-dark)" }}>Grafik Omzet &amp; Laba</div>
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,94,60,0.15)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#6b5d4f" />
              <YAxis tick={{ fontSize: 11 }} stroke="#6b5d4f" tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip formatter={(value: number) => formatIdr(value)} />
              <Legend />
              <Line type="monotone" dataKey="omzet" name="Omzet" stroke="#8b5e3c" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="laba" name="Laba kotor" stroke="#2e7d32" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ fontWeight: 700, marginBottom: "0.65rem", color: "var(--color-primary-dark)" }}>Menu Cepat</div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "1.25rem",
        }}
      >
        <Quick to="/produk" label="Produk" bg="#e8f5e9" emoji="▣" style={{ flex: "1 1 22%", minWidth: 72 }} />
        <Quick to="/produk/kelola" label="Kelola" bg="#fff3e0" emoji="✎" style={{ flex: "1 1 22%", minWidth: 72 }} />
        <Quick to="/transaksi" label="Transaksi" bg="#e3f2fd" emoji="◇" style={{ flex: "1 1 22%", minWidth: 72 }} />
        <Quick to="/laporan" label="Laporan" bg="#fce4ec" emoji="▤" style={{ flex: "1 1 22%", minWidth: 72 }} />
        <Quick to="/profil" label="Profil" bg="#efebe9" emoji="●" style={{ flex: "1 1 22%", minWidth: 72 }} />
        <Quick to="/bantuan" label="Bantuan" bg="#f3e5f5" emoji="?" style={{ flex: "1 1 22%", minWidth: 72 }} />
      </div>

      <div style={{ fontWeight: 700, marginBottom: "0.65rem", color: "var(--color-primary-dark)" }}>Aktivitas Terbaru</div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {recent.length === 0 ? (
          <p style={{ padding: "1rem", margin: 0, color: "var(--color-muted)" }}>Belum ada transaksi.</p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {recent.map((tx) => (
              <li
                key={tx.id}
                style={{
                  padding: "0.85rem 1rem",
                  borderBottom: "1px solid rgba(139,94,60,0.08)",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  alignItems: "center",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {tx.items.map((i) => `${i.name} (${i.qty})`).join(", ")}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>
                    {new Date(tx.createdAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: "var(--color-primary)", flexShrink: 0 }}>{formatIdr(tx.grandTotal)}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <style>{`
        @media (min-width: 900px) {
          .show-mobile-logout { display: none !important; }
          .show-desktop-user { display: inline !important; }
        }
      `}</style>
    </div>
  );
}

function Quick({
  to,
  label,
  bg,
  emoji,
  style,
}: {
  to: string;
  label: string;
  bg: string;
  emoji: string;
  style?: CSSProperties;
}) {
  return (
    <Link
      to={to}
      className="card"
      style={{
        textAlign: "center",
        padding: "0.65rem 0.25rem",
        background: bg,
        boxShadow: "0 4px 12px rgba(44,36,25,0.06)",
        textDecoration: "none",
        color: "inherit",
        ...style,
      }}
    >
      <div style={{ fontSize: "1.35rem" }} aria-hidden>
        {emoji}
      </div>
      <div style={{ fontSize: "0.65rem", fontWeight: 700, marginTop: "0.2rem", color: "var(--color-primary-dark)" }}>{label}</div>
    </Link>
  );
}
