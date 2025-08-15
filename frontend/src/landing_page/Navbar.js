import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const getLinkStyle = (path) => ({
    color: isActive(path) ? "orange" : "#000",
    fontWeight: isActive(path) ? "600" : "normal",
  });

  useEffect(() => {
    const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
    const collapse = document.getElementById("navbarSupportedContent");

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (collapse.classList.contains("show")) {
          const bsCollapse = new window.bootstrap.Collapse(collapse, {
            toggle: false,
          });
          bsCollapse.hide();
        }
      });
    });

    return () => {
      navLinks.forEach((link) => link.removeEventListener("click", () => {}));
    };
  }, []);

  return (
    <nav
      className="navbar navbar-expand-lg border-bottom main-navbar"
      style={{
        backgroundColor: "#FFF",
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 1000,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div className="container p-2 navbar-container d-flex align-items-center">
        <Link className="navbar-brand col-5 " to="/">
          <img
            src="media/images/logo.png"
            alt="Logo"
            style={{ width: "170px" }}
          />
        </Link>

        <button
          className="navbar-toggler ms-auto my-auto"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse justify-content-end"
          id="navbarSupportedContent"
        >
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link
                className="nav-link"
                style={getLinkStyle("/signup")}
                to="/signup"
              >
                Signup
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                style={getLinkStyle("/about")}
                to="/about"
              >
                About
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                style={getLinkStyle("/product")}
                to="/product"
              >
                Product
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                style={getLinkStyle("/pricing")}
                to="/pricing"
              >
                Pricing
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                style={getLinkStyle("/support")}
                to="/support"
              >
                Support
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
