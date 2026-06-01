// frontend/src/components/Layout.jsx
// Wraps every page with the Navbar above and the page content below,
// constrained to a sensible max-width.

import Navbar from "./Navbar.jsx";
import "./Layout.css";

function Layout({ children }) {
  return (
    <div className="layout">
      <Navbar />
      <main className="layout__main">
        <div className="layout__container">{children}</div>
      </main>
    </div>
  );
}

export default Layout;
