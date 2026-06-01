// frontend/src/components/SuccessMessage.jsx
// Reusable success notification that auto-dismisses after 3 seconds.
// Returns null when message is empty.

import { useState, useEffect } from "react";
import "./SuccessMessage.css";

function SuccessMessage({ message }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  if (!visible || !message) return null;

  return (
    <div className="success-message" role="status">
      <span className="success-message__icon">✅</span>
      <span className="success-message__text">{message}</span>
    </div>
  );
}

export default SuccessMessage;
