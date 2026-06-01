// frontend/src/pages/Orders.jsx
import { useEffect, useState, useCallback } from "react";
import apiClient from "../api/client";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";
import SuccessMessage from "../components/SuccessMessage";
import CreateOrderModal from "../modals/CreateOrderModal";
import OrderDetailModal from "../modals/OrderDetailModal";
import "./Pages.css";
import "../modals/Modal.css";

function Orders() {
  const [orders, setOrders]                 = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");
  const [successMsg, setSuccessMsg]         = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder]   = useState(null);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    setError("");
    apiClient
      .get("/orders")
      .then((res) => setOrders(res.data))
      .catch((err) => {
        const msg = err?.response?.data?.detail || err.message || "Failed to load orders";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleCreateSuccess = (newOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    setSuccessMsg(`Order #${newOrder.id} created successfully.`);
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const statusClass = (s) => `status-badge status-badge--${s}`;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Orders</h1>
        <button className="btn btn-primary" id="btn-create-order" onClick={() => setShowCreateModal(true)}>
          + Create Order
        </button>
      </div>

      <SuccessMessage message={successMsg} />
      <ErrorMessage message={error} />

      {loading ? (
        <Spinner />
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📋</div>
          <div className="empty-state__text">No orders yet. Create your first order above.</div>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer ID</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="td-mono">#{o.id}</td>
                  <td className="td-mono">#{o.customer_id}</td>
                  <td>${Number(o.total_amount).toFixed(2)}</td>
                  <td>
                    <span className={statusClass(o.status)}>{o.status}</span>
                  </td>
                  <td className="td-mono">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      id={`btn-view-order-${o.id}`}
                      onClick={() => handleViewDetail(o)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateOrderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
      {selectedOrder && (
        <OrderDetailModal
          isOpen={showDetailModal}
          onClose={() => { setShowDetailModal(false); setSelectedOrder(null); }}
          order={selectedOrder}
        />
      )}
    </div>
  );
}

export default Orders;
