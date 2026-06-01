// frontend/src/modals/CreateOrderModal.jsx
// Most complex modal: pick customer, add/remove product rows, live total preview.

import { useState, useEffect } from "react";
import apiClient from "../api/client";
import ErrorMessage from "../components/ErrorMessage";
import Spinner from "../components/Spinner";
import "./Modal.css";

const EMPTY_ITEM = () => ({ product_id: "", quantity: 1 });

function CreateOrderModal({ isOpen, onClose, onSuccess }) {
  const [customers, setCustomers]               = useState([]);
  const [products, setProducts]                 = useState([]);
  const [dataLoading, setDataLoading]           = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [items, setItems]                       = useState([EMPTY_ITEM()]);
  const [calculatedTotal, setCalculatedTotal]   = useState(0);
  const [error, setError]                       = useState("");
  const [submitting, setSubmitting]             = useState(false);

  // Fetch customers + products when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setDataLoading(true);
    setError("");
    Promise.all([
      apiClient.get("/customers"),
      apiClient.get("/products"),
    ])
      .then(([custRes, prodRes]) => {
        setCustomers(custRes.data);
        setProducts(prodRes.data);
      })
      .catch((err) => {
        const msg = err?.response?.data?.detail || err.message || "Failed to load data.";
        setError(msg);
      })
      .finally(() => setDataLoading(false));
  }, [isOpen]);

  // Recalculate total whenever items or products change
  useEffect(() => {
    const total = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === Number(item.product_id));
      if (!product || !item.quantity) return sum;
      return sum + Number(product.price) * Number(item.quantity);
    }, 0);
    setCalculatedTotal(total);
  }, [items, products]);

  const addItemRow = () => setItems((prev) => [...prev, EMPTY_ITEM()]);

  const removeItemRow = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const updateItem = (index, field, value) =>
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );

  const validate = () => {
    if (!selectedCustomerId) return "Please select a customer.";
    if (items.length === 0)  return "Please add at least one product.";
    for (let i = 0; i < items.length; i++) {
      if (!items[i].product_id) return `Row ${i + 1}: Please select a product.`;
      if (!items[i].quantity || Number(items[i].quantity) < 1)
        return `Row ${i + 1}: Quantity must be at least 1.`;
    }
    // Check for duplicate product selections
    const ids = items.map((it) => it.product_id);
    if (new Set(ids).size !== ids.length) return "Each product can only appear once per order.";
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setSubmitting(true);
    setError("");

    apiClient
      .post("/orders", {
        customer_id: Number(selectedCustomerId),
        items: items.map((it) => ({
          product_id: Number(it.product_id),
          quantity:   Number(it.quantity),
        })),
      })
      .then((res) => {
        onSuccess(res.data);
        resetForm();
        onClose();
      })
      .catch((err) => {
        // Propagate backend errors (e.g. "Insufficient stock for Widget X")
        const detail = err?.response?.data?.detail;
        const msg = Array.isArray(detail)
          ? detail.map((d) => d.msg || d).join(", ")
          : detail || err.message || "Failed to create order.";
        setError(msg);
      })
      .finally(() => setSubmitting(false));
  };

  const resetForm = () => {
    setSelectedCustomerId("");
    setItems([EMPTY_ITEM()]);
    setCalculatedTotal(0);
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal modal--wide">
        <div className="modal__header">
          <h2 className="modal__title">Create Order</h2>
          <button className="modal__close" onClick={handleClose} aria-label="Close">×</button>
        </div>

        <ErrorMessage message={error} />

        {dataLoading ? (
          <Spinner />
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {/* Customer selector */}
            <div className="form-group">
              <label className="form-label">Customer *</label>
              <select
                id="order-customer-select"
                className="form-select"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                <option value="">— Select a customer —</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Product rows */}
            <div className="form-group">
              <label className="form-label">Order Items *</label>
              {items.map((item, idx) => (
                <div key={idx} className="item-row">
                  <select
                    id={`order-item-product-${idx}`}
                    className="form-select"
                    value={item.product_id}
                    onChange={(e) => updateItem(idx, "product_id", e.target.value)}
                  >
                    <option value="">— Select product —</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (${Number(p.price).toFixed(2)}) — Stock: {p.quantity}
                      </option>
                    ))}
                  </select>

                  <input
                    id={`order-item-qty-${idx}`}
                    className="form-input"
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                    placeholder="Qty"
                  />

                  <button
                    type="button"
                    className="item-row__remove"
                    aria-label="Remove row"
                    onClick={() => removeItemRow(idx)}
                    disabled={items.length === 1}
                  >
                    ×
                  </button>
                </div>
              ))}

              <button
                type="button"
                id="btn-add-item-row"
                className="btn btn-ghost btn-sm"
                style={{ marginTop: "0.5rem" }}
                onClick={addItemRow}
              >
                + Add Product Row
              </button>
            </div>

            {/* Live total preview */}
            <div className="total-preview">
              <span className="total-preview__label">Estimated Total</span>
              <span className="total-preview__amount">${calculatedTotal.toFixed(2)}</span>
            </div>

            <div className="modal__actions">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Cancel
              </button>
              <button
                type="submit"
                id="btn-submit-create-order"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? "Creating…" : "Create Order"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default CreateOrderModal;
