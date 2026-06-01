// frontend/src/components/Navbar.jsx
// Top navigation bar, shown on all pages.
// Uses NavLink so the active route gets a highlighted style.

import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

const NAV_LINKS = [
  { to: "/", label: "Dashboard", exact: true },
  { to: "/products", label: "Products" },
  { to: "/customers", label: "Customers" },
  { to: "/orders", label: "Orders" },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        {/* Brand */}
        <NavLink to="/" className="navbar__brand">
          <span className="navbar__brand-icon">📦</span>
          <span className="navbar__brand-name">InvenFlow</span>
        </NavLink>

        {/* Desktop links */}
        <ul className="navbar__links">
          {NAV_LINKS.map(({ to, label, exact }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={exact}
                className={({ isActive }) =>
                  "navbar__link" + (isActive ? " navbar__link--active" : "")
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          className="navbar__hamburger"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className={`navbar__hamburger-bar${menuOpen ? " open" : ""}`} />
          <span className={`navbar__hamburger-bar${menuOpen ? " open" : ""}`} />
          <span className={`navbar__hamburger-bar${menuOpen ? " open" : ""}`} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <ul className="navbar__mobile-menu">
          {NAV_LINKS.map(({ to, label, exact }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={exact}
                className={({ isActive }) =>
                  "navbar__link" + (isActive ? " navbar__link--active" : "")
                }
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}

export default Navbar;
