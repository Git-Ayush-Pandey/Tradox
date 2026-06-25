import { useEffect, useState } from "react";
import { verifyToken } from "../hooks/api";

// ProtectedRoute: verifies JWT cookie on mount.
// If auth fails, redirects to REACT_APP_LOGOUT_REDIRECT_URL (the frontend login page).
// Falls back to "/" if the env var is misconfigured so the dashboard never navigates
// to "undefined" and loops.
const ProtectedRoute = ({ children }) => {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    verifyToken()
      .then((res) => {
        setAuth(res.data.status);
      })
      .catch((err) => {
        console.error("Verification failed:", err);
        setAuth(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (auth === null) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>Loading...</div>
    );
  }

  if (!auth) {
    // FIX: Guard against undefined env var — fall back to "/" so the app never
    // navigates to the literal string "undefined" which caused /unidentified loops.
    const redirectUrl =
      process.env.REACT_APP_LOGOUT_REDIRECT_URL &&
      process.env.REACT_APP_LOGOUT_REDIRECT_URL !== "undefined"
        ? process.env.REACT_APP_LOGOUT_REDIRECT_URL
        : "http://localhost:3000/login";

    window.location.href = redirectUrl;
    return null;
  }

  return children;
};

export default ProtectedRoute;
