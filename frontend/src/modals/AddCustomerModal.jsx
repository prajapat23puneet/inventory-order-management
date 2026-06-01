// frontend/src/modals/AddCustomerModal.jsx
import { useState } from "react";
import apiClient from "../api/client";
import ErrorMessage from "../components/ErrorMessage";
import "./Modal.css";

const INIT = { full_name: "", email: "", phone: "" };

// Basic email regex check
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function AddCustomerModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData]     = useState(INIT);
  const [error, setError]           = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!formData.full_name.trim()) return "Full name is required.";
    if (!formData.email.trim())     return "Email address is required.";
    if (!isValidEmail(formData.email.trim())) return "Please enter a valid email address.";
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setSubmitting(true);
    setError("");
    apiClient
      .post("/customers", {
        full_name: formData.full_name.trim(),
        email:     formData.email.trim(),
        phone:     formData.phone.trim() || null,
      })
      .then((res) => {
        onSuccess(res.data);
        setFormData(INIT);
        onClose();
      })
      .catch((err) => {
        const msg = err?.response?.data?.detail || err.message || "Failed to add customer.";
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
          <h2 className="modal__title">Add Customer</h2>
          <button className="modal__close" onClick={handleClose} aria-label="Close">×</button>
        </div>

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              id="add-customer-name"
              className="form-input"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="e.g. Jane Smith"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              id="add-customer-email"
              className="form-input"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="jane@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone (optional)</label>
            <input
              id="add-customer-phone"
              className="form-input"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 555 000 0000"
            />
          </div>

          <div className="modal__actions">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-add-customer"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Adding…" : "Add Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCustomerModal;
