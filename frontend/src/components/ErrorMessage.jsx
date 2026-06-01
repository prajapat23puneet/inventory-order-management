// frontend/src/components/ErrorMessage.jsx
// Reusable error banner. Returns null when message is empty.

import "./ErrorMessage.css";

function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <div className="error-message" role="alert">
      <span className="error-message__icon">⚠️</span>
      <span className="error-message__text">{message}</span>
    </div>
  );
}

export default ErrorMessage;
