// frontend/src/modals/AddProductModal.jsx
import { useState } from "react";
import apiClient from "../api/client";
import ErrorMessage from "../components/ErrorMessage";
import "./Modal.css";

const INIT = { name: "", sku: "", description: "", price: "", quantity: "" };

function AddProductModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState(INIT);
  const [error, setError]       = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!formData.name.trim())  return "Product name is required.";
    if (!formData.sku.trim())   return "SKU is required.";
    if (!formData.price || Number(formData.price) <= 0) return "Price must be greater than 0.";
    if (formData.quantity === "" || Number(formData.quantity) < 0) return "Quantity must be 0 or more.";
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setSubmitting(true);
    setError("");
    apiClient
      .post("/products", {
        name:        formData.name.trim(),
        sku:         formData.sku.trim(),
        description: formData.description.trim() || null,
        price:       Number(formData.price),
        quantity:    Number(formData.quantity),
      })
      .then((res) => {
        onSuccess(res.data);
        setFormData(INIT);
        onClose();
      })
      .catch((err) => {
        const msg = err?.response?.data?.detail || err.message || "Failed to add product.";
        setError(msg);
      })
      .finally(() => setSubmitting(false));
  };

  const handleClose = () => {
    setFormData(INIT);
    setError("");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal">
        <div className="modal__header">
          <h2 className="modal__title">Add Product</h2>
          <button className="modal__close" onClick={handleClose} aria-label="Close">×</button>
        </div>

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              id="add-product-name"
              className="form-input"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Wireless Mouse"
            />
          </div>

          <div className="form-group">
            <label className="form-label">SKU *</label>
            <input
              id="add-product-sku"
              className="form-input"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="e.g. WM-001"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              id="add-product-description"
              className="form-textarea"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional product description"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Price ($) *</label>
              <input
                id="add-product-price"
                className="form-input"
                name="price"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                id="add-product-quantity"
                className="form-input"
                name="quantity"
                type="number"
                min="0"
                step="1"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
          </div>

          <div className="modal__actions">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-add-product"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Adding…" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProductModal;
