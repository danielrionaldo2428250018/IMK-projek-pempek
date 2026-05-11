import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/produk", label: "Produk" },
  { to: "/produk/kelola", label: "Kelola Produk" },
  { to: "/transaksi", label: "Transaksi Baru" },
  { to: "/riwayat", label: "Riwayat Transaksi" },
  { to: "/laporan", label: "Laporan" },
  { to: "/profil", label: "Profil" },
  { to: "/bantuan", label: "Bantuan" },
];

export function DesktopSidebar() {
  const { username, logout } = useAuth();
  return (
    <aside className="app-shell__sidebar" aria-label="Menu samping">
      <div style={{ padding: "0 1.25rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
        <div style={{ fontWeight: 700, fontSize: "1.15rem" }}>Pempek Novi</div>
        <div style={{ fontSize: "0.8rem", opacity: 0.85, marginTop: "0.25rem" }}>POS</div>
      </div>
      <nav style={{ flex: 1, padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            style={({ isActive }) => ({
              padding: "0.65rem 0.85rem",
              borderRadius: "12px",
              fontWeight: 600,
              fontSize: "0.9rem",
              background: isActive ? "rgba(255,249,240,0.15)" : "transparent",
              color: "#fff9f0",
            })}
            end={l.to === "/dashboard"}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
        <div style={{ fontSize: "0.8rem", opacity: 0.9, marginBottom: "0.5rem" }}>{username}</div>
        <button
          type="button"
          className="btn btn--ghost"
          style={{ width: "100%", color: "#fff9f0", background: "rgba(255,255,255,0.1)" }}
          onClick={logout}
        >
          Keluar
        </button>
      </div>
    </aside>
  );
}
