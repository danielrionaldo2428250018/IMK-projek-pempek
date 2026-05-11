import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { clearAllCredentials } from "../auth/localCredentials";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { useToast } from "../context/ToastContext";
import { DEFAULT_SETTINGS } from "../state/migrate";

export default function Profile() {
  const { settings, updateSettings, clearAllData } = useStore();
  const { username, updateUsername, changeMasterPassword, logout } = useAuth();
  const { push } = useToast();

  const [outletName, setOutletName] = useState(settings.outletName);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [taxPercent, setTaxPercent] = useState(String(settings.taxPercent));
  const [lowStockThreshold, setLowStockThreshold] = useState(String(settings.lowStockThreshold));
  const [adminWhatsApp, setAdminWhatsApp] = useState(settings.adminWhatsApp);

  const [nameInput, setNameInput] = useState(username);
  useEffect(() => {
    setNameInput(username);
  }, [username]);

  const [curPass, setCurPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confPass, setConfPass] = useState("");

  const avatarLetter = (outletName.trim().charAt(0) || "P").toUpperCase();

  function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    updateSettings({
      outletName: outletName.trim() || DEFAULT_SETTINGS.outletName,
      address: address.trim(),
      phone: phone.trim(),
    });
    push("Profil outlet disimpan.", "success");
  }

  function savePreferences(e: React.FormEvent) {
    e.preventDefault();
    const tax = Number(taxPercent.replace(",", ".")) || 0;
    const low = Number(lowStockThreshold.replace(/\D/g, "")) || 0;
    const wa = adminWhatsApp.replace(/\D/g, "");
    updateSettings({
      taxPercent: tax,
      lowStockThreshold: low,
      adminWhatsApp: wa,
    });
    push("Preferensi disimpan.", "success");
  }

  function saveUsername(e: React.FormEvent) {
    e.preventDefault();
    updateUsername(nameInput);
    push("Username diperbarui.", "success");
  }

  function saveNewPassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPass !== confPass) {
      push("Konfirmasi password tidak sama.", "error");
      return;
    }
    const res = changeMasterPassword(curPass, newPass);
    if (!res.ok) {
      push(res.error, "error");
      return;
    }
    setCurPass("");
    setNewPass("");
    setConfPass("");
    push("Password berhasil diubah.", "success");
  }

  return (
    <div className="page profile-page">
      <h1 style={{ margin: "0 0 1.25rem", fontSize: "1.35rem", color: "var(--color-primary-dark)" }}>Profil</h1>

      <div className="card profile-hero" style={{ marginBottom: "1rem", textAlign: "center", padding: "1.5rem 1.25rem" }}>
        <div className="profile-avatar" aria-hidden>
          {avatarLetter}
        </div>
        <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--color-primary-dark)", marginTop: "0.85rem" }}>
          {outletName.trim() || "Nama outlet"}
        </div>
        <div style={{ fontSize: "0.85rem", color: "var(--color-muted)", marginTop: "0.35rem" }}>Username: {username}</div>
        <p style={{ margin: "0.75rem 0 0", fontSize: "0.88rem", color: "var(--color-muted)", lineHeight: 1.45 }}>
          Data outlet dipakai di struk. Username &amp; password untuk masuk diatur di bawah.
        </p>
      </div>

      <form onSubmit={saveUsername} className="card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ margin: "0 0 1rem", fontSize: "1rem", color: "var(--color-primary-dark)" }}>Username</h2>
        <p style={{ margin: "0 0 0.75rem", fontSize: "0.82rem", color: "var(--color-muted)", lineHeight: 1.45 }}>
          Dipakai untuk masuk dan tampil di menu samping. Setelah diubah, gunakan username baru pada halaman Masuk.
        </p>
        <div className="profile-field">
          <label className="label" htmlFor="dn">
            Username
          </label>
          <input id="dn" className="input" value={nameInput} onChange={(e) => setNameInput(e.target.value)} autoComplete="username" />
        </div>
        <button type="submit" className="btn btn--primary btn--block">
          Simpan username
        </button>
      </form>

      <form onSubmit={saveNewPassword} className="card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ margin: "0 0 1rem", fontSize: "1rem", color: "var(--color-primary-dark)" }}>Password</h2>
        <div className="profile-field">
          <label className="label" htmlFor="cp">
            Password saat ini
          </label>
          <input id="cp" type="password" className="input" autoComplete="current-password" value={curPass} onChange={(e) => setCurPass(e.target.value)} />
        </div>
        <div className="profile-field">
          <label className="label" htmlFor="np">
            Password baru
          </label>
          <input id="np" type="password" className="input" autoComplete="new-password" value={newPass} onChange={(e) => setNewPass(e.target.value)} minLength={4} />
        </div>
        <div className="profile-field">
          <label className="label" htmlFor="np2">
            Ulangi password baru
          </label>
          <input id="np2" type="password" className="input" autoComplete="new-password" value={confPass} onChange={(e) => setConfPass(e.target.value)} minLength={4} />
        </div>
        <button type="submit" className="btn btn--primary btn--block">
          Ganti password
        </button>
      </form>

      <form onSubmit={saveProfile} className="card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ margin: "0 0 1rem", fontSize: "1rem", color: "var(--color-primary-dark)" }}>Profil outlet</h2>
        <div className="profile-field">
          <label className="label" htmlFor="on">
            Nama outlet
          </label>
          <input id="on" className="input" value={outletName} onChange={(e) => setOutletName(e.target.value)} autoComplete="organization" />
        </div>
        <div className="profile-field">
          <label className="label" htmlFor="ad">
            Alamat
          </label>
          <textarea id="ad" className="input" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="street-address" />
        </div>
        <div className="profile-field">
          <label className="label" htmlFor="ph">
            Telepon / WhatsApp outlet
          </label>
          <input id="ph" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" />
        </div>
        <button type="submit" className="btn btn--primary btn--block" style={{ marginTop: "0.25rem" }}>
          Simpan profil outlet
        </button>
      </form>

      <form onSubmit={savePreferences} className="card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ margin: "0 0 1rem", fontSize: "1rem", color: "var(--color-primary-dark)" }}>Preferensi toko</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div className="profile-field">
            <label className="label" htmlFor="tx">
              Pajak % (setelah diskon)
            </label>
            <input id="tx" className="input" inputMode="decimal" value={taxPercent} onChange={(e) => setTaxPercent(e.target.value)} />
          </div>
          <div className="profile-field">
            <label className="label" htmlFor="ls">
              Ambang stok menipis
            </label>
            <input id="ls" className="input" inputMode="numeric" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} />
          </div>
        </div>
        <div className="profile-field" style={{ marginTop: "0.5rem" }}>
          <label className="label" htmlFor="wa">
            WhatsApp admin (lupa password)
          </label>
          <input
            id="wa"
            className="input"
            inputMode="numeric"
            placeholder="Kosongkan jika belum ada"
            value={adminWhatsApp}
            onChange={(e) => setAdminWhatsApp(e.target.value)}
          />
          <p style={{ margin: "0.35rem 0 0", fontSize: "0.75rem", color: "var(--color-muted)" }}>
            Opsional. Hanya angka (mis. 628…). Dipakai untuk tautan minta bantuan di halaman Masuk.
          </p>
        </div>
        <p style={{ margin: "0 0 1rem", fontSize: "0.8rem", color: "var(--color-muted)" }}>
          Pajak dihitung dari total setelah diskon. Contoh: isi 11 untuk PPN 11%.
        </p>
        <button type="submit" className="btn btn--primary btn--block">
          Simpan preferensi
        </button>
      </form>

      <div className="card" style={{ border: "1px solid rgba(198,40,40,0.25)" }}>
        <div style={{ fontWeight: 700, marginBottom: "0.5rem", color: "var(--color-danger)" }}>Data di perangkat ini</div>
        <p style={{ margin: "0 0 0.75rem", fontSize: "0.85rem", color: "var(--color-muted)", lineHeight: 1.5 }}>
          Menghapus semua data akan mengosongkan produk, kategori, transaksi, mengembalikan profil outlet &amp; preferensi ke default, mengembalikan username dan password ke{" "}
          <code>admin</code>, serta keluar dari sesi saat ini.
        </p>
        <button
          type="button"
          className="btn btn--danger btn--block"
          onClick={() => {
            if (confirm("Hapus semua data lokal dan reset password ke bawaan? Anda akan keluar.")) {
              clearAllData();
              clearAllCredentials();
              logout();
              setOutletName(DEFAULT_SETTINGS.outletName);
              setAddress(DEFAULT_SETTINGS.address);
              setPhone(DEFAULT_SETTINGS.phone);
              setTaxPercent(String(DEFAULT_SETTINGS.taxPercent));
              setLowStockThreshold(String(DEFAULT_SETTINGS.lowStockThreshold));
              setAdminWhatsApp(DEFAULT_SETTINGS.adminWhatsApp);
              setNameInput("admin");
              push("Semua data telah dikosongkan.", "info");
            }
          }}
        >
          Kosongkan semua data
        </button>
      </div>

      <div style={{ marginTop: "1.25rem", display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
        <Link to="/bantuan" className="btn btn--ghost">
          Bantuan
        </Link>
        <Link to="/dashboard" style={{ color: "var(--color-muted)", fontSize: "0.9rem" }}>
          ← Dashboard
        </Link>
      </div>

      <style>{`
        .profile-page .profile-avatar {
          width: 88px;
          height: 88px;
          margin: 0 auto;
          border-radius: 50%;
          background: linear-gradient(145deg, #8b5e3c, #5d4037);
          color: #fff9f0;
          font-size: 2.25rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 28px rgba(139, 94, 60, 0.35);
          border: 3px solid rgba(255, 249, 240, 0.9);
        }
        .profile-page .profile-field {
          margin-bottom: 0.85rem;
        }
        .profile-page .profile-field:last-of-type {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}
