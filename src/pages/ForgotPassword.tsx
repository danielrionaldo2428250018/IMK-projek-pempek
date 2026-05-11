import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { whatsappChatUrl } from "../utils";

const WA_TEXT = "Halo admin, saya lupa password aplikasi POS dan membutuhkan bantuan.";

export default function ForgotPassword() {
  const { isLoggedIn } = useAuth();
  const { settings } = useStore();

  if (isLoggedIn) return <Navigate to="/dashboard" replace />;

  const href = whatsappChatUrl(settings.adminWhatsApp, WA_TEXT);
  const waDigits = settings.adminWhatsApp.replace(/\D/g, "");

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
      <div className="card" style={{ width: "100%", maxWidth: 420, padding: "1.75rem" }}>
        <h1 style={{ margin: "0 0 0.75rem", fontSize: "1.4rem", color: "var(--color-primary-dark)" }}>Lupa password</h1>
        <p style={{ margin: "0 0 1rem", color: "var(--color-muted)", fontSize: "0.9rem", lineHeight: 1.55 }}>
          Password hanya bisa diatur dari dalam aplikasi (menu Profil). Jika lupa, minta bantuan admin toko lewat WhatsApp setelah nomor admin diisi di Profil → Preferensi toko.
        </p>
        {href ? (
          <>
            <p style={{ margin: "0 0 1rem", fontSize: "0.82rem", color: "var(--color-muted)" }}>
              Nomor tujuan: <span style={{ fontWeight: 700, color: "var(--color-text)" }}>+{waDigits}</span>
            </p>
            <a href={href} target="_blank" rel="noopener noreferrer" className="btn btn--primary btn--block" style={{ textDecoration: "none" }}>
              Chat WhatsApp admin
            </a>
          </>
        ) : (
          <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--color-muted)", lineHeight: 1.5 }}>
            Nomor WhatsApp admin belum diatur. Masuk dengan akun yang masih ingat password, lalu isi &quot;WhatsApp admin&quot; di Profil, atau hubungi pemilik toko secara langsung.
          </p>
        )}
      </div>

      <Link to="/login" style={{ marginTop: "1.1rem", fontSize: "0.9rem", color: "var(--color-primary)" }}>
        ← Kembali ke masuk
      </Link>
    </div>
  );
}
