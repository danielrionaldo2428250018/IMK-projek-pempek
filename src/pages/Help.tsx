import { Link } from "react-router-dom";

const items: { q: string; a: string }[] = [
  {
    q: "Bagaimana cara masuk dan mengatur password?",
    a: "Masuk memakai username dan password. Bawaannya keduanya adalah admin (huruf kecil). Setelah masuk, buka Profil untuk mengganti username, password, dan mengisi nomor WhatsApp admin untuk fitur minta bantuan.",
  },
  {
    q: "Saya lupa password — bagaimana?",
    a: "Di halaman Masuk gunakan tautan Lupa password? Minta bantuan untuk membuka WhatsApp ke nomor admin (jika sudah diatur di Profil → Preferensi). Jika nomor belum diatur, hubungi pemilik toko. Admin dapat mengatur ulang password dari Profil atau mengosongkan semua data (mengembalikan akun ke admin/admin).",
  },
  {
    q: "Saya tidak bisa masuk",
    a: "Pastikan username dan password benar (bawaan admin / admin jika belum diubah). Perhatikan huruf besar-kecil pada username. Jika lupa, minta bantuan lewat WhatsApp atau reset data dari Profil oleh admin.",
  },
  {
    q: "Dashboard dan laporan kosong",
    a: "Tampilan kosong berarti belum ada produk atau transaksi tercatat. Tambah kategori dan produk lewat menu Kelola Produk, lalu gunakan Kasir untuk mencatat penjualan.",
  },
  {
    q: "Tombol Bayar tidak jalan atau muncul pesan stok",
    a: "Pastikan jumlah yang dipesan tidak melebihi stok yang tercatat. Perbarui stok di edit produk. Pastikan juga minimal satu item di keranjang sebelum membayar.",
  },
  {
    q: "Saya tidak bisa menambah produk — tidak ada kategori",
    a: "Isi kolom Kategori baru pada form tambah produk untuk membuat kategori pertama, lalu simpan. Setelah itu Anda bisa memilih kategori dari daftar.",
  },
  {
    q: "Pajak tidak muncul di total",
    a: "Buka Profil → bagian Preferensi toko → isi Pajak % (misalnya 11 untuk PPN), simpan. Pajak dihitung dari nominal setelah diskon di halaman Kasir.",
  },
  {
    q: "Struk tidak bisa dicetak atau PDF kosong",
    a: "Gunakan tombol Cetak lalu pilih printer atau Simpan sebagai PDF di dialog browser. Jika dialog tidak muncul, periksa pop-up blocker. Di perangkat mobile, fitur cetak bergantung pada browser.",
  },
  {
    q: "Bagikan struk tidak berfungsi",
    a: "Di beberapa browser, Bagikan akan menyalin teks struk ke clipboard jika Web Share API tidak tersedia. Izinkan akses clipboard jika diminta.",
  },
  {
    q: "Data saya hilang setelah ganti perangkat atau browser",
    a: "Semua data disimpan hanya di browser (localStorage) perangkat ini — tidak ada sinkron ke server. Gunakan ekspor CSV di Laporan sebagai cadangan berkala. Untuk multi-perangkat diperlukan backend terpisah.",
  },
  {
    q: "Saya ingin mulai dari nol lagi",
    a: "Buka Profil → bagian Data di perangkat ini → Kosongkan semua data. Ini akan menghapus produk, kategori, transaksi, mengembalikan pengaturan outlet, mengembalikan username dan password ke admin, serta mengeluarkan Anda dari sesi.",
  },
  {
    q: "Grafik atau laporan terasa lambat",
    a: "Banyak transaksi di satu perangkat bisa memperlambat grafik. Ekspor CSV untuk arsip, lalu pertimbangkan mengosongkan data lama lewat Profil jika tidak diperlukan lagi.",
  },
];

export default function Help() {
  return (
    <div className="page help-page">
      <header style={{ marginBottom: "1.25rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.35rem", color: "var(--color-primary-dark)" }}>Bantuan</h1>
        <p style={{ margin: "0.5rem 0 0", color: "var(--color-muted)", fontSize: "0.95rem", lineHeight: 1.5 }}>
          Jawaban singkat untuk masalah yang sering dialami. Klik judul untuk membuka penjelasan.
        </p>
      </header>

      <div className="help-faq">
        {items.map((it) => (
          <details key={it.q} className="help-faq__item card">
            <summary className="help-faq__summary">{it.q}</summary>
            <p className="help-faq__body">{it.a}</p>
          </details>
        ))}
      </div>

      <p style={{ marginTop: "1.5rem", fontSize: "0.88rem", color: "var(--color-muted)" }}>
        Masih butuh bantuan? Hubungi pemilik toko atau admin sistem. Isi nomor WhatsApp admin di Profil agar tautan minta bantuan di halaman Masuk aktif.
      </p>

      <Link to="/dashboard" style={{ display: "inline-block", marginTop: "0.75rem", color: "var(--color-primary)" }}>
        ← Kembali ke dashboard
      </Link>
    </div>
  );
}
