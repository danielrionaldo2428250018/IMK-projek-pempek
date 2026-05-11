import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStore } from "../context/StoreContext";
import { downloadCsv, formatDateShort, formatIdr, startOfDay, startOfMonth, startOfWeekMonday, transactionProfit } from "../utils";

type Tab = "harian" | "mingguan" | "bulanan";

export default function Reports() {
  const [tab, setTab] = useState<Tab>("harian");
  const { transactions } = useStore();

  const range = useMemo(() => {
    const now = new Date();
    const end = now.getTime();
    let start: number;
    if (tab === "harian") start = startOfDay(now).getTime();
    else if (tab === "mingguan") start = startOfWeekMonday(now).getTime();
    else start = startOfMonth(now).getTime();
    return { start, end };
  }, [tab]);

  const filtered = useMemo(
    () => transactions.filter((t) => new Date(t.createdAt).getTime() >= range.start && new Date(t.createdAt).getTime() <= range.end),
    [transactions, range],
  );

  const income = filtered.reduce((s, t) => s + t.grandTotal, 0);
  const profit = filtered.reduce((s, t) => s + transactionProfit(t), 0);
  const count = filtered.length;
  const itemsSold = filtered.reduce((s, t) => s + t.items.reduce((a, i) => a + i.qty, 0), 0);

  const chartData = useMemo(() => {
    const map = new Map<string, { omzet: number; laba: number }>();
    for (const t of filtered) {
      const d = new Date(t.createdAt);
      let key: string;
      if (tab === "harian") key = d.toLocaleTimeString("id-ID", { hour: "2-digit" });
      else if (tab === "mingguan") key = d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" });
      else key = `${d.getDate()}`;
      const cur = map.get(key) ?? { omzet: 0, laba: 0 };
      cur.omzet += t.grandTotal;
      cur.laba += transactionProfit(t);
      map.set(key, cur);
    }
    return [...map.entries()].map(([name, v]) => ({ name, omzet: v.omzet, laba: v.laba }));
  }, [filtered, tab]);

  const topProducts = useMemo(() => {
    const m = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const t of filtered) {
      for (const i of t.items) {
        const cur = m.get(i.name) ?? { name: i.name, qty: 0, revenue: 0 };
        cur.qty += i.qty;
        cur.revenue += i.price * i.qty;
        m.set(i.name, cur);
      }
    }
    return [...m.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [filtered]);

  function exportCsv() {
    const rows: (string | number)[][] = [
      ["Tanggal", "ID", "Subtotal", "Diskon", "Pajak", "Grand total", "Bayar", "Laba kotor"],
      ...filtered.map((t) => [
        formatDateShort(t.createdAt),
        t.id.slice(0, 8),
        t.subtotal,
        t.discount,
        t.tax,
        t.grandTotal,
        t.payment,
        transactionProfit(t),
      ]),
    ];
    downloadCsv(`laporan-pempek-${tab}-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  }

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <h1 style={{ margin: 0, fontSize: "1.35rem", color: "var(--color-primary-dark)" }}>Laporan</h1>
        <button type="button" className="btn btn--ghost" onClick={exportCsv} disabled={!filtered.length}>
          Ekspor CSV
        </button>
      </div>

      <div style={{ display: "flex", gap: "0.35rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {(
          [
            ["harian", "Harian"],
            ["mingguan", "Mingguan"],
            ["bulanan", "Bulanan"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            className="btn"
            onClick={() => setTab(k)}
            style={{
              background: tab === k ? "var(--color-primary)" : "rgba(139,94,60,0.12)",
              color: tab === k ? "#fff" : "var(--color-primary-dark)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        <div className="card" style={{ padding: "0.65rem" }}>
          <div style={{ fontSize: "0.65rem", color: "var(--color-muted)", fontWeight: 700 }}>Pendapatan</div>
          <div style={{ fontWeight: 800, fontSize: "0.82rem", marginTop: "0.25rem", wordBreak: "break-word" }}>{formatIdr(income)}</div>
        </div>
        <div className="card" style={{ padding: "0.65rem" }}>
          <div style={{ fontSize: "0.65rem", color: "var(--color-muted)", fontWeight: 700 }}>Laba kotor</div>
          <div style={{ fontWeight: 800, fontSize: "0.82rem", marginTop: "0.25rem", wordBreak: "break-word", color: "var(--color-success)" }}>
            {formatIdr(profit)}
          </div>
        </div>
        <div className="card" style={{ padding: "0.65rem" }}>
          <div style={{ fontSize: "0.65rem", color: "var(--color-muted)", fontWeight: 700 }}>Transaksi</div>
          <div style={{ fontWeight: 800, fontSize: "1rem", marginTop: "0.25rem" }}>{count}</div>
        </div>
        <div className="card" style={{ padding: "0.65rem" }}>
          <div style={{ fontSize: "0.65rem", color: "var(--color-muted)", fontWeight: 700 }}>Item terjual</div>
          <div style={{ fontWeight: 800, fontSize: "1rem", marginTop: "0.25rem" }}>{itemsSold}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <div style={{ fontWeight: 700, marginBottom: "0.75rem", color: "var(--color-primary-dark)" }}>Grafik Omzet &amp; Laba</div>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData.length ? chartData : [{ name: "-", omzet: 0, laba: 0 }]}
              margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,94,60,0.15)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#6b5d4f" />
              <YAxis tick={{ fontSize: 10 }} stroke="#6b5d4f" tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip formatter={(v: number) => formatIdr(v)} />
              <Legend />
              <Bar dataKey="omzet" name="Omzet" fill="#8b5e3c" radius={[4, 4, 0, 0]} />
              <Bar dataKey="laba" name="Laba kotor" fill="#2e7d32" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ fontWeight: 700, marginBottom: "0.5rem", color: "var(--color-primary-dark)" }}>Produk terlaris</div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {topProducts.length === 0 ? (
          <p style={{ padding: "1rem", margin: 0, color: "var(--color-muted)" }}>Tidak ada data pada periode ini.</p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {topProducts.map((p, idx) => (
              <li
                key={p.name}
                style={{
                  padding: "0.75rem 1rem",
                  borderBottom: "1px solid rgba(139,94,60,0.08)",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "0.5rem",
                }}
              >
                <span>
                  <strong>#{idx + 1}</strong> {p.name}{" "}
                  <span style={{ color: "var(--color-muted)", fontSize: "0.85rem" }}>({p.qty} pcs)</span>
                </span>
                <span style={{ fontWeight: 700, color: "var(--color-primary)", flexShrink: 0 }}>{formatIdr(p.revenue)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
