// frontend/src/modals/OrderDetailModal.jsx
// Read-only view of a single order with all line items and grand total.

import "./Modal.css";

function OrderDetailModal({ isOpen, onClose, order }) {
  if (!isOpen || !order) return null;

  const grandTotal = order.items
    ? order.items.reduce(
        (sum, item) => sum + Number(item.unit_price) * Number(item.quantity),
        0
      )
    : Number(order.total_amount);

  const statusClass = `status-badge status-badge--${order.status}`;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal--wide">
        <div className="modal__header">
          <h2 className="modal__title">Order #{order.id}</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {/* Meta row */}
        <div style={{ display: "flex", gap: "2rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.3rem" }}>Status</div>
            <span className={statusClass}>{order.status}</span>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.3rem" }}>Customer ID</div>
            <span style={{ color: "#cbd5e1", fontWeight: 600 }}>#{order.customer_id}</span>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.3rem" }}>Date</div>
            <span style={{ color: "#cbd5e1" }}>
              {new Date(order.created_at).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Line items table */}
        {order.items && order.items.length > 0 ? (
          <>
            <table className="detail-table">
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>#{item.product_id}</td>
                    <td>{item.product_name || `Product #${item.product_id}`}</td>
                    <td>{item.quantity}</td>
                    <td>${Number(item.unit_price).toFixed(2)}</td>
                    <td>${(Number(item.unit_price) * Number(item.quantity)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="detail-total">
              <span>Grand Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </>
        ) : (
          <div style={{ color: "#64748b", textAlign: "center", padding: "1rem" }}>
            No line-item detail available.
          </div>
        )}

        <div className="modal__actions">
          <button id="btn-close-order-detail" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailModal;
