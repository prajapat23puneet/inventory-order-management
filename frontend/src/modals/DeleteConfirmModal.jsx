// frontend/src/modals/DeleteConfirmModal.jsx
// Reusable "are you sure?" modal for any entity type.

import ErrorMessage from "../components/ErrorMessage";
import "./Modal.css";

function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemName, errorMessage }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal__header">
          <h2 className="modal__title">Confirm Delete</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <ErrorMessage message={errorMessage} />

        <p className="delete-confirm__body">
          Are you sure you want to delete{" "}
          <span className="delete-confirm__name">"{itemName}"</span>? This action cannot be undone.
        </p>

        <div className="modal__actions">
          <button
            id="btn-cancel-delete"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            id="btn-confirm-delete"
            className="btn btn-danger"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
