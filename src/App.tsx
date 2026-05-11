import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import Help from "./pages/Help";
import Login from "./pages/Login";
import ManageProducts from "./pages/ManageProducts";
import ProductForm from "./pages/ProductForm";
import Profile from "./pages/Profile";
import Products from "./pages/Products";
import Receipt from "./pages/Receipt";
import Splash from "./pages/Splash";
import Transaction from "./pages/Transaction";
import TransactionHistory from "./pages/TransactionHistory";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Reports = lazy(() => import("./pages/Reports"));

function SuspensePage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="page">Memuat…</div>}>{children}</Suspense>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<Login />} />
      <Route path="/lupa-password" element={<ForgotPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/pengaturan" element={<Navigate to="/profil" replace />} />
        <Route element={<AppShell />}>
          <Route
            path="/dashboard"
            element={
              <SuspensePage>
                <Dashboard />
              </SuspensePage>
            }
          />
          <Route path="/produk" element={<Products />} />
          <Route path="/produk/kelola" element={<ManageProducts />} />
          <Route path="/produk/baru" element={<ProductForm />} />
          <Route path="/produk/:id/edit" element={<ProductForm />} />
          <Route path="/transaksi" element={<Transaction />} />
          <Route path="/riwayat" element={<TransactionHistory />} />
          <Route
            path="/laporan"
            element={
              <SuspensePage>
                <Reports />
              </SuspensePage>
            }
          />
          <Route path="/profil" element={<Profile />} />
          <Route path="/bantuan" element={<Help />} />
          <Route path="/struk/:id" element={<Receipt />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
