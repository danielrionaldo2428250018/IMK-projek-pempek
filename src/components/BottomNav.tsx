import { NavLink } from "react-router-dom";

const items = [
  { to: "/dashboard", label: "Home", icon: "◆" },
  { to: "/produk", label: "Produk", icon: "▣" },
  { to: "/transaksi", label: "Kasir", icon: "◇" },
  { to: "/laporan", label: "Laporan", icon: "▤" },
  { to: "/profil", label: "Profil", icon: "●" },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navigasi utama">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          className={({ isActive }) => (isActive ? "active" : "")}
          end={it.to !== "/produk"}
        >
          <span className="bottom-nav__icon" aria-hidden>
            {it.icon}
          </span>
          {it.label}
        </NavLink>
      ))}
    </nav>
  );
}
