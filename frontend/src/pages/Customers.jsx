// frontend/src/pages/Customers.jsx
import { useEffect, useState, useCallback } from "react";
import apiClient from "../api/client";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";
import SuccessMessage from "../components/SuccessMessage";
import AddCustomerModal from "../modals/AddCustomerModal";
import DeleteConfirmModal from "../modals/DeleteConfirmModal";
import "./Pages.css";

function Customers() {
  const [customers, setCustomers]             = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState("");
  const [successMsg, setSuccessMsg]           = useState("");
  const [showAddModal, setShowAddModal]       = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deleteError, setDeleteError]         = useState("");

  const fetchCustomers = useCallback(() => {
    setLoading(true);
    setError("");
    apiClient
      .get("/customers")
      .then((res) => setCustomers(res.data))
      .catch((err) => {
        const msg = err?.response?.data?.detail || err.message || "Failed to load customers";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleAddSuccess = (newCustomer) => {
    setCustomers((prev) => [newCustomer, ...prev]);
    setSuccessMsg(`Customer "${newCustomer.full_name}" added successfully.`);
  };

  const handleDeleteClick = (customer) => {
    setSelectedCustomer(customer);
    setDeleteError("");
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    setDeleteError("");
    apiClient
      .delete(`/customers/${selectedCustomer.id}`)
      .then(() => {
        setCustomers((prev) => prev.filter((c) => c.id !== selectedCustomer.id));
        setSuccessMsg(`Customer "${selectedCustomer.full_name}" deleted.`);
        setShowDeleteModal(false);
        setSelectedCustomer(null);
      })
      .catch((err) => {
        const msg = err?.response?.data?.detail || err.message || "Delete failed";
        setDeleteError(msg);
      });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Customers</h1>
        <button className="btn btn-primary" id="btn-add-customer" onClick={() => setShowAddModal(true)}>
          + Add Customer
        </button>
      </div>

      <SuccessMessage message={successMsg} />
      <ErrorMessage message={error} />

      {loading ? (
        <Spinner />
      ) : customers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">👥</div>
          <div className="empty-state__text">No customers yet. Add your first customer above.</div>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Member Since</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td className="td-name">{c.full_name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone || "—"}</td>
                  <td className="td-mono">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="td-actions">
                      <button
                        className="btn btn-danger btn-sm"
                        id={`btn-delete-customer-${c.id}`}
                        onClick={() => handleDeleteClick(c)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddCustomerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedCustomer(null); setDeleteError(""); }}
        onConfirm={handleDeleteConfirm}
        itemName={selectedCustomer?.full_name || ""}
        errorMessage={deleteError}
      />
    </div>
  );
}

export default Customers;
