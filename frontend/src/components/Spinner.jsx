// frontend/src/components/Spinner.jsx
// Centered loading spinner shown during async API calls.

import "./Spinner.css";

function Spinner() {
  return (
    <div className="spinner-wrapper" role="status" aria-label="Loading">
      <div className="spinner" />
      <span className="spinner-text">Loading…</span>
    </div>
  );
}

export default Spinner;
