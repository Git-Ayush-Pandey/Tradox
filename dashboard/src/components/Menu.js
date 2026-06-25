import { useEffect, useRef, useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { logout } from "../hooks/api";
import GeneralContext from "../contexts/GeneralContext";
import { Button } from "@mui/material";

const Menu = ({ onWatchlistClick }) => {
  const location = useLocation();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const dropdownRef = useRef(null);
  const { showAlert, setUser } = useContext(GeneralContext);

  const handleProfileClick = () => {
    setIsProfileDropdownOpen((prev) => !prev);
  };

  const handleLogoutClick = async () => {
    try {
      await logout();
      setUser(null);
      showAlert("success", "Logged out successfully.");
      setIsProfileDropdownOpen(false);
      window.location.replace(process.env.REACT_APP_LOGOUT_REDIRECT_URL);
    } catch (error) {
      console.error("Logout failed", error);
      showAlert("error", "Logout failed.");
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
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
        padding: "10px",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <img src="logo.png" alt="Logo" style={{ width: "50px" }} />

      {!isMobile && (
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
                    borderBottom: isActive(item.to)
                      ? "2px solid #1976d2"
                      : "none",
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
      )}

      <div
        className="profile"
        ref={dropdownRef}
        style={{ position: "relative", marginLeft: "auto" }}
      >
        {isMobile && (
          <Button
            onClick={onWatchlistClick}
            style={{
              marginRight: "12px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              background: "#f8f8f8",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            Watchlist
          </Button>
        )}
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
          TU
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
              minWidth: "150px",
            }}
          >
            {isMobile &&
              navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsProfileDropdownOpen(false)}
                  style={{
                    display: "block",
                    padding: "10px 16px",
                    textDecoration: "none",
                    color: isActive(item.to) ? "#1976d2" : "#333",
                    backgroundColor: "transparent",
                  }}
                >
                  {item.label}
                </Link>
              ))}

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
              onMouseOut={(e) =>
                (e.target.style.backgroundColor = "transparent")
              }
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
