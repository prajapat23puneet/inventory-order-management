// frontend/src/modals/EditProductModal.jsx
import { useState, useEffect } from "react";
import apiClient from "../api/client";
import ErrorMessage from "../components/ErrorMessage";
import "./Modal.css";

function EditProductModal({ isOpen, onClose, onSuccess, product }) {
  const [formData, setFormData] = useState({
    name: "", sku: "", description: "", price: "", quantity: "",
  });
  const [error, setError]           = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill form when product prop changes
  useEffect(() => {
    if (product) {
      setFormData({
        name:        product.name       ?? "",
        sku:         product.sku        ?? "",
        description: product.description ?? "",
        price:       product.price      ?? "",
        quantity:    product.quantity   ?? "",
      });
      setError("");
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!formData.name.trim()) return "Product name is required.";
    if (!formData.sku.trim())  return "SKU is required.";
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

    const payload = {};
    if (formData.name        !== product.name)        payload.name        = formData.name.trim();
    if (formData.sku         !== product.sku)         payload.sku         = formData.sku.trim();
    if (formData.description !== (product.description ?? "")) payload.description = formData.description.trim() || null;
    if (Number(formData.price)    !== Number(product.price))    payload.price    = Number(formData.price);
    if (Number(formData.quantity) !== Number(product.quantity)) payload.quantity = Number(formData.quantity);

    apiClient
      .put(`/products/${product.id}`, payload)
      .then((res) => {
        onSuccess(res.data);
        onClose();
      })
      .catch((err) => {
        const msg = err?.response?.data?.detail || err.message || "Update failed.";
        setError(msg);
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal__header">
          <h2 className="modal__title">Edit Product</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              id="edit-product-name"
              className="form-input"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">SKU *</label>
            <input
              id="edit-product-sku"
              className="form-input"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              id="edit-product-description"
              className="form-textarea"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Price ($) *</label>
              <input
                id="edit-product-price"
                className="form-input"
                name="price"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                id="edit-product-quantity"
                className="form-input"
                name="quantity"
                type="number"
                min="0"
                step="1"
                value={formData.quantity}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal__actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-edit-product"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProductModal;
