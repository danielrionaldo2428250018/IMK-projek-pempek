import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { useToast } from "../context/ToastContext";
import { whatsappChatUrl } from "../utils";

const WA_HELP_TEXT = "Halo, saya butuh bantuan karena lupa password aplikasi POS.";

export default function Login() {
  const { login, isLoggedIn } = useAuth();
  const { settings } = useStore();
  const { push } = useToast();
  const nav = useNavigate();
  const loc = useLocation();
  const from = (loc.state as { from?: string } | null)?.from ?? "/dashboard";

  const [user, setUser] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");

  if (isLoggedIn) return <Navigate to={from} replace />;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (login(user, p)) nav(from, { replace: true });
    else setErr("Username atau password salah. Bawaan: admin / admin.");
  }

  function onMintaBantuan(e: React.MouseEvent) {
    e.preventDefault();
    const href = whatsappChatUrl(settings.adminWhatsApp, WA_HELP_TEXT);
    if (!href) {
      push(
        "Nomor WhatsApp admin belum diatur. Hubungi pemilik toko secara langsung, atau isi nomor di Profil → Preferensi setelah masuk.",
        "info",
      );
      return;
    }
    window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <div
      style={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background: "var(--color-cream)",
      }}
    >
      <div className="card" style={{ width: "100%", maxWidth: 400, padding: "1.75rem" }}>
        <h1 style={{ margin: "0 0 0.25rem", fontSize: "1.5rem", color: "var(--color-primary-dark)" }}>Pempek POS</h1>
        <p style={{ margin: "0 0 1.5rem", color: "var(--color-muted)", fontSize: "0.9rem" }}>Masuk dengan username dan password toko</p>
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label className="label" htmlFor="user">
              Username
            </label>
            <input
              id="user"
              type="text"
              className="input"
              autoComplete="username"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="admin"
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label className="label" htmlFor="pass">
              Password
            </label>
            <input
              id="pass"
              type="password"
              className="input"
              autoComplete="current-password"
              value={p}
              onChange={(e) => setP(e.target.value)}
              placeholder="••••••"
            />
          </div>
          {err ? (
            <p style={{ color: "var(--color-danger)", fontSize: "0.85rem", margin: "0 0 1rem" }}>{err}</p>
          ) : null}
          <button type="submit" className="btn btn--primary btn--block">
            MASUK
          </button>
        </form>
        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <button
            type="button"
            onClick={onMintaBantuan}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              font: "inherit",
              cursor: "pointer",
              fontSize: "0.88rem",
              color: "var(--color-primary)",
              fontWeight: 600,
              textDecoration: "underline",
            }}
          >
            Lupa password? Minta bantuan
          </button>
        </div>
        <p style={{ marginTop: "0.85rem", fontSize: "0.8rem", color: "var(--color-muted)", textAlign: "center", lineHeight: 1.45 }}>
          Bawaan: username <code style={{ fontSize: "0.85em" }}>admin</code>, password <code style={{ fontSize: "0.85em" }}>admin</code> — ubah di Profil setelah masuk.
        </p>
      </div>
      <Link to="/" style={{ marginTop: "1rem", fontSize: "0.85rem", color: "var(--color-muted)" }}>
        ← Splash
      </Link>
    </div>
  );
}
