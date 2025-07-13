import { useEffect, useState } from "react";
import axios from "axios";

const ProtectedRoute = ({ children }) => {
  const [auth, setAuth] = useState(null); // null = loading

  useEffect(() => {
    axios
      .get("http://localhost:3002/auth/verify", { withCredentials: true })
      .then((res) => {
        setAuth(res.data.status);
      })
      .catch((err) => {
        console.error("Verification failed:", err);
        setAuth(false);
      });
  }, []);

  if (auth === null) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading...</div>;
  }

  if (!auth) {
    window.location.href = "http://localhost:3001/signup";
    return null;
  }

  return children;
};

export default ProtectedRoute;
