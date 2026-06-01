// frontend/src/pages/Products.jsx
import { useEffect, useState, useCallback } from "react";
import apiClient from "../api/client";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";
import SuccessMessage from "../components/SuccessMessage";
import AddProductModal from "../modals/AddProductModal";
import EditProductModal from "../modals/EditProductModal";
import DeleteConfirmModal from "../modals/DeleteConfirmModal";
import "./Pages.css";

function Products() {
  const [products, setProducts]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [successMsg, setSuccessMsg]       = useState("");
  const [showAddModal, setShowAddModal]   = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteError, setDeleteError]     = useState("");

  const fetchProducts = useCallback(() => {
    setLoading(true);
    setError("");
    apiClient
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => {
        const msg = err?.response?.data?.detail || err.message || "Failed to load products";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleAddSuccess = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
    setSuccessMsg(`Product "${newProduct.name}" added successfully.`);
  };

  const handleEditSuccess = (updated) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSuccessMsg(`Product "${updated.name}" updated successfully.`);
  };

  const handleDeleteConfirm = () => {
    setDeleteError("");
    apiClient
      .delete(`/products/${selectedProduct.id}`)
      .then(() => {
        setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
        setSuccessMsg(`Product "${selectedProduct.name}" deleted.`);
        setShowDeleteModal(false);
        setSelectedProduct(null);
      })
      .catch((err) => {
        const msg = err?.response?.data?.detail || err.message || "Delete failed";
        setDeleteError(msg);
      });
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setDeleteError("");
    setShowDeleteModal(true);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <button className="btn btn-primary" id="btn-add-product" onClick={() => setShowAddModal(true)}>
          + Add Product
        </button>
      </div>

      <SuccessMessage message={successMsg} />
      <ErrorMessage message={error} />

      {loading ? (
        <Spinner />
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📦</div>
          <div className="empty-state__text">No products yet. Add your first product above.</div>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Qty in Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="td-name">{p.name}</td>
                  <td className="td-mono">{p.sku}</td>
                  <td>${Number(p.price).toFixed(2)}</td>
                  <td>
                    <span className={`qty-badge ${p.quantity <= 5 ? "qty-badge--low" : "qty-badge--ok"}`}>
                      {p.quantity}
                    </span>
                  </td>
                  <td>
                    <div className="td-actions">
                      <button
                        className="btn btn-secondary btn-sm"
                        id={`btn-edit-product-${p.id}`}
                        onClick={() => handleEditClick(p)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        id={`btn-delete-product-${p.id}`}
                        onClick={() => handleDeleteClick(p)}
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

      {/* Modals */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />
      {selectedProduct && (
        <EditProductModal
          isOpen={showEditModal}
          onClose={() => { setShowEditModal(false); setSelectedProduct(null); }}
          onSuccess={handleEditSuccess}
          product={selectedProduct}
        />
      )}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedProduct(null); setDeleteError(""); }}
        onConfirm={handleDeleteConfirm}
        itemName={selectedProduct?.name || ""}
        errorMessage={deleteError}
      />
    </div>
  );
}

export default Products;
