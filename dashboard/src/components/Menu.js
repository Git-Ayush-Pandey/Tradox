import { useEffect, useRef, useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { logout } from "../hooks/api";
import GeneralContext from "../contexts/GeneralContext";

const Menu = () => {
  const location = useLocation();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { showAlert } = useContext(GeneralContext);
  const handleProfileClick = () => {
    setIsProfileDropdownOpen((prev) => !prev);
  };

  const handleLogoutClick = async () => {
    try {
      await logout();
       showAlert("success", "Logged out successfully.");
      setIsProfileDropdownOpen(false);
      window.location.href = "http://localhost:3001/signup";
    } catch (error) {
      console.error("Logout failed", error);
      showAlert("error", "Logout failed.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navItems = [
    { label: "Dashboard", to: "/" },
    { label: "Orders", to: "/orders" },
    { label: "Holdings", to: "/holdings" },
    { label: "Positions", to: "/positions" },
    { label: "Funds", to: "/funds" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div
      className="menu-container"
      style={{
        display: "flex",
        alignItems: "center",
        padding: "10px 20px",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <img src="logo.png" alt="Logo" style={{ width: "50px", marginRight: "20px" }} />

      <ul
        style={{
          display: "flex",
          flexGrow: 1,
          listStyle: "none",
          margin: 0,
          padding: 0,
          gap: "20px",
        }}
      >
        {navItems.map((item) => (
          <li key={item.to}>
            <Link to={item.to} style={{ textDecoration: "none" }}>
              <p
                style={{
                  margin: 0,
                  padding: "6px 12px",
                  fontWeight: isActive(item.to) ? "bold" : "normal",
                  borderBottom: isActive(item.to) ? "2px solid #1976d2" : "none",
                  color: isActive(item.to) ? "#1976d2" : "#333",
                  transition: "all 0.2s ease-in-out",
                }}
              >
                {item.label}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {/* Profile Section */}
      <div
        className="profile"
        ref={dropdownRef}
        style={{ position: "relative", marginLeft: "20px" }}
      >
        <div
          onClick={handleProfileClick}
          style={{
            width: "40px",
            height: "40px",
            backgroundColor: "#1976d2",
            color: "white",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          AU
        </div>

        {isProfileDropdownOpen && (
          <div
            className="dropdown-menu show"
            style={{
              position: "absolute",
              top: "110%",
              right: 0,
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "6px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              zIndex: 1000,
              minWidth: "120px",
            }}
          >
            <button
              className="dropdown-item"
              onClick={handleLogoutClick}
              style={{
                width: "100%",
                padding: "10px 16px",
                backgroundColor: "transparent",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#f5f5f5")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "transparent")}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
