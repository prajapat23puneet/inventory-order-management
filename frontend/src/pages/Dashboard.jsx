// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import apiClient from "../api/client";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";
import "./Pages.css";

function Dashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    apiClient
      .get("/dashboard")
      .then((res) => setStats(res.data))
      .catch((err) => {
        const msg = err?.response?.data?.detail || err.message || "Failed to load dashboard";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error)   return <ErrorMessage message={error} />;
  if (!stats)  return null;

  const cards = [
    { label: "Total Products",  value: stats.total_products,  color: "blue",   icon: "🛍️" },
    { label: "Total Customers", value: stats.total_customers, color: "green",  icon: "👥" },
    { label: "Total Orders",    value: stats.total_orders,    color: "purple", icon: "📋" },
    { label: "Low Stock Items", value: stats.low_stock_products?.length ?? 0, color: "red", icon: "⚠️" },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        {cards.map((c) => (
          <div key={c.label} className={`stat-card stat-card--${c.color}`}>
            <div className="stat-card__icon">{c.icon}</div>
            <div className="stat-card__label">{c.label}</div>
            <div className="stat-card__value">{c.value}</div>
          </div>
        ))}
      </div>

      {/* Low-stock table */}
      <p className="section-title">Low Stock Products (qty ≤ 5)</p>
      {stats.low_stock_products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">✅</div>
          <div className="empty-state__text">All products are well-stocked.</div>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Qty in Stock</th>
              </tr>
            </thead>
            <tbody>
              {stats.low_stock_products.map((p) => (
                <tr key={p.id}>
                  <td className="td-name">{p.name}</td>
                  <td className="td-mono">{p.sku}</td>
                  <td>
                    <span className="qty-badge qty-badge--low">{p.quantity}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
