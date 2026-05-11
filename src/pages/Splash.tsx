import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Splash() {
  const nav = useNavigate();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const t = window.setTimeout(() => {
      nav(isLoggedIn ? "/dashboard" : "/login", { replace: true });
    }, 2200);
    return () => window.clearTimeout(t);
  }, [nav, isLoggedIn]);

  return (
    <div
      style={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(165deg, #fff9f0 0%, #fdf5e6 45%, #f0e6d4 100%)",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 12px 40px rgba(139, 94, 60, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1.25rem",
          border: "3px solid #8b5e3c",
        }}
      >
        <span style={{ fontSize: "3rem" }} aria-hidden>
          🐟
        </span>
      </div>
      <h1
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontWeight: 700,
          fontSize: "1.85rem",
          color: "#6d4a2f",
          margin: 0,
          letterSpacing: "0.02em",
        }}
      >
        Pempek Novi
      </h1>
      <p style={{ color: "#6b5d4f", marginTop: "0.5rem", fontSize: "0.9rem" }}>Sistem POS</p>
    </div>
  );
}
